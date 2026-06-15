(function () {
  const E = window.ElectionSim;

  class Coalition {
    constructor(name, baseWeight = 1, rng) {
      this.name = name;
      this.baseWeight = baseWeight;

      // support for each candidate (0–100)
      this.support = {
        player: 50,
        opponents: 50
      };

      // sensitivity controls how reactive this bloc is
      this.sensitivity = rng ? rng.float(0.75, 1.25) : this.game.rng.next() * 0.5 + 0.75;
    }

    adjustSupport(deltaPlayer) {
      this.support.player += deltaPlayer * this.sensitivity;
      this.support.opponents = 100 - this.support.player;

      this.clamp();
    }

    clamp() {
      this.support.player = Math.max(0, Math.min(100, this.support.player));
      this.support.opponents = 100 - this.support.player;
    }
  }

  E.models = E.models || {};
  E.models.Coalition = Coalition;
})();