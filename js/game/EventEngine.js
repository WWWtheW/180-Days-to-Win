(function () {
  'use strict';
  const E = window.ElectionSim;

  const ENDORSERS = [
    { name: 'National Education Assoc.', type: 'union', coalition: 'college',        boost: 4, state: null, policies: ['education', 'healthcare'] },
    { name: 'United Auto Workers',       type: 'union', coalition: 'working_class',   boost: 5, state: 'MI', policies: ['jobs', 'healthcare'] },
    { name: 'AARP',                      type: 'org',   coalition: 'seniors',          boost: 5, state: null, policies: ['healthcare', 'social_issues'] },
    { name: 'NAACP',                     type: 'org',   coalition: 'minority',         boost: 5, state: null, policies: ['immigration', 'crime'] },
    { name: 'AFL-CIO',                   type: 'union', coalition: 'working_class',   boost: 4, state: null, policies: ['jobs', 'economy'] },
    { name: 'SEIU',                      type: 'union', coalition: 'working_class',   boost: 4, state: null, policies: ['jobs', 'healthcare'] },
    { name: 'Sierra Club',               type: 'org',   coalition: 'young',            boost: 3, state: null, policies: ['climate', 'energy'] },
    { name: 'League of Conservation Voters', type: 'org', coalition: 'young',         boost: 3, state: null, policies: ['climate', 'energy'] },
    { name: 'American Farm Bureau',      type: 'org',   coalition: 'rural',            boost: 4, state: null, policies: ['taxes', 'energy'] },
    { name: 'National Farmers Union',    type: 'org',   coalition: 'rural',            boost: 3, state: null, policies: ['jobs', 'taxes'] },
    { name: 'US Conference of Mayors',   type: 'org',   coalition: 'urban',            boost: 4, state: null, policies: ['climate', 'education'] },
    { name: 'Philadelphia Inquirer',     type: 'paper', coalition: 'suburban',         boost: 3, state: 'PA', policies: [] },
    { name: 'Arizona Republic',          type: 'paper', coalition: 'suburban',         boost: 3, state: 'AZ', policies: [] },
    { name: 'Detroit Free Press',        type: 'paper', coalition: 'urban',            boost: 2, state: 'MI', policies: [] },
    { name: 'Des Moines Register',       type: 'paper', coalition: 'rural',            boost: 2, state: 'IA', policies: [] },
  ];

  // Pool of state-level event definitions
  const STATE_EVENTS = [
    {
      id: 'factory_closure',
      statePool: ['MI','OH','PA','IN','WI','MO'],
      headline: (s) => `Plant closure in ${s.name} puts thousands out of work`,
      issueBoost: 'jobs',
      coalitionEffects: { working_class: 3, young: 1 },
      newsType: 'event',
      note: 'jobs and economy dominate in {{state}}'
    },
    {
      id: 'natural_disaster',
      statePool: ['FL','LA','NC','TX','GA','SC'],
      headline: (s) => `Disaster declaration in ${s.name} — both campaigns respond`,
      issueBoost: 'climate',
      coalitionEffects: { seniors: 2, suburban: 1 },
      newsType: 'event',
      note: 'climate and emergency response surge in {{state}}'
    },
    {
      id: 'border_incident',
      statePool: ['TX','AZ','NM','CA'],
      headline: (s) => `Border tensions spike in ${s.name} — immigration takes centre stage`,
      issueBoost: 'immigration',
      coalitionEffects: { working_class: 1, minority: -2, rural: 2 },
      newsType: 'event',
      note: 'immigration debate intensifies in {{state}}'
    },
    {
      id: 'healthcare_crisis',
      statePool: null, // any state
      headline: (s) => `Hospital closures in ${s.name} spark healthcare debate`,
      issueBoost: 'healthcare',
      coalitionEffects: { seniors: 3, working_class: 2 },
      newsType: 'event',
      note: 'healthcare becomes top concern in {{state}}'
    },
    {
      id: 'farm_crisis',
      statePool: ['IA','NE','KS','ND','SD','MN','WI'],
      headline: (s) => `Crop failures hit ${s.name} — farm communities demand answers`,
      issueBoost: 'energy',
      coalitionEffects: { rural: 4, working_class: 2, urban: -1 },
      newsType: 'event',
      note: 'rural and energy concerns dominate in {{state}}'
    },
    {
      id: 'tech_layoffs',
      statePool: ['CA','WA','TX','NY','MA'],
      headline: (s) => `Major tech layoffs in ${s.name} rattle economy voters`,
      issueBoost: 'economy',
      coalitionEffects: { college: 2, young: 2, working_class: 1 },
      newsType: 'event',
      note: 'economy and jobs anxiety rises in {{state}}'
    },
    {
      id: 'school_shooting',
      statePool: null,
      headline: (s) => `Tragedy in ${s.name} puts crime and social issues front and centre`,
      issueBoost: 'crime',
      coalitionEffects: { young: 3, suburban: 2, seniors: 1 },
      newsType: 'event',
      note: 'crime and safety dominate in {{state}}'
    },
    {
      id: 'opioid_report',
      statePool: ['WV','OH','KY','PA','NH','ME'],
      headline: (s) => `New opioid report puts healthcare crisis in ${s.name} under spotlight`,
      issueBoost: 'healthcare',
      coalitionEffects: { rural: 2, working_class: 2 },
      newsType: 'event',
      note: 'healthcare crisis deepens in {{state}}'
    }
  ];

  class EventEngine {
    constructor(gameState) {
      this.game = gameState;
    }

    // ── Context ──────────────────────────────────────────────────

    _ctx() {
      const g   = this.game;
      const p   = g.player;
      const opp = g.opponents?.[0];
      const lastEntry = [...g.actionHistory].reverse().find(h => h.state);
      const lastStateName = lastEntry
        ? g.getStateByAbbr(lastEntry.state)?.name ?? 'the trail' : 'the trail';

      // Derive policy context from current issue positions (replaces old policy-log lookup)
      const issueLabelMap = {
        economy: 'economic policy', healthcare: 'healthcare', immigration: 'immigration policy',
        climate: 'climate action', taxes: 'tax policy', crime: 'crime and justice',
        education: 'education', foreign_policy: 'foreign policy', energy: 'energy policy',
        social_issues: 'social issues', jobs: 'jobs and workers'
      };
      const positions = g.issuePositions || {};
      const topIssue  = Object.keys(positions).find(k => positions[k] !== 'centrist');
      const lastPolicy = topIssue ? (issueLabelMap[topIssue] ?? 'policy') : 'fiscal policy';

      return { name: p.name, opp: opp?.name ?? 'the opposition', party: p.party, state: lastStateName, policy: lastPolicy };
    }

    _pick(arr)      { return arr[Math.floor(this.game.rng.next() * arr.length)]; }
    _fill(tpl, ctx) { return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? ''); }

    _availableEndorsers() {
      const earned = this.game.endorsements || [];
      return ENDORSERS.filter(e => !earned.find(x => x.name === e.name));
    }

    // ── Scheduling ───────────────────────────────────────────────

    maybeTriggerEvent() {
      if (this.game.rng.next() > 0.18) return;
      this.pickEvent(this.evaluateContext())();
    }

    evaluateContext() {
      return {
        momentum:             this.game.player?.resources?.momentum ?? 50,
        daysLeft:             180 - this.game.day,
        battlegroundPressure: this.game.polling.getBattlegroundStates().length
      };
    }

    pickEvent(ctx) {
      const weights = [
        { fn: this.scandal.bind(this),                weight: ctx.momentum > 70 ? 4 : 1 },
        { fn: this.endorsement.bind(this),             weight: ctx.momentum > 60 ? 3 : 1 },
        { fn: this.gaffe.bind(this),                   weight: ctx.momentum < 40 ? 3 : 1 },
        { fn: this.jobsReport.bind(this),              weight: 2 },
        { fn: this.stateLevelEvent.bind(this),         weight: 2 },
        { fn: this.viralMoment.bind(this),             weight: 1.5 },
        { fn: this.opponentScandal.bind(this),         weight: 1.5 },
        { fn: this.investigativeJournalism.bind(this), weight: ctx.daysLeft > 40 ? 1.5 : 0 },
      ];
      if (ctx.daysLeft < 30) weights.push({ fn: this.octoberSurprise.bind(this), weight: 6 });
      return this.weightedPick(weights);
    }

    weightedPick(list) {
      const total = list.reduce((s, i) => s + i.weight, 0);
      let roll = this.game.rng.next() * total;
      for (const item of list) {
        if (roll < item.weight) return item.fn;
        roll -= item.weight;
      }
      return list[list.length - 1].fn;
    }

    // ── STATE-LEVEL EVENT ────────────────────────────────────────

    stateLevelEvent() {
      const g      = this.game;
      const def    = this._pick(STATE_EVENTS);

      // Pick a state from the pool (or any state if pool is null)
      let candidates;
      if (def.statePool) {
        candidates = g.states.filter(s => def.statePool.includes(s.abbr));
      } else {
        // Pick any state that has reasonable weight for the issue
        candidates = g.states.filter(s => (s.issueWeights?.[def.issueBoost] || 0) > 0.55);
      }
      if (!candidates.length) candidates = g.states;
      const state = this._pick(candidates);

      // Boost the issue weight in that state
      if (state.issueWeights) {
        state.issueWeights[def.issueBoost] = Math.min(1.0,
          (state.issueWeights[def.issueBoost] || 0.5) + 0.12
        );
      }

      // Apply coalition effects in that state (via stateNews so MapRenderer shows badge)
      for (const [col, delta] of Object.entries(def.coalitionEffects)) {
        g.getCoalition(col)?.adjustSupport(delta * 0.4); // partial global effect
      }

      // Tag state news
      g.stateNews = g.stateNews || {};
      g.stateNews[state.abbr] = { headline: def.note.replace('{{state}}', state.name), day: g.day, type: 'event' };

      g.stateSupportEngine?.updateAllStates();
      g.news.unshift({ day: g.day, headline: def.headline(state) });
      g.log.push(`State event: ${def.id} in ${state.abbr}`);

      // Journal hook — record what happened
      g.journalEvents = g.journalEvents || [];
      g.journalEvents.push({ day: g.day, type: 'state_event', state: state.name, id: def.id });
    }

    // ── VIRAL MOMENT ─────────────────────────────────────────────

    viralMoment() {
      const g        = this.game;
      const ctx      = this._ctx();
      const charisma = g.player?.stats?.charisma ?? 50;
      // Chance of positive outcome scales with charisma
      const isPositive = g.rng.next() < (charisma / 120);

      if (isPositive) {
        const headlines = [
          `{{name}}'s speech in {{state}} goes viral — campaign sees massive surge`,
          `Clip of {{name}} at town hall spreads across social media`,
          `{{name}}'s off-the-cuff moment resonates with millions online`,
          `Video of {{name}} addressing crowd in {{state}} breaks the internet`
        ];
        const boost = 6 + Math.round((charisma - 50) / 10);
        g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + boost);
        g.player.resources.volunteers = Math.min(20000, (g.player.resources.volunteers || 0) + 400);
        g.getCoalition('young')?.adjustSupport(3);
        g.getCoalition('independent')?.adjustSupport(1.5);
        g.news.unshift({ day: g.day, headline: this._fill(this._pick(headlines), ctx) });
        g.log.push('Viral moment — positive');
        g.journalEvents = g.journalEvents || [];
        g.journalEvents.push({ day: g.day, type: 'viral_positive' });
      } else {
        const headlines = [
          `{{name}}'s moment goes viral — for all the wrong reasons`,
          `Clip of {{name}} in {{state}} mocked across social media`,
          `{{name}} scrambles after video goes viral, drawing criticism`,
          `{{opp}} amplifies unflattering {{name}} clip circulating online`
        ];
        g.player.resources.momentum = Math.max(0, (g.player.resources.momentum || 50) - 5);
        g.getCoalition('independent')?.adjustSupport(-2);
        g.activeEvents.push({ type: 'scandal', remaining: 2 });
        g.news.unshift({ day: g.day, headline: this._fill(this._pick(headlines), ctx) });
        g.log.push('Viral moment — negative');
      }
    }

    // ── ENDORSEMENT ──────────────────────────────────────────────

    endorsement() {
      const ctx       = this._ctx();
      const available = this._availableEndorsers();
      if (!available.length) {
        this.game.player.resources.momentum += 3;
        this.game.news.unshift({ day: this.game.day, headline: `Community leaders rally behind ${ctx.name}` });
        return;
      }

      const endorser = this._pick(available);
      const roll     = this.game.rng.next();

      if (roll < 0.55) {
        // Player gets endorsed (majority case)
        this._applyEndorser(endorser, ctx);
      } else if (roll < 0.80) {
        // Opponent gets endorsed — player loses coalition support
        const g      = this.game;
        const opp    = g.opponents?.[0];
        const oppName = opp?.name ?? 'the opposition';
        const stateStr = endorser.state ? ` in ${g.getStateByAbbr(endorser.state)?.name ?? endorser.state}` : '';
        const headlines = {
          union: [`${endorser.name} breaks with ${ctx.name}, backs ${oppName}${stateStr}`],
          paper: [`${endorser.name} editorial board endorses ${oppName}${stateStr}`],
          org:   [`${endorser.name} endorses ${oppName} instead${stateStr}`]
        };
        g.news.unshift({ day: g.day, headline: this._pick(headlines[endorser.type] ?? headlines.org) });
        // Mark as used so it can't endorse player later
        g.endorsements = g.endorsements || [];
        g.endorsements.push({ ...endorser, opponent: true });
        // Penalty: coalition shifts against player
        g.getCoalition(endorser.coalition)?.adjustSupport(-(endorser.boost * 0.6));
        if (opp) opp.resources.momentum = Math.min(100, (opp.resources.momentum || 50) + 3);
        g.log.push(`Endorsement: ${endorser.name} → opponent`);
        g.journalEvents = g.journalEvents || [];
        g.journalEvents.push({ day: g.day, type: 'opponent_endorsement', who: endorser.name, coalition: endorser.coalition });
        g.stateSupportEngine?.updateAllStates();
      } else {
        // Refusal to endorse — neutral, minor goodwill loss
        const g = this.game;
        const headlines = [
          `${endorser.name} declines to endorse either presidential candidate`,
          `${endorser.name} sits out the presidential race — no endorsement issued`,
          `${endorser.name} refuses to back ${ctx.name} or ${g.opponents?.[0]?.name ?? 'the opponent'}`
        ];
        g.news.unshift({ day: g.day, headline: this._pick(headlines) });
        // Mark as used; no coalition effect
        g.endorsements = g.endorsements || [];
        g.endorsements.push({ ...endorser, declined: true });
        g.log.push(`Endorsement: ${endorser.name} → declined`);
      }
    }

    _applyEndorser(endorser, ctx) {
      const g = this.game;
      if (!g.endorsements) g.endorsements = [];
      g.endorsements.push(endorser);
      g.player.resources.momentum += 4;
      g.player.resources.politicalCapital = Math.min(100, (g.player.resources.politicalCapital || 0) + 10);
      g.getCoalition(endorser.coalition)?.adjustSupport(endorser.boost);
      if (endorser.state) {
        const st = g.getStateByAbbr(endorser.state);
        if (st) st.playerCampaignBoost = (st.playerCampaignBoost || 0) + endorser.boost;
      }
      const stateStr = endorser.state ? ` in ${g.getStateByAbbr(endorser.state)?.name ?? endorser.state}` : '';
      const headlines = {
        union: [`${endorser.name} endorses ${ctx.name}, boosting labour support`, `${endorser.name} throws weight behind ${ctx.name}${stateStr}`],
        paper: [`${endorser.name} editorial board endorses ${ctx.name}${stateStr}`],
        org:   [`${endorser.name} endorses ${ctx.name} following ${ctx.policy} stance`]
      };
      g.news.unshift({ day: g.day, headline: this._pick(headlines[endorser.type] ?? headlines.org) });
      g.log.push(`Endorsement: ${endorser.name}`);
      g.stateSupportEngine?.updateAllStates();
      g.journalEvents = g.journalEvents || [];
      g.journalEvents.push({ day: g.day, type: 'endorsement', who: endorser.name, coalition: endorser.coalition });
    }

    checkPolicyEndorsements(policyKey) {
      const available = this._availableEndorsers().filter(e => e.policies.includes(policyKey));
      for (const endorser of available) {
        if (this.game.rng.next() > 0.40) continue;
        this._applyEndorser(endorser, this._ctx());
      }
    }

    // ── GAFFE ────────────────────────────────────────────────────

    gaffe() {
      const ctx = this._ctx();
      const headline = this._fill(this._pick([
        '{{name}} stumbles on {{policy}} question at {{state}} town hall',
        '{{name}}\'s off-message remarks draw swift criticism',
        'Media cycle turns against {{name}} after comments on the trail',
        '{{opp}} camp seizes on {{name}}\'s latest misstep',
        '{{name}} forced to clarify position after remarks in {{state}}',
        'Hot-mic moment haunts {{name}} on the campaign trail',
        '{{name}}\'s answer on {{policy}} raises fresh questions',
        'Backlash builds over {{name}}\'s remarks at {{state}} fundraiser'
      ]), ctx);
      this.game.news.unshift({ day: this.game.day, headline });

      // Pick a random response pool so choices vary each time
      const pool = this._pick(window.ElectionSim.data.GAFFE_RESPONSES || []);
      if (!pool) return;

      E.ChoiceModal.show({
        tag: '⚠ CAMPAIGN GAFFE', title: headline,
        subtitle: 'How does your campaign respond?',
        choices: pool.choices,
        onChoice: (i) => {
          pool.apply(i, this.game, this.game.rng);
          this.game.player.resources.momentum = Math.max(0, Math.min(100, this.game.player.resources.momentum));
          this.game.log.push('Gaffe response chosen');
        }
      });
    }

    // ── SCANDAL ──────────────────────────────────────────────────

    scandal() {
      const ctx = this._ctx();
      const headline = this._fill(this._pick([
        'Report questions {{name}}\'s past record on {{policy}}',
        'Former staffer raises concerns about {{name}}\'s campaign',
        '{{opp}} allies circulate damaging story about {{name}}',
        'Controversy emerges over {{name}}\'s statement in {{state}}',
        'Media scrutiny intensifies around {{name}}\'s {{policy}} position',
        'Leaked emails reveal tension inside {{name}}\'s campaign',
        'Opposition research drops damaging dossier on {{name}}',
        'Anonymous sources allege misconduct inside {{name}}\'s operation',
        '{{name}}\'s past remarks on {{policy}} resurface at critical moment'
      ]), ctx);
      const lastEntry = [...this.game.actionHistory].reverse().find(h => h.state);
      if (lastEntry?.state) {
        this.game.stateNews = this.game.stateNews || {};
        this.game.stateNews[lastEntry.state] = { headline: 'Scandal', day: this.game.day, type: 'scandal' };
      }
      this.game.news.unshift({ day: this.game.day, headline });

      // Pick a random response pool so choices vary each time
      const pool = this._pick(window.ElectionSim.data.SCANDAL_RESPONSES || []);
      if (!pool) return;

      E.ChoiceModal.show({
        tag: '🔥 CAMPAIGN CONTROVERSY', title: headline,
        subtitle: 'Choose your response strategy',
        choices: pool.choices,
        onChoice: (i) => {
          pool.apply(i, this.game, this.game.rng);
          this.game.player.resources.momentum = Math.max(0, Math.min(100, this.game.player.resources.momentum));
          this.game.log.push('Scandal triggered — response chosen');
        }
      });
    }

    // ── OPPONENT SCANDAL ─────────────────────────────────────────

    opponentScandal() {
      const opp = this.game.opponents?.[0];
      if (!opp) return;
      const headlines = [
        `Investigation reveals questions about ${opp.name}'s past`,
        `Former ally raises concerns about ${opp.name}`,
        `${opp.name} campaign faces scrutiny over financial disclosures`,
        `Report surfaces damaging details about ${opp.name}'s record`,
        `${opp.name}'s past statements resurface — campaign scrambles`
      ];
      const headline = this._pick(headlines);
      this.game.news.unshift({ day: this.game.day, headline });
      this.game.activeEvents.push({
        type: 'opponent_scandal', remaining: 3, amplified: false, oppName: opp.name
      });
      this.game.log.push('Opponent scandal triggered');
    }

    // ── INVESTIGATIVE JOURNALISM ─────────────────────────────────

    investigativeJournalism() {
      const ctx = this._ctx();
      this.game.activeEvents.push({
        type: 'investigation', remaining: 5, damage: 0, suppressed: false, dayStarted: this.game.day
      });
      this.game.news.unshift({ day: this.game.day, headline: this._fill(this._pick([
        'Investigative journalist begins digging into {{name}}\'s record',
        'Reporter working on major story about {{name}}\'s campaign finances',
        '{{name}} campaign aware of imminent investigative report',
        'Sources say reporter filing exposé on {{name}}\'s past positions'
      ]), ctx) });
      this.game.log.push('Investigation event triggered');
    }

    // ── JOBS REPORT ──────────────────────────────────────────────

    jobsReport() {
      const g    = this.game;
      const good = g.rng.next() > 0.5;
      const ctx  = this._ctx();
      g.coalitions.forEach(c => c.adjustSupport(g.rng.range(-1, 1)));
      const pool = good
        ? ['Strong jobs report gives {{name}} economic tailwind', 'Unemployment falls — {{name}} claims credit on the stump', 'Positive economic data bolsters {{name}}\'s central argument']
        : ['Weak jobs numbers create headwinds for {{name}}\'s campaign', '{{opp}} hammers {{name}} over latest economic data', 'New economic report sparks debate on {{name}}\'s platform'];
      if (good) g.player.resources.momentum += 2; else g.player.resources.momentum -= 2;
      g.news.unshift({ day: g.day, headline: this._fill(this._pick(pool), ctx) });
      g.log.push('Economic report event');
    }

    // ── OCTOBER SURPRISE ─────────────────────────────────────────

    octoberSurprise() {
      const g   = this.game;
      const ctx = this._ctx();
      const opp = g.opponents?.[0];

      const pool = [
        // Hits the player
        {
          targetPlayer: true,
          headline: 'Breaking: damaging documents surface about {{name}}\'s record',
          effects() {
            g.player.resources.momentum -= 8;
            g.getCoalition('independent')?.adjustSupport(-3);
            g.getCoalition('college')?.adjustSupport(-2);
          },
          label: 'Document Leak', duration: 7
        },
        {
          targetPlayer: true,
          headline: '{{name}} camp hit by major campaign finance leak',
          effects() {
            g.player.resources.momentum -= 6;
            g.getCoalition('college')?.adjustSupport(-2);
            g.player.resources.politicalCapital = Math.max(0, (g.player.resources.politicalCapital || 0) - 20);
          },
          label: 'Finance Scandal', duration: 8
        },
        // Hits the opponent
        {
          targetPlayer: false,
          headline: opp ? `${opp.name} hit by bombshell late in the race` : 'Opponent hit by late scandal',
          effects() {
            if (opp) opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 14);
            g.player.resources.momentum = Math.min(100, (g.player.resources.momentum || 50) + 5);
          },
          label: 'Opponent Bombshell', duration: 7
        },
        {
          targetPlayer: false,
          headline: opp ? `${opp.name}'s running mate controversy dominates final weeks` : 'Running mate drama rocks the opposition',
          effects() {
            if (opp) opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 8);
            g.getCoalition('independent')?.adjustSupport(2);
          },
          label: 'VP Controversy', duration: 6
        },
        // Neutral / both affected
        {
          targetPlayer: null,
          headline: 'Economic shockwave hits days before election — markets in freefall',
          effects() {
            g.coalitions.forEach(c => c.adjustSupport(g.rng.range(-2, 2)));
            g.player.resources.momentum += g.rng.range(-5, 3);
            if (opp) opp.resources.momentum += g.rng.range(-5, 3);
          },
          label: 'Economic Crash', duration: 9
        },
        {
          targetPlayer: null,
          headline: 'Foreign policy crisis erupts — both campaigns forced to stake a position',
          effects() {
            g.player.resources.momentum -= 4;
            if (opp) opp.resources.momentum -= 3;
            g.states.forEach(s => {
              if ((s.issueWeights?.foreign_policy || 0) > 0.65) {
                s.playerCampaignBoost = (s.playerCampaignBoost || 0) - 1.5;
              }
            });
          },
          label: 'Foreign Crisis', duration: 10
        },
        {
          targetPlayer: null,
          headline: 'Whistleblower releases internal campaign documents — both sides scramble',
          effects() {
            // Suppresses momentum and increases volatility in close states
            g.player.resources.momentum  = Math.max(0, (g.player.resources.momentum  || 50) - 4);
            const opp = g.opponents?.[0];
            if (opp) opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 4);
            g.states.forEach(s => { s.volatility = Math.min(20, (s.volatility || 5) + 3); });
          },
          label: 'Whistleblower Story', duration: 7
        }
      ];

      const chosen = this._pick(pool);
      g.activeEvents.push({ type: 'october_surprise', label: chosen.label, remaining: chosen.duration });
      chosen.effects();
      g.player.resources.momentum = Math.max(0, Math.min(100, g.player.resources.momentum));
      g.news.unshift({ day: g.day, headline: this._fill(chosen.headline, ctx) });
      g.log.push(`October surprise: ${chosen.label} (targets: ${chosen.targetPlayer === true ? 'player' : chosen.targetPlayer === false ? 'opponent' : 'both'})`);
      g.journalEvents = g.journalEvents || [];
      g.journalEvents.push({ day: g.day, type: 'october_surprise', label: chosen.label });
    }
  }

  E.EventEngine = EventEngine;
})();