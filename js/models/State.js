(function () {

  class State {
    constructor(data) {
      this.name = data.name;
      this.abbr = data.abbr;
      this.electoralVotes = data.electoralVotes;

      this.partisanLean = data.partisanLean; // - (D) to + (R)

      this.volatility = data.volatility;

      this.demographics = data.demographics;

      this.poll = {
        candidateA: 50,
        candidateB: 50,
        undecided: 0,
        volatility: data.volatility || 5
      };

      this.history = [];
      this.turnoutModifier = data.turnoutModifier || 1;
      this.issueWeights = data.issueWeights || {};
      this.issueLeans   = data.issueLeans   || {};

      this.playerSupport = 50;
      this.playerCampaignBoost = 0;   // direct support boost from targeted actions (decays ~18%/day)
      this.attentionDays       = 0;   // consecutive days of player activity here (read by AI)
      this.turnoutBoost        = 0;   // GOTV bonus — persists to election night vote calc
      this.opponentSupport = 50;

      this.aiPressure = 0;
    }

    updatePoll(deltaA, deltaB) {
      this.poll.candidateA += deltaA;
      this.poll.candidateB += deltaB;

      const total = this.poll.candidateA + this.poll.candidateB;
      this.poll.candidateA = (this.poll.candidateA / total) * 100;
      this.poll.candidateB = (this.poll.candidateB / total) * 100;
    }

    getLean() {
      if (this.poll.candidateA > this.poll.candidateB + 5) return "A";
      if (this.poll.candidateB > this.poll.candidateA + 5) return "B";
      return "TOSSUP";
    }
  }

  window.ElectionSim.models = window.ElectionSim.models || {};
  window.ElectionSim.models.State = State;
})();