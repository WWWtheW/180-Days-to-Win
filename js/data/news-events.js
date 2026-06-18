// js/data/news-events.js
// Headline pools for every campaign action. GameState._generateActionNews picks
// a random entry, substituting {name} and {state} from context.
// Keys match action keys in GameState.initActions(); type-based fallbacks used when no key match.

window.ElectionSim = window.ElectionSim || {};
window.ElectionSim.data = window.ElectionSim.data || {};

window.ElectionSim.data.NEWS_EVENTS = {

  // ── GROUND — STATE ──────────────────────────────────────────────────────────

  rallyUrban: [
    '{name} draws thousands at {state} rally',
    '{name} energises city crowd in {state}',
    'Standing-room-only crowd greets {name} in {state}',
    '{name} fires up urban base at {state} event',
    '{name} makes direct pitch to {state} voters at packed rally',
    'Enthusiastic crowd turns out for {name} in {state}',
    '{name} holds blockbuster rally in {state}',
    'Overflow crowds line streets as {name} campaigns in {state}',
  ],

  ruralTour: [
    '{name} makes a direct pitch to rural {state} voters',
    '{name} hits the back roads of {state} on rural swing',
    '{name} stops at a diner in {state} to meet local voters',
    '{name} tours farm country in {state}',
    '{name} holds town meeting in rural {state}',
    '{name} woos small-town voters across {state}',
    '{name} visits county fair in {state}, talks agriculture',
    '{name} makes campaign stops through {state} heartland',
  ],

  townHall: [
    '{name} holds town hall in {state}, takes unscripted questions',
    '{name} faces voters directly in {state} town hall',
    '{name} answers tough questions at {state} community forum',
    'Voters grill {name} at open town hall in {state}',
    '{name} engages {state} residents in wide-ranging Q&A',
    '{name} holds listening session with {state} voters',
    'Standing-room crowd peppers {name} with questions in {state}',
    '{name}\'s {state} town hall draws strong local interest',
  ],

  grassroots: [
    '{name} campaign volunteers fan out across {state}',
    '{name} builds ground game with new volunteers in {state}',
    'Knock-and-drag operation expands in {state} for {name}',
    '{name} grassroots push targets persuadable {state} voters',
    'Door-to-door canvassers hit the streets for {name} in {state}',
    '{name} neighbourhood outreach efforts intensify in {state}',
    'Phone banking surge as {name} campaign targets {state}',
    '{name} expands local organising in {state}',
  ],

  gotvDrive: [
    '{name} launches get-out-the-vote push in {state}',
    '{name} campaign mobilises turnout operation in {state}',
    'Early vote push begins for {name} campaign in {state}',
    '{name} team floods {state} with GOTV volunteers',
    '{name} targets low-propensity voters in {state} final stretch',
    'Last-minute voter contact surge for {name} in {state}',
    '{name} campaign locks down ground operation in {state}',
    'Turnout machinery fires up for {name} in key state {state}',
  ],

  communityOutreach: [
    '{name} meets with community leaders in {state}',
    '{name} holds listening session in {state}\'s minority communities',
    '{name} visits cultural centers across {state}',
    '{name} builds coalition support through grassroots outreach in {state}',
    '{name} meets with faith and civic leaders in {state}',
    '{name} expands community engagement efforts in {state}',
    '{name} hosts roundtable with local organizers in {state}',
    '{name} deepens ties with diverse communities in {state}',
  ],

  // ── AIR — STATE ─────────────────────────────────────────────────────────────

  tvAds: [
    '{name} launches new ad blitz targeting {state}',
    '{name} goes on air in {state} with fresh spot',
    'New {name} TV campaign floods {state} airwaves',
    '{name} buys major ad time in {state} media markets',
    '{name} rolls out biographical ad in {state}',
    '{name} hits {state} airways with positive contrast spot',
    '{name} campaign spends big on {state} television',
    'Swing-state ad push targets {state} for {name}',
  ],

  attack_state: [
    '{name} goes negative in {state} with new attack spot',
    '{name} launches hard-hitting ad against opponent in {state}',
    '{name} hits opponent\'s record in new {state} campaign',
    'Contrast ad from {name} campaign floods {state} screens',
    '{name} targets opponent\'s weaknesses in {state} media push',
    '{name} goes on offence in {state} with blistering new ad',
    '{name} launches opposition research-backed attack in {state}',
    'Sharp new contrast ad from {name} lands in {state}',
  ],

  // ── AIR — NATIONAL ──────────────────────────────────────────────────────────

  mediaBlitz: [
    '{name} launches major national media campaign',
    '{name} goes on offense with nationwide media push',
    '{name} saturates airwaves with new national ad buy',
    '{name} dominates the national conversation with media blitz',
    '{name} makes major ad investment across national markets',
    'National {name} ad campaign kicks off across the country',
    '{name} floods national media ahead of key stretch',
    '{name} rolls out sweeping national messaging campaign',
  ],

  air_national: [
    '{name} campaign buys national ad time',
    '{name} rolls out fresh national ad campaign',
    'New national messaging from {name} hits the airwaves',
    '{name} goes up with national media buy',
  ],

  // ── DEVELOP — NATIONAL ───────────────────────────────────────────────────────

  debatePrep: [
    '{name} hunkers down for intensive debate preparation',
    '{name} holds mock debates ahead of upcoming showdown',
    '{name} campaign goes into debate-prep mode',
    '{name} team stages practice sessions for upcoming debate',
    'Sources say {name} is deep in debate preparation',
    '{name} sharpens arguments in closed-door debate prep',
    '{name} campaign readies candidate for upcoming debate',
    '{name} runs through scenarios ahead of debate night',
  ],

  volunteerDrive: [
    '{name} campaign launches major volunteer recruitment push',
    'Hundreds sign up to volunteer for {name} campaign',
    '{name} volunteer numbers surge after new recruitment drive',
    '{name} opens new field offices to harness volunteer energy',
    'Grassroots energy drives {name} volunteer recruitment',
    '{name} campaign reports record volunteer sign-ups',
    'New wave of volunteers joins {name}\'s ground army',
    '{name} campaign expands field operation with new recruits',
  ],

  oppoResearch: [
    '{name} campaign digs into opponent\'s record',
    'Sources say {name} team has commissioned deep opposition research',
    '{name} campaign signals it is preparing contrast material',
    'Political operatives say {name} team is building a dossier',
  ],

  debateBoost: [
    '{name} doubles down on intensive debate preparation',
    '{name} campaign adds extra debate coaching sessions',
  ],

  // ── ARCHETYPE ACTIONS ────────────────────────────────────────────────────────

  rallyingCry: [
    '{name} delivers barnburner speech, drawing massive crowd response',
    '{name}\'s rallying cry electrifies base supporters',
    'Overflow crowd erupts as {name} delivers signature address',
    '{name} whips supporters into frenzy with passionate appeal',
    '{name} base energised after electric national appeal',
  ],

  partyElder: [
    '{name} draws on decades of experience to consolidate party support',
    'Party stalwarts rally behind {name} as elder statesman',
    '{name} works the phones to shore up party infrastructure',
    '{name} leverages longtime relationships to secure key backing',
  ],

  partyFavour: [
    '{name} calls in political favours with party leadership',
    '{name} secures party institutional backing behind closed doors',
    'Party machinery aligns with {name} after leadership outreach',
  ],

  viralMomentAction: [
    '{name} campaign seizes on viral moment to amplify message',
    'Viral content from {name} campaign ignites social media',
    '{name} team rides wave of online attention to boost outreach',
    '{name}\'s campaign goes viral — social media lights up',
  ],

  dataBlitz: [
    '{name} launches data-driven micro-targeting operation',
    '{name} campaign deploys sophisticated digital outreach',
    'Precision digital campaign from {name} targets swing voters',
    '{name} uses data analytics to sharpen voter targeting',
  ],

  // ── GENERIC FALLBACKS BY TYPE ────────────────────────────────────────────────

  ground_state: [
    '{name} campaigns in {state}',
    '{name} makes stop in {state}',
    '{name} visits {state} on campaign swing',
    '{name} holds events across {state}',
    '{name} spends the day in {state}',
    '{name} makes push in {state}',
    '{name} hits the trail in {state}',
    '{name} meets voters in {state}',
  ],

  ground_national: [
    '{name} intensifies national campaign effort',
    '{name} campaign ramps up ground operation',
    '{name} boosts nationwide outreach',
  ],

  // ── PRESS CONFERENCES ────────────────────────────────────────────────────────
  // Keyed by topic label (lowercased, spaces→underscores) from PRESS_CONFERENCE_TOPICS.

  press_economic_vision: [
    '{name} lays out economic vision at press conference',
    '{name} faces tough questions on the economy at press briefing',
    '{name} unveils economic agenda before assembled press',
    'Reporters press {name} on economic plans at news conference',
  ],

  press_healthcare_commitment: [
    '{name} reaffirms healthcare commitment at press conference',
    '{name} faces healthcare questions head-on before reporters',
    '{name} doubles down on healthcare platform in press briefing',
  ],

  press_national_security: [
    '{name} projects strength on national security at press conference',
    '{name} fields foreign policy questions from assembled press',
    '{name} addresses national security concerns in press briefing',
  ],

  press_climate_energy: [
    '{name} outlines climate agenda at press conference',
    '{name} takes questions on energy policy from reporters',
    '{name} defends climate plan before the press corps',
  ],

  press_immigration_border: [
    '{name} addresses immigration policy at tense press conference',
    'Reporters grill {name} on border policy specifics',
    '{name} clarifies immigration stance before assembled media',
  ],

  press_education_youth: [
    '{name} champions education agenda at press conference',
    '{name} fields student debt questions from reporters',
    '{name} unveils education plan before the press',
  ],

  press_jobs_workers: [
    '{name} speaks directly to workers at press conference',
    '{name} addresses jobs and trade questions from reporters',
    '{name} makes pitch to working families before assembled press',
  ],

  press_democracy_rule_of_law: [
    '{name} addresses democracy and rule of law at press conference',
    '{name} draws sharp contrast on judicial independence before reporters',
    '{name} fields pointed questions on democratic norms',
  ],

};
