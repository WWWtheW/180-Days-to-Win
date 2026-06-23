(function () {
  const E = window.ElectionSim;

  const DEBATE_TOPICS = [
    {
      id:       'economy',
      label:    'Attack on Economy',
      desc:     'Hammer the opponent\'s economic record and cost-of-living failures.',
      statKey:  'politicalInstinct',
      effects:  { working_class: 3, suburban: 1, young: 1 },
      risk:     'Opponent may pivot to your own record.',
      tag:      '📊 Economy'
    },
    {
      id:       'healthcare',
      label:    'Healthcare Appeal',
      desc:     'Make a personal case for your healthcare plan — focus on real families.',
      statKey:  'charisma',
      effects:  { seniors: 4, working_class: 2, independent: 1 },
      risk:     'Lower stat floor — charisma-dependent.',
      tag:      '🏥 Healthcare'
    },
    {
      id:       'values',
      label:    'Values & Vision',
      desc:     'Elevate the debate — paint a picture of the country you\'re fighting for.',
      statKey:  'charisma',
      effects:  { young: 3, independent: 2, college: 2, rural: -1 },
      risk:     'Weak on specifics — opponent may pivot to policy details.',
      tag:      '🌟 Vision'
    },
    {
      id:       'experience',
      label:    'Experience & Stability',
      desc:     'Contrast your record and readiness with your opponent\'s weaknesses.',
      statKey:  'experience',
      effects:  { seniors: 3, suburban: 2, independent: 2, young: -1 },
      risk:     'Can come across as establishment.',
      tag:      '⚖ Record'
    },
    {
      id:       'attack',
      label:    'Direct Attack',
      desc:     'Go on offence — challenge the opponent directly on their biggest liability.',
      statKey:  'debate',
      effects:  { independent: -1, urban: 2, working_class: 2, young: 2 },
      risk:     'Risky — can backfire if opponent has a strong counter.',
      tag:      '⚔ Attack'
    }
  ];

  class DebateSystem {
    constructor(gameState) {
      this.game       = gameState;
      this.debateDays = [60, 120, 160];
      this.pendingDebate = false;
    }

    shouldDebate(day) {
      return this.debateDays.includes(day);
    }

    // Called by GameState.advanceDay() when shouldDebate is true
    triggerDebateModal(onResolved) {
      const debateNum = this.debateDays.indexOf(this.game.day) + 1;

      // Pick a thematic pool from responses.js; fall back to shuffling built-in topics
      const pools = window.ElectionSim.data?.DEBATE_RESPONSES;
      let offered;
      if (pools?.length) {
        offered = this._pick(pools);  // seeded pick of one 3-topic pool
      } else {
        const shuffled = [...DEBATE_TOPICS].sort(() => this.game.rng.next() - 0.5);
        offered = shuffled.slice(0, 3);
      }

      E.ChoiceModal.show({
        tag:      `PRESIDENTIAL DEBATE ${debateNum} OF 3`,
        title:    'Choose your strategy',
        subtitle: `Debate prep: ${Math.round(this.game.debatePreparation)} pts · Your debate skill: ${this.game.player?.stats?.debate ?? '?'}`,
        choices: offered.map(t => ({
          label: t.label,
          desc:  `${t.desc} <span style="color:#475569;font-size:10px">${t.risk}</span>`,
          tag:   t.tag
        })),
        onChoice: (i) => {
          const topic = offered[i];
          const result = this._resolve(topic);
          onResolved(result);
        }
      });
    }

    _resolve(topic) {
      const player   = this.game.player;
      const opponent = this.game.opponents[0];
      if (!opponent) return { result: 'draw', topic };

      // Player's underlying debate skill now always contributes (35%), same way the
      // opponent's score always weighs theirs — previously only 2 of 15 topics used it at all.
      const topicVal     = player.stats[topic.statKey] || 50;
      const debateVal    = player.stats.debate || 50;
      const statVal      = topicVal * 0.65 + debateVal * 0.35;
      const prepBonus    = Math.min(20, this.game.debatePreparation);
      const playerScore  = statVal + prepBonus + this.game.rng.range(-12, 12);
      const oppScore     = opponent.stats.debate * 0.6 + opponent.stats.charisma * 0.4
                           + this.game.rng.range(-12, 12);
      const margin       = playerScore - oppScore;

      // Apply topic coalition effects scaled by margin
      const scale = Math.max(0.3, Math.min(1.5, playerScore / 70));
      for (const [name, delta] of Object.entries(topic.effects)) {
        this.game.getCoalition(name)?.adjustSupport(delta * scale * (margin > 0 ? 1 : -0.5));
      }

      let result;
      if (margin > 15)       result = 'win';
      else if (margin < -15) result = 'loss';
      else                   result = 'draw';

      return { result, margin, topic };
    }

    // Kept for backward compat — called if modal is somehow skipped
    runDebate() {
      return this._resolve(DEBATE_TOPICS[0]);
    }

    _pick(arr) {
      return arr[Math.floor(this.game.rng.next() * arr.length)];
    }
  }

  E.DebateSystem = DebateSystem;
})();