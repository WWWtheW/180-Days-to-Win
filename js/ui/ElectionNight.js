(function () {
  const E = window.ElectionSim;

  class ElectionNight {
    constructor(game) {
      this.game     = game;
      this.interval = null;
      this.calledStates = new Set();
      this.speed    = 900;
      this.overlay  = null;
      this.resultScreen = null;

      this._buildDOM();
      this._bindEvents();

      document.addEventListener('electionNightStart', () => this.open());
      document.addEventListener('electionNightEnd',   e  => this._showResult(e.detail));
    }

    // ─────────────────────────────────────────────────
    // DOM CONSTRUCTION
    // ─────────────────────────────────────────────────

    _buildDOM() {
      const overlay = document.createElement('div');
      overlay.id = 'election-night-overlay';
      overlay.innerHTML = `
        <div id="en-header">
          <div id="en-live-badge"><div id="en-live-dot"></div>LIVE</div>
          <div id="en-title-block">
            <div id="en-title">ELECTION NIGHT</div>
            <div id="en-subtitle">LIVE RESULTS COVERAGE</div>
          </div>
          <div id="en-controls">
            <button class="en-speed-btn" data-speed="1800">0.5×</button>
            <button class="en-speed-btn" data-speed="1200">0.75×</button>
            <button class="en-speed-btn en-active" data-speed="900">1×</button>
            <button class="en-speed-btn" data-speed="300">3×</button>
            <button class="en-speed-btn" data-speed="80">MAX</button>
            <button id="en-skip-btn">Skip to End</button>
          </div>
        </div>

        <div id="en-ev-section">
          <div class="en-ev-side">
            <div class="en-ev-party-label">DEMOCRAT</div>
            <div class="en-ev-number en-dem" id="en-dem-count">0</div>
            <div class="en-ev-cand-name" id="en-dem-name">—</div>
          </div>
          <div id="en-ev-bar-wrap">
            <div id="en-ev-bar-track">
              <div id="en-ev-dem-fill" style="width:0%"></div>
              <div id="en-ev-uncalled-fill"></div>
              <div id="en-ev-rep-fill" style="width:0%"></div>
              <div id="en-270-marker"></div>
            </div>
            <div id="en-ev-remaining">538 EV — 270 needed to win</div>
          </div>
          <div class="en-ev-side">
            <div class="en-ev-party-label">REPUBLICAN</div>
            <div class="en-ev-number en-rep" id="en-rep-count">0</div>
            <div class="en-ev-cand-name" id="en-rep-name">—</div>
          </div>
        </div>

        <div id="en-main">
          <div id="en-map-panel">
            <div id="en-map-title">STATE RESULTS</div>
            <div id="en-state-grid"></div>
          </div>
          <div id="en-feed-panel">
            <div id="en-feed-header">LIVE RESULTS FEED</div>
            <div id="en-feed"></div>
            <div id="en-legend">
              <div class="en-legend-item"><div class="en-legend-dot" style="background:#1e40af"></div>DEM Win</div>
              <div class="en-legend-item"><div class="en-legend-dot" style="background:#991b1b"></div>REP Win</div>
              <div class="en-legend-item"><div class="en-legend-dot" style="background:#78350f"></div>Too Close</div>
              <div class="en-legend-item"><div class="en-legend-dot" style="background:#1f2937"></div>Too Early</div>
            </div>
          </div>
        </div>

        <div id="en-result-screen">
          <div id="en-result-winner-label">PROJECTED WINNER</div>
          <div id="en-result-name">—</div>
          <div id="en-result-subline">—</div>
          <div id="en-result-ev-breakdown">
            <div class="en-result-ev-item dem">
              <div class="ev-num" id="en-final-dem-ev">0</div>
              <div class="ev-label">DEMOCRAT EV</div>
            </div>
            <div class="en-result-ev-item rep">
              <div class="ev-num" id="en-final-rep-ev">0</div>
              <div class="ev-label">REPUBLICAN EV</div>
            </div>
          </div>
          <button id="en-result-close-btn">← Back to Final Map</button>
          <div id="en-result-footer">
            <div id="en-result-seed-row">
              <span class="en-result-seed-label">Campaign Seed:</span>
              <span id="en-result-seed-code">—</span>
              <button id="en-result-copy-seed">Copy</button>
            </div>
            <button id="en-result-journal-btn">📓 Open Campaign Journal</button>
          </div>
        </div>`;

      document.body.appendChild(overlay);
      this.overlay      = overlay;
      this.resultScreen = overlay.querySelector('#en-result-screen');
    }

    _bindEvents() {
      this.overlay.querySelectorAll('.en-speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.overlay.querySelectorAll('.en-speed-btn').forEach(b => b.classList.remove('en-active'));
          btn.classList.add('en-active');
          this._setSpeed(parseInt(btn.dataset.speed));
        });
      });
      this.overlay.querySelector('#en-skip-btn').addEventListener('click', () => this._skipToEnd());
      this.overlay.querySelector('#en-result-close-btn').addEventListener('click', () => {
        document.getElementById('en-result-screen').style.display = 'none';
      });
      this.overlay.querySelector('#en-result-copy-seed').addEventListener('click', () => {
        const code = document.getElementById('en-result-seed-code').textContent;
        if (code && code !== '—') {
          navigator.clipboard.writeText(code).then(() => {
            const btn = document.getElementById('en-result-copy-seed');
            if (btn) { btn.textContent = '✓'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
          });
        }
      });
      this.overlay.querySelector('#en-result-journal-btn').addEventListener('click', () => {
        document.querySelector('#journal-close')?.click();
        this.game.journal?.open();
        document.querySelector('#journal-panel').style.zIndex = 2001;
      });
    }

    // ─────────────────────────────────────────────────
    // OPEN
    // ─────────────────────────────────────────────────

    open() {
      const p   = this.game.player;
      const opp = this.game.opponents[0];
      const isDem = p.party === 'Democrat';

      document.getElementById('en-dem-name').textContent = isDem ? p.name : (opp?.name || 'Democrat');
      document.getElementById('en-rep-name').textContent = isDem ? (opp?.name || 'Republican') : p.name;

      this._buildStateGrid();
      this.overlay.classList.add('en-visible');
      this._render();
      this._play();
    }

    _buildStateGrid() {
      const grid = document.getElementById('en-state-grid');
      grid.innerHTML = '';
      this.game.electionNight.stateData.forEach(ed => {
        const cell = document.createElement('div');
        cell.className   = 'en-state-cell status-not-started';
        cell.dataset.abbr = ed.state.abbr;
        cell.innerHTML = `<span class="en-abbr">${ed.state.abbr}</span><span class="en-ev-badge">${ed.state.electoralVotes}</span>`;
        grid.appendChild(cell);
      });
    }

    // ─────────────────────────────────────────────────
    // PLAYBACK
    // ─────────────────────────────────────────────────

    _play() {
      if (this.interval) return;
      this.interval = setInterval(() => { this.game.tickElectionNight(); this._render(); }, this.speed);
    }

    _stop() { clearInterval(this.interval); this.interval = null; }

    _setSpeed(ms) {
      this.speed = ms;
      if (this.interval) { this._stop(); this._play(); }
    }

    _skipToEnd() {
      if (!this.game.electionNight.active) {
        // Election already fully concluded (all states called) — reopen the final results
        if (this.resultScreen) this.resultScreen.classList.add('en-visible');
        return;
      }
      this._stop();
      let safety = 0;
      while (this.game.electionNight.active && safety++ < 500) this.game.tickElectionNight();
      this._render();
    }

    // ─────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────

    _render() {
      this._renderEVSection();
      this._renderStateGrid();
      this._renderFeed();
    }

    _renderEVSection() {
      const en      = this.game.electionNight;
      const dem     = en.demEV;
      const rep     = en.repEV;
      const total   = 538;
      const uncalled = Math.max(0, total - dem - rep);

      document.getElementById('en-dem-count').textContent = dem;
      document.getElementById('en-rep-count').textContent = rep;
      document.getElementById('en-ev-dem-fill').style.width = `${(dem / total) * 100}%`;
      document.getElementById('en-ev-rep-fill').style.width = `${(rep / total) * 100}%`;

      const demName = document.getElementById('en-dem-name').textContent;
      const repName = document.getElementById('en-rep-name').textContent;

      let statusText;
      if      (dem >= 270) statusText = `${demName} projected to win the presidency — ${uncalled} EV uncalled`;
      else if (rep >= 270) statusText = `${repName} projected to win the presidency — ${uncalled} EV uncalled`;
      else                 statusText = `${uncalled} EV still uncalled — 270 needed to win`;

      document.getElementById('en-ev-remaining').textContent = statusText;
    }

    _renderStateGrid() {
      const en = this.game.electionNight;

      en.stateData.forEach(ed => {
        const cell = this.overlay.querySelector(`.en-state-cell[data-abbr="${ed.state.abbr}"]`);
        if (!cell) return;

        // ── Determine status class ──────────────────────────────────
        let statusClass;

        if (ed.status === 'dem_wins') {
          statusClass = 'status-dem-wins';
        } else if (ed.status === 'rep_wins') {
          statusClass = 'status-rep-wins';
        } else if (ed.status === 'not_started') {
          statusClass = 'status-not-started';
        } else if (ed.status === 'too_close') {
          // Tossup: always amber — never lean based on noisy apparent pct
          statusClass = 'status-too-close';
        } else {
          // too_early — color by apparent leader strength
          const apparent = ed.apparentDemPct ?? 50;
          const margin   = apparent - 50;  // + = Dem leading, - = Rep leading

          if      (margin > 10)  statusClass = 'status-lean-dem-strong';
          else if (margin > 2)   statusClass = 'status-lean-dem';
          else if (margin < -10) statusClass = 'status-lean-rep-strong';
          else if (margin < -2)  statusClass = 'status-lean-rep';
          else                   statusClass = 'status-too-early';
        }

        cell.className = `en-state-cell ${statusClass}`;
        if (ed.status === 'dem_wins' || ed.status === 'rep_wins') {
          cell.classList.add('en-called');

          // Flash animation fires only the first time this state is called
          if (!this.calledStates.has(ed.state.abbr)) {
            this.calledStates.add(ed.state.abbr);
            cell.classList.add('en-flash');
            setTimeout(() => cell.classList.remove('en-flash'), 900);
          }
        }

        // ── Cell body ───────────────────────────────────────────────
        const apparent     = ed.apparentDemPct ?? ed.demPct;
        const reportingPct = Math.round(ed.reportingPct);

        if (ed.status === 'dem_wins' || ed.status === 'rep_wins') {
          // Use ACTUAL final percentages — never noisy apparent values
          const winnerParty = ed.status === 'dem_wins' ? 'D' : 'R';
          const winnerPct   = (ed.status === 'dem_wins' ? ed.demPct : ed.repPct).toFixed(1);
          cell.innerHTML = `
            <span class="en-abbr">${ed.state.abbr}</span>
            <span class="en-ev-badge">${ed.state.electoralVotes}</span>
            <span class="en-called-pct">${winnerParty} ${winnerPct}%</span>`;
        } else if (reportingPct > 0) {
          const leaderPct   = Math.max(apparent, 100 - apparent).toFixed(1);
          const leaderParty = apparent >= 50 ? 'D' : 'R';
          cell.innerHTML = `
            <span class="en-abbr">${ed.state.abbr}</span>
            <span class="en-ev-badge">${ed.state.electoralVotes}</span>
            <span class="en-live-pct">${leaderParty} ${leaderPct}%</span>
            <span class="en-reporting">${reportingPct}% in</span>`;
        } else {
          cell.innerHTML = `<span class="en-abbr">${ed.state.abbr}</span><span class="en-ev-badge">${ed.state.electoralVotes}</span>`;
        }

        // ── Tooltip ─────────────────────────────────────────────────
        if (reportingPct > 0 && ed.status !== 'not_started') {
          const calledSuffix = (ed.status === 'dem_wins' || ed.status === 'rep_wins') ? '\n★ CALLED' : '';
          // Tooltip always shows actual final split once called; apparent during counting
          const tooltipDem = (ed.status === 'dem_wins' || ed.status === 'rep_wins')
            ? ed.demPct.toFixed(1) : apparent.toFixed(1);
          const tooltipRep = (100 - parseFloat(tooltipDem)).toFixed(1);
          cell.title =
            `${ed.state.name} (${ed.state.electoralVotes} EV)\n` +
            `${reportingPct}% reporting\n` +
            `DEM ${tooltipDem}% — REP ${tooltipRep}%` +
            calledSuffix;
        } else {
          cell.title = `${ed.state.name} (${ed.state.electoralVotes} EV)`;
        }
      });
    }

    _renderFeed() {
      const feed = document.getElementById('en-feed');
      const en   = this.game.electionNight;

      const currentCount = feed.querySelectorAll('.en-feed-item').length;
      if (currentCount === en.updates.length) return;

      const newCount = en.updates.length - currentCount;
      const fragment = document.createDocumentFragment();

      for (let i = newCount - 1; i >= 0; i--) {
        const u    = en.updates[i];
        const item = document.createElement('div');
        item.className = `en-feed-item type-${u.type}`;
        item.innerHTML = `<div class="en-feed-icon"></div><div class="en-feed-text">${this._escapeHtml(u.text)}</div>`;
        fragment.appendChild(item);
      }
      feed.insertBefore(fragment, feed.firstChild);
    }

    // ─────────────────────────────────────────────────
    // RESULT SCREEN
    // ─────────────────────────────────────────────────

    _showResult(detail) {
      this._stop();
      const { winner, demEV, repEV } = detail;
      const p   = this.game.player;
      const opp = this.game.opponents[0];
      const isDem     = p.party === 'Democrat';
      const demName   = isDem ? p.name : (opp?.name || 'Democrat');
      const repName   = isDem ? (opp?.name || 'Republican') : p.name;
      const winnerName = winner === 'Democrat' ? demName : winner === 'Republican' ? repName : 'Neither Candidate';
      const playerWon  = (isDem && winner === 'Democrat') || (!isDem && winner === 'Republican');

      const subline = winner === 'tie'
        ? 'No candidate reached 270 electoral votes — contingent election'
        : playerWon
          ? `YOU WIN — ${winnerName} is the next President of the United States`
          : `${winnerName} is projected to win the presidency`;

      document.getElementById('en-result-name').textContent    = winnerName;
      document.getElementById('en-result-subline').textContent = subline;
      document.getElementById('en-final-dem-ev').textContent   = demEV;
      document.getElementById('en-final-rep-ev').textContent   = repEV;
      document.getElementById('en-result-name').style.color    =
        winner === 'Democrat' ? '#60a5fa' : winner === 'Republican' ? '#f87171' : '#e2e8f0';

      // Populate seed code
      const seedCode = this.game.getSeedString?.() || '—';
      const seedEl   = document.getElementById('en-result-seed-code');
      if (seedEl) seedEl.textContent = seedCode;

      // Write the final journal entry
      if (this.game.journal) {
        this.game.journal.addElectionEntry({ winner, demEV, repEV, playerWon });
      }

      // Election fully concluded (all states called) — repurpose the skip button
      const skipBtn = this.overlay.querySelector('#en-skip-btn');
      if (skipBtn) skipBtn.textContent = '🏆 View Final Results';

      this.resultScreen.classList.add('en-visible');
    }

    _escapeHtml(str) {
      const d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }
  }

  E.ElectionNight = ElectionNight;
})();
