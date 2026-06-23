(function () {
  const E = window.ElectionSim;

  let game;
  let map;
  let actionPanel;   // ← new

  function initGame(config) {
    game = new E.GameState(config.seed || Date.now());
    E.state = game;

    config.name = escapeHtml(config.name.trim());
    game.createPlayerCandidate(config.name, config.party, config.stats);
    if (config.archetypeId && game.player) {
      game.player.identity = game.player.identity || {};
      game.player.identity.archetype = config.archetypeId;
    }
    game.gameConfig = config;
    if (config.issuePositions) {
      game.applyIssuePositions(config.issuePositions);
    }
    game.stateSupportEngine.updateAllStates();

    map = new E.MapRenderer(game);
    game.journal = new E.CampaignJournal(game);
    new E.ElectionNight(game);

    const difficultyMap = { easy: 1.4, normal: 1.1, hard: 0.85 };
    const opponentDifficulty = difficultyMap[config.difficulty] ?? 1.1;
    const opponentName  = config.party === 'Democrat' ? 'Andrew Luo'   : 'Andrew Camrud';
    const opponentParty = config.party === 'Democrat' ? 'Republican'   : 'Democrat';
    game.generateOpponent(opponentName, opponentParty, opponentDifficulty);

    renderUI();
    actionPanel = new E.ActionPanel(game, updateUI);   // ← new (fills #action-panel)
    updateUI();
  }

  function renderUI() {
    document.getElementById('candidate-panel').innerHTML = `
      <div class="panel">
        <b>Candidate</b>
        <div id="candidate-info"></div>
      </div>`;

    document.getElementById('resources-panel').innerHTML = `
      <div class="panel">
        <b>Resources</b>
        <div id="resources-info"></div>
      </div>`;

    document.getElementById('journal-seed-panel').innerHTML = `
      <div class="panel">
        <button class="journal-open-btn" id="ap-journal-btn">📓 Campaign Journal</button>
        <div class="ap-seed-row">
          <span class="ap-seed-code" id="ap-seed-code">—</span>
          <button class="ap-seed-copy" id="ap-seed-copy">Copy seed</button>
        </div>
      </div>`;

    document.getElementById('ap-journal-btn').addEventListener('click', () => {
      game.journal?.open();
    });
    document.getElementById('ap-seed-copy').addEventListener('click', () => {
      const code = game.getSeedString?.() || '';
      if (!code) return;
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('ap-seed-copy');
        if (btn) { btn.textContent = 'Copied!'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = 'Copy seed'; btn.classList.remove('copied'); }, 1500); }
      });
    });

    // News ticker has no visible scrollbar — let vertical mouse-wheel /
    // trackpad scroll translate into horizontal movement instead.
    const tickerTrack = document.getElementById('news-ticker-track');
    if (tickerTrack) {
      tickerTrack.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          tickerTrack.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // #action-panel is left EMPTY here — ActionPanel fills it after renderUI()

    document.getElementById('polling-panel').innerHTML = `
      <div class="panel">
        <b>Polling</b>
        <div id="poll-list"></div>
      </div>
      <div class="panel">
        <b>Coalitions</b>
        <div id="coalition-view"></div>
      </div>`;

    document.getElementById('battleground-panel').innerHTML = `
      <div class="panel">
        <b>Battleground States</b>
        <div id="battleground-view"></div>
      </div>`;

    // EV win-marker position
    const marker       = document.getElementById('ev-win-marker');
    const playerIsDem  = game.player.party === 'Democrat';
    marker.style.left  = playerIsDem ? `${(270 / 538) * 100}%` : `${((538 - 270) / 538) * 100}%`;
    marker.dataset.label = playerIsDem ? '270 D' : '270 R';
  }

  function updateUI() {
    document.getElementById('date-display').innerText = game.getDayProgress();

    const p = game.player;

    // ── Candidate info ─────────────────────────────────────────────
    document.getElementById('candidate-info').innerHTML = `
      <p><b>Name:</b> ${p.name}</p>
      <p><b>Party:</b> ${p.party}</p>
      <p><b>Archetype:</b> ${p.identity?.archetype ?? '—'}</p>
      <p><b>Charisma:</b> ${p.stats.charisma}</p>
      <p><b>Media:</b> ${p.stats.mediaSkill}</p>
      <p><b>Debate:</b> ${p.stats.debate}</p>`;

    // ── Resources — now shows volunteers + political capital ────────
    const r = p.resources;
    document.getElementById('resources-info').innerHTML = `
      <p>💰 $${Math.floor(r.money).toLocaleString()}</p>
      <p>📈 Momentum: ${Math.round(r.momentum)}</p>
      <p>👥 Volunteers: ${Math.floor(r.volunteers || 0).toLocaleString()}</p>
      <p>⚡ Pol. Capital: ${Math.round(r.politicalCapital || 0)}</p>`;

    // ── Seed display — refreshed here since issue positions (part of the
    // encoded seed string) can change mid-game ──────────────────────
    const seedEl = document.getElementById('ap-seed-code');
    if (seedEl) {
      const str = game.getSeedString?.() || '—';
      seedEl.textContent = str.length > 22 ? str.slice(0, 22) + '…' : str;
      seedEl.title = str;
    }

    // ── Coalitions ─────────────────────────────────────────────────
    document.getElementById('coalition-view').innerHTML =
      game.coalitions.map(c => `<p>${c.name}: ${c.support.player.toFixed(1)}%</p>`).join('');

    // ── Polls ──────────────────────────────────────────────────────
    document.getElementById('poll-list').innerHTML =
      game.polling.polls.slice(0, 8).map(p => `
        <div class="poll-item">
          <b>${p.pollster}</b><br>
          Day ${p.day}<br>
          You ${p.player.toFixed(1)}%
        </div>`).join('');

    // ── Battleground ───────────────────────────────────────────────
    const battlegrounds = game.polling.getBattlegroundStates();
    document.getElementById('battleground-view').innerHTML =
      battlegrounds.map(s => `<p>${s.abbr} (${s.playerSupport.toFixed(1)}%)</p>`).join('');

    // ── News ticker (bottom bar) ─────────────────────────────────────
    document.getElementById('news-ticker-content').innerHTML =
      game.news.slice(0, 15).map(n =>
        `<span class="ticker-item">Day ${n.day}: ${n.headline}</span>`
      ).join('<span class="ticker-sep">●</span>');

    // ── Map ────────────────────────────────────────────────────────
    map.update();

    // ── Action panel (saturation bars, slot counter, disabled states)
    if (actionPanel) actionPanel.update();
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  window.addEventListener('load', () => {
    new E.CandidateSelect(initGame);
  });
})();