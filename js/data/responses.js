// js/data/responses.js
// Pooled response sets for scandals, gaffes, and debates.
// EventEngine picks one pool randomly per event — prevents the same 3 choices every time.

window.ElectionSim = window.ElectionSim || {};
window.ElectionSim.data = window.ElectionSim.data || {};

// ── SCANDAL RESPONSES ────────────────────────────────────────────────────────
// Each entry: { choices: [{label, desc, tag}], apply(idx, g, rng) }
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
        if (res >= 55) r.momentum += 3; // empathy bounce
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
        // Charisma check: high charisma turns gaffe into bounce
        if (charisma >= 65) { r.momentum += 4; }
        else if (charisma < 40) { r.momentum -= 5; g.activeEvents.push({ type: 'scandal', remaining: 3 }); }
        else { g.activeEvents.push({ type: 'scandal', remaining: 2 }); }
      } else {
        r.momentum -= 3;
        // Burns a surrogate slot conceptually — just a minor momentum trade
        g.activeEvents.push({ type: 'scandal', remaining: 1 });
      }
    }
  },
  {
    choices: [
      { label: 'Policy Pivot',       desc: 'Immediately announce a new initiative to dominate headlines.', tag: '-2 momentum · drowns story in 1 day' },
      { label: 'Fundraise Off It',   desc: '"They want to silence us." — fire up the base.',              tag: '-4 momentum · +$100k from energised donors' },
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

// ── PRESS CONFERENCE TOPICS ──────────────────────────────────────────────────
// Pick 3 at random each time a press conference is held.
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
      if (pos === 'liberal')       { g.getCoalition?.('minority')?.adjustSupport(3); g.getCoalition?.('rural')?.adjustSupport(-1); }
      else if (pos === 'conservative') { g.getCoalition?.('rural')?.adjustSupport(3); g.getCoalition?.('minority')?.adjustSupport(-1); }
      else                         { g.getCoalition?.('independent')?.adjustSupport(2); }
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
