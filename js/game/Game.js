(function () {
  const E = window.ElectionSim;

  class Game {
    constructor(state) {
      this.state = state;
      this.rng = state.rng;

      this.eventQueue = [];
      this.resolvedEvents = [];

      this.difficulty = 1;

      this.narrativeFlags = {
        scandalRisk: 0,
        mediaHeat: 0,
        enthusiasm: 50
      };
    }

    // -----------------------------
    // EVENT SYSTEM
    // -----------------------------

    scheduleEvent(day, type, data = {}) {
      this.eventQueue.push({ day, type, data });
    }

    processEvents() {
      const today = this.state.day;

      const triggered = this.eventQueue.filter(e => e.day <= today);

      this.eventQueue = this.eventQueue.filter(e => e.day > today);

      for (const event of triggered) {
        this.resolveEvent(event);
      }
    }

    resolveEvent(event) {
      this.resolvedEvents.push(event);

      switch (event.type) {
        case "momentum_shift":
          if (this.state.player) {
            this.state.player.resources.momentum += event.data.value;
          }
          break;

        case "funding_boost":
          if (this.state.player) {
            this.state.player.resources.money += event.data.value;
          }
          break;

        default:
          this.state.log.push(`Event occurred: ${event.type}`);
      }
    }

    // -----------------------------
    // PASSIVE SIMULATION
    // -----------------------------

    applyPassiveDrift() {
      const p = this.state.player;
      if (!p) return;

      // momentum naturally regresses toward mean
      p.resources.momentum += (50 - p.resources.momentum) * 0.02;

      // random micro-variation
      p.resources.momentum += this.random(-1.2, 1.2);

      // money burn (campaign cost)
      p.resources.money -= 5000 + Math.floor(this.rng.range(0, 5000));

      if (p.resources.money < 0) p.resources.money = 0;
    }

    random(min, max) {
      return this.rng.float(min, max);
    }

    // -----------------------------
    // MAIN TICK
    // -----------------------------

    step() {
      this.processEvents();
      this.applyPassiveDrift();

      this.state.log.push(`Day ${this.state.day} processed`);
    }
  }

  E.Game = Game;
})();