(function () {
  const E = window.ElectionSim;

  class PollingEngine {
    constructor(gameState) {
      this.game = gameState;

      this.polls = [];
      this.statePolls = [];

      // Each pollster releases on its own jittered cadence instead of a single
      // global day%5 trigger — produces organic spacing (occasional same-day
      // overlaps, occasional multi-week gaps) while keeping combined volume
      // roughly comparable to the old fixed schedule (~40 national polls/180 days).
      this.pollsters = [
        { name: "Atlas Research",        bias:  1,   avgInterval: 24, jitter: 6  },
        { name: "Civic Polling",         bias: -1,   avgInterval: 26, jitter: 7  },
        { name: "National Survey Group", bias:  0,   avgInterval: 22, jitter: 6  },
        { name: "Heartland Monitor",     bias:  0.7, avgInterval: 34, jitter: 8  },
        { name: "Coastal Insights",      bias: -0.7, avgInterval: 32, jitter: 8  },
        { name: "Beacon Analytics",      bias:  0,   avgInterval: 45, jitter: 10 },
        { name: "Liberty Tracking Poll", bias:  1.5, avgInterval: 40, jitter: 10 }
      ];

      // Schedule each pollster's first release independently
      this.pollsters.forEach(p => {
        p.nextPollDay = this.game.day + this._jitteredInterval(p);
      });

      this.nextStatePollDay = this.game.day + this.game.rng.range(3, 6);
    }

    _jitteredInterval(p) {
      const lo = Math.max(1, p.avgInterval - p.jitter);
      const hi = p.avgInterval + p.jitter;
      return this.game.rng.range(lo, hi);
    }

    // Called once per day from GameState.advanceDay() — checks each pollster's
    // independent schedule and fires a state-poll batch on its own cadence.
    tick() {
      this.pollsters.forEach(p => {
        if (this.game.day >= p.nextPollDay) {
          this.generateNationalPoll(p);
          p.nextPollDay = this.game.day + this._jitteredInterval(p);
        }
      });

      if (this.game.day >= this.nextStatePollDay) {
        this.generateStatePollBatch();
        this.nextStatePollDay = this.game.day + this.game.rng.range(3, 6);
      }
    }

    generateNationalPoll(pollster) {
      const Poll = E.models.Poll;

      const support = this.calculateNationalSupport();

      const errorRange = this.game.pollAnalystActive ? 2 : 4;
      const error = this.game.rng.range(-errorRange, errorRange);

      const momentumBonus = (this.game.player.resources.momentum - 50) * 0.05;

      const player = Math.max(0, Math.min(100, support + pollster.bias + error + momentumBonus));

      const poll = new Poll({
        day: this.game.day,
        pollster: pollster.name,
        player,
        opponent: 100 - player,
        sampleSize: 500 + Math.floor(this.game.rng.next() * 1000),
        error
      });

      this.polls.unshift(poll);
      if (this.polls.length > 40) this.polls.pop();

      this.game.news.unshift({
        day: this.game.day,
        headline: `New ${pollster.name} poll: ${this.game.player.name} ${player.toFixed(1)}% — ${this.game.opponents?.[0]?.name ?? 'opponent'} ${(100 - player).toFixed(1)}%`
      });

      return poll;
    }

    calculateNationalSupport() {
      let total = 0;
      this.game.states.forEach(state => {
        total += state.electoralVotes * (state.playerSupport ?? 50);
      });
      return total / 538;
    }

    generateStatePoll(state, pollster) {
      const StatePoll = E.models.StatePoll;

      const stateErrorRange = this.game.pollAnalystActive ? 2 : 4;
      const error = this.game.rng.range(-stateErrorRange, stateErrorRange);

      const support = state.playerSupport;
      const player = Math.max(0, Math.min(100, support + pollster.bias + error));

      const poll = new StatePoll({
        day: this.game.day,
        state: state.abbr,
        pollster: pollster.name,
        player,
        opponent: 100 - player,
        sampleSize: 400 + Math.floor(this.game.rng.next() * 800),
        error
      });

      this.statePolls.unshift(poll);
      if (this.statePolls.length > 200) this.statePolls.pop();

      return poll;
    }

    // Generates a batch of state polls weighted heavily toward battlegrounds
    // (~80%) but with a real chance of spot-checking a safe/likely state too —
    // mirrors how real pollsters occasionally re-confirm "safe" states.
    generateStatePollBatch() {
      const sorted = [...this.game.states].sort(
        (a, b) => Math.abs(a.playerSupport - 50) - Math.abs(b.playerSupport - 50)
      );
      const battlegroundPool = sorted.slice(0, 15);
      const safePool         = sorted.slice(15);

      const totalPolls = 6 + Math.floor(this.game.rng.next() * 5); // 6-10 per batch
      const used = new Set();

      for (let i = 0; i < totalPolls; i++) {
        const useBattleground = this.game.rng.next() < 0.82 || !safePool.length;
        const pool = useBattleground ? battlegroundPool : safePool;
        const avail = pool.filter(s => !used.has(s.abbr));
        const choices = avail.length ? avail : pool;
        if (!choices.length) continue;

        const state = choices[Math.floor(this.game.rng.next() * choices.length)];
        used.add(state.abbr);

        const pollster = this.pollsters[Math.floor(this.game.rng.next() * this.pollsters.length)];
        this.generateStatePoll(state, pollster);
      }
    }

    getBattlegroundStates() {
      return [...this.game.states]
        .sort((a, b) => Math.abs(a.playerSupport - 50) - Math.abs(b.playerSupport - 50))
        .slice(0, 10);
    }

  }

  E.PollingEngine = PollingEngine;
})();
