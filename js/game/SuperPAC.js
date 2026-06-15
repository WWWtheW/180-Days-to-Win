(function () {
  'use strict';
  const E = window.ElectionSim;

  // SuperPAC runs independently — player can signal but not directly control.
  // Fund accumulates passively each day (scales with momentum).
  // Signals cost political capital and direct the PAC to a state for N days.

  class SuperPAC {
    constructor(game) {
      this.game    = game;
      this.fund    = 500000;   // starting PAC fund
      this.signals = [];       // [{ stateAbbr, daysRemaining, dailySpend }]
      this.maxSignals = 2;     // can only direct to 2 states at once
    }

    // Called each advanceDay()
    tick() {
      const p = this.game.player;
      if (!p) return;

      // Passive fund growth — scales with momentum (more enthusiasm = more PAC donations)
      const momentumFactor = Math.max(0.3, (p.resources.momentum || 50) / 50);
      const dailyInflow    = Math.floor(15000 * momentumFactor * (1 + this.game.rng.range(-0.2, 0.2)));
      this.fund           += dailyInflow;

      // Process active signals
      this.signals = this.signals.filter(sig => {
        const state = this.game.getStateByAbbr(sig.stateAbbr);
        if (!state) return false;

        const spend = Math.min(sig.dailySpend, this.fund);
        this.fund  -= spend;

        // Airwave effect — smaller than a direct TV Ad action, no saturation penalty
        state.playerCampaignBoost = (state.playerCampaignBoost || 0) + (spend / 300000) * 0.8;
        this.game.getCoalition('independent')?.adjustSupport(0.15);

        sig.daysRemaining--;
        return sig.daysRemaining > 0;
      });
    }

    // Player sends a signal — costs capital, directs PAC to a state for 5 days
    signal(stateAbbr) {
      const CAPITAL_COST = 15;
      const r = this.game.player?.resources;
      if (!r) return false;
      if ((r.politicalCapital || 0) < CAPITAL_COST) return false;
      if (this.signals.length >= this.maxSignals)    return false;
      if (this.signals.find(s => s.stateAbbr === stateAbbr)) return false;

      r.politicalCapital -= CAPITAL_COST;

      const dailySpend = Math.floor(this.fund * 0.12); // commit ~12% of fund/day
      this.signals.push({ stateAbbr, daysRemaining: 5, dailySpend });

      const state = this.game.getStateByAbbr(stateAbbr);
      this.game.news.unshift({
        day:      this.game.day,
        headline: `Super PAC aligned with ${this.game.player.name} begins ad blitz in ${state?.name ?? stateAbbr}`
      });
      this.game.log.push(`SuperPAC signalled → ${stateAbbr}`);
      return true;
    }

    canSignal(stateAbbr) {
      if ((this.game.player?.resources?.politicalCapital || 0) < 15) return false;
      if (this.signals.length >= this.maxSignals) return false;
      if (this.signals.find(s => s.stateAbbr === stateAbbr))        return false;
      return true;
    }
  }

  E.SuperPAC = SuperPAC;
})();