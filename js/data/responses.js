// js/data/responses.js
// Pooled response sets for scandals, gaffes, debates, and press conferences.
// EventEngine / DebateSystem picks one pool per event — prevents identical choices every time.

window.ElectionSim = window.ElectionSim || {};
window.ElectionSim.data = window.ElectionSim.data || {};

// ── SCANDAL RESPONSES ────────────────────────────────────────────────────────
window.ElectionSim.data.SCANDAL_RESPONSES = [
  {
    choices: [
      { label: 'Deny & Attack Source',  desc: 'Discredit the reporting and go on offence.',           tag: '-2 momentum · outcome depends on scandal resistance' },
      { label: 'Apologise & Pivot',     desc: 'Accept responsibility and pivot to policy.',            tag: '-7 momentum · 2-day cycle' },
      { label: 'Ride It Out',           desc: 'No comment. Full cycle but no immediate cost.',         tag: '0 now · full 3-day cycle' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      const res = g.player.stats?.scandalResistance ?? 50;
      if (idx === 0) {
        r.momentum -= 2;
        const bonus = (res - 50) / 10;
        r.momentum += bonus;
        g.activeEvents.push({ type: 'scandal', remaining: bonus > 0 ? 1 : 3 });
      } else if (idx === 1) {
        r.momentum -= 7;
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      } else {
        g.activeEvents.push({ type: 'scandal', remaining: 3 });
      }
    }
  },
  {
    choices: [
      { label: 'Full Press Conference',  desc: 'Take questions head-on — transparency over evasion.',  tag: '-4 momentum · short cycle if credible' },
      { label: 'Surrogate Response',     desc: 'Let your team handle it while you stay above the fray.', tag: '-3 momentum · 2-day cycle' },
      { label: 'Change the Subject',     desc: 'Announce a bold policy pivot and drown out the noise.', tag: '-1 momentum · story lingers 4 days' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      if (idx === 0) {
        r.momentum -= 4;
        const res = g.player.stats?.scandalResistance ?? 50;
        g.activeEvents.push({ type: 'scandal', remaining: res >= 60 ? 1 : 2 });
      } else if (idx === 1) {
        r.momentum -= 3;
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      } else {
        r.momentum -= 1;
        g.activeEvents.push({ type: 'scandal', remaining: 4 });
      }
    }
  },
  {
    choices: [
      { label: 'Legal Action Threat',   desc: 'Push back hard and demand retractions.',               tag: '-2 momentum · 30% chance escalates' },
      { label: 'Personal Statement',    desc: 'Speak directly to voters — humanise the response.',    tag: '-5 momentum · wins empathy if authentic' },
      { label: 'Pivot to Opponent',     desc: 'Turn the narrative back with a counter-attack.',        tag: '-3 momentum · opponent -3 momentum' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      const opp = g.opponents?.[0];
      if (idx === 0) {
        r.momentum -= 2;
        if (rng.next() < 0.3) g.activeEvents.push({ type: 'scandal', remaining: 4 });
        else                  g.activeEvents.push({ type: 'scandal', remaining: 1 });
      } else if (idx === 1) {
        r.momentum -= 5;
        const res = g.player.stats?.scandalResistance ?? 50;
        if (res >= 55) r.momentum += 3;
        g.activeEvents.push({ type: 'scandal', remaining: 1 });
      } else {
        r.momentum -= 3;
        if (opp) opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 3);
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      }
    }
  },
  {
    choices: [
      { label: 'Op-Ed Rebuttal',        desc: 'Write directly to voters in a major newspaper.',       tag: '-2 momentum · +2 suburban coalition' },
      { label: 'Fundraise Off It',       desc: '"They want to silence us." — energise the base.',      tag: '-4 momentum · +$150k if base is fired up' },
      { label: 'One-on-One Interview',   desc: 'Sit down with a trusted journalist for a deep dive.',  tag: '-3 momentum · 60% clears the air' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      if (idx === 0) {
        r.momentum -= 2;
        g.getCoalition?.('suburban')?.adjustSupport(2);
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      } else if (idx === 1) {
        r.momentum -= 4;
        r.money = (r.money || 0) + 150000;
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      } else {
        r.momentum -= 3;
        if (rng.next() < 0.6) g.activeEvents.push({ type: 'scandal', remaining: 1 });
        else                  g.activeEvents.push({ type: 'scandal', remaining: 3 });
      }
    }
  }
];

// ── GAFFE RESPONSES ──────────────────────────────────────────────────────────
window.ElectionSim.data.GAFFE_RESPONSES = [
  {
    choices: [
      { label: 'Deny & Redirect',   desc: 'Dispute the characterisation and pivot to your message.', tag: '-3 momentum · story runs 2 days' },
      { label: 'Apologise & Pivot', desc: 'Own it briefly, then pivot hard to policy.',              tag: '-6 momentum · ends today' },
      { label: 'Stay Silent',       desc: 'No comment — let it fade on its own.',                   tag: '-4 momentum · 50% chance escalates' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      if (idx === 0)      { r.momentum -= 3; g.activeEvents.push({ type: 'scandal', remaining: 2 }); }
      else if (idx === 1) { r.momentum -= 6; }
      else                { r.momentum -= 4; if (rng.next() > 0.5) g.activeEvents.push({ type: 'scandal', remaining: 3 }); }
    }
  },
  {
    choices: [
      { label: 'Clarification Tour',     desc: 'Do back-to-back interviews explaining what you meant.', tag: '-2 momentum · adds 1 day of coverage' },
      { label: 'Lean Into It',           desc: 'Embrace the moment with self-deprecating humour.',       tag: '-1 momentum · high risk / high reward' },
      { label: 'Rapid Surrogate Deploy', desc: 'Send allies into every market to control the message.',  tag: '-3 momentum · burns one surrogate slot' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      const charisma = g.player.stats?.charisma ?? 50;
      if (idx === 0) {
        r.momentum -= 2;
        g.activeEvents.push({ type: 'scandal', remaining: 3 });
      } else if (idx === 1) {
        r.momentum -= 1;
        if (charisma >= 65)  { r.momentum += 4; }
        else if (charisma < 40) { r.momentum -= 5; g.activeEvents.push({ type: 'scandal', remaining: 3 }); }
        else { g.activeEvents.push({ type: 'scandal', remaining: 2 }); }
      } else {
        r.momentum -= 3;
        // Actually burn a surrogate slot — pull one active surrogate off the trail early
        if (g.activeSurrogates?.length) {
          const idx2 = Math.floor(rng.next() * g.activeSurrogates.length);
          const pulled = g.activeSurrogates.splice(idx2, 1)[0];
          g.news.unshift({
            day: g.day,
            headline: `${pulled.stateName ?? pulled.stateAbbr} surrogate recalled to handle messaging crisis`
          });
          g.log.push(`Surrogate pulled from ${pulled.stateAbbr} to manage gaffe response`);
        }
        g.activeEvents.push({ type: 'scandal', remaining: 1 });
      }
    }
  },
  {
    choices: [
      { label: 'Policy Pivot',        desc: 'Immediately announce a new initiative to dominate headlines.', tag: '-2 momentum · drowns story in 1 day' },
      { label: 'Fundraise Off It',    desc: '"They want to silence us." — fire up the base.',              tag: '-4 momentum · +$100k from energised donors' },
      { label: 'Town Hall Deep Dive', desc: 'Host an unscripted Q&A to show confidence and openness.',    tag: '-3 momentum · +2 college coalition' }
    ],
    apply(idx, g, rng) {
      const r = g.player.resources;
      if (idx === 0) {
        r.momentum -= 2;
        g.activeEvents.push({ type: 'scandal', remaining: 1 });
      } else if (idx === 1) {
        r.momentum -= 4;
        r.money = (r.money || 0) + 100000;
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      } else {
        r.momentum -= 3;
        g.getCoalition?.('college')?.adjustSupport(2);
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
      }
    }
  }
];

// ── DEBATE RESPONSES ─────────────────────────────────────────────────────────
// Each pool is presented as the 3 choices for one debate.
// DebateSystem picks one pool per debate (seeded), then passes chosen topic to _resolve().
// Topic shape matches DEBATE_TOPICS in DebateSystem.js — _resolve() works on either.
//
// HOW TO WIRE UP (2-line change in DebateSystem.triggerDebateModal):
//   const pools = window.ElectionSim.data?.DEBATE_RESPONSES;
//   const offered = pools?.length ? this._pick(pools) : [...DEBATE_TOPICS].sort(()=>this.game.rng.next()-0.5).slice(0,3);

window.ElectionSim.data.DEBATE_RESPONSES = [
  // ── Pool 1: Kitchen Table ──────────────────────────────────────────────────
  [
    {
      id: 'cost_of_living', label: 'Cost of Living Crisis',
      desc: 'Hammer the opponent on grocery bills, rent, and everyday costs — put a face on the numbers.',
      statKey: 'politicalInstinct',
      effects: { working_class: 4, seniors: 2, suburban: 1 },
      risk: 'Opponent may question your economic credibility.',
      tag: '🛒 Cost of Living'
    },
    {
      id: 'healthcare', label: 'Healthcare Appeal',
      desc: 'Make a personal case for your healthcare plan — focus on real families and pre-existing conditions.',
      statKey: 'charisma',
      effects: { seniors: 4, working_class: 2, independent: 1 },
      risk: 'Lower floor — charisma-dependent. Policy gaps get exposed.',
      tag: '🏥 Healthcare'
    },
    {
      id: 'wages', label: 'Wages & Workers',
      desc: 'Draw a clear contrast on minimum wage, union rights, and corporate power.',
      statKey: 'politicalInstinct',
      effects: { working_class: 5, young: 2, rural: 1, suburban: -1 },
      risk: 'Suburban moderates may see this as too populist.',
      tag: '⚒ Workers'
    }
  ],

  // ── Pool 2: Security & Order ───────────────────────────────────────────────
  [
    {
      id: 'crime_safety', label: 'Crime & Public Safety',
      desc: 'Own the law-and-order frame — make a credible case on public safety without alienating minorities.',
      statKey: 'debate',
      effects: { suburban: 3, independent: 2, rural: 2, minority: -2 },
      risk: 'Easy to overreach and lose minority coalition ground.',
      tag: '🔒 Public Safety'
    },
    {
      id: 'immigration', label: 'Border & Immigration',
      desc: 'Take a clear stance on border security and immigration enforcement or a path to citizenship.',
      statKey: 'politicalInstinct',
      effects: { rural: 3, working_class: 2, minority: -1, young: -1 },
      risk: 'High-variance. Opponent will drive wedge on specifics.',
      tag: '🛂 Immigration'
    },
    {
      id: 'foreign_policy', label: 'Foreign Policy & Alliances',
      desc: 'Project competence on NATO, China, and global stability — draw a contrast on experience.',
      statKey: 'experience',
      effects: { seniors: 3, suburban: 2, independent: 2, young: -1 },
      risk: 'Domestic-focused voters may tune out. Gets technical fast.',
      tag: '🌐 Foreign Policy'
    }
  ],

  // ── Pool 3: Future & Vision ────────────────────────────────────────────────
  [
    {
      id: 'climate', label: 'Climate & Clean Energy',
      desc: 'Make the affirmative case for clean energy jobs and long-term climate leadership.',
      statKey: 'politicalInstinct',
      effects: { young: 5, college: 3, suburban: 1, rural: -2 },
      risk: 'Rural and working-class voters may see this as job-threatening.',
      tag: '🌿 Climate'
    },
    {
      id: 'education', label: 'Education & Opportunity',
      desc: 'Champion public schools, student debt relief, and equal access to higher education.',
      statKey: 'charisma',
      effects: { young: 4, college: 3, working_class: 1, seniors: -1 },
      risk: 'Seniors may see this as prioritising the young at their expense.',
      tag: '🎓 Education'
    },
    {
      id: 'values_vision', label: 'Values & National Vision',
      desc: 'Elevate the debate above policy — paint a picture of the country you\'re fighting for.',
      statKey: 'charisma',
      effects: { young: 3, independent: 2, college: 2, rural: -1 },
      risk: 'Opponent may pivot to specifics you can\'t answer.',
      tag: '🌟 Vision'
    }
  ],

  // ── Pool 4: Credibility & Record ──────────────────────────────────────────
  [
    {
      id: 'experience', label: 'Experience & Stability',
      desc: 'Contrast your record and readiness against your opponent\'s weaknesses.',
      statKey: 'experience',
      effects: { seniors: 3, suburban: 2, independent: 2, young: -1 },
      risk: 'Can read as establishment. Opponent may call it out.',
      tag: '⚖ Record'
    },
    {
      id: 'taxes', label: 'Tax Policy',
      desc: 'Draw a sharp contrast on who pays — tax cuts for the wealthy vs relief for the middle class.',
      statKey: 'politicalInstinct',
      effects: { working_class: 3, college: 2, seniors: 1, rural: 1 },
      risk: 'Complex terrain. Opponent will deploy talking points fast.',
      tag: '💵 Taxes'
    },
    {
      id: 'direct_attack', label: 'Direct Attack',
      desc: 'Go on offence — challenge the opponent directly on their biggest liability.',
      statKey: 'debate',
      effects: { independent: -1, urban: 2, working_class: 2, young: 2 },
      risk: 'High risk. Strong counter from opponent shuts this down fast.',
      tag: '⚔ Attack'
    }
  ],

  // ── Pool 5: Social Contract ────────────────────────────────────────────────
  [
    {
      id: 'social_security', label: 'Social Security & Retirement',
      desc: 'Defend Social Security and Medicare against cuts — make the opponent own their record.',
      statKey: 'politicalInstinct',
      effects: { seniors: 5, working_class: 2, suburban: 1 },
      risk: 'Gets wonky fast. One wrong number and it unravels.',
      tag: '👴 Retirement'
    },
    {
      id: 'veterans', label: 'Veterans & Military',
      desc: 'Champion veterans\' care and military readiness — speak directly to service families.',
      statKey: 'experience',
      effects: { rural: 3, independent: 2, suburban: 2, young: 1 },
      risk: 'Any perceived weakness on defence gets amplified immediately.',
      tag: '🎖 Veterans'
    },
    {
      id: 'democracy', label: 'Democracy & Rule of Law',
      desc: 'Draw a sharp contrast on democratic norms, judicial independence, and voting rights.',
      statKey: 'charisma',
      effects: { college: 4, suburban: 3, young: 2, rural: -2 },
      risk: 'Rural voters may see this as condescending. High enthusiasm, high polarisation.',
      tag: '🗳 Democracy'
    }
  ]
];

// ── PRESS CONFERENCE TOPICS ──────────────────────────────────────────────────
window.ElectionSim.data.PRESS_CONFERENCE_TOPICS = [
  {
    label: 'Economic Vision',
    desc: 'Lay out your economic agenda and field tough questions from journalists.',
    tag: '+3 momentum · working_class & college boost',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 3);
      g.getCoalition?.('working_class')?.adjustSupport(2);
      g.getCoalition?.('college')?.adjustSupport(1);
    }
  },
  {
    label: 'Healthcare Commitment',
    desc: 'Reaffirm your healthcare platform in detail — draw a clear contrast.',
    tag: '+2 momentum · seniors & working_class',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 2);
      g.getCoalition?.('seniors')?.adjustSupport(2);
      g.getCoalition?.('working_class')?.adjustSupport(1);
    }
  },
  {
    label: 'National Security',
    desc: 'Project strength and decisiveness on defence and foreign policy.',
    tag: '+2 momentum · suburban & independent',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 2);
      g.getCoalition?.('suburban')?.adjustSupport(2);
      g.getCoalition?.('independent')?.adjustSupport(2);
    }
  },
  {
    label: 'Climate & Energy',
    desc: 'Speak directly on your climate agenda and future energy policy.',
    tag: '+3 momentum · young & college',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 3);
      g.getCoalition?.('young')?.adjustSupport(3);
      g.getCoalition?.('college')?.adjustSupport(1);
    }
  },
  {
    label: 'Immigration & Border',
    desc: 'Take questions on immigration policy — own your position clearly.',
    tag: '+1 momentum · high-variance coalition shifts',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 1);
      const pos = g.issuePositions?.immigration;
      if (pos === 'liberal')           { g.getCoalition?.('minority')?.adjustSupport(3); g.getCoalition?.('rural')?.adjustSupport(-1); }
      else if (pos === 'conservative') { g.getCoalition?.('rural')?.adjustSupport(3); g.getCoalition?.('minority')?.adjustSupport(-1); }
      else                             { g.getCoalition?.('independent')?.adjustSupport(2); }
    }
  },
  {
    label: 'Education & Youth',
    desc: 'Champion your education agenda — student debt, funding, teachers.',
    tag: '+2 momentum · young & college',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 2);
      g.getCoalition?.('young')?.adjustSupport(2);
      g.getCoalition?.('college')?.adjustSupport(2);
    }
  },
  {
    label: 'Jobs & Workers',
    desc: 'Speak directly to working people — union halls, wages, trade.',
    tag: '+3 momentum · working_class & rural',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 3);
      g.getCoalition?.('working_class')?.adjustSupport(3);
      g.getCoalition?.('rural')?.adjustSupport(1);
    }
  },
  {
    label: 'Democracy & Rule of Law',
    desc: 'Draw a sharp contrast on democratic norms and judicial independence.',
    tag: '+2 momentum · suburban & college',
    apply(g) {
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 2);
      g.getCoalition?.('suburban')?.adjustSupport(2);
      g.getCoalition?.('college')?.adjustSupport(2);
    }
  }
];
