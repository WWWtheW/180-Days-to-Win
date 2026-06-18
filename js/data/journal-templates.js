// js/data/journal-templates.js
// All prose templates for the Campaign Journal, extracted for easy editing and expansion.
// Functions receive a `d` (week data) object — see CampaignJournal._weekData() for shape.

window.ElectionSim = window.ElectionSim || {};
window.ElectionSim.data = window.ElectionSim.data || {};

window.ElectionSim.data.JOURNAL_TEMPLATES = {

  // ── OPENERS ───────────────────────────────────────────────────────────────
  // One per entry, chosen fresh each week (anti-repetition via usedSet).

  OPENERS: [
    (d) => `Week ${d.week} opened with the campaign ${d.trailing ? 'fighting to close a gap' : 'pressing a hard-won lead'} in the polls.`,
    (d) => `Entering week ${d.week}, ${d.name}'s operation ${d.trailing ? 'faced mounting pressure' : 'moved with growing confidence'}.`,
    (d) => `The ${d.week === 1 ? 'first' : d.week === 2 ? 'second' : `${d.week}th`} week of the general found ${d.name} ${d.trailing ? 'in a tighter position than hoped' : 'consolidating momentum'}.`,
    (d) => `Day ${d.startDay} kicked off with ${d.name}'s campaign ${d.momentum > 60 ? 'riding high' : d.momentum < 40 ? 'under pressure' : 'in a holding pattern'} on momentum.`,
    (d) => `Week ${d.week}: ${d.name}'s team ${d.slotsUsed > 8 ? 'drove a punishing schedule' : 'worked methodically'} across the battleground map.`,
    (d) => `${d.name} began the week with ${d.momentum > 65 ? 'a full head of steam' : d.momentum < 35 ? 'damage to contain' : 'work to do'} across the key states.`,
    (d) => `The trail turned to week ${d.week} with ${d.name}'s campaign ${d.trailing ? 'scrambling to find a path forward' : 'looking to press its advantage'}.`,
    (d) => `${d.slotsUsed === 0 ? `A quiet week ${d.week} for ${d.name}'s campaign — a deliberate pause, or lost time?` : `${d.name} kept up the pace through week ${d.week}, logging ${d.slotsUsed} campaign actions.`}`,
    (d) => `As week ${d.week} began, the national mood ${d.trailing ? 'still favoured the opposition' : 'leaned toward' + ' ' + d.name}.`,
    (d) => `Week ${d.week} arrived with ${180 - d.startDay} days remaining — ${d.trailing ? 'not enough time to waste' : 'enough runway to extend the lead'}.`,
  ],

  // ── STATE SENTENCES ───────────────────────────────────────────────────────

  STATE_SENTENCES: [
    (d) => d.topState ? `The bulk of campaign activity centred on ${d.topState}, where the team invested heavily.` : null,
    (d) => d.topState ? `${d.topState} drew the most attention this week — a reflection of its place in the path to 270.` : null,
    (d) => d.topState ? `Field operations in ${d.topState} consumed the most resources, with the campaign tracking closely there.` : null,
    (d) => d.topState && d.topState2 ? `${d.topState} and ${d.topState2} both saw sustained activity as the campaign worked its battleground map.` : null,
    (d) => d.topState ? `The campaign planted its flag firmly in ${d.topState} this week, betting on returns there.` : null,
    (d) => d.topState ? `${d.topState} became the defining focus of the week — a key piece of the electoral puzzle.` : null,
    (d) => d.topState && d.topState2 ? `Resources split between ${d.topState} and ${d.topState2}, reflecting a two-front strategy.` : null,
    (d) => d.topState ? `Organisers pushed hard in ${d.topState}, sensing an opening in the latest data.` : null,
  ],

  // ── COALITION SENTENCES ───────────────────────────────────────────────────

  COALITION_SENTENCES: [
    (d) => d.topCoalition ? `Outreach to ${d.topCoalition.replace(/_/g,' ')} voters remained a central focus throughout the week.` : null,
    (d) => d.topCoalition ? `The campaign's messaging leaned into ${d.topCoalition.replace(/_/g,' ')} concerns, hoping to consolidate that bloc.` : null,
    (d) => d.topCoalition ? `Mobilising ${d.topCoalition.replace(/_/g,' ')} voters was the strategic thread running through the week's events.` : null,
    (d) => d.topCoalition ? `The week's actions reflected a clear bet on turning out ${d.topCoalition.replace(/_/g,' ')} support.` : null,
    (d) => null,
  ],

  // ── EVENT SENTENCES ───────────────────────────────────────────────────────
  // Keyed by journalEvent.type. Receive the event object as `d`.

  EVENT_SENTENCES: {
    endorsement:          (d) => `A highlight was an endorsement from ${d.who || 'a major outside group'}, which added credibility with ${(d.coalition || '').replace(/_/g,' ')} voters.`,
    viral_positive:       () => `A moment from the trail went viral online, generating an unexpected surge in enthusiasm and volunteer sign-ups.`,
    viral_negative:       () => `A clip circulated online drew ridicule — a reminder of how quickly the news cycle can turn.`,
    state_event:          (d) => `Events in ${d.state || 'a key state'} reshaped local priorities, adding urgency to the campaign's ground presence there.`,
    vp_pick:              (d) => `The selection of ${d.name || 'the running mate'} defined the week, energising the base and drawing heavy media coverage.`,
    october_surprise:     (d) => `A late-breaking story — ${d.label || 'major news event'} — dominated the final days of the week and forced the campaign onto defence.`,
    debate_win:           (d) => `A strong debate performance shifted the narrative, with analysts crediting ${d.name || 'the candidate'} across key exchanges.`,
    debate_loss:          () => `The debate did not go as planned — a difficult night that the campaign will need to put behind it quickly.`,
    debate_draw:          () => `Both candidates held their ground in the debate — no decisive winner, though momentum remained stable.`,
    opponent_endorsement: (d) => `A blow this week: ${d.who || 'a key outside group'} endorsed the opposition instead, pulling ${(d.coalition || '').replace(/_/g,' ')} voters away from the campaign's coalition.`,
    press_conference:     (d) => `${d.name || 'The campaign'} held a press conference on ${d.topic || 'a key issue'}, controlling the narrative and keeping the week's message on track.`,
  },

  // ── OPPONENT SENTENCES ────────────────────────────────────────────────────
  // Every other week only.

  OPPONENT_SENTENCES: [
    (d) => d.oppName ? `${d.oppName} spent the week ${d.oppLeading ? 'defending a lead' : 'pressing hard in battlegrounds'} of their own.` : null,
    (d) => d.oppName ? `On the other side of the race, ${d.oppName}'s campaign ${d.oppMomentum > 55 ? 'appeared energised' : 'showed signs of strain'}.` : null,
    (d) => d.oppName ? `${d.oppName} kept up the pressure, refusing to cede any ground in the key states.` : null,
    (d) => d.oppName ? `Across the aisle, ${d.oppName}'s operation ${d.oppMomentum > 60 ? 'looked formidable' : 'seemed to be running on fumes'}.` : null,
    (d) => d.oppName && !d.oppLeading ? `${d.oppName} showed no sign of backing down, intensifying efforts in states the campaign hoped to put away.` : null,
    (d) => null,
  ],

  // ── CLOSERS ───────────────────────────────────────────────────────────────

  CLOSERS: [
    (d) => `The campaign moves into week ${d.week + 1} with ${180 - d.endDay} days remaining.`,
    (d) => `With ${180 - d.endDay} days to election day, every decision carries more weight than the last.`,
    (d) => `${d.trailing ? 'The math remains daunting, but' : 'Momentum intact,'} the road ahead demands total focus.`,
    (d) => d.endDay > 160 ? 'The final sprint begins.' : `The clock is ticking — ${180 - d.endDay} days left.`,
    (d) => `${180 - d.endDay <= 14 ? 'The finish line is in sight.' : `Week ${d.week + 1} will demand everything the campaign has left.`}`,
    (d) => `${d.trailing ? `Time is running short. The gap must close.` : `The lead is real — now it must be protected.`}`,
    (d) => d.endDay >= 170 ? `The final stretch. Everything the campaign built over 180 days comes down to this.` : `Another week survived. Another week closer to the vote.`,
  ],

  // ── ELECTION NIGHT ENTRIES ────────────────────────────────────────────────
  // Functions receive { p, opp, playerEV, oppEV, oppName }.

  ELECTION_WIN: [
    ({ p, playerEV, oppEV }) => `After 180 days on the trail, ${p.name} won the presidency — ${playerEV} to ${oppEV} in electoral votes. A hard-fought campaign ends in victory.`,
    ({ p, playerEV }) => `Election Night delivered what the campaign had worked toward: ${p.name} elected the next President of the United States with ${playerEV} electoral votes.`,
    ({ p, playerEV, oppEV }) => `The map turned in ${p.name}'s favour as the night wore on. ${playerEV} to ${oppEV} — a result that reflects 180 days of strategy, sacrifice, and relentless campaigning.`,
    ({ p, playerEV, oppEV }) => `${playerEV} electoral votes. That's the number that made ${p.name} the next president. A campaign that began 180 days ago ends here, in triumph.`,
    ({ p, oppEV, playerEV }) => `When the last state was called, ${p.name} stood at ${playerEV} electoral votes — enough. The opponent fell short at ${oppEV}. A long campaign is over.`,
  ],

  ELECTION_LOSS: [
    ({ p, playerEV, oppName, oppEV }) => `The campaign ended on a painful note. ${p.name} fell short with ${playerEV} electoral votes — ${oppName} carried the night with ${oppEV}.`,
    ({ oppName, oppEV }) => `After 180 days, the final map did not hold. ${oppName} won the presidency with ${oppEV} electoral votes. There will be time for reflection, but not tonight.`,
    ({ oppName, oppEV, playerEV, p }) => `${oppName} claimed the presidency ${oppEV} to ${playerEV}. Despite everything this campaign built, Election Night delivered a loss that stings deeply.`,
    ({ p, playerEV }) => `The numbers came in slowly, then all at once. ${p.name} ends the night at ${playerEV} electoral votes — not enough. A campaign that gave everything still came up short.`,
    ({ oppName }) => `${oppName} will be the next president. The campaign is over. The work of the last 180 days did not deliver the outcome the team fought for.`,
  ],

  ELECTION_TIE: [
    () => `No candidate reached 270 electoral votes. A contingent election now goes to the House — a genuinely historic and uncertain moment.`,
    ({ playerEV, oppEV }) => `The electoral map deadlocked — ${playerEV} to ${oppEV}. An unprecedented outcome that history will remember.`,
    () => `Neither side crossed 270. The presidency will be decided in the halls of Congress, not at the ballot box. An extraordinary end to an extraordinary campaign.`,
  ],

};
