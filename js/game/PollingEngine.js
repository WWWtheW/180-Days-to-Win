(function () {
  const E = window.ElectionSim;

  class PollingEngine {
    constructor(gameState) {
      this.game = gameState;

      this.polls = [];
      this.statePolls = [];

      this.pollsters = [
        {
          name: "Atlas Research",
          bias: 1
        },
        {
          name: "Civic Polling",
          bias: -1
        },
        {
          name: "National Survey Group",
          bias: 0
        }
      ];
    }

    generateNationalPoll() {
      const Poll = E.models.Poll;

      const support =
        this.calculateNationalSupport();

      const pollster =
        this.pollsters[
          Math.floor(
            this.game.rng.next() *
            this.pollsters.length
          )
        ];

      const errorRange = this.game.pollAnalystActive ? 2 : 4;
      const error =
        this.game.rng.range(-errorRange, errorRange);

      const momentumBonus =
        (this.game.player
          .resources.momentum - 50)
        * 0.05;

      const player = Math.max(0, Math.min(100, support + pollster.bias + error + momentumBonus));

      const poll = new Poll({
        day: this.game.day,
        pollster: pollster.name,
        player,
        opponent: 100 - player,
        sampleSize:
          500 +
          Math.floor(
            this.game.rng.next() *
            1000
          ),
        error
      });

      this.polls.unshift(poll);

      if (this.polls.length > 30) {
        this.polls.pop();
      }

      return poll;
    }

    calculateNationalSupport() {
      let total = 0;

      this.game.states.forEach(state => {
        total +=
          state.electoralVotes *
          (state.playerSupport ?? 50);
      });

      return total / 538;
    }

    generateStatePoll(state) {
      const StatePoll =
        E.models.StatePoll;

      const pollster =
        this.pollsters[
          Math.floor(
            this.game.rng.next() *
            this.pollsters.length
          )
        ];

      const stateErrorRange = this.game.pollAnalystActive ? 2 : 4;
      const error =
        this.game.rng.range(-stateErrorRange, stateErrorRange);

      const support =
        state.playerSupport;

      const player = Math.max(0, Math.min(100, support + pollster.bias + error));

      const poll = new StatePoll({
        day: this.game.day,
        state: state.abbr,
        pollster: pollster.name,
        player,
        opponent: 100 - player,
        sampleSize:
          400 +
          Math.floor(
            this.game.rng.next() * 800
          ),
        error
      });

      this.statePolls.unshift(poll);

      if (this.statePolls.length > 200) {
        this.statePolls.pop();
      }

      return poll;
    }

    getBattlegroundStates() {
      return [...this.game.states]
        .sort((a, b) => {
          return (
            Math.abs(a.playerSupport - 50) -
            Math.abs(b.playerSupport - 50)
          );
        })
        .slice(0, 10);
    }

  }

  E.PollingEngine =
    PollingEngine;
})();