/**
 * useCoreEngine.js — SILO v11
 * Freeze tokens · 2x multiplier · Weekly challenges · Pattern intelligence
 */
import React from 'react';
var useState      = React.useState;
var useEffect     = React.useEffect;
var createContext = React.createContext;
var useContext    = React.useContext;

var SK  = 'silo_core_v5';
export var XPL = 300;

// ─── TIERS ────────────────────────────────────────────────────────────────────
export var TIERS = [
  { min:1,  title:'Quiescent Matrix',   desc:'Dormant. Awaiting first signal.',               color:'#475569', glow:'rgba(71,85,105,0.5)'    },
  { min:4,  title:'Resonant Core',      desc:'Oscillating. Patterns emerging from noise.',    color:'#4a9eff', glow:'rgba(74,158,255,0.55)'  },
  { min:8,  title:'Kinetic Lattice',    desc:'Expanding. Signal threads multiplying outward.',color:'#22c55e', glow:'rgba(34,197,94,0.55)'   },
  { min:13, title:'Cascade Engine',     desc:'Accelerating. The architecture self-modifies.', color:'#e879a0', glow:'rgba(232,121,160,0.55)' },
  { min:18, title:'Sovereign Nexus',    desc:'Autonomous. The system rewrites itself.',        color:'#a78bfa', glow:'rgba(167,139,250,0.6)'  },
  { min:24, title:'Monolithic Overlord',desc:'Fully sentient. The Core has become aware.',    color:'#f59e0b', glow:'rgba(245,158,11,0.65)'  },
];

