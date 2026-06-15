(function () {
  const E = window.ElectionSim;

  class StateSupportEngine {
    constructor(gameState) {
      this.game = gameState;
    }

    updateAllStates() {
      this.game.states.forEach(state => {
        state.playerSupport = this.calculateStateSupport(state);
        state.opponentSupport = 100 - state.playerSupport
      });
    }

    calculateStateSupport(state) {
      const coalitions = this.game.coalitions;

      let support = 50;

      const getSupport = name => {
        const c = coalitions.find(x => x.name === name);
        return c ? c.support.player : 50;
      };

      if (state.demographics.urban) {
        support +=
          (getSupport("urban") - 50) *
          state.demographics.urban *
          0.15;
      }

      if (state.demographics.rural) {
        support +=
          (getSupport("rural") - 50) *
          state.demographics.rural *
          0.15;
      }

      if (state.demographics.suburban) {
        support +=
          (getSupport("suburban") - 50) *
          state.demographics.suburban *
          0.15;
      }

      if (state.demographics.college) {
        support +=
          (getSupport("college") - 50) *
          state.demographics.college *
          0.15;
      }

      if (state.demographics.working_class) {
        support +=
          (getSupport("working_class") - 50) *
          state.demographics.working_class *
          0.15;
      }

      const partyDir = this.game.player?.party === "Republican" ? -1 : 1;
      support -= state.partisanLean * 15 * partyDir;

      // volatility-based random noise
      const noise =
        (this.game.rng.next() - 0.5) * state.volatility * 0.2;

      support += noise;

      const momentum =
        this.game.player?.resources?.momentum ?? 50;

      support +=
        ((momentum - 50) / 40) * (Math.max(0.1, 1 - Math.abs(state.partisanLean) / 2.5));

      support -= state.aiPressure;
      support += (state.playerCampaignBoost || 0);

      return Math.max(0, Math.min(100, support));
    }
  }

  E.StateSupportEngine = StateSupportEngine;
})();