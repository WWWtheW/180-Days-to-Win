(function () {
  const E = window.ElectionSim;

  class Policy {
    constructor(name, effects) {
      this.name = name;

      // effects format:
      // { coalition: deltaSupport }
      this.effects = effects;
    }

    apply(gameState) {
      for (const [coalitionName, delta] of Object.entries(this.effects)) {
        const c = gameState.getCoalition(coalitionName);
        if (c) {
          c.adjustSupport(delta);
        }
      }
    }
  }

  E.models = E.models || {};
  E.models.Policy = Policy;
})();