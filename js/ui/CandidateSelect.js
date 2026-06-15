(function () {
  const E = window.ElectionSim;

  const ARCHETYPES = [
    {
      id: 'veteran', title: 'The Veteran', subtitle: 'Career politician',
      description: 'Decades in public service forged an unmatched machine. You know every lever of power in Washington.',
      icon: '★',
      stats: { charisma: 58, debate: 80, fundraising: 75, experience: 92, scandalResistance: 78, discipline: 82, mediaSkill: 60, politicalInstinct: 85 }
    },
    {
      id: 'firebrand', title: 'The Firebrand', subtitle: 'Voice of the movement',
      description: 'The crowds go wild. The establishment panics. You channel something deeper than policy — you channel rage.',
      icon: '◆',
      stats: { charisma: 90, debate: 65, fundraising: 55, experience: 38, scandalResistance: 35, discipline: 45, mediaSkill: 85, politicalInstinct: 70 }
    },
    {
      id: 'insider', title: 'The Insider', subtitle: 'The party machine',
      description: 'Donors pick up on the first ring. Every committee chair owes you a favor. You know the game cold.',
      icon: '◈',
      stats: { charisma: 62, debate: 68, fundraising: 95, experience: 80, scandalResistance: 85, discipline: 82, mediaSkill: 65, politicalInstinct: 75 }
    },
    {
      id: 'outsider', title: 'The Outsider', subtitle: 'No record to attack',
      description: 'No political past to weaponize. No establishment to defend. You run on instinct, and the people feel it.',
      icon: '○',
      stats: { charisma: 82, debate: 52, fundraising: 68, experience: 30, scandalResistance: 32, discipline: 42, mediaSkill: 80, politicalInstinct: 65 }
    },
    {
      id: 'technocrat', title: 'The Technocrat', subtitle: 'Data over doctrine',
      description: 'You have a plan for every crisis. Whether voters care for nuance is the variable you haven\'t solved for.',
      icon: '▣',
      stats: { charisma: 45, debate: 82, fundraising: 70, experience: 88, scandalResistance: 90, discipline: 95, mediaSkill: 52, politicalInstinct: 72 }
    }
  ];

  const STAT_DISPLAY = [
    { key: 'charisma',    label: 'CHRSM' },
    { key: 'debate',      label: 'DEBTE' },
    { key: 'fundraising', label: 'FUNDS' },
    { key: 'experience',  label: 'EXPRC' },
    { key: 'mediaSkill',  label: 'MEDIA' },
    { key: 'discipline',  label: 'DISC ' }
  ];

  class CandidateSelect {
    constructor(onComplete) {
      this.onComplete = onComplete;

      const issues = E.data?.ISSUES || [];
      this.selection = {
        name:           '',
        party:          'Democrat',
        archetypeId:    null,
        difficulty:     'normal',
        issuePositions: Object.fromEntries(issues.map(k => [k, 'centrist']))
      };

      this._render();
      this._bind();
    }

    _renderStatBars(stats) {
      return STAT_DISPLAY.map(({ key, label }) => `
        <div class="cs-stat-row">
          <span class="cs-stat-label">${label}</span>
          <div class="cs-stat-bar-wrap">
            <div class="cs-stat-bar-fill" style="width:${stats[key]}%"></div>
          </div>
        </div>`).join('');
    }

    _renderArchetypeCards() {
      return ARCHETYPES.map(a => `
        <div class="cs-archetype-card" data-archetype="${a.id}">
          <span class="cs-archetype-icon">${a.icon}</span>
          <div class="cs-archetype-title">${a.title}</div>
          <div class="cs-archetype-subtitle">${a.subtitle}</div>
          <div class="cs-archetype-desc">${a.description}</div>
          <div class="cs-stat-list">${this._renderStatBars(a.stats)}</div>
        </div>`).join('');
    }

    _renderDifficulty() {
      return [
        { id: 'easy',   label: 'Easy',   desc: 'Weaker opposition. Good for learning the ropes.' },
        { id: 'normal', label: 'Normal', desc: 'A balanced race. The intended experience.' },
        { id: 'hard',   label: 'Hard',   desc: 'Stronger, better-funded opposition.' }
      ].map(d => `
        <div class="cs-difficulty-btn ${d.id === 'normal' ? 'selected' : ''}" data-difficulty="${d.id}">
          <div class="cs-difficulty-label">${d.label}</div>
          <div class="cs-difficulty-desc">${d.desc}</div>
        </div>`).join('');
    }

    _renderIssuePositions() {
      const posData = E.data?.ISSUE_POSITIONS || {};
      const issues  = E.data?.ISSUES          || [];
      return `
        <div class="cs-issue-note">
          These shape your opening coalition alignment. Centrist by default — changes cost you with one side to gain with another.
        </div>
        <div class="cs-issue-grid">
          ${issues.map(key => {
            const issue = posData[key];
            if (!issue) return '';
            return `
              <div class="cs-issue-row" data-issue="${key}">
                <span class="cs-issue-label">${issue.label}</span>
                <div class="cs-issue-btns">
                  <button class="cs-pos-btn" data-pos="liberal"       title="${issue.liberal.desc}">${issue.liberal.label}</button>
                  <button class="cs-pos-btn cs-pos-ctr-sel" data-pos="centrist"      title="${issue.centrist.desc}">${issue.centrist.label}</button>
                  <button class="cs-pos-btn" data-pos="conservative"  title="${issue.conservative.desc}">${issue.conservative.label}</button>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }

    _render() {
      const overlay = document.getElementById('candidate-select-overlay');
      overlay.innerHTML = `
        <div class="cs-container">
          <div class="cs-seed-import" id="cs-seed-import">
            <input id="cs-seed-input" type="text" placeholder="Paste a seed to load a previous run setup…"/>
            <button id="cs-seed-load">Load →</button>
          </div>
          <div class="cs-header">
            <div class="cs-flag-stripe"></div>
            <div class="cs-stars-row">★ ★ ★ ★ ★ ★ ★</div>
            <h1 class="cs-title">Declare Your Candidacy</h1>
            <div class="cs-tagline">180 Days to Win — Campaign Setup</div>
          </div>

          <div class="cs-section">
            <div class="cs-section-label">01 — Candidate Identity</div>
            <div class="cs-identity-row">
              <div>
                <span class="cs-field-label">Candidate Name</span>
                <input type="text" id="cs-name" class="cs-input"
                  placeholder="Enter your name" maxlength="40" autocomplete="off"/>
              </div>
              <div>
                <span class="cs-field-label">Party Affiliation</span>
                <div class="cs-party-row">
                  <button class="cs-party-btn active-dem" data-party="Democrat">◀ Democrat</button>
                  <button class="cs-party-btn" data-party="Republican">Republican ▶</button>
                </div>
              </div>
            </div>
          </div>

          <div class="cs-section">
            <div class="cs-section-label">02 — Candidate Background</div>
            <div class="cs-archetypes">${this._renderArchetypeCards()}</div>
          </div>

          <div class="cs-section">
            <div class="cs-section-label">03 — Difficulty</div>
            <div class="cs-difficulty-row">${this._renderDifficulty()}</div>
          </div>

          <div class="cs-section">
            <div class="cs-section-label">04 — Issue Positions</div>
            ${this._renderIssuePositions()}
          </div>

          <div class="cs-submit-area">
            <div class="cs-error" id="cs-error"></div>
            <button id="cs-submit" class="cs-submit-btn">Enter the Race →</button>
          </div>
        </div>`;
    }

    _bind() {
      document.getElementById('cs-name').addEventListener('input', e => {
        this.selection.name = e.target.value;
        if (this.selection.name.trim()) document.getElementById('cs-error').textContent = '';
      });

      const seedInput = document.getElementById('cs-seed-input');
      const seedLoad  = document.getElementById('cs-seed-load');
      if (seedLoad && seedInput) {
        seedLoad.addEventListener('click', () => {
          const parsed = E.GameState?.parseSeedString?.(seedInput.value.trim());
          if (!parsed) { seedInput.style.borderColor = '#ef4444'; return; }

          // Pre-select party
          const partyBtns = document.querySelectorAll('.cs-party-btn');
          const party = parsed.p === 0 ? 'Democrat' : 'Republican';
          partyBtns.forEach(b => {
            b.classList.remove('active-dem','active-rep');
            if (b.dataset.party === party) b.classList.add(party === 'Democrat' ? 'active-dem' : 'active-rep');
          });
          this.selection.party = party;

          // Pre-select archetype
          if (parsed.a) {
            const card = document.querySelector(`.cs-archetype-card[data-archetype="${parsed.a}"]`);
            card?.click();
          }

          // Pre-select difficulty
          if (parsed.d) {
            const dBtn = document.querySelector(`.cs-difficulty-btn[data-difficulty="${parsed.d}"]`);
            dBtn?.click();
          }

          // Pre-set issue positions
          if (parsed.i) {
            Object.entries(parsed.i).forEach(([issue, pos]) => {
              const row = document.querySelector(`.cs-issue-row[data-issue="${issue}"]`);
              const btn = row?.querySelector(`.cs-pos-btn[data-pos="${pos}"]`);
              btn?.click();
            });
          }

          // Store seed for GameState
          this.selection._seed = parsed.s;
          seedInput.style.borderColor = '#4ade80';
        });
      }

      document.querySelectorAll('.cs-party-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selection.party = btn.dataset.party;
          document.querySelectorAll('.cs-party-btn').forEach(b =>
            b.classList.remove('active-dem', 'active-rep'));
          btn.classList.add(btn.dataset.party === 'Democrat' ? 'active-dem' : 'active-rep');
        });
      });

      document.querySelectorAll('.cs-archetype-card').forEach(card => {
        card.addEventListener('click', () => {
          this.selection.archetypeId = card.dataset.archetype;
          document.querySelectorAll('.cs-archetype-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          document.getElementById('cs-error').textContent = '';
        });
      });

      document.querySelectorAll('.cs-difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selection.difficulty = btn.dataset.difficulty;
          document.querySelectorAll('.cs-difficulty-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });

      document.querySelectorAll('.cs-issue-row').forEach(row => {
        row.querySelectorAll('.cs-pos-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const issue = row.dataset.issue;
            const pos   = btn.dataset.pos;
            this.selection.issuePositions[issue] = pos;
            row.querySelectorAll('.cs-pos-btn').forEach(b =>
              b.classList.remove('cs-pos-lib-sel', 'cs-pos-ctr-sel', 'cs-pos-con-sel'));
            btn.classList.add(
              pos === 'liberal' ? 'cs-pos-lib-sel' :
              pos === 'conservative' ? 'cs-pos-con-sel' : 'cs-pos-ctr-sel'
            );
          });
        });
      });

      document.getElementById('cs-submit').addEventListener('click', () => this._submit());
    }

    _submit() {
      const name = this.selection.name.trim();
      if (!name) {
        document.getElementById('cs-error').textContent = '▸ Enter your candidate name to continue.';
        document.getElementById('cs-name').focus();
        return;
      }
      if (!this.selection.archetypeId) {
        document.getElementById('cs-error').textContent = '▸ Choose a candidate background to continue.';
        return;
      }
      const archetype = ARCHETYPES.find(a => a.id === this.selection.archetypeId);
      const overlay   = document.getElementById('candidate-select-overlay');
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        this.onComplete({
          name,
          seed: this.selection._seed || null,
          party:          this.selection.party,
          archetypeId:    this.selection.archetypeId,
          stats:          { ...archetype.stats },
          difficulty:     this.selection.difficulty,
          issuePositions: { ...this.selection.issuePositions }
        });
      }, 400);
    }
  }

  E.CandidateSelect = CandidateSelect;
})();