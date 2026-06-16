(function () {
  const E = window.ElectionSim;

  const Candidate      = E.models.Candidate;
  const State          = E.models.State;
  const Coalition      = E.models.Coalition;
  const Policy         = E.models.Policy;
  const CampaignAction = E.models.CampaignAction;

  class GameState {
    constructor(seed = 12345) {
      this.day = 1;
      this.seed = seed;
      this.gameConfig = null;
      this.rng = new E.utils.Random(seed);

      this.player        = null;
      this.opponents     = [];
      this.aiControllers = [];
      this.log           = [];

      this.resources = structuredClone(E.data.CONSTANTS.STARTING_RESOURCES);

      // WORLD
      this.worldData = E.data.STATES;
      this.states    = this.loadStates();

      // COALITIONS
      this.coalitions = this.initCoalitions();

      // ACTIONS
      this.actions       = this.initActions();
      this.actionHistory = [];

      // ── New: saturation + daily slot tracking ──────────────────
      this.actionSaturation  = {};   // { [actionKey]: 0-100 }
      this.actionCooldowns = {};  // { [actionKey]: daysRemaining }
      this.journalEvents   = [];  // raw event log read by CampaignJournal
      this.vpPickTriggered = false;
      this.dailyActionsUsed  = 0;
      this.dailyActionLimit  = 2;
      // ──────────────────────────────────────────────────────────

      // STATE SUPPORT
      this.stateSupportEngine = new E.StateSupportEngine(this);

      // POLLING
      this.polling = new E.PollingEngine(this);

      // DEBATE
      this.debates           = new E.DebateSystem(this);
      this.debatePreparation = 0;

      // EVENTS
      this.events       = new E.EventEngine(this);
      this.news         = [];
      this.stateNews = {};   // { [abbr]: { headline, day, type } } — latest event per state
      this.activeEvents = [];
      this.endorsements = [];   // { name, type, coalition, boost, state, policies }
      this.superPAC = new E.SuperPAC(this);
      this.issuePositions = {};
      this.activeSurrogates = [];  // [{ stateAbbr, stateName, daysRemaining, dailyBoost }]

      // Press conferences — available every 14 days
      this.pressConferenceAvailable = true;   // available from day 1
      this.pressConferenceLastDay   = -14;

      // ELECTION NIGHT
      this.electionNight = {
        active:    false,
        tick:      0,
        demEV:     0,
        repEV:     0,
        stateData: [],
        updates:   []
      };

      if (!E.OpponentAI) console.warn('OpponentAI not loaded');

      this.engine = new E.Game(this);
    }

    // ============================
    // WORLD
    // ============================

    loadStates() {
      return this.worldData.map(state => new State(state));
    }

    getStateByAbbr(abbr) {
      return this.states.find(s => s.abbr === abbr);
    }

    // ============================
    // COALITIONS
    // ============================

    initCoalitions() {
      return E.data.CONSTANTS.COALITIONS.map(name => new Coalition(name, 1, this.rng));
    }

    getCoalition(name) {
      return this.coalitions.find(c => c.name === name);
    }

    applyIssuePositions(positions) {
      const posData = window.ElectionSim.data?.ISSUE_POSITIONS;
      if (!posData || !positions) return;

      for (const [issue, stance] of Object.entries(positions)) {
        if (stance === 'centrist') continue;                    // centrist = no shift
        const effects = posData[issue]?.[stance]?.effects;
        if (!effects) continue;
        for (const [coalition, delta] of Object.entries(effects)) {
          this.getCoalition(coalition)?.adjustSupport(delta);
        }
      }

      this.issuePositions = { ...positions };
      this.stateSupportEngine.updateAllStates();
      this.log.push('Issue positions applied');
    }

    // ============================
    // CAMPAIGN ACTIONS
    // ============================

    initActions() {
      const A = E.models.CampaignAction;
      return {

        // ── GROUND ──────────────────────────────────────────────
        rallyUrban: new A({
          name: 'Urban Rally',
          type: 'ground',
          targeting: 'state',
          cost: { money: 150000 },
          momentumEffect: 2,
          statKeys: ['charisma'],
          stateBoostBase: 2.5,
          effects: { urban: 3, young: 1.5, rural: -0.5 }
        }),

        ruralTour: new A({
          name: 'Rural Tour',
          type: 'ground',
          targeting: 'state',
          cost: { money: 100000 },
          momentumEffect: 1.5,
          statKeys: ['charisma', 'politicalInstinct'],
          stateBoostBase: 2.5,
          effects: { rural: 3.5, working_class: 2, urban: -0.5 }
        }),

        townHall: new A({
          name: 'Town Hall',
          type: 'ground',
          targeting: 'state',
          cost: { money: 50000 },
          momentumEffect: 1,
          statKeys: ['charisma', 'experience'],
          stateBoostBase: 1.5,
          effects: { independent: 3, seniors: 2.5, suburban: 1.5, rural: 0.5, young: -0.5 }
        }),

        grassroots: new A({
          name: 'Grassroots Org',
          type: 'ground',
          targeting: 'state',
          cost: { money: 50000 },
          momentumEffect: 0.5,
          statKeys: ['politicalInstinct', 'discipline'],
          stateBoostBase: 1.5,
          volunteerEffect: 300,
          effects: { working_class: 1.5, young: 1, independent: 0.5 }
        }),

        // Only unlocks at day 140 — spends volunteers for lasting turnout
        gotvDrive: new A({
          name: 'GOTV Drive',
          type: 'ground',
          targeting: 'state',
          minDay: 140,
          cost: { money: 0, volunteers: 500 },
          momentumEffect: 1,
          statKeys: ['politicalInstinct', 'experience'],
          stateBoostBase: 1,
          turnoutEffect: 3,
          effects: {}
        }),

        // ── AIR ─────────────────────────────────────────────────
        mediaBlitz: new A({
          name: 'Media Blitz',
          type: 'air',
          targeting: 'national',
          cost: { money: 500000 },
          momentumEffect: 4,
          statKeys: ['mediaSkill'],
          stateBoostBase: 0,
          effects: { suburban: 3, independent: 2 }
        }),

        tvAds: new A({
          name: 'TV Ads',
          type: 'air',
          targeting: 'state',
          cost: { money: 300000 },
          momentumEffect: 1,
          statKeys: ['mediaSkill'],
          stateBoostBase: 4,
          effects: { independent: 1 }
        }),

        attackAd: new A({
          name: 'Attack Ad',
          type: 'air',
          targeting: 'state',
          cost: { money: 200000, politicalCapital: 10 },
          momentumEffect: 1,
          statKeys: ['mediaSkill'],
          stateBoostBase: 2.5,
          opponentMomentumEffect: -4,
          effects: { independent: 2 }
        }),

        // ── DEVELOP ─────────────────────────────────────────────
        debatePrep: new A({
          name: 'Debate Prep',
          type: 'develop',
          targeting: 'national',
          cost: { money: 75000 },
          momentumEffect: 0,
          statKeys: ['discipline'],
          debatePrepEffect: 5,
          effects: { college: 1, independent: 0.5 }
        }),

        volunteerDrive: new A({
          name: 'Volunteer Drive',
          type: 'develop',
          targeting: 'national',
          cost: { money: 150000 },
          momentumEffect: 0.5,
          statKeys: ['fundraising', 'politicalInstinct'],
          volunteerEffect: 450,
          effects: { working_class: 0.5, young: 0.5 }
        }),

        oppoResearch: new A({
          name: 'Oppo Research',
          type: 'develop',
          targeting: 'national',
          cost: { money: 75000, politicalCapital: 20 },
          momentumEffect: 0,
          statKeys: ['politicalInstinct', 'discipline'],
          opponentMomentumEffect: -6,
          triggerOpponentEvent: true,
          effects: {}
        }),

        // ── ARCHETYPE UNIQUE ACTIONS ──────────────────────────────
        // (each only available if player.identity.archetype matches)

        rallyingCry: new A({
          name: 'Rallying Cry',
          type: 'ground', targeting: 'national',
          requiredArchetype: 'firebrand',
          cost: { money: 0 },
          momentumEffect: 12,
          statKeys: ['charisma'],
          volunteerEffect: 800,
          effects: { working_class: 5, young: 4, independent: -4, college: -2 }
        }),

        partyElder: new A({
          name: 'Party Elder',
          type: 'develop', targeting: 'national',
          requiredArchetype: 'veteran',
          cost: { politicalCapital: 25 },
          momentumEffect: 2,
          statKeys: ['experience'],
          effects: {}
        }),

        partyFavour: new A({
          name: 'Party Favour',
          type: 'develop', targeting: 'national',
          requiredArchetype: 'insider',
          cost: { politicalCapital: 30 },
          momentumEffect: 1,
          statKeys: ['fundraising'],
          effects: {}
        }),

        viralMomentAction: new A({
          name: 'Viral Moment',
          type: 'air', targeting: 'state',
          requiredArchetype: 'outsider',
          cost: { money: 0 },
          momentumEffect: 0,   // handled by special post-apply
          statKeys: ['charisma', 'mediaSkill'],
          stateBoostBase: 2,
          effects: {}
        }),

        dataBlitz: new A({
          name: 'Data Blitz',
          type: 'air', targeting: 'state',
          requiredArchetype: 'technocrat',
          cost: { money: 200000, politicalCapital: 15 },
          momentumEffect: 1,
          statKeys: ['discipline', 'mediaSkill'],
          stateBoostBase: 6,   // higher than TV Ads; no saturation penalty applied (see useAction)
          effects: { independent: 2, college: 1 }
        }),
      };
    }

    /**
     * Execute a campaign action.
     * @param {string}     key         — action key
     * @param {State|null} targetState — required for state-targeted actions
     * @returns {boolean}  true if applied, false if blocked
     */
    useAction(key, targetState = null) {
      if (this.dailyActionsUsed >= this.dailyActionLimit) return false;
      const action = this.actions[key];
      if (!action || !this.player) return false;

      const saturation = this.actionSaturation[key] || 0;
      const applied    = action.apply(this, targetState, saturation);
      if (!applied) return false;

      // Raise saturation; decays daily (see advanceDay)
      this.actionSaturation[key] = Math.min(100, saturation + 15);
      // Special post-apply logic for archetype actions
      if (key === 'rallyingCry') {
        this.actionCooldowns['rallyingCry'] = 15;
      }
      if (key === 'partyElder') {
        this.events?.endorsement?.();
      }
      if (key === 'partyFavour') {
        this.player.resources.money = (this.player.resources.money || 0) + 800000;
        this.events?.endorsement?.();
      }
      if (key === 'viralMomentAction') {
        this.events?.viralMoment?.();
      }
      // dataBlitz skips saturation penalty
      if (key === 'dataBlitz') {
        this.actionSaturation['dataBlitz'] = 0;
      }
      this.dailyActionsUsed++;
      this.actionHistory.push({
        day:   this.day,
        action: key,
        state: targetState?.abbr || null
      });
      this.stateSupportEngine.updateAllStates();
      return true;
    }

    deploySurrogate(stateAbbr) {
      const MAX = 3;
      const COST = 200;
      const r = this.player?.resources;
      if (!r) return false;
      if ((r.volunteers || 0) < COST)                                  return false;
      if (this.activeSurrogates.length >= MAX)                         return false;
      if (this.activeSurrogates.find(s => s.stateAbbr === stateAbbr)) return false;

      r.volunteers -= COST;
      const state = this.getStateByAbbr(stateAbbr);
      this.activeSurrogates.push({
        stateAbbr,
        stateName:     state?.name ?? stateAbbr,
        daysRemaining: 3,
        dailyBoost:    0.6
      });
      if (state && this.player) {
        this.news.unshift({
          day:      this.day,
          headline: `${this.player.name} surrogate begins campaigning in ${state.name}`
        });
      }
      return true;
    }

    counterSpin() {
      const r = this.player?.resources;
      if (!r || (r.politicalCapital || 0) < 20) return false;
      if (!this.activeEvents?.length) return false;
      r.politicalCapital -= 20;
      const evt = this.activeEvents[0];
      evt.remaining = Math.max(0, evt.remaining - 2);
      if (evt.remaining <= 0) {
        this.activeEvents = this.activeEvents.filter(e => e !== evt);
        this.news.unshift({ day: this.day, headline: `${this.player.name} successfully pivots away from controversy` });
      } else {
        this.news.unshift({ day: this.day, headline: `${this.player.name} campaign moves to counter the news cycle` });
      }
      r.momentum = Math.min(100, (r.momentum || 50) + 3);
      this.log.push('Counter-spin used');
      return true;
    }

    partyRally() {
      const r = this.player?.resources;
      if (!r || (r.politicalCapital || 0) < 15) return false;
      if (this.dailyActionsUsed >= this.dailyActionLimit) return false;
      r.politicalCapital -= 15;
      this.dailyActionsUsed++;
      this.coalitions.forEach(c => c.adjustSupport(1));
      r.momentum = Math.min(100, (r.momentum || 50) + 2);
      this.stateSupportEngine.updateAllStates();
      this.news.unshift({ day: this.day, headline: `${this.player.name} rallies party faithful across the country` });
      this.log.push('Party rally used');
      return true;
    }

    rapidResponse() {
      const r   = this.player?.resources;
      const opp = this.opponents?.[0];
      if (!r || (r.politicalCapital || 0) < 25 || !opp) return false;
      r.politicalCapital -= 25;
      opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 10);
      r.momentum = Math.min(100, (r.momentum || 50) + 3);
      this.news.unshift({ day: this.day, headline: `${this.player.name} rapid response team neutralises ${opp.name} attack` });
      this.log.push('Rapid response used');
      return true;
    }

    suppressInvestigation() {
      const r     = this.player?.resources;
      const event = this.activeEvents.find(e => e.type === 'investigation');
      if (!r || !event) return false;
      if ((r.politicalCapital || 0) < 20) return false;
      r.politicalCapital -= 20;
      event.suppressed = true;
      this.news.unshift({ day: this.day, headline: `${this.player.name} campaign moves to contain emerging story` });
      this.log.push('Investigation suppressed for today');
      return true;
    }

    debateBoost() {
      // Kept for save-state compatibility — now superseded by activatePollAnalyst
      return this.activatePollAnalyst();
    }

    activatePollAnalyst() {
      const r = this.player?.resources;
      if (!r || (r.politicalCapital || 0) < 25) return false;
      if (this.pollAnalystActive) return false;
      r.politicalCapital -= 25;
      this.pollAnalystActive = true;
      this.pollAnalystDays   = 10;
      this.news.unshift({ day: this.day, headline: `${this.player.name} brings in top data analyst — polling now sharper` });
      this.log.push('Poll analyst activated');
      return true;
    }

    holdPressConference() {
      if (!this.pressConferenceAvailable) return false;
      if ((this.dailyActionsUsed || 0) >= (this.dailyActionLimit || 3)) return false;

      // Pick 3 random topics from the pool
      const allTopics = window.ElectionSim.data?.PRESS_CONFERENCE_TOPICS || [];
      if (!allTopics.length) return false;

      const shuffled = [...allTopics].sort(() => this.rng.next() - 0.5).slice(0, 3);

      this.pressConferenceAvailable = false;
      this.pressConferenceLastDay   = this.day;
      this.dailyActionsUsed = (this.dailyActionsUsed || 0) + 1;

      const game = this;
      window.ElectionSim.ChoiceModal.show({
        tag: '📺 PRESS CONFERENCE',
        title: `${this.player.name} holds press briefing — choose your focus`,
        subtitle: 'Your answer will dominate tomorrow\'s news cycle.',
        choices: shuffled.map(t => ({ label: t.label, desc: t.desc, tag: t.tag })),
        onChoice: (i) => {
          shuffled[i].apply(game);
          game.news.unshift({ day: game.day, headline: `${game.player.name} holds press conference on ${shuffled[i].label.toLowerCase()}` });
          game.log.push(`Press conference: ${shuffled[i].label}`);
          game.journalEvents = game.journalEvents || [];
          game.journalEvents.push({ day: game.day, type: 'press_conference', topic: shuffled[i].label });
        }
      });
      return true;
    }

    /**
     * Detailed status for a given action key — used by ActionPanel.
     */
    getActionStatus(key) {
      const action = this.actions[key];
      if (!action || !this.player) return 'unavailable';
      // Archetype gate
      if (action.requiredArchetype && this.player.identity?.archetype !== action.requiredArchetype) {
        return 'wrong_archetype';
      }
      // Cooldown gate
      if (this.actionCooldowns[key] > 0) {
        return `cooldown:${this.actionCooldowns[key]}d`;
      }
      if (action.minDay && this.day < action.minDay)
        return `available day ${action.minDay}`;
      if (this.dailyActionsUsed >= this.dailyActionLimit)
        return 'no_slots';
      const r = this.player.resources;
      if (r.money              < (action.cost.money            || 0)) return 'no_money';
      if ((r.volunteers  || 0) < (action.cost.volunteers       || 0)) return 'no_volunteers';
      if ((r.politicalCapital || 0) < (action.cost.politicalCapital || 0)) return 'no_capital';
      return 'ok';
    }

    canAfford(key) {
      return this.getActionStatus(key) === 'ok';
    }

    canMomentum() {
      return (this.player?.resources?.momentum || 0) >= 2;
    }

    fundraiseGrassroots() {
      const r = this.player?.resources;
      if (!r) return false;
      // No momentum cost — small donors give regardless; scales with volunteers
      const volBonus   = Math.min(1.4, 1 + (r.volunteers || 0) / 20000);
      const yield_     = Math.floor(80000 * volBonus * (1 + this.rng.range(-0.1, 0.1)));
      r.money         += yield_;
      r.volunteers     = Math.min(20000, (r.volunteers || 0) + 50); // small volunteer bump
      // Slight working-class boost — grassroots signal
      this.getCoalition('working_class')?.adjustSupport(0.3);
      this.news.unshift({ day: this.day, headline: `${this.player.name} grassroots fundraiser raises $${Math.round(yield_/1000)}k` });
      this.log.push(`Grassroots fundraise: +$${yield_}`);
      return true;
    }

    fundraiseDonorDinner() {
      const r = this.player?.resources;
      if (!r || (r.politicalCapital || 0) < 5) return false;
      // High yield but costs capital and a slight populist hit
      const momentumBonus = Math.max(0.7, 1 + (r.momentum - 50) / 150);
      const yield_        = Math.floor(600000 * momentumBonus * (1 + this.rng.range(-0.15, 0.15)));
      r.money            += yield_;
      r.politicalCapital  = Math.min(100, (r.politicalCapital || 0) + 8); // donors bring capital
      r.politicalCapital -= 5; // cost to arrange
      // Small working-class hit — seen as out of touch
      this.getCoalition('working_class')?.adjustSupport(-0.5);
      this.getCoalition('college')?.adjustSupport(0.3);
      this.news.unshift({ day: this.day, headline: `${this.player.name} attends high-dollar fundraiser — raises $${Math.round(yield_/1000)}k` });
      this.log.push(`Donor dinner: +$${yield_}`);
      return true;
    }

    hasActionsLeft() {
      return this.dailyActionsUsed < this.dailyActionLimit;
    }

    /** 0-100 raw saturation value for this action key */
    getSaturationPct(key) {
      return Math.round(this.actionSaturation[key] || 0);
    }

    /**
     * Combined effectiveness (saturation × stat multiplier) as 0-100 integer.
     * Used by ActionPanel for tooltips.
     */
    getEffectiveness(key) {
      const action = this.actions[key];
      if (!action || !this.player) return 100;
      const sat     = this.actionSaturation[key] || 0;
      const satMult = 1 - (sat / 100) * 0.65;
      const statMult = action._statMult(this.player);
      return Math.round(satMult * statMult * 100);
    }

    // ============================
    // CANDIDATES
    // ============================

    createPlayerCandidate(name, party, statPreset = null) {
      this.player = new Candidate(name, party, this.rng, true, statPreset);
      if (statPreset?.archetypeId) {
        this.player.identity = this.player.identity || {};
        this.player.identity.archetype = statPreset.archetypeId;
      }
      this.log.push(`Player candidate created: ${name}`);
      this.news.unshift({
        day: this.day,
        headline: `${this.player.name} announces presidential bid as a ${this.player.party}`
      });
    }

    generateOpponent(name, party, difficulty = 1.1) {
      const opp = new Candidate(name, party, this.rng, false, null, difficulty);
      this.opponents.push(opp);
      this.aiControllers.push(new E.OpponentAI(opp, this));
      return opp;
    }

    // ============================
    // TIME
    // ============================

    advanceDay() {
      if (this.electionNight.active) return;

      this.day++;

      // ── Reset daily action slots ──────────────────────────────
      this.dailyActionsUsed = 0;

      // Decay action cooldowns
      for (const key of Object.keys(this.actionCooldowns)) {
        this.actionCooldowns[key]--;
        if (this.actionCooldowns[key] <= 0) delete this.actionCooldowns[key];
      }

      // ── Poll analyst countdown ─────────────────────────────────
      if (this.pollAnalystActive) {
        this.pollAnalystDays = (this.pollAnalystDays || 1) - 1;
        if (this.pollAnalystDays <= 0) {
          this.pollAnalystActive = false;
          this.pollAnalystDays   = 0;
          this.news.unshift({ day: this.day, headline: 'Data analyst contract concluded — polling returns to normal noise levels' });
        }
      }

      // ── Press conference availability (every 14 days) ──────────
      if (!this.pressConferenceAvailable && this.day - this.pressConferenceLastDay >= 14) {
        this.pressConferenceAvailable = true;
      }

      // ── Decay action saturation (~88% retained per day) ───────
      for (const key of Object.keys(this.actionSaturation)) {
        this.actionSaturation[key] *= 0.88;
        if (this.actionSaturation[key] < 0.5) delete this.actionSaturation[key];
      }

      this.engine.step();
      this.aiControllers.forEach(ai => ai.takeTurn());

      if (this.player) {
        // Momentum drifts back toward 50
        let m = this.player.resources.momentum;
        m = 50 + (m - 50) * 0.95;
        m += this.rng.range(-2, 2);
        this.player.resources.momentum = Math.max(0, Math.min(100, m));

        // Political capital trickles back slowly
        this.player.resources.politicalCapital = Math.min(
          100, (this.player.resources.politicalCapital || 0) + 0.4
        );
      }

      if (this.rng.next() < 0.3) {
        this.coalitions.forEach(c => c.adjustSupport(this.rng.range(-1, 1)));
      }

      // Process active surrogates
      this.activeSurrogates = this.activeSurrogates.filter(s => {
        const st = this.getStateByAbbr(s.stateAbbr);
        if (st) st.playerCampaignBoost = (st.playerCampaignBoost || 0) + s.dailyBoost;
        this.getCoalition('working_class')?.adjustSupport(0.2);
        this.getCoalition('young')?.adjustSupport(0.15);
        s.daysRemaining--;
        return s.daysRemaining > 0;
      });

      // ── Per-state daily decay ─────────────────────────────────
      this.states.forEach(s => {
        s.aiPressure          = (s.aiPressure         || 0) * 0.85;
        s.playerCampaignBoost = (s.playerCampaignBoost || 0) * 0.82;
        s.attentionDays       = 0;
      });

      this.superPAC.tick();

      // Expire state news badges older than 5 days
      if (this.stateNews) {
        for (const [abbr, entry] of Object.entries(this.stateNews)) {
          if (this.day - entry.day > 5) delete this.stateNews[abbr];
        }
      }

      this.stateSupportEngine.updateAllStates();
      this.processEvents();

      if (this.day % 5 === 0) {
        this.polling.generateNationalPoll();
        const battlegrounds = this.polling.getBattlegroundStates();
        battlegrounds.forEach(state => this.polling.generateStatePoll(state));
      }

      this.events?.maybeTriggerEvent();

      // Player VP pick prompt (around day 45)
      if (!this.vpPickTriggered && this.player && this.day >= 44 && this.day <= 48) {
        this.vpPickTriggered = true;
        new E.VPPick(this, () => { /* onComplete */ });
      }

      if (this.debates.shouldDebate(this.day)) {
        // Pause auto-advance and show the choice modal
        this.debates.triggerDebateModal((result) => {
          this.resolveDebate(result);
        });
      }

      if (this.day >= 180 && !this.electionNight.active) {
        this.startElectionNight();
      }
    }

    getDayProgress() {
      return `${this.day} / ${E.data.CONSTANTS.CAMPAIGN_DAYS}`;
    }

    // ============================
    // DEBATE
    // ============================

    resolveDebate(result) {
      if (result.result === 'win') {
        this.player.resources.momentum += 8;
        // Debate win earns political capital
        this.player.resources.politicalCapital = Math.min(
          100, (this.player.resources.politicalCapital || 0) + 15
        );
        this.coalitions.forEach(c => c.adjustSupport(2));
        this.log.push('Debate victory');
        this.journalEvents.push({ day: this.day, type: 'debate_win' });
        this.news.unshift({
          day: this.day,
          headline: `${this.player.name} wins presidential debate`
        });
      } else if (result.result === 'loss') {
        this.player.resources.momentum -= 8;
        this.coalitions.forEach(c => c.adjustSupport(-2));
        this.log.push('Debate defeat');
        this.journalEvents.push({ day: this.day, type: 'debate_loss' });
        this.news.unshift({
          day: this.day,
          headline: `${this.player.name} fumbles debate, costing support`
        });
      } else {
        this.log.push('Debate draw');
        this.journalEvents.push({ day: this.day, type: 'debate_draw' });
        this.news.unshift({
          day: this.day,
          headline: 'Both candidates deliver mixed debate performances'
        });
      }
      this.debatePreparation = 0;
    }

    // ============================
    // EVENTS
    // ============================

    processEvents() {
      for (const event of this.activeEvents) {
        event.remaining--;

        if (event.type === 'scandal') {
          if (event.remaining === 2) {
            this.news.unshift({ day: this.day, headline: 'Media scrutiny intensifies' });
            this.player.resources.momentum -= 2;
          }
          if (event.remaining === 1) {
            this.news.unshift({ day: this.day, headline: 'Opponents amplify controversy' });
            this.player.resources.momentum -= 3;
          }
          if (event.remaining <= 0) {
            event.resolved = true;
            this.news.unshift({ day: this.day, headline: 'Controversy fades from headlines' });
            this.player.resources.momentum += 1;
          }
        }

        if (event.type === 'october_surprise') {
          if (event.remaining === 5) {
            this.news.unshift({ day: this.day, headline: 'Breaking story dominates all coverage' });
            this.player.resources.momentum -= 5;
            this.stateSupportEngine.updateAllStates();
          }
          if (event.remaining === 3) {
            this.news.unshift({ day: this.day, headline: 'Late-campaign story continues to overshadow race' });
            this.player.resources.momentum -= 3;
          }
          if (event.remaining === 1) {
            this.news.unshift({ day: this.day, headline: 'Campaign scrambles to contain damage' });
            this.player.resources.momentum -= 2;
          }
          if (event.remaining <= 0) {
            event.resolved = true;
            this.news.unshift({ day: this.day, headline: 'October surprise fades — campaign regroups' });
            this.player.resources.momentum += 3;
          }
        }

        if (event.type === 'investigation') {
          if (!event.suppressed) {
            event.damage = (event.damage || 0) + 2;
          }
          event.suppressed = false;
          if (event.remaining === 2 && event.damage > 4) {
            this.news.unshift({ day: this.day, headline: 'Sources say investigative story nears publication' });
          }
          if (event.remaining <= 0) {
            event.resolved = true;
            const dmg = event.damage || 0;
            if (dmg <= 2) {
              this.news.unshift({ day: this.day, headline: `Investigative report on ${this.player.name} finds little of substance` });
            } else if (dmg <= 6) {
              this.player.resources.momentum -= dmg;
              this.news.unshift({ day: this.day, headline: `Investigative report damages ${this.player.name} campaign` });
            } else {
              this.player.resources.momentum -= dmg;
              this.getCoalition('independent')?.adjustSupport(-2);
              this.news.unshift({ day: this.day, headline: `Bombshell investigation rocks ${this.player.name} campaign` });
            }
          }
        }

        if (event.type === 'opponent_scandal') {
          const opp = this.opponents?.[0];
          if (event.remaining === 2 && !event.amplified) {
            // Show amplify/ignore choice if not already decided
            E.ChoiceModal.show({
              tag:      '📰 OPPONENT VULNERABILITY',
              title:    `${event.oppName || 'Opponent'} scandal still in news cycle`,
              subtitle: 'You have a 24-hour window to amplify or let it fade.',
              choices: [
                { label: 'Amplify',  desc: 'Spend capital to keep the story alive and push it further. High risk/reward.',      tag: '20⚡ · opponent -10 momentum · you +3 momentum' },
                { label: 'Ignore',   desc: 'Let it run its course. Safer — no capital cost, modest passive damage to opponent.', tag: 'free · opponent -3 momentum' }
              ],
              onChoice: (i) => {
                event.amplified = true;
                if (i === 0) {
                  const r = this.player?.resources;
                  if (r && (r.politicalCapital || 0) >= 20) {
                    r.politicalCapital -= 20;
                    r.momentum = Math.min(100, (r.momentum || 50) + 3);
                    if (opp) opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 10);
                    this.news.unshift({ day: this.day, headline: `${this.player.name} campaign amplifies opponent controversy` });
                  }
                } else {
                  if (opp) opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 3);
                }
              }
            });
          }
          if (event.remaining <= 0) event.resolved = true;
        }
      }
      this.activeEvents = this.activeEvents.filter(e => !e.resolved);
    }

    // ============================
    // ELECTION NIGHT
    // ============================

    startElectionNight() {
      const en       = this.electionNight;
      en.active      = true;
      en.tick        = 0;
      en.demEV       = 0;
      en.repEV       = 0;
      en.updates     = [];

      const isDemPlayer = this.player.party === 'Democrat';

      en.stateData = this.states.map(state => {
        const noise      = this.rng.range(-2.5, 2.5);
        // GOTV turnout boost nudges final vote share
        const turnoutAdj = Math.min(4, (state.turnoutBoost || 0) * 0.4);
        const playerPct  = Math.max(25, Math.min(75, state.playerSupport + noise + turnoutAdj));
        const oppPct     = 100 - playerPct;

        const demPct  = isDemPlayer ? playerPct : oppPct;
        const repPct  = isDemPlayer ? oppPct    : playerPct;
        const margin  = Math.abs(demPct - repPct);

        const baseDelay    = Math.max(0, Math.round((28 - margin) * 0.65));
        const staggerDelay = baseDelay + Math.round(this.rng.range(0, 7));
        const reportSpeed  = 2 + (margin / 50) * 12 + this.rng.range(-1, 2);

        return {
          state,
          demPct,
          repPct,
          reportingPct:  0,
          status:        'not_started',
          staggerDelay,
          reportSpeed:   Math.max(1.5, reportSpeed),
          lastMilestone:   -1,
          apparentDemPct:  50    // tracks running apparent count for UI display
        };
      });

      this.news.unshift({ day: this.day, headline: 'Polls close — election night coverage begins' });
      document.dispatchEvent(new CustomEvent('electionNightStart'));
    }

    tickElectionNight() {
      if (!this.electionNight.active) return;

      const en   = this.electionNight;
      en.tick++;
      const tick = en.tick;

      const isDemPlayer = this.player.party === 'Democrat';
      const demName     = isDemPlayer ? this.player.name       : (this.opponents[0]?.name || 'Democrat');
      const repName     = isDemPlayer ? (this.opponents[0]?.name || 'Republican') : this.player.name;

      const newUpdates = [];

      for (const ed of en.stateData) {
        const { state } = ed;

        if (ed.status === 'dem_wins' || ed.status === 'rep_wins') continue;
        if (tick < ed.staggerDelay) { ed.status = 'not_started'; continue; }

        const jitter = this.rng.range(-1.5, 2.5);
        ed.reportingPct = Math.min(100, ed.reportingPct + ed.reportSpeed + jitter);

        const margin     = Math.abs(ed.demPct - ed.repPct);
        const demLeading = ed.demPct > ed.repPct;

        // Red mirage: in true swing states, early in-person votes (counted first)
        // lean Republican. Mail-in ballots correct this around 70–75% reporting.
        const absLean    = Math.abs(state.partisanLean || 0);
        const mirageMax  = absLean < 0.30 ? 4 * (1 - absLean / 0.30) : 0;
        const mirageFade = Math.max(0, 1 - ed.reportingPct / 72);
        const mirageBias = -mirageMax * mirageFade; // always hurts Dem early

        const noiseFactor = Math.max(0, 1 - ed.reportingPct / 100) * 2.5;
        const noise       = this.rng.range(-noiseFactor, noiseFactor);
        const appDemPct   = Math.max(30, Math.min(70, ed.demPct + noise + mirageBias));
        const appRepPct   = 100 - appDemPct;

        // Store for UI — ElectionNight reads this each tick
        ed.apparentDemPct = appDemPct;

        const appLeaderName  = appDemPct >= appRepPct ? demName : repName;
        const appTrailerName = appDemPct >= appRepPct ? repName : demName;
        const appLeaderPct   = Math.max(appDemPct, appRepPct).toFixed(1);
        const appTrailerPct  = Math.min(appDemPct, appRepPct).toFixed(1);

        const pct        = Math.round(ed.reportingPct);
        const prevStatus = ed.status;
        const callThreshold = Math.min(92, Math.max(10, 150 / (margin + 0.1)));

        if (ed.reportingPct < 6) {
          ed.status = 'too_early';

        } else if (ed.reportingPct >= callThreshold) {
          ed.status = demLeading ? 'dem_wins' : 'rep_wins';
          if (ed.status === 'dem_wins') en.demEV += state.electoralVotes;
          else                          en.repEV += state.electoralVotes;

          const winner = demLeading ? demName : repName;
          const party  = demLeading ? 'Democrat' : 'Republican';

          newUpdates.push({
            tick,
            type: demLeading ? 'call-dem' : 'call-rep',
            text: `${party.toUpperCase()} CALL: ${winner} projected to win ${state.name} (${state.electoralVotes} EV)`
          });

          if (!en.projectionCalled) {
            if (en.demEV >= 270) {
              en.projectionCalled = true;
              newUpdates.push({ tick, type: 'projection', text: `${demName.toUpperCase()} PROJECTED TO WIN THE PRESIDENCY` });
            } else if (en.repEV >= 270) {
              en.projectionCalled = true;
              newUpdates.push({ tick, type: 'projection', text: `${repName.toUpperCase()} PROJECTED TO WIN THE PRESIDENCY` });
            }
          }

        } else if (margin < 4) {
          if (prevStatus === 'too_early' || prevStatus === 'not_started') {
            ed.status = 'too_close';
            newUpdates.push({ tick, type: 'too-close', text: `${state.name} — TOO CLOSE TO CALL with ${pct}% of precincts reporting` });
          } else {
            ed.status = 'too_close';
          }

          const bucket = Math.floor(ed.reportingPct / 25);
          if (bucket > ed.lastMilestone && ed.reportingPct >= 20) {
            ed.lastMilestone = bucket;
            newUpdates.push({ tick, type: 'update', text: `${state.name}: ${appLeaderName} leads ${appTrailerName} ${appLeaderPct}%–${appTrailerPct}% with ${pct}% of precincts reporting` });
          }

        } else {
          ed.status = 'too_early';
          const bucket = Math.floor(ed.reportingPct / 33);
          if (bucket > ed.lastMilestone && ed.reportingPct >= 30) {
            ed.lastMilestone = bucket;
            newUpdates.push({ tick, type: 'update', text: `${state.name}: ${appLeaderName} leads ${appTrailerName} ${appLeaderPct}%–${appTrailerPct}% with ${pct}% of precincts reporting` });
          }
        }
      }

      en.updates = [...newUpdates, ...en.updates].slice(0, 120);

      const allDone = en.stateData.every(ed => ed.status === 'dem_wins' || ed.status === 'rep_wins');
      if (allDone || tick > 250) this.finalizeElection();
    }

    calculateEV() {
      const { demEV, repEV } = this.electionNight;
      return {
        playerEV:   this.player.party === 'Democrat' ? demEV : repEV,
        opponentEV: this.player.party === 'Democrat' ? repEV : demEV,
        demEV,
        repEV
      };
    }

    finalizeElection() {
      const { demEV, repEV } = this.electionNight;
      const winner = demEV >= 270 ? 'Democrat' : repEV >= 270 ? 'Republican' : 'tie';
      this.news.unshift({ day: this.day, headline: `Election Result: ${winner.toUpperCase()} wins` });
      this.electionNight.active = false;
      document.dispatchEvent(new CustomEvent('electionNightEnd', { detail: { winner, demEV, repEV } }));
    }

    getSeedString() {
      const cfg = this.gameConfig;
      if (!cfg) return '';
      try {
        const obj = {
          s: this.seed,
          p: cfg.party === 'Democrat' ? 0 : 1,
          a: cfg.archetypeId,
          d: cfg.difficulty,
          i: cfg.issuePositions
        };
        return '180DTW:' + btoa(JSON.stringify(obj));
      } catch { return ''; }
    }

    static parseSeedString(str) {
      if (!str || !str.startsWith('180DTW:')) return null;
      try { return JSON.parse(atob(str.slice(7))); } catch { return null; }
    }
  }

  E.GameState = GameState;
})();
