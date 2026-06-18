(function () {
  const E = window.ElectionSim;

  // VP_POOL now comes from window.ElectionSim.data.VP_CANDIDATES, filtered
  // by the opponent's own party in pickVP() below.

  class OpponentAI {
    constructor(candidate, gameState) {
      this.candidate  = candidate;
      this.game       = gameState;
      this.focusStates = [];
      this.lastAction  = null;
      this.vp          = null;
      this.vpPickedDay = null;
    }

    takeTurn() {
      // VP pick around day 45 (±3 days of randomness)
      if (!this.vp && this.game.day >= 42 + Math.floor(this.game.rng.next() * 6)) {
        this.pickVP();
      }

      this.selectTargets();
      const target = this.focusStates[
        Math.floor(this.game.rng.next() * this.focusStates.length)
      ];
      if (!target) return;

      this.applyPressure(target);

      const actionKeys = Object.keys(this.game.actions).filter(k => {
        const action = this.game.actions[k];
        if (action.requiredArchetype && action.requiredArchetype !== this.candidate.identity?.archetype) return false;
        if (k === 'gotvDrive' && this.game.day <= 140) return false;
        return true;
      });
      const actionKey = this.game.rng.pick(actionKeys);
      this.execute(actionKey);

      if (this.game.activeEvents.length > 0) {
        const hasScandal = this.game.activeEvents.some(e => e.type === 'scandal');
        if (hasScandal) this.launchAttackAd();
      }
    }

    pickVP() {
      const VP_POOL = (E.data?.VP_CANDIDATES?.[this.candidate.party]) || [];
      if (!VP_POOL.length) return;

      // Pick the VP whose home state is most contested (highest value to AI)
      const ranked   = this.evaluateStates().sort((a, b) => b.value - a.value);
      const topAbbrs = ranked.slice(0, 8).map(x => x.state.abbr);

      // Prefer VPs from contested states
      const preferred = VP_POOL.filter(v => topAbbrs.includes(v.state));
      const pool      = preferred.length ? preferred : VP_POOL;
      this.vp         = pool[Math.floor(this.game.rng.next() * pool.length)];
      this.vpPickedDay = this.game.day;

      // Apply VP effects
      const vpState = this.game.getStateByAbbr(this.vp.state);
      if (vpState) {
        vpState.aiPressure = (vpState.aiPressure || 0) + 2;  // home state boost
      }
      this.game.getCoalition(this.vp.coalition)?.adjustSupport(-this.vp.boost); // hurts player

      this.game.news.unshift({
        day:      this.game.day,
        headline: `${this.candidate.name} selects ${this.vp.name} as running mate — ${this.vp.archetype}`
      });
      this.game.log.push(`Opponent VP pick: ${this.vp.name} (${this.vp.state})`);
    }

    evaluateStates() {
      return this.game.states.map(state => {
        const margin = Math.abs(state.playerSupport - 50);
        const value  = Math.exp(-margin / 10) * (state.volatility ** 0.5) * (state.electoralVotes ** 0.3);
        return { state, value };
      });
    }

    selectTargets() {
      const ranked = this.evaluateStates().sort((a, b) => b.value - a.value);
      this.focusStates = ranked.slice(0, 5).map(x => x.state);
    }

    applyPressure(state) {
      // Opponent momentum now actually matters: a damaged opponent (post-scandal,
      // post-rapid-response) applies meaningfully weaker pressure; a surging one applies more.
      const momentum     = this.candidate.resources?.momentum ?? 50;
      const momentumMult = 0.6 + (momentum / 100) * 0.8; // 0.6x @ 0, 1.0x @ 50, 1.4x @ 100
      const intensity = (this.candidate.stats.charisma * 0.6 +
                         this.candidate.stats.politicalInstinct * 0.4) / 100 * momentumMult;
      state.aiPressure = Math.min((state.aiPressure || 0) + intensity, 8);
      this.game.news.unshift({
        day:      this.game.day,
        headline: `${this.candidate.name} campaigns heavily in ${state.name}`
      });
    }

    launchAttackAd() {
      this.game.player.resources.momentum -= 2;
      this.game.news.unshift({
        day:      this.game.day,
        headline: `${this.candidate.name} launches attack ads against ${this.game.player.name}`
      });
    }

    execute(actionKey) {
      const action = this.game.actions[actionKey];
      if (!action) return;
      const instinct      = this.candidate.stats.politicalInstinct;
      const momentum      = this.candidate.resources?.momentum ?? 50;
      const momentumMult  = 0.6 + (momentum / 100) * 0.8;
      const effectiveness = (instinct / 100) * 0.8 * momentumMult;
      for (const [name, delta] of Object.entries(action.effects)) {
        const coalition = this.game.coalitions.find(c => c.name === name);
        if (coalition) coalition.adjustSupport(-delta * effectiveness);
      }
    }
  }

  E.OpponentAI = OpponentAI;
})();
