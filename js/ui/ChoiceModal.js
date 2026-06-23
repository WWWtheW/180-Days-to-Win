(function () {
  'use strict';
  const E = window.ElectionSim;

  /**
   * Reusable modal that presents 2–4 choices to the player.
   * Usage:
   *   E.ChoiceModal.show({ title, subtitle, choices: [{label, desc, tag}], onChoice: fn(index) })
   */
  class ChoiceModal {
    constructor() {
      this._buildDOM();
    }

    _buildDOM() {
      const el = document.createElement('div');
      el.id    = 'choice-modal-overlay';
      el.innerHTML = `
        <div id="choice-modal">
          <div id="cm-tag"></div>
          <div id="cm-title"></div>
          <div id="cm-subtitle"></div>
          <div id="cm-choices"></div>
        </div>`;
      document.body.appendChild(el);
      this._overlay = el;
    }

    show({ title, subtitle, tag = '', choices, onChoice }) {
      document.getElementById('cm-tag').textContent      = tag;
      document.getElementById('cm-title').textContent    = title;
      document.getElementById('cm-subtitle').textContent = subtitle;

      const grid = document.getElementById('cm-choices');
      grid.innerHTML = '';

      const resources = E.state?.player?.resources || {};

      choices.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'cm-choice';

        // Choices may declare a cost, e.g. { politicalCapital: 20 } — grey out
        // and disable if the player can't currently afford it.
        let affordable = true;
        let shortfallText = '';
        if (c.cost) {
          for (const [key, amt] of Object.entries(c.cost)) {
            const have = resources[key] || 0;
            if (have < amt) {
              affordable = false;
              const label = key === 'politicalCapital' ? 'political capital'
                          : key === 'money' ? 'money'
                          : key;
              shortfallText = `Need ${amt} ${label} (have ${Math.round(have)})`;
              break;
            }
          }
        }

        btn.innerHTML = `
          <div class="cm-choice-label">${c.label}</div>
          <div class="cm-choice-desc">${c.desc}</div>
          ${c.tag ? `<div class="cm-choice-tag">${c.tag}</div>` : ''}
          ${!affordable ? `<div class="cm-choice-insufficient">${shortfallText}</div>` : ''}`;

        if (!affordable) {
          btn.disabled = true;
          btn.classList.add('cm-choice-disabled');
        } else {
          btn.onclick = () => {
            this._overlay.classList.remove('cm-visible');
            onChoice(i, c);
          };
        }

        grid.appendChild(btn);
      });

      this._overlay.classList.add('cm-visible');
    }

    hide() {
      this._overlay.classList.remove('cm-visible');
    }
  }

  // Singleton
  E.ChoiceModal = new ChoiceModal();
})();