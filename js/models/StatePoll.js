(function () {
  const E = window.ElectionSim;

  class StatePoll {
    constructor(config) {
      this.day = config.day;
      this.state = config.state;

      this.pollster = config.pollster;

      this.player = config.player;
      this.opponent = config.opponent;

      this.sampleSize = config.sampleSize;
      this.error = config.error;
    }
  }

  E.models = E.models || {};
  E.models.StatePoll = StatePoll;
})();