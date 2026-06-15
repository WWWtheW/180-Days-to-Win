(function () {
  'use strict';
  const E = window.ElectionSim;

  class ActionPanel {
    constructor(game, onUpdate) {
      this.game          = game;
      this.onUpdate      = onUpdate;
      this.pendingAction = null;

      this._render();
      this._bind();
      this.update();
    }

    // ═══════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════

    _render() {
      document.getElementById('action-panel').innerHTML = `
        <div class="panel" id="ap-wrap">

          <div class="ap-head">
            <b>Actions</b>
            <div class="ap-slots" id="ap-slots"></div>
          </div>

          <div id="ap-main">
            ${this._catHTML('Ground', 'ground', ['rallyUrban','ruralTour','townHall','grassroots','gotvDrive'])}
            ${this._catHTML('Air',    'air',    ['mediaBlitz','tvAds','attackAd'])}
            ${this._catHTML('Develop','develop',['debatePrep','volunteerDrive','oppoResearch'])}

            <div class="ap-divider"></div>

            <!-- Media appearances -->
            <div class="ap-cat-label ap-cat-media" id="ap-press-conf-label">📺 Media</div>
            <button class="ap-util" id="ap-press-conf" disabled>Press Conference · 1 slot · every 14 days</button>

            <div class="ap-divider"></div>

            <!-- Surrogates -->
            <div class="ap-cat-label ap-cat-surrogate">Surrogates</div>
            <button class="ap-util" id="ap-deploy-surrogate">Deploy Surrogate · 200👥 · no slot</button>
            <div id="ap-active-surrogates"></div>

            <div class="ap-divider"></div>

            <!-- Political capital actions (no action slot except Party Rally) -->
            <div class="ap-cat-label ap-cat-capital">Political Capital</div>
            <div class="ap-btn-grid">
              <button class="ap-btn ap-btn-capital" id="ap-counter-spin">
                <div class="ap-sat-bar" style="display:none"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">⚡</span><span class="ap-btn-name">Counter-Spin</span></span>
                  <span class="ap-btn-cost">20⚡ · no slot</span>
                </div>
              </button>
              <button class="ap-btn ap-btn-capital" id="ap-party-rally">
                <div class="ap-sat-bar" style="display:none"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">🌐</span><span class="ap-btn-name">Party Rally</span></span>
                  <span class="ap-btn-cost">15⚡ · 1 slot</span>
                </div>
              </button>
              <button class="ap-btn ap-btn-capital" id="ap-rapid-response">
                <div class="ap-sat-bar" style="display:none"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">⚡</span><span class="ap-btn-name">Rapid Response</span></span>
                  <span class="ap-btn-cost">25⚡ · no slot</span>
                </div>
              </button>
              <button class="ap-btn ap-btn-capital" id="ap-poll-analyst">
                <div class="ap-sat-bar" style="display:none"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">📊</span><span class="ap-btn-name">Poll Analyst</span></span>
                  <span class="ap-btn-cost">25⚡ · 10 days · no slot</span>
                </div>
              </button>
            </div>

            <div class="ap-divider"></div>
            <div class="ap-cat-label ap-cat-develop" style="margin-top:8px">Fundraising</div>
            <div class="ap-btn-grid">
              <button class="ap-btn ap-btn-develop" id="ap-grassroots-fundraise" disabled>
                <div class="ap-sat-bar" style="display:none"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">🌐</span><span class="ap-btn-name">Grassroots</span></span>
                  <span class="ap-btn-cost">free · +👥</span>
                </div>
              </button>
              <button class="ap-btn ap-btn-develop" id="ap-donor-dinner" disabled>
                <div class="ap-sat-bar" style="display:none"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">🌐</span><span class="ap-btn-name">Donor Dinner</span></span>
                  <span class="ap-btn-cost">5⚡ · +capital</span>
                </div>
              </button>
            </div>
            <div class="ap-divider"></div>
            <div class="ap-cat-label ap-cat-superpac">Super PAC</div>
            <div class="ap-superpac-row">
              <div class="ap-superpac-fund" id="ap-pac-fund">$0</div>
              <button class="ap-util" id="ap-pac-signal" style="margin:0;flex:1">
                Signal PAC · 15⚡ · no slot
              </button>
            </div>
            <div id="ap-pac-signals"></div>
            <div class="ap-divider"></div>
            <div class="ap-cat-label ap-cat-archetype" id="ap-archetype-label">Archetype Ability</div>
            <div class="ap-btn-grid" id="ap-archetype-grid"></div>

            <div class="ap-divider"></div>
            <button class="journal-open-btn" id="ap-journal-btn">📓 Campaign Journal</button>

            <div class="ap-seed-row">
              <span class="ap-seed-code" id="ap-seed-code">—</span>
              <button class="ap-seed-copy" id="ap-seed-copy">Copy seed</button>
            </div>
            <div class="ap-divider"></div>
            <button class="ap-end-day" id="ap-end-day">End Day →</button>
          </div>

          <!-- State picker -->
          <div id="ap-picker" style="display:none">
            <div class="picker-head">
              <span id="picker-label">Pick a state</span>
              <button class="ap-cancel" id="picker-cancel">✕ Cancel</button>
            </div>
            <div id="picker-body"></div>
          </div>

        </div>`;
    }

    _catHTML(label, type, keys) {
      const btns = keys.map(k => this._btnHTML(k)).filter(Boolean).join('');
      if (!btns) return '';
      return `
        <div class="ap-cat">
          <div class="ap-cat-label ap-cat-${type}">${label}</div>
          <div class="ap-btn-grid">${btns}</div>
        </div>`;
    }

    _btnHTML(key) {
      const a = this.game.actions[key];
      if (!a) return '';
      const cost  = this._costLabel(a);
      const scope = a.targeting === 'state' ? '📍' : '🌐';
      return `
        <button class="ap-btn ap-btn-${a.type}" data-action="${key}" disabled>
          <div class="ap-sat-bar" id="sat-${key}"></div>
          <div class="ap-btn-inner">
            <span class="ap-btn-top">
              <span class="ap-btn-scope">${scope}</span>
              <span class="ap-btn-name">${a.name}</span>
            </span>
            <span class="ap-btn-cost">${cost}</span>
          </div>
        </button>`;
    }

    _costLabel(a) {
      const p = [];
      if (a.cost.money)            p.push('$' + this._fmt(a.cost.money));
      if (a.cost.volunteers)       p.push(a.cost.volunteers + '👥');
      if (a.cost.politicalCapital) p.push(a.cost.politicalCapital + '⚡');
      return p.join(' · ') || '—';
    }

    _fmt(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000)    return Math.round(n / 1000) + 'k';
      return String(n);
    }

    // ═══════════════════════════════════════════════════════════════
    //  EVENTS
    // ═══════════════════════════════════════════════════════════════

    _bind() {
      document.getElementById('action-panel').addEventListener('click', e => {

        // Regular action buttons
        const btn = e.target.closest('.ap-btn[data-action]');
        if (btn && !btn.disabled) {
          const key = btn.dataset.action;
          const a   = this.game.actions[key];
          if (!a) return;
          if (a.targeting === 'state') this._showPicker(key);
          else { this.game.useAction(key, null); this.update(); this.onUpdate(); }
          return;
        }

        // State picker selection
        const sb = e.target.closest('.psb');
        if (sb) {
          const abbr = sb.dataset.abbr;
          if (this.pendingAction === 'SURROGATE') {
            this.game.deploySurrogate(abbr);
          } else if (this.pendingAction === 'SUPERPAC') {
            this.game.superPAC.signal(abbr);
          } else if (this.pendingAction) {
            const state = this.game.getStateByAbbr(abbr);
            if (state) this.game.useAction(this.pendingAction, state);
          }
          this._hidePicker();
          this.update();
          this.onUpdate();
          return;
        }

        if (e.target.closest('#picker-cancel')) { this._hidePicker(); return; }

        // Surrogate deploy
        if (e.target.id === 'ap-deploy-surrogate') { this._showPicker('SURROGATE'); return; }

        // Press conference
        if (e.target.id === 'ap-press-conf') {
          this.game.holdPressConference();
          this.update(); this.onUpdate(); return;
        }

        // Fundraise
        if (e.target.id === 'ap-grassroots-fundraise' || e.target.closest('#ap-grassroots-fundraise')) {
          this.game.fundraiseGrassroots(); this.update(); this.onUpdate(); return;
        }
        if (e.target.id === 'ap-donor-dinner' || e.target.closest('#ap-donor-dinner')) {
          this.game.fundraiseDonorDinner(); this.update(); this.onUpdate(); return;
        }

        // Capital actions (no slot except party rally)
        if (e.target.closest('#ap-counter-spin'))   { this.game.counterSpin();    this.update(); this.onUpdate(); return; }
        if (e.target.closest('#ap-party-rally'))    { this.game.partyRally();     this.update(); this.onUpdate(); return; }
        if (e.target.closest('#ap-rapid-response')) { this.game.rapidResponse();  this.update(); this.onUpdate(); return; }
        if (e.target.closest('#ap-poll-analyst'))    { this.game.activatePollAnalyst(); this.update(); this.onUpdate(); return; }

        if (e.target.id === 'ap-pac-signal') {
          this._showPicker('SUPERPAC');
          return;
        }

        // Journal
        if (e.target.id === 'ap-journal-btn') {
          this.game.journal?.open();
          return;
        }

        // Seed copy
        if (e.target.id === 'ap-seed-copy') {
          const code = this.game.getSeedString?.() || '';
          if (code) {
            navigator.clipboard.writeText(code).then(() => {
              const btn = document.getElementById('ap-seed-copy');
              if (btn) { btn.textContent = 'Copied!'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = 'Copy seed'; btn.classList.remove('copied'); }, 1500); }
            });
          }
          return;
        }

        // End Day
        if (e.target.id === 'ap-end-day') { this.game.advanceDay(); this.update(); this.onUpdate(); }
      });
    }

    // ═══════════════════════════════════════════════════════════════
    //  STATE PICKER
    // ═══════════════════════════════════════════════════════════════

    _showPicker(keyOrSurrogate) {
      this.pendingAction = keyOrSurrogate;
      const isSurrogate  = keyOrSurrogate === 'SURROGATE';
      const isSuperPAC   = keyOrSurrogate === 'SUPERPAC';
      const label = isSurrogate ? 'Deploy Surrogate — pick a state'
            : isSuperPAC       ? 'Signal Super PAC — pick a state'
            : (this.game.actions[keyOrSurrogate]?.name ?? '') + ' — pick a state';
      document.getElementById('picker-label').textContent = label;
      document.getElementById('ap-main').style.display   = 'none';
      document.getElementById('ap-picker').style.display = 'block';
      this._renderPicker(isSurrogate);
    }

    _hidePicker() {
      this.pendingAction = null;
      document.getElementById('ap-main').style.display   = '';
      document.getElementById('ap-picker').style.display = 'none';
    }

    _renderPicker(isSurrogate) {
      const all  = [...this.game.states];
      const isBG = s => Math.abs(s.playerSupport - 50) < 9;
      const bgs  = all.filter(isBG).sort((a, b) => b.electoralVotes - a.electoralVotes);
      const rest = all.filter(s => !isBG(s)).sort((a, b) => a.name.localeCompare(b.name));
      const activeSurrogateAbbrs = new Set((this.game.activeSurrogates || []).map(s => s.stateAbbr));
      const isDem = this.game.player?.party === 'Democrat';

      const stateBtn = s => {
        const pct      = s.playerSupport;
        // Party-aware class: blue = Democrat winning, red = Republican winning
        const leading  = pct > 52;
        const trailing = pct < 48;
        const cls = leading  ? (isDem ? 'psb-dem-lead' : 'psb-rep-lead')
                  : trailing ? (isDem ? 'psb-dem-trail' : 'psb-rep-trail')
                  : 'psb-tossup';
        const occupied = isSurrogate && activeSurrogateAbbrs.has(s.abbr);
        const star     = (s.playerCampaignBoost || 0) > 0.5 ? '<span class="psb-star">★</span>' : '';
        return `
          <button class="psb ${cls}" data-abbr="${s.abbr}"
                  ${occupied ? 'disabled' : ''}
                  title="${s.name} · ${s.electoralVotes} EV · ${pct.toFixed(1)}%${occupied ? ' · surrogate active' : ''}">
            <div class="psb-abbr">${s.abbr}${star}</div>
            <div class="psb-ev">${s.electoralVotes}EV</div>
            <div class="psb-pct">${pct.toFixed(1)}%</div>
          </button>`;
      };

      document.getElementById('picker-body').innerHTML = `
        <div class="picker-section">
          <div class="picker-slabel">⚡ Battleground</div>
          <div class="picker-grid">${bgs.length ? bgs.map(stateBtn).join('') : '<span class="picker-empty">No close states</span>'}</div>
        </div>
        <div class="picker-section">
          <div class="picker-slabel">All States</div>
          <div class="picker-grid">${rest.map(stateBtn).join('')}</div>
        </div>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  UPDATE
    // ═══════════════════════════════════════════════════════════════

    update() {
      const g    = this.game;
      const left = g.dailyActionLimit - g.dailyActionsUsed;
      const cap  = g.player?.resources?.politicalCapital || 0;

      // Slot pips
      const slotsEl = document.getElementById('ap-slots');
      if (slotsEl) {
        slotsEl.innerHTML =
          Array.from({ length: g.dailyActionLimit }, (_, i) =>
            `<span class="slot-pip ${i < left ? 'avail' : 'used'}"></span>`
          ).join('') + `<span class="slots-txt">${left} left</span>`;
      }

      // Regular action buttons
      document.querySelectorAll('#action-panel .ap-btn[data-action]').forEach(btn => {
        const key    = btn.dataset.action;
        const a      = g.actions[key];
        if (!a) return;
        const status = g.getActionStatus(key);
        btn.disabled = status !== 'ok';
        const sat = g.getSaturationPct(key);
        const bar = document.getElementById('sat-' + key);
        if (bar) {
          bar.style.width      = sat + '%';
          bar.style.background = sat > 65 ? '#ef4444' : sat > 35 ? '#f59e0b' : '#22c55e';
          bar.style.opacity    = sat > 10 ? '0.28' : '0';
        }
        const eff  = g.getEffectiveness(key);
        const tips = [a.name, `Eff: ${eff}%`];
        if (sat > 10)                        tips.push(`Sat: ${sat}%`);
        if (status === 'no_slots')           tips.push('No action slots remaining');
        else if (status === 'no_money')      tips.push('Insufficient funds');
        else if (status === 'no_volunteers') tips.push(`Need ${a.cost.volunteers} volunteers`);
        else if (status === 'no_capital')    tips.push('Not enough political capital');
        else if (status?.startsWith('avail')) tips.push(status);
        btn.title = tips.join(' · ');
      });

      // Surrogate button
      const surBtn = document.getElementById('ap-deploy-surrogate');
      if (surBtn) {
        const vols  = g.player?.resources?.volunteers || 0;
        const atMax = (g.activeSurrogates?.length ?? 0) >= 3;
        surBtn.disabled = vols < 200 || atMax;
        surBtn.title    = atMax ? 'Max 3 surrogates active'
                        : vols < 200 ? 'Need 200 volunteers'
                        : 'Send a surrogate (3 days, no action slot)';
      }

      // Press conference button
      const pcBtn = document.getElementById('ap-press-conf');
      if (pcBtn) {
        const available  = g.pressConferenceAvailable;
        const noSlots    = (g.dailyActionsUsed || 0) >= (g.dailyActionLimit || 3);
        pcBtn.disabled   = !available || noSlots;
        const daysUntil  = available ? 0 : Math.max(0, 14 - (g.day - (g.pressConferenceLastDay || 0)));
        pcBtn.title      = !available
          ? `Next press conference available in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
          : noSlots ? 'No action slots remaining'
          : 'Hold a press conference — choose your topic (1 slot)';
        pcBtn.textContent = available
          ? '📺 Press Conference · 1 slot · AVAILABLE'
          : `📺 Press Conference · available in ${daysUntil}d`;
      }

      // Active surrogate tags
      const surEl = document.getElementById('ap-active-surrogates');
      if (surEl) {
        const surrogates = g.activeSurrogates || [];
        surEl.innerHTML = surrogates.map(s =>
          `<span class="ap-surrogate-tag">${s.stateAbbr} <span class="sur-days">${s.daysRemaining}d</span></span>`
        ).join('');
      }

      // Fundraise
      const gf = document.getElementById('ap-grassroots-fundraise');
      if (gf) {
        gf.disabled = false;
        gf.title = 'Free fundraise — scales with volunteers. Slight working-class boost.';
      }
      const dd = document.getElementById('ap-donor-dinner');
      if (dd) {
        const cap = g.player?.resources?.politicalCapital || 0;
        dd.disabled = cap < 5;
        dd.title = cap < 5
          ? 'Need 5 political capital to arrange'
          : 'High-yield fundraiser. Costs 5⚡, slight working-class hit.';
      }

      // Capital action buttons
      const hasEvents = (g.activeEvents?.length ?? 0) > 0;
      const opp       = g.opponents?.[0];

      const capBtn = (id, costNeeded, extraCheck = true, tip = '') => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = cap < costNeeded || !extraCheck;
        el.title    = cap < costNeeded ? `Need ${costNeeded} political capital (have ${Math.floor(cap)})`
                    : !extraCheck ? tip
                    : `${costNeeded}⚡ political capital`;
      };

      capBtn('ap-counter-spin',   20, hasEvents, 'No active events to counter');
      capBtn('ap-party-rally',    15, left > 0,  'No action slots remaining');
      capBtn('ap-rapid-response', 25, !!opp,     'No opponent to target');
      capBtn('ap-poll-analyst', 25, !g.pollAnalystActive, g.pollAnalystActive ? `Active (${g.pollAnalystDays}d left)` : null);

      // Show suppress button only when investigation is active
      const hasInvestigation = (g.activeEvents || []).some(e => e.type === 'investigation');
      let suppressSection = document.getElementById('ap-suppress-section');
      if (hasInvestigation) {
        if (!suppressSection) {
          suppressSection = document.createElement('div');
          suppressSection.id = 'ap-suppress-section';
          suppressSection.innerHTML = `
            <div class="ap-divider"></div>
            <div class="ap-cat-label" style="color:#f87171">⚠ Active Investigation</div>
            <button class="ap-btn ap-btn-capital" id="ap-suppress-btn" style="width:100%;grid-column:span 2">
              <div class="ap-sat-bar" style="display:none"></div>
              <div class="ap-btn-inner">
                <span class="ap-btn-top"><span class="ap-btn-scope">⚡</span><span class="ap-btn-name">Suppress Story</span></span>
                <span class="ap-btn-cost">20⚡ · no slot · stops today's damage</span>
              </div>
            </button>`;
          // Insert before End Day
          const endDay = document.getElementById('ap-end-day');
          endDay?.parentNode.insertBefore(suppressSection, endDay);
          // Bind click
          document.getElementById('ap-suppress-btn')?.addEventListener('click', () => {
            g.suppressInvestigation(); this.update(); this.onUpdate();
          });
        }
        const suppressBtn = document.getElementById('ap-suppress-btn');
        if (suppressBtn) {
          const cap = g.player?.resources?.politicalCapital || 0;
          const evt = (g.activeEvents || []).find(e => e.type === 'investigation');
          suppressBtn.disabled = cap < 20;
          suppressBtn.title    = cap < 20
            ? 'Need 20 political capital'
            : `Suppress today's reporting (accumulated damage: ${evt?.damage || 0})`;
        }
      } else if (suppressSection) {
        suppressSection.remove();
      }

      // SuperPAC section
      const pacFund = document.getElementById('ap-pac-fund');
      if (pacFund) {
        const fund = g.superPAC?.fund || 0;
        pacFund.textContent = '$' + (fund >= 1000000
          ? (fund / 1000000).toFixed(1) + 'M'
          : Math.round(fund / 1000) + 'k');
      }

      const pacBtn = document.getElementById('ap-pac-signal');
      if (pacBtn) {
        const cap     = g.player?.resources?.politicalCapital || 0;
        const atMax   = (g.superPAC?.signals?.length ?? 0) >= 2;
        pacBtn.disabled = cap < 15 || atMax;
        pacBtn.title    = atMax ? 'Max 2 PAC signals active'
                  : cap < 15 ? 'Need 15 political capital'
                  : 'Direct Super PAC spending to a state (5 days, no slot)';
      }

      const pacSigs = document.getElementById('ap-pac-signals');
      if (pacSigs) {
        const sigs = g.superPAC?.signals || [];
        pacSigs.innerHTML = sigs.map(s =>
          `<span class="ap-surrogate-tag">${s.stateAbbr} <span class="sur-days">${s.daysRemaining}d</span></span>`
        ).join('');
      }

      // Archetype action section
      const archetype = g.player?.identity?.archetype;
      const archetypeActions = Object.entries(g.actions || {})
        .filter(([, a]) => a.requiredArchetype === archetype);

      const archetypeLabel = document.getElementById('ap-archetype-label');
      const archetypeGrid  = document.getElementById('ap-archetype-grid');
      if (archetypeLabel) archetypeLabel.style.display = archetypeActions.length ? '' : 'none';

      if (archetypeGrid && archetypeActions.length) {
        // Only rebuild if content changed
        if (archetypeGrid.children.length !== archetypeActions.length) {
          archetypeGrid.innerHTML = archetypeActions.map(([key, a]) => {
            const scope = a.targeting === 'state' ? '📍' : '🌐';
            return `
              <button class="ap-btn ap-btn-archetype" data-action="${key}" disabled>
                <div class="ap-sat-bar" id="sat-${key}"></div>
                <div class="ap-btn-inner">
                  <span class="ap-btn-top"><span class="ap-btn-scope">${scope}</span><span class="ap-btn-name">${a.name}</span></span>
                  <span class="ap-btn-cost">${this._costLabel(a)}</span>
                </div>
              </button>`;
          }).join('');
        }
        // Update disabled state for archetype buttons
        archetypeActions.forEach(([key]) => {
          const btn    = archetypeGrid.querySelector(`[data-action="${key}"]`);
          if (!btn) return;
          const status = g.getActionStatus(key);
          btn.disabled = status !== 'ok';
          const cooldownMatch = status?.match(/^cooldown:(\d+)d$/);
          btn.title = cooldownMatch
            ? `On cooldown — ${cooldownMatch[1]} days remaining`
            : status === 'no_slots' ? 'No action slots remaining'
            : status === 'no_money' ? 'Insufficient funds'
            : status === 'no_capital' ? 'Not enough political capital'
            : `${g.actions[key]?.name} — your archetype ability`;
        });
      }

      // Seed display
      const seedEl = document.getElementById('ap-seed-code');
      if (seedEl) {
        const str = g.getSeedString?.() || '—';
        seedEl.textContent = str.length > 22 ? str.slice(0, 22) + '…' : str;
        seedEl.title = str;
      }
    }
  }

  E.ActionPanel = ActionPanel;
})();