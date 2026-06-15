(function () {
  const U = window.ElectionSim.utils;

  function rollStats(rng, difficulty = 1) {
    // difficulty > 1 slightly reduces player advantage consistency
    const base = (min, max) =>
      min + Math.floor((rng.range(0, max - min)) / difficulty)

    return {
      charisma: base(40, 90),
      debate: base(35, 90),
      fundraising: base(40, 95),
      experience: base(30, 95),
      scandalResistance: base(20, 90),
      discipline: base(30, 90),
      mediaSkill: base(35, 95),
      politicalInstinct: base(30, 95)
    };
  }

  function generateIdentity(rng) {
    const archetypes = [
      "outsider",
      "insider",
      "populist",
      "moderate",
      "reformer",
      "technocrat",
      "firebrand"
    ];

    return {
      archetype: rng.pick(archetypes)
    };
  }

  class Candidate {
    constructor(name, party, rng, isPlayer = false, statPreset = null, difficulty = 1.1) {
      this.name = name;
      this.party = party;
      this.isPlayer = isPlayer;

      this.identity = generateIdentity(rng);
      this.stats = statPreset
        ? { ...statPreset }
        : rollStats(rng, isPlayer ? 1 : difficulty);

      this.polling = {
        national: 50
      };

      this.resources = {
        money:           isPlayer ? 5000000 : rng.range(2000000, 8000000),
        momentum:        50,
        volunteers:      isPlayer ? 1000 : 0,
        politicalCapital: isPlayer ? 50  : 0
      };
    }

    getStrengthScore() {
      const s = this.stats;
      return (
        s.charisma * 0.15 +
        s.debate * 0.1 +
        s.fundraising * 0.1 +
        s.mediaSkill * 0.15 +
        s.politicalInstinct * 0.2 +
        s.discipline * 0.1 +
        s.experience * 0.1 +
        s.scandalResistance * 0.1
      );
    }
  }

  window.ElectionSim.models = window.ElectionSim.models || {};
  window.ElectionSim.models.Candidate = Candidate;
})();