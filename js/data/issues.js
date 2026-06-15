// Flat array kept for any backward-compatible iteration
window.ElectionSim.data.ISSUES = [
  'economy', 'healthcare', 'immigration', 'climate', 'taxes',
  'crime', 'education', 'foreign_policy', 'energy', 'social_issues', 'jobs'
];

// Rich position data — used by CandidateSelect, GameState, and state panel charts
window.ElectionSim.data.ISSUE_POSITIONS = {
  economy: {
    label: 'Economy',
    liberal:      { label: 'Pro-Worker',    desc: 'Regulate big business, expand worker rights',     effects: { working_class: 3, minority: 1, urban: 1, young: 1,   rural: -1, suburban: -1 } },
    centrist:     { label: 'Balanced',      desc: 'Growth with responsible oversight',               effects: {} },
    conservative: { label: 'Free Market',   desc: 'Deregulate, cut red tape, unleash business',     effects: { suburban: 2, rural: 2, college: 1,  working_class: -2, urban: -1 } }
  },
  healthcare: {
    label: 'Healthcare',
    liberal:      { label: 'Universal',     desc: 'Single-payer or robust public option',            effects: { seniors: 3, working_class: 3, young: 2, minority: 1, suburban: -1 } },
    centrist:     { label: 'ACA+',          desc: 'Strengthen and expand existing coverage',         effects: { seniors: 1, working_class: 1 } },
    conservative: { label: 'Market-Based',  desc: 'Competition and choice, not government mandates', effects: { rural: 2, suburban: 2,  seniors: -2, working_class: -3 } }
  },
  immigration: {
    label: 'Immigration',
    liberal:      { label: 'Reform',        desc: 'Path to citizenship, expanded legal immigration', effects: { minority: 4, young: 2, urban: 2,   rural: -2, working_class: -1 } },
    centrist:     { label: 'Secure & Hum.', desc: 'Border security with humane treatment',           effects: { suburban: 1, independent: 1 } },
    conservative: { label: 'Enforcement',   desc: 'Strict enforcement, limit new entry',             effects: { rural: 3, working_class: 2, suburban: 1, minority: -4, urban: -2 } }
  },
  climate: {
    label: 'Climate',
    liberal:      { label: 'Green New Deal',desc: 'Aggressive clean transition, major investment',   effects: { young: 4, college: 3, urban: 2,     rural: -3, working_class: -2 } },
    centrist:     { label: 'Paris+',        desc: 'Meet targets through balanced transition',        effects: { young: 1, college: 1, suburban: 1 } },
    conservative: { label: 'Energy First',  desc: 'Energy independence over green mandates',         effects: { rural: 3, working_class: 2,  young: -3, college: -2, urban: -1 } }
  },
  taxes: {
    label: 'Taxes',
    liberal:      { label: 'Fair Share',    desc: 'Raise taxes on wealthy and corporations',         effects: { working_class: 3, young: 2, minority: 1, suburban: -2, college: -1 } },
    centrist:     { label: 'Targeted',      desc: 'Close loopholes, targeted credits',               effects: { working_class: 1, suburban: 1 } },
    conservative: { label: 'Cut & Grow',    desc: 'Broad cuts to stimulate economic growth',         effects: { suburban: 3, rural: 2, college: 2,  working_class: -1, minority: -1 } }
  },
  crime: {
    label: 'Crime & Justice',
    liberal:      { label: 'Reform',        desc: 'Police reform, rehabilitation, end mass incarceration', effects: { minority: 4, young: 3, college: 2, urban: 2, rural: -2, working_class: -1 } },
    centrist:     { label: 'Balanced',      desc: 'Public safety with accountability',               effects: { independent: 2 } },
    conservative: { label: 'Law & Order',   desc: 'Back the blue, mandatory minimums',               effects: { rural: 3, suburban: 3, seniors: 2, working_class: 1, minority: -3, young: -2 } }
  },
  education: {
    label: 'Education',
    liberal:      { label: 'Public Good',   desc: 'Fund public schools, free community college',     effects: { young: 3, college: 2, working_class: 2, minority: 2, rural: -1 } },
    centrist:     { label: 'Reform+Fund',   desc: 'Accountability and targeted investment',          effects: { college: 1, young: 1 } },
    conservative: { label: 'School Choice', desc: 'Vouchers, charter schools, parental rights',      effects: { suburban: 3, rural: 2,  young: -2, working_class: -1, minority: -1 } }
  },
  foreign_policy: {
    label: 'Foreign Policy',
    liberal:      { label: 'Multilateral',  desc: 'Alliances, diplomacy, international institutions', effects: { college: 2, urban: 2, young: 1,  rural: -1 } },
    centrist:     { label: 'Pragmatic',     desc: 'American interests through strategic engagement',  effects: {} },
    conservative: { label: 'America First', desc: 'Sovereignty, strength, reduced foreign commitments', effects: { rural: 3, working_class: 2, seniors: 2, college: -1, urban: -1 } }
  },
  energy: {
    label: 'Energy',
    liberal:      { label: 'Clean Energy',  desc: 'Renewables investment, phase out fossil fuels',   effects: { young: 3, college: 2, urban: 2,   rural: -2, working_class: -2 } },
    centrist:     { label: 'All of Above',  desc: 'Transition while maintaining energy security',    effects: { suburban: 1, independent: 1 } },
    conservative: { label: 'Fossil Fuels',  desc: 'Domestic oil, gas and coal — jobs and independence', effects: { rural: 4, working_class: 3, young: -3, college: -2 } }
  },
  social_issues: {
    label: 'Social Issues',
    liberal:      { label: 'Progressive',   desc: 'Protect civil rights, LGBTQ+ rights, gender equality', effects: { young: 4, college: 3, minority: 3, urban: 2, rural: -3, seniors: -2 } },
    centrist:     { label: 'Moderate',      desc: 'Protect rights while respecting cultural differences',  effects: { suburban: 2, independent: 1 } },
    conservative: { label: 'Traditional',   desc: 'Traditional values, religious liberty, family',    effects: { rural: 3, seniors: 3, working_class: 1, young: -3, college: -2, minority: -1 } }
  },
  jobs: {
    label: 'Jobs & Workers',
    liberal:      { label: 'Labor First',   desc: 'Unions, minimum wage increase, worker protections', effects: { working_class: 4, young: 2, minority: 2, rural: 1, suburban: -1 } },
    centrist:     { label: 'Growth+Fair',   desc: 'Job creation paired with fair wage standards',    effects: { working_class: 1, suburban: 1 } },
    conservative: { label: 'Business-Led',  desc: 'Remove barriers to business growth and hiring',   effects: { suburban: 3, rural: 2, college: 2, working_class: -2, minority: -1 } }
  }
};