(function () {
  const E = window.ElectionSim;

  class TimeSystem {
    constructor(game) {
      this.game = game;
      this.dayLengthMs = 800; // later tunable for speed control
      this.running = false;
    }

    start() {
      this.running = true;
      this.tick();
    }

    stop() {
      this.running = false;
    }

    tick() {
      if (!this.running) return;

      setTimeout(() => {
        this.game.advanceDay();
        this.tick();
      }, this.dayLengthMs);
    }
  }

  E.TimeSystem = TimeSystem;
})();