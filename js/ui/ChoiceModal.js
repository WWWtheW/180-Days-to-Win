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

      choices.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'cm-choice';
        btn.innerHTML = `
          <div class="cm-choice-label">${c.label}</div>
          <div class="cm-choice-desc">${c.desc}</div>
          ${c.tag ? `<div class="cm-choice-tag">${c.tag}</div>` : ''}`;
        btn.onclick = () => {
          this._overlay.classList.remove('cm-visible');
          onChoice(i, c);
        };
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