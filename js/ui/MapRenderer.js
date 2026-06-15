(function () {
  const E = window.ElectionSim;

  class MapRenderer {
    constructor(game) {
      this.game      = game;
      this.container = document.getElementById('map-container');
      this.evBar     = document.getElementById('ev-bar');
      this.evLabel   = document.getElementById('ev-label');

      this.selectedState = null;

      this.TIER_STYLE = {
        SAFE_D:   '#1f4ed8',
        LIKELY_D: '#4f7cff',
        LEAN_D:   '#8fb3ff',
        TOSSUP:   '#cccccc',
        LEAN_R:   '#ff8a8a',
        LIKELY_R: '#ff4d4d',
        SAFE_R:   '#b30000'
      };

      this.render();
    }

    render() {
      this.updateEVBar();

      const grid = document.createElement('div');
      grid.id = 'state-grid';
      grid.style.display             = 'grid';
      grid.style.gridTemplateColumns = 'repeat(10, 1fr)';
      grid.style.gap                 = '4px';
      grid.style.width               = '95%';

      this.game.states.forEach(state => {
        const el           = document.createElement('div');
        el.className       = 'state-cell';
        const newsEntry = this.game.stateNews?.[state.abbr];
        const dot = newsEntry
          ? `<span class="sc-news-dot sc-news-${newsEntry.type}" title="${newsEntry.headline}"></span>`
          : '';
        el.innerHTML = state.abbr + dot;
        el.style.aspectRatio    = '1';
        el.style.display        = 'flex';
        el.style.alignItems     = 'center';
        el.style.justifyContent = 'center';
        el.style.padding        = '0';
        el.style.background     = this.getColor(state);
        el.style.cursor         = 'pointer';
        el.style.borderRadius   = '4px';
        el.style.fontSize       = '20px';
        el.style.fontWeight     = 'bold';
        el.style.color          = '#fff';
        el.style.userSelect     = 'none';
        el.style.textShadow     = '0 1px 2px rgba(0,0,0,0.6)';
        el.onclick = () => this.selectState(state);
        grid.appendChild(el);
      });

      this.container.innerHTML = '';
      this.container.appendChild(grid);
    }

    getStateTier(state) {
      const support    = state.playerSupport || 50;
      const demSupport = this.game.player.party === 'Democrat' ? support : 100 - support;
      if (demSupport >= 57.5) return 'SAFE_D';
      if (demSupport >= 53.5) return 'LIKELY_D';
      if (demSupport >= 51)   return 'LEAN_D';
      if (demSupport > 49)    return 'TOSSUP';
      if (demSupport > 46.5)  return 'LEAN_R';
      if (demSupport > 42.5)  return 'LIKELY_R';
      return 'SAFE_R';
    }

    getColor(state) {
      return this.TIER_STYLE[this.getStateTier(state)];
    }

    selectState(state) {
      this.selectedState = state;
      this.showStatePanel(state);
    }

    // ── State panel ───────────────────────────────────────────────

    showStatePanel(state) {
      let panel = document.getElementById('state-panel');

      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'state-panel';
        this.container.appendChild(panel);
      }

      const polls = this.game.polling.statePolls
        .filter(p => p.state === state.abbr)
        .slice(0, 3);

      const leanText = Math.abs(state.partisanLean) < 0.025
        ? 'EVEN'
        : state.partisanLean < 0
          ? `D+${Math.round(Math.abs(state.partisanLean * 20))}`
          : `R+${Math.round(Math.abs(state.partisanLean * 20))}`;

      const volatilityText = state.volatility <= 4 ? 'Low'
                           : state.volatility <= 6 ? 'Moderate' : 'High';

      panel.innerHTML = `
        <div class="panel-header">
          <b class="state-title">${state.name}</b>
          <button class="panel-close">✕</button>
        </div>
        <hr/>

        <div class="sp-meta">
          <span>${state.electoralVotes} EV</span>
          <span class="sp-lean">${leanText}</span>
          <span>Vol: ${volatilityText}</span>
          <span class="sp-support">${state.playerSupport.toFixed(1)}%</span>
        </div>

        ${polls.length ? `
          <div class="sp-section-label">Recent Polls</div>
          ${polls.map(p =>
            `<div class="sp-poll-item">${p.pollster}: ${p.player.toFixed(1)}%</div>`
          ).join('')}
        ` : ''}

        <div class="sp-section-label">Coalition Strength</div>
        <div class="sp-chart">${this._renderCoalitionChart(state)}</div>

        <div class="sp-section-label">Issue Priorities</div>
        <div class="sp-chart">${this._renderIssueChart(state)}</div>
      `;

      panel.querySelector('.panel-close').onclick = () => panel.remove();
    }

    // ── Chart helpers ─────────────────────────────────────────────

    _renderCoalitionChart(state) {
      const dem = state.demographics || {};

      const LABELS = {
        working_class: 'Workers', college: 'College', urban: 'Urban',
        rural: 'Rural', suburban: 'Suburban', young: 'Young',
        seniors: 'Seniors', minority: 'Minority', independent: 'Indep.'
      };

      return Object.entries(dem)
        .filter(([k]) => LABELS[k] && dem[k] > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key, val]) => {
          const pct = Math.round(val * 100);
          return `
            <div class="sp-row">
              <span class="sp-row-label">${LABELS[key]}</span>
              <div class="sp-bar-wrap">
                <div class="sp-bar sp-bar-coal" style="width:${pct}%"></div>
              </div>
              <span class="sp-row-val">${pct}%</span>
            </div>`;
        }).join('');
    }

    _renderIssueChart(state) {
      const weights  = state.issueWeights  || {};
      const leans    = state.issueLeans    || {};
      const myPos    = this.game.issuePositions || {};

      const LABELS = {
        economy: 'Economy', healthcare: 'Healthcare', immigration: 'Immigr.',
        climate: 'Climate', taxes: 'Taxes', crime: 'Crime',
        education: 'Educatn', foreign_policy: 'Foreign', energy: 'Energy',
        social_issues: 'Social', jobs: 'Jobs'
      };
      const COLORS = { liberal: '#60a5fa', centrist: '#64748b', conservative: '#f87171' };
      const ARROWS = { liberal: '◀', centrist: '·', conservative: '▶' };

      return Object.entries(weights)
        .sort((a, b) => b[1] - a[1])
        .map(([key, val]) => {
          const pct       = Math.round(val * 100);
          const lean      = leans[key]  || 'centrist';
          const playerPos = myPos[key]  || 'centrist';
          const col       = COLORS[lean];
          const arrow     = ARROWS[lean];

          // Alignment: only shown when player has taken a non-centrist stance
          let alignHtml = '';
          let alignTip  = '';
          if (playerPos !== 'centrist') {
            if (playerPos === lean) {
              alignHtml = `<span class="sp-align sp-align-good" title="Your stance aligns with this state">✓</span>`;
            } else if (
              (playerPos === 'liberal' && lean === 'conservative') ||
              (playerPos === 'conservative' && lean === 'liberal')
            ) {
              alignHtml = `<span class="sp-align sp-align-bad"  title="Your stance conflicts with this state">✗</span>`;
            } else {
              alignHtml = `<span class="sp-align sp-align-mid"  title="Partial alignment">~</span>`;
            }
          }

          return `
            <div class="sp-row">
              <span class="sp-row-label">${LABELS[key] || key}</span>
              <div class="sp-bar-wrap">
                <div class="sp-bar" style="width:${pct}%;background:${col}"></div>
              </div>
              <span class="sp-row-dot" style="color:${col}">${arrow}</span>
              ${alignHtml}
            </div>`;
        }).join('');
    }

    // ── EV bar ────────────────────────────────────────────────────

    calculateEVBreakdown() {
      const breakdown = {
        SAFE_D: 0, LIKELY_D: 0, LEAN_D: 0,
        TOSSUP: 0,
        LEAN_R: 0, LIKELY_R: 0, SAFE_R: 0
      };
      this.game.states.forEach(state => {
        breakdown[this.getStateTier(state)] += state.electoralVotes;
      });
      return breakdown;
    }

    updateEVBar() {
      const breakdown = this.calculateEVBreakdown();
      const totalEV   = Object.values(breakdown).reduce((a, b) => a + b, 0);

      this.evBar.innerHTML = '';

      Object.entries(breakdown).forEach(([tier, ev]) => {
        if (!ev) return;
        const seg       = document.createElement('div');
        seg.className   = 'ev-segment';
        seg.style.background = this.TIER_STYLE[tier];
        seg.style.width      = `${(ev / totalEV) * 100}%`;
        seg.textContent = ev;
        this.evBar.appendChild(seg);
      });
    }

    update() {
      this.render();
      // Refresh panel if one is open
      if (this.selectedState) {
        const panel = document.getElementById('state-panel');
        if (panel) this.showStatePanel(this.selectedState);
      }
    }
  }

  E.MapRenderer = MapRenderer;
})();