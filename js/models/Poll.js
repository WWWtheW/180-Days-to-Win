(function () {
  const E = window.ElectionSim;

  class Poll {
    constructor(config) {
      this.day = config.day;

      this.pollster = config.pollster;

      this.state = config.state || null;

      this.player =
        config.player;

      this.opponent =
        config.opponent;

      this.sampleSize =
        config.sampleSize;

      this.error =
        config.error;
    }
  }

  E.models = E.models || {};
  E.models.Poll = Poll;
})();