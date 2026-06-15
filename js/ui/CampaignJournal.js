(function () {
  'use strict';
  const E = window.ElectionSim;

  // Anti-repetition: each template has an id; track which were used in recent weeks
  const OPENERS = [
    (d) => `Week ${d.week} opened with the campaign ${d.trailing ? 'fighting to close a gap' : 'pressing a hard-won lead'} in the polls.`,
    (d) => `Entering week ${d.week}, ${d.name}'s operation ${d.trailing ? 'faced mounting pressure' : 'moved with growing confidence'}.`,
    (d) => `The ${d.week === 1 ? 'first' : d.week === 2 ? 'second' : `${d.week}th`} week of the general found ${d.name} ${d.trailing ? 'in a tighter position than hoped' : 'consolidating momentum'}.`,
    (d) => `Day ${d.startDay} kicked off with ${d.name}'s campaign ${d.momentum > 60 ? 'riding high' : d.momentum < 40 ? 'under pressure' : 'in a holding pattern'} on momentum.`,
    (d) => `Week ${d.week}: ${d.name}'s team ${d.slotsUsed > 8 ? 'drove a punishing schedule' : 'worked methodically'} across the battleground map.`,
  ];

  const STATE_SENTENCES = [
    (d) => d.topState ? `The bulk of campaign activity centred on ${d.topState}, where the team invested heavily.` : null,
    (d) => d.topState ? `${d.topState} drew the most attention this week — a reflection of its place in the path to 270.` : null,
    (d) => d.topState ? `Field operations in ${d.topState} consumed the most resources, with the campaign tracking closely there.` : null,
    (d) => d.topState && d.topState2 ? `${d.topState} and ${d.topState2} both saw sustained activity as the campaign worked its battleground map.` : null,
  ];

  const COALITION_SENTENCES = [
    (d) => d.topCoalition ? `Outreach to ${d.topCoalition.replace('_',' ')} voters remained a central focus throughout the week.` : null,
    (d) => d.topCoalition ? `The campaign's messaging leaned into ${d.topCoalition.replace('_',' ')} concerns, hoping to consolidate that bloc.` : null,
    (d) => null,
  ];

  const EVENT_SENTENCES = {
    endorsement:     (d) => `A highlight was an endorsement from ${d.who || 'a major outside group'}, which added credibility with ${(d.coalition || '').replace('_',' ')} voters.`,
    viral_positive:  () => `A moment from the trail went viral online, generating an unexpected surge in enthusiasm and volunteer sign-ups.`,
    viral_negative:  () => `A clip circulated online drew ridicule — a reminder of how quickly the news cycle can turn.`,
    state_event:     (d) => `Events in ${d.state || 'a key state'} reshaped local priorities, adding urgency to the campaign's ground presence there.`,
    vp_pick:         (d) => `The selection of ${d.name} as running mate defined the week, energising the base and drawing heavy media coverage.`,
    october_surprise:(d) => `A late-breaking story — ${d.label || 'major news event'} — dominated the final days of the week and forced the campaign onto defence.`,
    debate_win:      () => `A strong debate performance shifted the narrative, with analysts giving ${E.state?.player?.name ?? 'the candidate'} the edge across key exchanges.`,
    debate_loss:     () => `The debate did not go as planned — a difficult night that the campaign will need to put behind it quickly.`,
    debate_draw:     () => `Both candidates held their ground in the debate — no decisive winner, though the campaign felt momentum remain stable.`,
  };

  const OPPONENT_SENTENCES = [
    (d) => d.oppName ? `${d.oppName} spent the week ${d.oppLeading ? 'defending a lead' : 'pressing hard in battlegrounds'} of their own.` : null,
    (d) => d.oppName ? `On the other side of the race, ${d.oppName}'s campaign ${d.oppMomentum > 55 ? 'appeared energised' : 'showed signs of strain'}.` : null,
    (d) => null,
  ];

  const CLOSERS = [
    (d) => `The campaign moves into week ${d.week + 1} with ${180 - d.endDay} days remaining.`,
    (d) => `With ${180 - d.endDay} days to election day, every decision carries more weight than the last.`,
    (d) => `${d.trailing ? 'The math remains daunting, but' : 'Momentum intact,'} the road ahead demands total focus.`,
    (d) => d.endDay > 160 ? 'The final sprint begins.' : `The clock is ticking — ${180 - d.endDay} days left.`,
  ];

  function pickFresh(templates, usedSet, data) {
    const available = templates.filter((_, i) => !usedSet.has(i));
    const pool      = available.length ? available : templates;
    for (const tpl of pool) {
      const result = tpl(data);
      if (result) {
        const idx = templates.indexOf(tpl);
        usedSet.add(idx);
        if (usedSet.size > Math.ceil(templates.length * 0.6)) usedSet.clear();
        return result;
      }
    }
    return null;
  }

  class CampaignJournal {
    constructor(game) {
      this.game          = game;
      this._usedOpeners  = new Set();
      this._usedStates   = new Set();
      this._usedCoals    = new Set();
      this._usedOpps     = new Set();
      this._usedClosers  = new Set();
      this._panel        = null;
    }

    // ── Data gathering ────────────────────────────────────────────

    _weekData(weekNum) {
      const g        = this.game;
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay   = Math.min(weekNum * 7, g.day);

      const weekActions = (g.actionHistory || []).filter(a => a.day >= startDay && a.day <= endDay);
      const weekEvents  = (g.journalEvents  || []).filter(e => e.day >= startDay && e.day <= endDay);

      // Top state this week
      const stateCounts = {};
      weekActions.forEach(a => { if (a.state) stateCounts[a.state] = (stateCounts[a.state] || 0) + 1; });
      const sortedStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
      const topStateAbbr = sortedStates[0]?.[0];
      const topState     = topStateAbbr ? g.getStateByAbbr(topStateAbbr)?.name : null;
      const topState2Abbr= sortedStates[1]?.[0];
      const topState2    = topState2Abbr ? g.getStateByAbbr(topState2Abbr)?.name : null;

      // Top coalition (from action effects — proxy via action type)
      const groundCount = weekActions.filter(a => ['rallyUrban','ruralTour','grassroots','townHall'].includes(a.action)).length;
      const airCount    = weekActions.filter(a => ['mediaBlitz','tvAds','attackAd'].includes(a.action)).length;
      let topCoalition  = null;
      if (groundCount > airCount) topCoalition = topStateAbbr ? (g.getStateByAbbr(topStateAbbr)?.demographics ? Object.entries(g.getStateByAbbr(topStateAbbr).demographics).sort((a,b)=>b[1]-a[1])[0]?.[0] : null) : 'working_class';
      else if (airCount > 0)      topCoalition = 'independent';

      const opp        = g.opponents?.[0];
      const momentum   = g.player?.resources?.momentum ?? 50;
      const polls      = g.polling?.polls || [];
      const lastPoll   = polls[polls.length - 1];
      const trailing   = lastPoll ? lastPoll.player < 50 : false;

      return {
        week: weekNum, startDay, endDay,
        name: g.player?.name ?? 'The candidate',
        topState, topState2, topCoalition,
        momentum, trailing, slotsUsed: weekActions.length,
        oppName: opp?.name, oppLeading: !trailing, oppMomentum: opp?.resources?.momentum ?? 50,
        journalEvents: weekEvents,
      };
    }

    // ── Entry generation ──────────────────────────────────────────

    generateEntry(weekNum) {
      const d = this._weekData(weekNum);
      const sentences = [];

      // 1. Opener
      const opener = pickFresh(OPENERS, this._usedOpeners, d);
      if (opener) sentences.push(opener);

      // 2. Event sentence (specific to what happened — no template fatigue issue since data-driven)
      const notableEvent = d.journalEvents.find(e =>
        ['endorsement','viral_positive','viral_negative','state_event','vp_pick','october_surprise','debate_win','debate_loss','debate_draw'].includes(e.type)
      );
      if (notableEvent) {
        const tpl = EVENT_SENTENCES[notableEvent.type];
        if (tpl) sentences.push(tpl(notableEvent));
      } else {
        // Fall back to state or coalition sentence
        const stateSentence = pickFresh(STATE_SENTENCES, this._usedStates, d);
        if (stateSentence) sentences.push(stateSentence);
        else {
          const coalSentence = pickFresh(COALITION_SENTENCES, this._usedCoals, d);
          if (coalSentence) sentences.push(coalSentence);
        }
      }

      // 3. Opponent sentence (every other week)
      if (weekNum % 2 === 0) {
        const oppSentence = pickFresh(OPPONENT_SENTENCES, this._usedOpps, d);
        if (oppSentence) sentences.push(oppSentence);
      }

      // 4. Closer
      const closer = pickFresh(CLOSERS, this._usedClosers, d);
      if (closer) sentences.push(closer);

      return {
        weekNum, startDay: d.startDay, endDay: d.endDay,
        text: sentences.filter(Boolean).join(' ')
      };
    }

    generateAllEntries() {
      const totalWeeks = Math.floor((this.game.day - 1) / 7) + 1;
      const entries    = [];
      for (let w = 1; w <= totalWeeks; w++) entries.push(this.generateEntry(w));
      return entries;
    }

    // ── Election Night final entry ─────────────────────────────

    addElectionEntry({ winner, demEV, repEV, playerWon }) {
      const g    = this.game;
      const p    = g.player;
      const opp  = g.opponents?.[0];
      const isDem = p.party === 'Democrat';
      const playerEV = isDem ? demEV : repEV;
      const oppEV    = isDem ? repEV  : demEV;
      const oppName  = opp?.name ?? 'the opponent';

      const winTemplates = [
        `After 180 days on the trail, ${p.name} won the presidency — ${playerEV} to ${oppEV} in electoral votes. A hard-fought campaign ends in victory.`,
        `Election Night delivered what the campaign had worked toward: ${p.name} elected the next President of the United States with ${playerEV} electoral votes.`,
        `The map turned in ${p.name}'s favour as the night wore on. ${playerEV} to ${oppEV} — a result that reflects 180 days of strategy, sacrifice, and relentless campaigning.`
      ];
      const lossTemplates = [
        `The campaign ended on a painful note. ${p.name} fell short with ${playerEV} electoral votes — ${oppName} carried the night with ${oppEV}.`,
        `After 180 days, the final map did not hold. ${oppName} won the presidency with ${oppEV} electoral votes. There will be time for reflection, but not tonight.`,
        `${oppName} claimed the presidency ${oppEV} to ${playerEV}. Despite everything this campaign built, Election Night delivered a loss that stings deeply.`
      ];
      const tieTemplates = [
        `No candidate reached 270 electoral votes. A contingent election now goes to the House — a genuinely historic and uncertain moment.`,
        `The electoral map deadlocked — ${playerEV} to ${oppEV}. An unprecedented outcome that history will remember.`
      ];

      let pool;
      if (winner === 'tie') pool = tieTemplates;
      else pool = playerWon ? winTemplates : lossTemplates;

      const text = pool[Math.floor(Math.random() * pool.length)];

      this._electionEntry = { weekNum: 'ELECTION NIGHT', startDay: 181, endDay: 181, text };
    }

    // ── UI ────────────────────────────────────────────────────────

    open() {
      if (this._panel) { this._panel.remove(); this._panel = null; }

      const entries = this.generateAllEntries();
      if (this._electionEntry) entries.push(this._electionEntry);

      const panel   = document.createElement('div');
      panel.id = 'journal-panel';

      const plainText = [...entries].reverse().map(e =>
        `── ${e.weekNum === 'ELECTION NIGHT' ? 'ELECTION NIGHT' : `Week ${e.weekNum} · Days ${e.startDay}–${e.endDay}`} ──\n${e.text}`
      ).join('\n\n');

      panel.innerHTML = `
        <div class="journal-header">
          <div class="journal-title">Campaign Journal</div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="journal-copy-btn" id="journal-copy">📋 Copy</button>
            <button class="journal-close" id="journal-close">✕</button>
          </div>
        </div>
        <div class="journal-entries">
          ${[...entries].reverse().map(e => `
            <div class="journal-entry${e.weekNum === 'ELECTION NIGHT' ? ' journal-entry-final' : ''}">
              <div class="journal-week-label">${e.weekNum === 'ELECTION NIGHT' ? '★ ELECTION NIGHT' : `Week ${e.weekNum} · Days ${e.startDay}–${e.endDay}`}</div>
              <div class="journal-text">${e.text}</div>
            </div>`).join('')}
        </div>`;

      document.body.appendChild(panel);
      this._panel = panel;

      panel.querySelector('#journal-close').addEventListener('click', () => {
        panel.remove(); this._panel = null;
      });
      panel.querySelector('#journal-copy').addEventListener('click', () => {
        const seed = this.game.getSeedString?.() ? `\nSeed: ${this.game.getSeedString()}` : '';
        navigator.clipboard.writeText(`180 DAYS TO WIN — Campaign Journal${seed}\n\n${plainText}`)
          .then(() => {
            const btn = panel.querySelector('#journal-copy');
            if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000); }
          });
      });
    }
  }

  E.CampaignJournal = CampaignJournal;
})();