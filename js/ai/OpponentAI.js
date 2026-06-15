(function () {
  const E = window.ElectionSim;

  const VP_POOL = [
    { name: 'Sen. Maria Santos',  state: 'NV', coalition: 'minority',      boost: 4, archetype: 'Regional Favourite' },
    { name: 'Gov. James Hartley', state: 'OH', coalition: 'working_class',  boost: 4, archetype: 'Party Unifier' },
    { name: 'Rep. Claire Nguyen', state: 'AZ', coalition: 'young',          boost: 3, archetype: 'Next Generation' },
    { name: 'Sen. David Okafor',  state: 'GA', coalition: 'minority',       boost: 5, archetype: 'Base Energizer' },
    { name: 'Gov. Susan Marsh',   state: 'PA', coalition: 'suburban',       boost: 4, archetype: 'Swing State Anchor' },
    { name: 'Rep. Tom Callahan',  state: 'MI', coalition: 'working_class',  boost: 4, archetype: 'Rust Belt Bridge' },
    { name: 'Sen. Elena Vargas',  state: 'FL', coalition: 'minority',       boost: 5, archetype: 'Sunbelt Contender' },
    { name: 'Gov. Aaron Pierce',  state: 'WI', coalition: 'independent',    boost: 3, archetype: 'Crossover Appeal' },
  ];

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

      const actionKeys = Object.keys(this.game.actions).filter(k =>
        !['gotvDrive'].includes(k) || this.game.day > 140
      );
      const actionKey = this.game.rng.pick(actionKeys);
      this.execute(actionKey);

      if (this.game.activeEvents.length > 0) {
        const hasScandal = this.game.activeEvents.some(e => e.type === 'scandal');
        if (hasScandal) this.launchAttackAd();
      }
    }

    pickVP() {
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
      const intensity = (this.candidate.stats.charisma * 0.6 +
                         this.candidate.stats.politicalInstinct * 0.4) / 100;
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
      const effectiveness = (instinct / 100) * 0.8;
      for (const [name, delta] of Object.entries(action.effects)) {
        const coalition = this.game.coalitions.find(c => c.name === name);
        if (coalition) coalition.adjustSupport(-delta * effectiveness);
      }
    }
  }

  E.OpponentAI = OpponentAI;
})();