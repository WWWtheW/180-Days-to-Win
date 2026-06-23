(function () {
  'use strict';
  const E = window.ElectionSim;

  // VP options now come from window.ElectionSim.data.VP_CANDIDATES,
  // filtered by party in the VPPick constructor (see this.options).

  class VPPick {
    constructor(game, onComplete) {
      this.game       = game;
      this.onComplete = onComplete;
      this.options    = (E.data?.VP_CANDIDATES?.[game.player?.party]) || [];
      this._build();
    }

    _build() {
      const overlay = document.createElement('div');
      overlay.id    = 'vp-pick-overlay';

      const riskColor = r => r === 'Low' ? '#4ade80' : r === 'Med' ? '#fbbf24' : '#f87171';

      overlay.innerHTML = `
        <div id="vp-pick-modal">
          <div id="vp-pick-tag">DAY ${this.game.day} — RUNNING MATE SELECTION</div>
          <div id="vp-pick-title">Choose Your Vice President</div>
          <div id="vp-pick-subtitle">Your running mate will shape coalition alignment and state-level support for the rest of the campaign.</div>

          <div id="vp-pick-cards">
            ${this.options.map((vp, i) => `
              <div class="vp-card" data-index="${i}">
                <div class="vp-card-head">
                  <div>
                    <div class="vp-card-name">${vp.name}</div>
                    <div class="vp-card-arch">${vp.archetype}</div>
                  </div>
                  <div class="vp-card-meta">
                    <span class="vp-state-badge">${vp.state}</span>
                    <span class="vp-risk" style="color:${riskColor(vp.risk)}">Risk: ${vp.risk}</span>
                  </div>
                </div>
                <div class="vp-card-desc">${vp.desc}</div>
                <div class="vp-card-effect">
                  +${vp.boost} ${vp.coalition.replace('_', ' ')} support · home state boost
                </div>
              </div>`).join('')}
          </div>

          <div id="vp-custom-section">
            <div class="vp-divider"></div>
            <div id="vp-custom-label">— or enter a custom name —</div>
            <div id="vp-custom-row">
              <input id="vp-custom-name" type="text" placeholder="VP name…" maxlength="40"/>
              <select id="vp-custom-state">
                ${this.game.states.map(s => `<option value="${s.abbr}">${s.abbr} — ${s.name}</option>`).join('')}
              </select>
              <select id="vp-custom-coalition">
                <option value="working_class">Working Class</option>
                <option value="college">College Educated</option>
                <option value="young">Young Voters</option>
                <option value="seniors">Seniors</option>
                <option value="minority">Minority</option>
                <option value="suburban">Suburban</option>
                <option value="independent">Independents</option>
                <option value="rural">Rural</option>
              </select>
              <button id="vp-custom-confirm">Confirm Custom VP →</button>
            </div>
          </div>
        </div>`;

      document.body.appendChild(overlay);
      this._overlay = overlay;
      this._bindEvents();
    }

    _bindEvents() {
      this._overlay.querySelectorAll('.vp-card').forEach(card => {
        card.addEventListener('click', () => {
          const vp = this.options[parseInt(card.dataset.index)];
          this._applyVP(vp.name, vp.state, vp.coalition, vp.boost, vp.risk);
        });
      });

      this._overlay.querySelector('#vp-custom-confirm').addEventListener('click', () => {
        const name      = this._overlay.querySelector('#vp-custom-name').value.trim();
        const stateAbbr = this._overlay.querySelector('#vp-custom-state').value;
        const coalition = this._overlay.querySelector('#vp-custom-coalition').value;
        if (!name) return;
        this._applyVP(name, stateAbbr, coalition, 4, 'Med');
      });
    }

    _applyVP(name, stateAbbr, coalition, boost, risk = 'Low') {
      const g = this.game;

      // Store on player
      g.player.vp = { name, state: stateAbbr, coalition, boost, risk };

      // Coalition boost
      g.getCoalition(coalition)?.adjustSupport(boost);

      // Home state boost
      const state = g.getStateByAbbr(stateAbbr);
      if (state) state.playerCampaignBoost = (state.playerCampaignBoost || 0) + boost;

      // Slight momentum bump
      g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 5);

      // Political capital bump (VP pick energises the party)
      g.player.resources.politicalCapital = Math.min(100, (g.player.resources.politicalCapital || 0) + 10);

      g.news.unshift({
        day: g.day,
        headline: `${g.player.name} selects ${name} as running mate — ${state?.name ?? stateAbbr} gets a boost`
      });
      g.log.push(`Player VP pick: ${name} (${stateAbbr})`);
      g.journalEvents = g.journalEvents || [];
      g.journalEvents.push({ day: g.day, type: 'vp_pick', name, state: state?.name ?? stateAbbr });

      g.stateSupportEngine?.updateAllStates();

      this._overlay.remove();
      this.onComplete?.();
    }
  }

  E.VPPick = VPPick;
})();