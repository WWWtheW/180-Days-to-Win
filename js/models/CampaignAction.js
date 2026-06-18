(function () {
  const E = window.ElectionSim;

  class CampaignAction {
    constructor(config) {
      this.name        = config.name;
      this.type        = config.type       || 'develop';
      this.targeting   = config.targeting  || 'national';
      this.minDay      = config.minDay     || 0;
      this.requiredArchetype = config.requiredArchetype || null;

      this.cost = {
        money:            config.cost?.money            || 0,
        volunteers:       config.cost?.volunteers       || 0,
        politicalCapital: config.cost?.politicalCapital || 0
      };

      this.momentumEffect       = config.momentumEffect       || 0;
      this.effects              = config.effects              || {};
      this.statKeys             = config.statKeys             || [];
      this.stateBoostBase       = config.stateBoostBase       || 0;
      this.volunteerEffect      = config.volunteerEffect      || 0;
      this.turnoutEffect        = config.turnoutEffect        || 0;
      this.debatePrepEffect     = config.debatePrepEffect     || 0;

      // ── Opponent-targeted effects (new for Task #9) ────────────
      this.opponentMomentumEffect = config.opponentMomentumEffect || 0;
      this.triggerOpponentEvent   = config.triggerOpponentEvent   || false;
    }

    apply(gameState, targetState, saturation) {
      const player = gameState.player;
      if (!player) return false;

      const r = player.resources;
      if (r.money              < this.cost.money)            return false;
      if ((r.volunteers  || 0) < this.cost.volunteers)       return false;
      if ((r.politicalCapital || 0) < this.cost.politicalCapital) return false;

      r.money              -= this.cost.money;
      r.volunteers          = Math.max(0, (r.volunteers || 0)       - this.cost.volunteers);
      r.politicalCapital    = Math.max(0, (r.politicalCapital || 0) - this.cost.politicalCapital);

      const satMult  = 1 - ((saturation || 0) / 100) * 0.65;
      const statMult = this._statMult(player);
      const eff      = satMult * statMult;

      r.momentum = Math.max(0, Math.min(100, (r.momentum || 50) + this.momentumEffect * eff));

      for (const [name, delta] of Object.entries(this.effects)) {
        const c = gameState.getCoalition(name);
        if (c) c.adjustSupport(delta * eff);
      }

      if (targetState && this.stateBoostBase > 0) {
        targetState.playerCampaignBoost =
          (targetState.playerCampaignBoost || 0) + this.stateBoostBase * eff;
        targetState.attentionDays = (targetState.attentionDays || 0) + 1;
      }

      if (this.volunteerEffect) {
        r.volunteers = Math.min(
          20000, (r.volunteers || 0) + Math.round(this.volunteerEffect * eff)
        );
      }

      if (targetState && this.turnoutEffect) {
        targetState.turnoutBoost =
          (targetState.turnoutBoost || 0) + this.turnoutEffect * eff;
      }

      if (this.debatePrepEffect) {
        gameState.debatePreparation =
          (gameState.debatePreparation || 0) + this.debatePrepEffect * eff;
      }

      this._applyOpponentEffects(gameState, eff);
      gameState.log.push(
        `Action: ${this.name}${targetState ? ' → ' + targetState.name : ''} (eff ${Math.round(eff * 100)}%)`
      );
      return true;
    }

    _applyOpponentEffects(gameState, eff) {
      const opp = gameState.opponents?.[0];
      if (!opp) return;
      if (this.opponentMomentumEffect) {
        opp.resources.momentum = Math.max(
          0, Math.min(100, (opp.resources.momentum || 50) + this.opponentMomentumEffect * eff)
        );
      }
      if (this.triggerOpponentEvent) {
        opp.resources.momentum = Math.max(0, (opp.resources.momentum || 50) - 5 * eff);
        gameState.news.unshift({
          day:      gameState.day,
          headline: `${opp.name}'s campaign hit by opposition research leak`
        });
      }
    }

    _statMult(player) {
      if (!this.statKeys.length) return 1;
      const avg = this.statKeys.reduce(
        (sum, k) => sum + (player.stats[k] || 50), 0
      ) / this.statKeys.length;
      return Math.max(0.4, Math.min(1.6, avg / 62.5));
    }

  }

  E.models = E.models || {};
  E.models.CampaignAction = CampaignAction;
})();