export function getTier(level) {
  for (var i = TIERS.length - 1; i >= 0; i--) {
    if (level >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

// ─── TASK SYSTEM ──────────────────────────────────────────────────────────────
export var TASK_CATS = {
  body: { label:'Body', color:'#22c55e', glow:'rgba(34,197,94,0.4)'   },
  mind: { label:'Mind', color:'#4a9eff', glow:'rgba(74,158,255,0.4)'  },
  soul: { label:'Soul', color:'#f97316', glow:'rgba(249,115,22,0.4)'  },
};

export var TASK_DIFFS = {
  1: { label:'Standard', mult:1.0, color:'#475569' },
  2: { label:'Hard',     mult:1.5, color:'#f59e0b' },
  3: { label:'Extreme',  mult:2.0, color:'#ef4444' },
};

export var TASK_FREQS = {
  daily:  { label:'Daily'  },
  weekly: { label:'Weekly' },
  once:   { label:'Once'   },
};

export var TASK_TEMPLATES = [
  { id:'tmpl_run',       name:'RUN / SPRINT',        cat:'body', freq:'daily',  diff:1, xp:60,  desc:'Cardio output' },
  { id:'tmpl_gym',       name:'LIFT / TRAIN',         cat:'body', freq:'daily',  diff:2, xp:80,  desc:'Resistance work' },
  { id:'tmpl_cold',      name:'COLD EXPOSURE',        cat:'body', freq:'daily',  diff:2, xp:55,  desc:'Stress inoculation' },
  { id:'tmpl_sleep',     name:'FULL SLEEP CYCLE',     cat:'body', freq:'daily',  diff:1, xp:40,  desc:'Recovery protocol' },
  { id:'tmpl_meditate',  name:'MEDITATION',           cat:'mind', freq:'daily',  diff:1, xp:45,  desc:'Signal clarity' },
  { id:'tmpl_journal',   name:'DEEP JOURNAL ENTRY',   cat:'mind', freq:'daily',  diff:1, xp:40,  desc:'Pattern processing' },
  { id:'tmpl_noscroll',  name:'NO-SCROLL BLOCK',      cat:'mind', freq:'daily',  diff:1, xp:35,  desc:'Noise reduction' },
  { id:'tmpl_read',      name:'READ / STUDY',         cat:'mind', freq:'daily',  diff:1, xp:40,  desc:'Signal intake' },
  { id:'tmpl_social',    name:'REAL CONNECTION',      cat:'soul', freq:'weekly', diff:1, xp:70,  desc:'Human bandwidth' },
  { id:'tmpl_outside',   name:'TIME IN NATURE',       cat:'soul', freq:'daily',  diff:1, xp:45,  desc:'Ground signal' },
  { id:'tmpl_creative',  name:'CREATIVE WORK',        cat:'soul', freq:'weekly', diff:1, xp:55,  desc:'Expression output' },
  { id:'tmpl_gratitude', name:'GRATITUDE LOG',        cat:'soul', freq:'daily',  diff:1, xp:30,  desc:'Polarity shift' },
  { id:'tmpl_noalcohol', name:'ALCOHOL-FREE DAY',     cat:'body', freq:'daily',  diff:1, xp:35,  desc:'Baseline clarity' },
  { id:'tmpl_water',     name:'HYDRATION PROTOCOL',   cat:'body', freq:'daily',  diff:1, xp:20,  desc:'System maintenance' },
  { id:'tmpl_stretch',   name:'MOBILITY / STRETCH',   cat:'body', freq:'daily',  diff:1, xp:30,  desc:'Structural integrity' },
  { id:'tmpl_learn',     name:'LEARN SOMETHING NEW',  cat:'mind', freq:'weekly', diff:2, xp:80,  desc:'Expansion protocol' },
  { id:'tmpl_clean',     name:'ENVIRONMENT RESET',    cat:'soul', freq:'weekly', diff:1, xp:40,  desc:'Signal space clarity' },
  { id:'tmpl_plan',      name:'WEEKLY PLANNING',      cat:'mind', freq:'once',   diff:1, xp:60,  desc:'Vector alignment' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getLevelFromXP(xp) { return Math.max(1, Math.floor(xp / XPL) + 1); }
export function getLvlXP(xp)       { return xp % XPL; }
export function getXPIntoLevel(xp) { return xp % XPL; }

export function weekKey() {
  var d = new Date();
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6 : 1);
  var mon = new Date(d); mon.setDate(diff);
  return mon.toISOString().slice(0, 10);
}

function weekStart(wk) { return wk; }
function weekEnd(wk) {
  var d = new Date(wk); d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

function hashStr(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; }
  return h;
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

export function getTaskStreak(taskId, taskLog, freq) {
  if (!taskLog || !taskLog.length) return 0;
  var dates = taskLog.filter(function(l) { return l.id === taskId; }).map(function(l) { return l.date; });
  if (!dates.length) return 0;
  var unique = dates.filter(function(d, i, a) { return a.indexOf(d) === i; }).sort().reverse();
  var streak = 0, cur = new Date();
  if (freq === 'weekly') {
    var weeks = unique.map(function(d) {
      var dt = new Date(d), wd = dt.getDay();
      var ed = dt.getDate() - wd + (wd === 0 ? -6 : 1);
      var m = new Date(dt); m.setDate(ed);
      return m.toISOString().slice(0, 10);
    });
    var uw = weeks.filter(function(w, i, a) { return a.indexOf(w) === i; }).sort().reverse();
    for (var i = 0; i < uw.length; i++) {
      var ex = new Date(cur); ex.setDate(ex.getDate() - i * 7);
      var exd = ex.getDay(), edi = ex.getDate() - exd + (exd === 0 ? -6 : 1);
      var em = new Date(ex); em.setDate(edi);
      if (uw[i] === em.toISOString().slice(0, 10)) streak++;
      else break;
    }
  } else {
    for (var j = 0; j < unique.length; j++) {
      var e2 = new Date(cur); e2.setDate(e2.getDate() - j);
      if (unique[j] === e2.toISOString().slice(0, 10)) streak++;
      else break;
    }
  }
  return streak;
}

// ─── WEEKLY CHALLENGES ────────────────────────────────────────────────────────
export var WEEKLY_CHALLENGES = [
  {
    id:'clear5', icon:'🌿', label:'Log 5 CLEAR signal entries this week',
    target:5, color:'#22c55e', xp:120,
    check:function(st, wk) {
      var ws = st.weeklyShifts || {}, total = 0;
      Object.keys(ws).forEach(function(k) { if (k >= weekStart(wk) && k <= weekEnd(wk)) total += (ws[k].CLEAR || 0); });
      return total;
    },
  },
  {
    id:'tasks7', icon:'▪', label:'Complete 7 tasks in a single week',
    target:7, color:'#4a9eff', xp:100,
    check:function(st, wk) {
      return (st.taskLog || []).filter(function(t) { return t.date >= weekStart(wk) && t.date <= weekEnd(wk); }).length;
    },
  },
  {
    id:'words300', icon:'📓', label:'Write 300+ words in journal entries this week',
    target:300, color:'#a78bfa', xp:90,
    check:function(st, wk) {
      return (st.log || []).filter(function(en) { return en.date >= weekStart(wk) && en.date <= weekEnd(wk); })
                           .reduce(function(s, en) { return s + (en.wordCount || 0); }, 0);
    },
  },
  {
    id:'streak5', icon:'🔥', label:'Maintain a 5-day active streak',
    target:5, color:'#f97316', xp:110,
    check:function(st) { return st.streak || 0; },
  },
  {
    id:'body3', icon:'💪', label:'Complete 3 body tasks in one week',
    target:3, color:'#22c55e', xp:80,
    check:function(st, wk) {
      return (st.taskLog || []).filter(function(t) { return t.date >= weekStart(wk) && t.date <= weekEnd(wk) && t.cat === 'body'; }).length;
    },
  },
  {
    id:'reflect3', icon:'🧘', label:'Log 3 REFLECTIVE signal entries this week',
    target:3, color:'#4a9eff', xp:85,
    check:function(st, wk) {
      var ws = st.weeklyShifts || {}, total = 0;
      Object.keys(ws).forEach(function(k) { if (k >= weekStart(wk) && k <= weekEnd(wk)) total += (ws[k].REFLECTIVE || 0); });
      return total;
    },
  },
  {
    id:'burn2', icon:'◈', label:'Burn 2 entries (purge protocol) this week',
    target:2, color:'#ef4444', xp:75,
    check:function(st, wk) {
      return (st.log || []).filter(function(en) { return en.date >= weekStart(wk) && en.date <= weekEnd(wk) && en.action === 'burn'; }).length;
    },
  },
  {
    id:'soul3', icon:'🌲', label:'Complete 3 soul tasks in one week',
    target:3, color:'#f59e0b', xp:80,
    check:function(st, wk) {
      return (st.taskLog || []).filter(function(t) { return t.date >= weekStart(wk) && t.date <= weekEnd(wk) && t.cat === 'soul'; }).length;
    },
  },
];

export function getWeeklyChallenge(wk) {
  return WEEKLY_CHALLENGES[Math.abs(hashStr(wk)) % WEEKLY_CHALLENGES.length];
}

// ─── SIGNAL SUGGESTIONS ───────────────────────────────────────────────────────
export var SIGNAL_SUGGESTIONS = {
  HEAVY: [
    { name:'Cold Exposure',    taskId:'tmpl_cold',     reason:'Physical stress resets cortisol and clears heavy signal.' },
    { name:'Meditation',       taskId:'tmpl_meditate', reason:'10 minutes of stillness defragments a heavy mental state.' },
    { name:'Time in Nature',   taskId:'tmpl_outside',  reason:'Grounding signal counteracts stress buildup.' },
  ],
  HEAT: [
    { name:'Mobility / Stretch', taskId:'tmpl_stretch',   reason:'Release physical tension accumulated during turbulent signal.' },
    { name:'No-Scroll Block',    taskId:'tmpl_noscroll',   reason:'Cut the noise feed that amplifies heat signal.' },
    { name:'Gratitude Log',      taskId:'tmpl_gratitude',  reason:'Polarity shift from reactive to appreciative state.' },
  ],
  CLEAR: [
    { name:'Learn Something New', taskId:'tmpl_learn',    reason:'Deploy your clear state into high-leverage learning.' },
    { name:'Creative Work',       taskId:'tmpl_creative', reason:'Clear signal is optimal for creative output.' },
    { name:'Deep Journal Entry',  taskId:'tmpl_journal',  reason:'Capture your clear thinking for pattern analysis.' },
  ],
  REFLECTIVE: [
    { name:'Deep Journal Entry', taskId:'tmpl_journal', reason:'Reflective signal deepens into insight through writing.' },
    { name:'Weekly Planning',    taskId:'tmpl_plan',    reason:'Reflective state is ideal for directional planning.' },
    { name:'Read / Study',       taskId:'tmpl_read',    reason:'Absorb new signal while in receptive reflective mode.' },
  ],
};

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export var ACHIEVEMENTS = [
  { id:'first_entry',  icon:'◆', title:'First Signal',       desc:'Logged your first journal entry.',         color:'#4a9eff' },
  { id:'first_task',   icon:'▪', title:'Protocol Initiated', desc:'Completed your first task.',               color:'#22c55e' },
  { id:'streak_3',     icon:'🔥',title:'3-Day Lock',         desc:'Maintained a 3-day active streak.',         color:'#f97316' },
  { id:'streak_7',     icon:'⚡',title:'One Week',           desc:'Maintained a 7-day active streak.',         color:'#f59e0b' },
  { id:'streak_14',    icon:'💎',title:'Fortnight Protocol', desc:'14 consecutive days of signal.',            color:'#a78bfa' },
  { id:'streak_30',    icon:'👑',title:'30-Day Protocol',    desc:'30 days of unbroken signal.',               color:'#e879a0' },
  { id:'level_4',      icon:'◉', title:'Resonance Achieved', desc:'Reached Level 4 — Resonant Core.',         color:'#4a9eff' },
  { id:'level_8',      icon:'◈', title:'Lattice Formed',     desc:'Reached Level 8 — Kinetic Lattice.',       color:'#22c55e' },
  { id:'level_13',     icon:'◇', title:'Cascade Active',     desc:'Reached Level 13 — Cascade Engine.',       color:'#e879a0' },
  { id:'level_18',     icon:'✦', title:'Nexus Sovereign',    desc:'Reached Level 18 — Sovereign Nexus.',      color:'#a78bfa' },
  { id:'level_24',     icon:'★', title:'Monolith',           desc:'Reached Level 24 — Monolithic Overlord.',  color:'#f59e0b' },
  { id:'entries_10',   icon:'📓',title:'Transmission Log',   desc:'Logged 10 journal entries.',                color:'#4a9eff' },
  { id:'entries_50',   icon:'📡',title:'Signal Archive',     desc:'Logged 50 journal entries.',                color:'#a78bfa' },
  { id:'tasks_10',     icon:'⬡', title:'Protocol Runner',    desc:'Completed 10 tasks total.',                 color:'#22c55e' },
  { id:'tasks_50',     icon:'⬢', title:'System Executor',    desc:'Completed 50 tasks total.',                 color:'#f59e0b' },
  { id:'tasks_100',    icon:'★', title:'Autonomous Agent',   desc:'Completed 100 tasks total.',                color:'#e879a0' },
  { id:'xp_1000',      icon:'◆', title:'Signal Milestone',   desc:'Accumulated 1,000 total XP.',               color:'#4a9eff' },
  { id:'xp_5000',      icon:'◈', title:'Deep Signal',        desc:'Accumulated 5,000 total XP.',               color:'#f59e0b' },
  { id:'body_master',  icon:'💪',title:'Body Protocol',      desc:'Logged 20 body tasks.',                     color:'#22c55e' },
  { id:'mind_master',  icon:'🧠',title:'Mind Protocol',      desc:'Logged 20 mind tasks.',                     color:'#4a9eff' },
  { id:'soul_master',  icon:'🌲',title:'Soul Protocol',      desc:'Logged 20 soul tasks.',                     color:'#f97316' },
  { id:'clear_signal', icon:'🌿',title:'Clear Transmission', desc:'Logged 10 CLEAR signal entries.',           color:'#22c55e' },
  { id:'freeze_used',  icon:'❄', title:'Freeze Protocol',    desc:'Used a streak freeze token.',               color:'#a0d8ef' },
  { id:'challenge_1',  icon:'🏆',title:'Challenger',         desc:'Completed your first weekly challenge.',    color:'#f59e0b' },
  { id:'challenge_5',  icon:'👑',title:'Challenge Master',   desc:'Completed 5 weekly challenges.',            color:'#e879a0' },
];

// ─── STATE ────────────────────────────────────────────────────────────────────
function defaults() {
  return {
    totalXP:                  0,
    log:                      [],
    streak:                   0,
    lastDate:                 null,
    weeklyShifts:             {},
    journalEntries:           [],
    tasks:                    [],
    taskLog:                  [],
    completedToday:           {},
    completedDate:            null,
    completedWeek:            {},
    completedWeekKey:         null,
    completedOnce:            {},
    unlockedAchievements:     [],
    freezeTokens:             0,
    freezesUsed:              0,
    streakMilestonesRewarded: [],
    firstActionDate:          null,
    weekChallengeKey:         null,
    weekChallengeComplete:    false,
    weekChallengesCompleted:  0,
    actionPulse:              0,
    _pendingFreezeStreak:     null,
    _pendingFreezeActive:     false,
  };
}

function persist(st) { try { localStorage.setItem(SK, JSON.stringify(st)); } catch(x) {} }
function hydrate() {
  try {
    var r = localStorage.getItem(SK);
    return r ? Object.assign({}, defaults(), JSON.parse(r)) : defaults();
  } catch(x) { return defaults(); }
}

// ─── INTERNAL LOGIC ───────────────────────────────────────────────────────────
function applyXPCalc(prev, amt) {
  var today   = todayKey();
  var isFirst = (prev.firstActionDate !== today);
  var mult    = isFirst ? 2 : 1;
  var awarded = amt * mult;
  return { newXP: (prev.totalXP || 0) + awarded, firstActionDate: today, xpAwarded: awarded };
}

function checkStreakRewards(streak, prev) {
  var milestones = [7, 14, 30, 60];
  var rewarded = (prev.streakMilestonesRewarded || []).slice();
  var bonus = 0;
  milestones.forEach(function(m) {
    if (streak >= m && rewarded.indexOf(m) === -1) { rewarded.push(m); bonus++; }
  });
  return { rewarded: rewarded, bonusTokens: bonus };
}

function checkWeeklyChallenge(next, wk) {
  if (next.weekChallengeComplete) return { bonus: 0, complete: true };
  var ch = getWeeklyChallenge(wk);
  return ch.check(next, wk) >= ch.target ? { bonus: ch.xp, complete: true } : { bonus: 0, complete: false };
}

function checkAchievements(st, prev) {
  var ul = (st.unlockedAchievements || []).slice();
  function add(id) { if (ul.indexOf(id) === -1) ul.push(id); }
  var tl = st.taskLog || [], lg = st.log || [], str = st.streak || 0, xp = st.totalXP || 0, lv = getLevelFromXP(xp);
  if (lg.length >= 1)   add('first_entry');
  if (tl.length >= 1)   add('first_task');
  if (str >= 3)         add('streak_3');
  if (str >= 7)         add('streak_7');
  if (str >= 14)        add('streak_14');
  if (str >= 30)        add('streak_30');
  if (lv >= 4)          add('level_4');
  if (lv >= 8)          add('level_8');
  if (lv >= 13)         add('level_13');
  if (lv >= 18)         add('level_18');
  if (lv >= 24)         add('level_24');
  if (lg.length >= 10)  add('entries_10');
  if (lg.length >= 50)  add('entries_50');
  if (tl.length >= 10)  add('tasks_10');
  if (tl.length >= 50)  add('tasks_50');
  if (tl.length >= 100) add('tasks_100');
  if (xp >= 1000)       add('xp_1000');
  if (xp >= 5000)       add('xp_5000');
  var body = tl.filter(function(t) { return t.cat === 'body'; }).length;
  var mind = tl.filter(function(t) { return t.cat === 'mind'; }).length;
  var soul = tl.filter(function(t) { return t.cat === 'soul'; }).length;
  if (body >= 20) add('body_master');
  if (mind >= 20) add('mind_master');
  if (soul >= 20) add('soul_master');
  var ws = st.weeklyShifts || {};
  var clr = Object.values(ws).reduce(function(s, d) { return s + (d.CLEAR || 0); }, 0);
  if (clr >= 10)                             add('clear_signal');
  if ((st.freezesUsed || 0) >= 1)            add('freeze_used');
  if ((st.weekChallengesCompleted || 0) >= 1) add('challenge_1');
  if ((st.weekChallengesCompleted || 0) >= 5) add('challenge_5');
  var prevUl = prev.unlockedAchievements || [];
  var newId  = null;
  for (var i = 0; i < ul.length; i++) { if (prevUl.indexOf(ul[i]) === -1) { newId = ul[i]; break; } }
  return { ul: ul, newId: newId };
}

function afterMutate(next, prev, setEvo, setAch) {
  var wk = weekKey();
  var wkc = checkWeeklyChallenge(next, wk);
  if (wkc.complete && !prev.weekChallengeComplete) {
    next.weekChallengeComplete   = true;
    next.weekChallengesCompleted = (prev.weekChallengesCompleted || 0) + 1;
    next.totalXP += wkc.bonus;
  }
  var ach = checkAchievements(next, prev);
  next.unlockedAchievements = ach.ul;
  if (ach.newId) {
    var a = ACHIEVEMENTS.find(function(x) { return x.id === ach.newId; });
    if (a) setTimeout(function() { setAch(a); }, 400);
  }
  var ot = getTier(getLevelFromXP(prev.totalXP || 0));
  var nt = getTier(getLevelFromXP(next.totalXP));
  if (nt.title !== ot.title) setTimeout(function() { setEvo(nt); }, 250);
  return next;
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
var Ctx = createContext(null);

export function CoreProvider(props) {
  var s1 = useState(null);  var state          = s1[0], setState          = s1[1];
  var s2 = useState(false); var loaded         = s2[0], setLoaded         = s2[1];
  var s3 = useState(null);  var evolution      = s3[0], setEvolution      = s3[1];
  var s4 = useState(null);  var newAchievement = s4[0], setNewAchievement = s4[1];

  useEffect(function() {
    var st = hydrate(), today = todayKey(), wk = weekKey();
    if (st.completedDate !== today)  { st.completedToday = {};  st.completedDate = today; }
    if (st.completedWeekKey !== wk)  { st.completedWeek = {};   st.completedWeekKey = wk; }
    if (st.weekChallengeKey !== wk)  { st.weekChallengeKey = wk; st.weekChallengeComplete = false; }
    if (st.lastDate !== today) {
      var yest = new Date(); yest.setDate(yest.getDate() - 1);
      var ykey = yest.toISOString().slice(0, 10);
      if (st.lastDate === ykey) {
        var prevStr = st.streak || 0;
        var sr = checkStreakRewards(prevStr, st);
        if (sr.bonusTokens > 0) { st.freezeTokens = (st.freezeTokens || 0) + sr.bonusTokens; st.streakMilestonesRewarded = sr.rewarded; }
        if ((st.freezeTokens || 0) > 0 && prevStr > 0) { st._pendingFreezeActive = true; st._pendingFreezeStreak = prevStr; }
        st.streak = 0;
      } else if (st.lastDate && st.lastDate < ykey) {
        st.streak = 0;
      }
    }
    setState(st);
    setLoaded(true);
  }, []);

  useEffect(function() { if (state) persist(state); }, [state]);

  function commitEntry(parseResult) {
    setState(function(prev) {
      if (!prev) return prev;
      var today  = todayKey();
      var xpCalc = applyXPCalc(prev, parseResult.xp);
      var weekly = Object.assign({}, prev.weeklyShifts || {});
      if (!weekly[today]) weekly[today] = { HEAVY:0, HEAT:0, CLEAR:0, REFLECTIVE:0 };
      if (parseResult.primaryShift) weekly[today][parseResult.primaryShift]++;
      var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
      Object.keys(weekly).forEach(function(k) { if (new Date(k) < cutoff) delete weekly[k]; });
      var entry = {
        id: Date.now(), date: today,
        time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
        wordCount: parseResult.wordCount, charCount: parseResult.charCount,
        primaryShift: parseResult.primaryShift, shiftLabel: parseResult.shiftLabel,
        shiftColor: parseResult.shiftColor, xp: xpCalc.xpAwarded, action: parseResult.action,
      };
      var newLog     = [entry].concat((prev.log || []).slice(0, 49));
      var newJournal = parseResult.action === 'commit'
        ? [{ id: Date.now(), date: today, time: entry.time, text: parseResult.rawText || '', mood: parseResult.primaryShift, xp: xpCalc.xpAwarded }].concat((prev.journalEntries || []).slice(0, 99))
        : (prev.journalEntries || []);
      var next = Object.assign({}, prev, {
        totalXP: xpCalc.newXP, firstActionDate: xpCalc.firstActionDate,
        log: newLog, weeklyShifts: weekly, journalEntries: newJournal,
        lastDate: today, streak: Math.max(prev.streak || 0, 1),
        actionPulse: (prev.actionPulse || 0) + 1,
      });
      return afterMutate(next, prev, setEvolution, setNewAchievement);
    });
  }

  function logTask(task) {
    setState(function(prev) {
      if (!prev) return prev;
      var today   = todayKey();
      var compKey = task.freq === 'daily' ? 'completedToday' : task.freq === 'weekly' ? 'completedWeek' : 'completedOnce';
      var compObj = prev[compKey] || {};
      if (compObj[task.id]) return prev;
      var xpBase  = Math.round(task.xp * ((TASK_DIFFS[task.diff] || TASK_DIFFS[1]).mult));
      var xpCalc  = applyXPCalc(prev, xpBase);
      var newComp = Object.assign({}, compObj); newComp[task.id] = true;
      var newTL   = (prev.taskLog || []).concat([{ id: task.id, date: today, xp: xpCalc.xpAwarded, cat: task.cat }]).slice(-500);
      var next = Object.assign({}, prev, {
        totalXP: xpCalc.newXP, firstActionDate: xpCalc.firstActionDate,
        taskLog: newTL, lastDate: today,
        streak: Math.max(prev.streak || 0, 1),
        actionPulse: (prev.actionPulse || 0) + 1,
      });
      next[compKey] = newComp;
      var sr = checkStreakRewards(next.streak, prev);
      if (sr.bonusTokens > 0) { next.freezeTokens = (prev.freezeTokens || 0) + sr.bonusTokens; next.streakMilestonesRewarded = sr.rewarded; }
      return afterMutate(next, prev, setEvolution, setNewAchievement);
    });
  }

  function createTask(taskData) {
    setState(function(prev) {
      if (!prev) return prev;
      return Object.assign({}, prev, { tasks: (prev.tasks || []).concat([Object.assign({ id: 'task_' + Date.now() }, taskData)]) });
    });
  }

  function deleteTask(id) {
    setState(function(prev) {
      if (!prev) return prev;
      return Object.assign({}, prev, { tasks: (prev.tasks || []).filter(function(t) { return t.id !== id; }) });
    });
  }

  function useFreeze() {
    setState(function(prev) {
      if (!prev || !prev._pendingFreezeActive) return prev;
      return Object.assign({}, prev, {
        streak: prev._pendingFreezeStreak || 0,
        freezeTokens: Math.max(0, (prev.freezeTokens || 0) - 1),
        freezesUsed: (prev.freezesUsed || 0) + 1,
        _pendingFreezeActive: false, _pendingFreezeStreak: null,
      });
    });
  }

  function dismissFreeze() {
    setState(function(prev) {
      if (!prev) return prev;
      return Object.assign({}, prev, { _pendingFreezeActive: false, _pendingFreezeStreak: null });
    });
  }

  function dismissEvolution()  { setEvolution(null); }
  function dismissAchievement(){ setNewAchievement(null); }
  function resetAll() { try { localStorage.removeItem(SK); } catch(x) {} setState(defaults()); }

  // Derived values — computed each render, never stored in state
  var decayActive = false, isFirstActionToday = false, pendingFreeze = false, pendingFreezeStreak = 0;
  if (state) {
    var t0 = todayKey();
    if (state.lastDate) {
      var diffDays = Math.floor((new Date(t0) - new Date(state.lastDate)) / 86400000);
      decayActive = diffDays >= 2;
    }
    isFirstActionToday  = (state.firstActionDate !== t0);
    pendingFreeze       = !!(state._pendingFreezeActive);
    pendingFreezeStreak = state._pendingFreezeStreak || 0;
  }

  return React.createElement(Ctx.Provider, {
    value: {
      state, loaded, evolution, newAchievement,
      commitEntry, logTask, createTask, deleteTask,
      useFreeze, dismissFreeze, dismissEvolution, dismissAchievement, resetAll,
      decayActive, isFirstActionToday, pendingFreeze, pendingFreezeStreak,
      XPL,
    },
  }, props.children);
}

export function useCoreEngine() {
  var ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCoreEngine outside CoreProvider');
  return ctx;
}
