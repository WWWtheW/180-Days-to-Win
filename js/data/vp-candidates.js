// js/data/vp-candidates.js
// VP candidate pool split by party. Player draws from their own party's list
// (VPPick.js); opponent AI draws from theirs (OpponentAI.js). Since player and
// opponent are always opposing parties, the two lists never overlap — no risk
// of the same running mate being "available" to both campaigns.

window.ElectionSim = window.ElectionSim || {};
window.ElectionSim.data = window.ElectionSim.data || {};

window.ElectionSim.data.VP_CANDIDATES = {

  Democrat: [
    { name: 'Sen. Maria Santos',  state: 'NV', coalition: 'minority',      boost: 5, risk: 'Low', archetype: 'Swing-State Champion',
      desc: 'Former federal prosecutor with deep roots in Nevada\'s Latino community. Brings credibility on immigration and law enforcement.' },
    { name: 'Gov. James Hartley', state: 'OH', coalition: 'working_class', boost: 5, risk: 'Low', archetype: 'Rust Belt Bridge',
      desc: 'Two-term governor who flipped a red state. Commands enormous credibility with white working-class voters across the Midwest.' },
    { name: 'Rep. Claire Nguyen', state: 'AZ', coalition: 'young',         boost: 4, risk: 'Med', archetype: 'Next Generation',
      desc: 'Youngest member of Congress at 38. Energises youth turnout dramatically, but some question her readiness on foreign policy.' },
    { name: 'Sen. David Okafor',  state: 'GA', coalition: 'minority',      boost: 6, risk: 'Med', archetype: 'Base Energizer',
      desc: 'Civil rights leader turned senator. Supercharges minority turnout nationally. Some moderate voters view him as too progressive.' },
    { name: 'Gov. Susan Marsh',   state: 'PA', coalition: 'suburban',      boost: 5, risk: 'Low', archetype: 'Suburban Anchor',
      desc: 'Former Republican-turned-independent who won Pennsylvania twice. A genuine crossover pick — moderate, experienced, scandal-free.' },
  ],

  Republican: [
    { name: 'Sen. Tom Whitfield',    state: 'TX', coalition: 'rural',         boost: 5, risk: 'Low', archetype: 'Heartland Stalwart',
      desc: 'Third-term senator from the Texas plains. Commands deep trust with rural and agricultural voters across the Sun Belt.' },
    { name: 'Gov. Linda Castellano', state: 'FL', coalition: 'seniors',       boost: 5, risk: 'Low', archetype: 'Sunbelt Anchor',
      desc: 'Two-term governor who built a coalition of retirees and small business owners. Scandal-free and well-liked statewide.' },
    { name: 'Rep. Marcus Doyle',     state: 'WI', coalition: 'working_class', boost: 5, risk: 'Med', archetype: 'Rust Belt Populist',
      desc: 'A union-hall favourite turned congressman, known for blunt talk and a blue-collar appeal that crosses party lines.' },
    { name: 'Sen. Rachel Kim',       state: 'NC', coalition: 'suburban',      boost: 4, risk: 'Med', archetype: 'Suburban Crossover',
      desc: 'A first-term senator with crossover appeal among suburban moderates, though some in the base see her as too centrist.' },
    { name: 'Gov. Hank Buchanan',    state: 'OH', coalition: 'independent',   boost: 4, risk: 'Low', archetype: 'Midwest Bridge-Builder',
      desc: 'A pragmatic governor known for reaching across the aisle — popular with independents, occasionally distrusted by the party base.' },
  ]

};
