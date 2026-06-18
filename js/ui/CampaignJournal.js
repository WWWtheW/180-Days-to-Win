(function () {
  'use strict';
  const E = window.ElectionSim;

  // Templates live in js/data/journal-templates.js — loaded before this file.
  // Getters so hot-reloading or late binding works without issues.
  const T          = () => E.data?.JOURNAL_TEMPLATES ?? {};
  const OPENERS    = () => T().OPENERS    ?? [];
  const STATE_S    = () => T().STATE_SENTENCES    ?? [];
  const COAL_S     = () => T().COALITION_SENTENCES ?? [];
  const EVENT_S    = () => T().EVENT_SENTENCES    ?? {};
  const OPP_S      = () => T().OPPONENT_SENTENCES  ?? [];
  const CLOSERS    = () => T().CLOSERS    ?? [];

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

      const opener = pickFresh(OPENERS(), this._usedOpeners, d);
      if (opener) sentences.push(opener);

      const notableEvent = d.journalEvents.find(e =>
        Object.keys(EVENT_S()).includes(e.type)
      );
      if (notableEvent) {
        const tpl = EVENT_S()[notableEvent.type];
        if (tpl) sentences.push(tpl(notableEvent));
      } else {
        const stateSentence = pickFresh(STATE_S(), this._usedStates, d);
        if (stateSentence) sentences.push(stateSentence);
        else {
          const coalSentence = pickFresh(COAL_S(), this._usedCoals, d);
          if (coalSentence) sentences.push(coalSentence);
        }
      }

      if (weekNum % 2 === 0) {
        const oppSentence = pickFresh(OPP_S(), this._usedOpps, d);
        if (oppSentence) sentences.push(oppSentence);
      }

      const closer = pickFresh(CLOSERS(), this._usedClosers, d);
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
      const g      = this.game;
      const p      = g.player;
      const opp    = g.opponents?.[0];
      const isDem  = p.party === 'Democrat';
      const playerEV = isDem ? demEV : repEV;
      const oppEV    = isDem ? repEV  : demEV;
      const oppName  = opp?.name ?? 'the opponent';
      const ctx      = { p, opp, playerEV, oppEV, oppName };

      const T    = window.ElectionSim.data?.JOURNAL_TEMPLATES ?? {};
      const pool = winner === 'tie' ? (T.ELECTION_TIE ?? [])
                 : playerWon       ? (T.ELECTION_WIN  ?? [])
                 :                   (T.ELECTION_LOSS ?? []);

      const rng  = g.rng ? () => g.rng.next() : Math.random;
      const text = pool.length
        ? pool[Math.floor(rng() * pool.length)](ctx)
        : `The election is over. ${playerWon ? 'Victory.' : 'Defeat.'}`;

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
