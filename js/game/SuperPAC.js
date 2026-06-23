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

      // Passive independent spending — the PAC doesn't sit idle just because
      // the player hasn't signaled. It autonomously puts a smaller share of
      // its fund into a few close, non-signaled battlegrounds each day —
      // real PAC behavior, just less targeted/efficient than a direct signal.
      const signaledAbbrs = new Set(this.signals.map(s => s.stateAbbr));
      if (this.fund > 80000) {
        const passivePool = [...this.game.states]
          .filter(s => !signaledAbbrs.has(s.abbr))
          .sort((a, b) => Math.abs(a.playerSupport - 50) - Math.abs(b.playerSupport - 50))
          .slice(0, 3); // top 3 closest non-signaled states

        if (passivePool.length) {
          const passiveBudget = Math.floor(this.fund * 0.03); // 3%/day, vs ~12%/day on a direct signal
          this.fund -= passiveBudget;
          const perState = passiveBudget / passivePool.length;
          passivePool.forEach(state => {
            // Half the per-dollar effect of a signaled buy — less-targeted, independently produced ads
            state.playerCampaignBoost = (state.playerCampaignBoost || 0) + (perState / 300000) * 0.4;
          });

          // Occasional news mention so passive activity isn't invisible, without spamming daily
          if (this.game.rng.next() < 0.06) {
            this.game.news.unshift({
              day: this.game.day,
              headline: `Independent Super PAC spending detected in ${passivePool[0].name} and other close states`
            });
          }
        }
      }
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

  // Opponent SuperPAC — fully autonomous (no signal UI), spends in the closest
  // battlegrounds. Spend rate scales with game difficulty: harder difficulty
  // means a more aggressive opponent PAC, mirroring how opponentDifficulty
  // already affects stat rolls and endorsement bias elsewhere.
  class OpponentSuperPAC {
    constructor(game) {
      this.game = game;
      this.fund = 400000; // starting fund, slightly below the player's PAC baseline
    }

    tick() {
      const opp = this.game.opponents?.[0];
      if (!opp) return;

      // opponentDifficulty: 1.4 easy / 1.1 normal / 0.85 hard (lower = tougher opponent).
      // Invert it so hard mode produces the most aggressive PAC spending.
      const diffVal   = this.game.opponentDifficulty ?? 1.1;
      const spendMult = Math.max(0.15, 1.6 - diffVal); // hard ≈0.75, normal ≈0.5, easy ≈0.2

      // Passive fund growth — scales with the opponent's own momentum and difficulty
      const momentumFactor = Math.max(0.3, (opp.resources.momentum || 50) / 50);
      const dailyInflow    = Math.floor(12000 * momentumFactor * spendMult * (1 + this.game.rng.range(-0.2, 0.2)));
      this.fund += dailyInflow;

      if (this.fund < 60000) return; // not worth deploying yet

      // Autonomous spend in the closest battlegrounds — opponent PAC doesn't
      // "signal," it just acts in its own interest every day.
      const targets = [...this.game.states]
        .sort((a, b) => Math.abs(a.playerSupport - 50) - Math.abs(b.playerSupport - 50))
        .slice(0, 4);
      if (!targets.length) return;

      const budget = Math.floor(this.fund * 0.05 * spendMult);
      this.fund   -= budget;
      const perState = budget / targets.length;

      targets.forEach(state => {
        state.aiPressure = Math.min(10, (state.aiPressure || 0) + (perState / 300000) * 0.8);
      });

      // Occasional news visibility, not every day
      if (this.game.rng.next() < 0.05) {
        this.game.news.unshift({
          day: this.game.day,
          headline: `Outside groups aligned with ${opp.name} ramp up ad spending in key states`
        });
      }
    }
  }

  E.SuperPAC = SuperPAC;
  E.OpponentSuperPAC = OpponentSuperPAC;
})();