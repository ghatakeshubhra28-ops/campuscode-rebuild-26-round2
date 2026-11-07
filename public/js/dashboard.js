// dashboard.js - Arena Console. All data is mock data that lives in the browser.
(function () {
  'use strict';

  // ---------- Helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  const icon = (name) => '<i data-lucide="' + name + '"></i>';
  function drawIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ---------- Data ----------
  let student = load('cc_student', null);
  if (!student || !student.name) student = { name: 'Student', email: '', college: 'CampusCode student', id: 'CC-2026-0000' };
  let team = load('cc_team', 'Team LUNA');
  let joined = load('cc_joined', ['rebuild']);
  let readIds = load('cc_read', []);
  let invited = load('cc_invited', []);

  const VIEWS = [
    { id: 'overview',      label: 'Overview',              icon: 'layout-dashboard', group: 'Workspace' },
    { id: 'events',        label: 'Events',                icon: 'calendar',         group: 'Workspace' },
    { id: 'my-events',     label: 'My Events',             icon: 'clock',            group: 'Workspace' },
    { id: 'hackmate',      label: 'HackMate AI',           icon: 'sparkles',         group: 'AI tools' },
    { id: 'ideacheck',     label: 'IdeaCheck AI',          icon: 'lightbulb',        group: 'AI tools' },
    { id: 'rulebot',       label: 'RuleBot AI',            icon: 'bot',              group: 'AI tools' },
    { id: 'certificates',  label: 'Certificates',          icon: 'award',            group: 'Me' },
    { id: 'digital-card',  label: 'Digital Card',          icon: 'id-card',          group: 'Me' },
    { id: 'profile',       label: 'Profile',               icon: 'user',             group: 'Me' },
    { id: 'guide',         label: 'Student Guide',         icon: 'book-open',        group: 'Help' },
    { id: 'official',      label: 'Official Communication', icon: 'megaphone',       group: 'Help' },
    { id: 'notifications', label: 'Notifications',         icon: 'bell',             group: 'Help' },
    { id: 'help',          label: 'Help & Support',        icon: 'life-buoy',        group: 'Help' }
  ];

  const EVENTS = [
    { id: 'rebuild', init: 'RE', type: 'Hackathon', tag: 'Web development', name: "ReBuild '26", date: '06-07 Nov 2026', mode: 'Individual', status: 'live',
      desc: 'Recreate the CampusCode portal on Friday, rebuild it with an original design on Saturday. Frontend only, mock data is fine.' },
    { id: 'fc2', init: 'FQ', type: 'Quiz', tag: 'Open innovation', name: "FirstCommit '26 Quiz Competition 2.0", date: 'Open now', mode: 'Open to all', status: 'open',
      desc: 'A quick quiz round on coding and tech basics.' },
    { id: 'fc1', init: 'FQ', type: 'Quiz', tag: 'Open innovation', name: "FirstCommit '26 Quiz Competition", date: 'Open now', mode: 'Open to all', status: 'open',
      desc: 'The first edition of the FirstCommit quiz.' },
    { id: 'sprint', init: 'DS', type: 'Hackathon', tag: 'Design', name: 'Design Sprint 48', date: 'Dec 2026', mode: 'Teams of 2-4', status: 'soon',
      desc: 'Sample event: two days to design and prototype a product for campus life.' },
    { id: 'git', init: 'GH', type: 'Workshop', tag: 'Open source', name: 'Git and GitHub Workshop', date: 'Dec 2026', mode: 'Open to all', status: 'open',
      desc: 'Sample event: branches, pull requests and your first open source contribution.' },
    { id: 'pitch', init: 'PI', type: 'Pitch', tag: 'Startups', name: 'Campus Pitch Night', date: 'Jan 2027', mode: 'Individual or team', status: 'soon',
      desc: 'Sample event: pitch your idea in 3 minutes to mentors from the community.' }
  ];

  const PEOPLE = [
    { name: 'Ananya Rao',   id: 'CC-2026-4412', college: 'VIT Pune',   skills: ['React', 'Figma', 'UI'] },
    { name: 'Kabir Mehta',  id: 'CC-2026-2087', college: 'COEP Pune',  skills: ['Flask', 'Python', 'SQL'] },
    { name: 'Isha Nair',    id: 'CC-2026-7731', college: 'MIT-WPU',    skills: ['Flutter', 'Firebase'] },
    { name: 'Rohan Desai',  id: 'CC-2026-5120', college: 'PICT Pune',  skills: ['Node.js', 'APIs', 'DevOps'] },
    { name: 'Meera Joshi',  id: 'CC-2026-3345', college: 'VIT Pune',   skills: ['ML', 'Python', 'Data'] },
    { name: 'Dev Patel',    id: 'CC-2026-9068', college: 'SPPU',       skills: ['Figma', 'Branding', 'Motion'] }
  ];

  const NOTES = [
    { id: 'n1', title: 'Round 2 is live', text: 'Rebuild the 4 pages with an original design. Submit by 8:00 PM today.', when: 'Today' },
    { id: 'n2', title: 'Your ID was issued', text: 'Your Student pass is ready in Digital Card.', when: 'Today' },
    { id: 'n3', title: "You joined ReBuild '26", text: 'Use the same team name on every submission.', when: '5 Nov' },
    { id: 'n4', title: 'HackMate has suggestions', text: 'Six sample students match your interests.', when: '5 Nov' },
    { id: 'n5', title: 'Certificates are coming', text: 'Participation certificates are issued on 10 Nov.', when: '4 Nov' },
    { id: 'n6', title: 'Welcome to CampusCode', text: 'Your single place to run and join hackathons.', when: '4 Nov' }
  ];

  const NEWS = [
    { when: '5 Nov, 10 AM', tag: 'Rules', title: 'Rules and round details shared', text: 'Registrations close at 6 PM. Read the schedule, rules and brand guidelines.' },
    { when: '6 Nov, 8 AM', tag: 'Round 1', title: 'Round 1 opens: Recreate', text: 'Recreate the 4 pages and submit your demo by 10 PM.' },
    { when: '6 Nov, 10 PM+', tag: 'Results', title: 'Round 2 shortlist', text: 'Posted in the WhatsApp group and channel after Round 1 ends.' },
    { when: '7 Nov, 10 AM', tag: 'Round 2', title: 'Round 2 opens: Rebuild', text: 'Top performers only. A complete new UI. Submit by 8 PM.' },
    { when: '8 Nov', tag: 'Holiday', title: 'Diwali: no round', text: 'No round on Sunday. Enjoy Diwali with family.' },
    { when: '9 Nov', tag: 'Round 3', title: 'Interview shortlist', text: 'The shortlist for interviews is given.' },
    { when: '10 Nov', tag: 'Results', title: 'Certificates and interviews', text: 'Participation certificates are issued and Round 3 interviews begin.' },
    { when: '11 Nov', tag: 'Round 3', title: 'Interviews continue', text: 'Interviews continue for shortlisted participants.' }
  ];

  const GUIDE = [
    ['Get started', 'Create your account with your full name, email and password, confirm you are 18 or older, and verify your email with a one-time code. Your Student pass is issued as soon as you are verified.'],
    ['Join an event', 'Open Events, pick an event and press Join now. Paid events such as ReBuild need an invite code that only works for the email it was sent to.'],
    ['Find teammates', 'HackMate helps you find teammates. You can search by skill, college or a CampusCode ID.'],
    ['Submit your idea or project', 'Use IdeaCheck to screen an idea. For hackathons, submit your GitHub repo link, a live demo link and a short note for the organiser.'],
    ['Track rounds and results', 'My Events shows every event you joined with its rounds. Official Communication lists announcements and results.'],
    ['Certificates and Digital ID', 'Verifiable certificates are issued after events. Your Digital Card is your Student pass with a QR code.']
  ];

  const FAQ = [
    ['I did not get my email code.', 'Check your spam folder first, then go back one step and send the code again.'],
    ['Can I change my team name?', 'Yes. Open Profile, edit your team name and save. Use the same name everywhere so organisers can track your work.'],
    ['My live link does not open.', 'Test it in an incognito window on a laptop. A broken link cannot be judged, so tell the organisers in the WhatsApp group straight away.'],
    ['Who do I contact about a problem?', 'Email support@campuscode.co.in or post in the event WhatsApp group.']
  ];

  const RULES = [
    { k: /deadline|due|late|when|time|8 ?pm|10 ?pm/, a: 'Round 1 closes Friday 6 Nov at 10:00 PM IST. Round 2 closes Saturday 7 Nov at 8:00 PM IST. Late submissions are not accepted, and what is live at the deadline is what gets judged.' },
    { k: /\bai\b|40|percent|chatgpt|copilot|generated/, a: 'AI tools may be used, but only in a limited way. If more than 40% of the code is AI-written, the submission will not be considered, and you must be able to explain your own code.' },
    { k: /font|colou?r|brand|logo|purple|lime|hex/, a: 'Fonts: Inter for headings and DM Mono for small labels. Colours: purple #7665ff, lime #a8e62e (or #82b91a), black #111111 and background #f7f7f4. Use the logo exactly as given: never recolour, stretch or redraw it.' },
    { k: /team|individual|alone|solo/, a: 'ReBuild is an individual hackathon: you build alone and make one submission per round. You still need a team name for tracking, used the same way on Unstop, the portal and every submission.' },
    { k: /submit|submission|link|repo|github|demo|pdf|note/, a: 'Submit on the portal only: a GitHub repo link, a live demo link and a note for the organiser typed in the form. A PDF link is optional and must be a public Google Drive link.' },
    { k: /judg|criteria|score|marks|grading/, a: 'Round 1 is judged on faithful recreation, completeness (all 4 pages), polish and desktop experience. Round 2 is judged on originality, CampusCode vibe fit, usability, completeness and polish.' },
    { k: /round 2|rebuild|redesign|original|copy/, a: 'Round 2 is for top Round 1 performers only. Build a complete new UI in the CampusCode vibe. It must not be a copy of Round 1 or of the live portal, and you must not resubmit your Round 1 work.' },
    { k: /prize|internship|stipend|winner|cash/, a: 'The winner gets a Winner Certificate and a CampusCode internship with a Rs 15,000 stipend. The runner-up gets a certificate and every participant gets a participation certificate. There are no cash prizes.' },
    { k: /tailwind|bootstrap|template|library|libraries/, a: 'UI libraries such as Tailwind and Bootstrap are allowed. Do not copy a ready-made dashboard template as-is.' },
    { k: /host|vercel|netlify|deploy/, a: 'You can host for free: push your code to GitHub, then import the repo on vercel.com (or netlify.com) and deploy. Paste the live link as your demo link.' },
    { k: /diwali|sunday|interview|round 3|certificate/, a: 'Sunday 8 Nov is Diwali with no round. The interview shortlist is given on 9 Nov, participation certificates are issued on 10 Nov, and interviews run on 10 and 11 Nov.' }
  ];
  const ASK = ['When is the deadline?', 'What is the AI code limit?', 'Which fonts and colours?', 'What do I submit?', 'How is Round 2 judged?'];
  let chat = [{ from: 'bot', text: "Hi, I am RuleBot. I answer questions about the ReBuild '26 rules and schedule. This is a demo: it matches keywords, it is not a live AI model." }];

  // ---------- State ----------
  let current = 'overview';
  let evFilter = 'All';
  let evQuery = '';
  let hmQuery = '';
  let ideaResult = null;

  const unread = () => NOTES.filter((n) => readIds.indexOf(n.id) === -1).length;
  const initials = (name) => name.split(' ').filter(Boolean).map((w) => w.charAt(0)).join('').slice(0, 2).toUpperCase() || 'ST';
  const firstName = () => student.name.split(' ')[0];
  function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
  const head = (label, title, sub) =>
    '<div class="dx-head"><p class="label"><span class="live-dot"></span> ' + label + '</p><h1>' + title + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>';

  // ---------- Rail, top bar ----------
  function renderNav() {
    let html = '';
    let group = '';
    VIEWS.forEach((v) => {
      if (v.group !== group) { group = v.group; html += '<div class="dx-group">' + group + '</div>'; }
      const badge = v.id === 'notifications' && unread() ? '<span class="dx-badge">' + unread() + '</span>' : '';
      html += '<button class="dx-item' + (v.id === current ? ' on' : '') + '" data-go="' + v.id + '" type="button">' + icon(v.icon) + '<span>' + v.label + '</span>' + badge + '</button>';
    });
    $('#nav').innerHTML = html;
    drawIcons();
  }
  function renderChrome() {
    $('#miniAv').textContent = initials(student.name);
    $('#miniName').textContent = student.name;
    $('#miniId2').textContent = student.id;
    $('#topAv').textContent = initials(student.name);
    $('#topName').textContent = student.name;
    const c = $('#bellCount');
    c.textContent = unread();
    c.classList.toggle('zero', unread() === 0);
    const v = VIEWS.find((x) => x.id === current);
    $('#crumb').textContent = 'CampusCode / Student / ' + (v ? v.label : '');
  }

  // ---------- Views ----------
  function viewOverview() {
    const ongoing = EVENTS.filter((e) => joined.indexOf(e.id) !== -1 && e.status === 'live').length;
    const strength = profileStrength();
    return head('Student workspace / Live', greeting() + ', <span class="mark">' + esc(firstName()) + '</span>.', 'Your ID, your journey, your events and your AI tools in one place.') +
      '<section class="card dx-hero"><div><p class="label">Build / Learn / Collaborate</p><h2>ReBuild \'26</h2>' +
      '<p>An individual dashboard-recreation hackathon by CampusCode. Recreate the platform on Friday and rebuild it with an original design on Saturday. Frontend only, mock data is fine.</p>' +
      '<button class="btn" data-go="my-events" type="button">Open my events &rarr;</button></div></section>' +
      '<div class="dx-stats4">' +
      kpi('calendar-check', 'Registered', joined.length, 'Events joined') +
      kpi('zap', 'Ongoing', ongoing, 'Live right now') +
      kpi('circle-check', 'Completed', 0, 'Finished events') +
      kpi('award', 'Certificates', 0, 'Issued 10 Nov') + '</div>' +
      '<div class="dx-grid-2">' +
      '<section class="card"><p class="label">Your journey</p><h2 class="dx-card-title">ReBuild \'26</h2>' + journeyHtml() + '</section>' +
      '<div><section class="card"><p class="label">Upcoming deadlines</p><h2 class="dx-card-title">What is next</h2><ul class="dx-list">' +
      '<li><span>Round 2 submission</span><span class="when">Sat 7 Nov, 8 PM</span></li>' +
      '<li><span>Interview shortlist</span><span class="when">Mon 9 Nov</span></li>' +
      '<li><span>Certificates issued</span><span class="when">Tue 10 Nov</span></li>' +
      '<li><span>Interviews continue</span><span class="when">Wed 11 Nov</span></li></ul></section>' +
      '<section class="card" style="margin-top:20px"><p class="label">Profile strength</p><h2 class="dx-card-title">' + strength + '% complete</h2>' +
      '<div class="dx-meter-bar"><i style="width:' + strength + '%"></i></div>' +
      '<p class="dx-note">Add your college and team name in Profile.</p>' +
      '<div class="dx-actions"><button class="btn ghost sm" data-go="profile" type="button">Open profile</button></div></section></div></div>' +
      '<p class="label" style="margin-top:36px">AI spotlight</p><div class="dx-grid-3">' +
      tool('sparkles', 'HackMate AI', 'Find teammates by skill, college or CampusCode ID.', 'hackmate') +
      tool('lightbulb', 'IdeaCheck AI', 'Screen your idea for originality, feasibility and impact.', 'ideacheck') +
      tool('bot', 'RuleBot AI', 'Ask anything about the rules and schedule.', 'rulebot') + '</div>' +
      '<section class="card" style="margin-top:20px"><p class="label">Recent activity</p><h2 class="dx-card-title">Your timeline</h2><ul class="dx-list act">' +
      '<li><span class="when">Today</span><span>Opened Round 2: Rebuild</span></li>' +
      '<li><span class="when">Today</span><span>Student pass issued: ' + esc(student.id) + '</span></li>' +
      '<li><span class="when">5 Nov</span><span>Joined ReBuild \'26 as ' + esc(team) + '</span></li>' +
      '<li><span class="when">4 Nov</span><span>Created your CampusCode account</span></li></ul></section>';
  }
  function kpi(ic, label, value, sub) {
    return '<div class="card dx-kpi">' + icon(ic) + '<p class="label">' + label + '</p><strong>' + value + '</strong><p class="label">' + sub + '</p></div>';
  }
  function tool(ic, title, text, go) {
    return '<button class="card hoverable dx-tool" data-go="' + go + '" type="button">' + icon(ic) + '<h3>' + title + '</h3><p>' + text + '</p><span class="go">Open &rarr;</span></button>';
  }
  function journeyHtml() {
    return '<ol class="dx-tl">' +
      '<li class="done"><span class="dot"></span><h3>ID issued</h3><p>Account created and email verified.</p></li>' +
      '<li class="done"><span class="dot"></span><h3>Joined ReBuild \'26</h3><p>Individual hackathon, frontend only.</p></li>' +
      '<li class="done"><span class="dot"></span><h3>Round 1: Recreate</h3><p>Four pages recreated and submitted.</p></li>' +
      '<li class="active"><span class="dot"></span><h3>Round 2: Rebuild</h3><p>An original design in the CampusCode vibe. In progress.</p></li>' +
      '<li><span class="dot"></span><h3>Round 3: Interview</h3><p>Shortlisted participants only.</p></li>' +
      '<li><span class="dot"></span><h3>Certificates</h3><p>Participation certificates are issued.</p></li></ol>';
  }
  function profileStrength() {
    let n = 40;
    if (student.name && student.name !== 'Student') n += 15;
    if (student.email) n += 15;
    if (student.college && student.college !== 'CampusCode student') n += 15;
    if (team) n += 15;
    return n;
  }

  function statusPill(s) {
    return s === 'live' ? '<span class="dx-pill lime">LIVE NOW</span>' : s === 'open' ? '<span class="dx-pill purple">OPEN</span>' : '<span class="dx-pill">OPENING SOON</span>';
  }
  function eventCard(ev) {
    const isJoined = joined.indexOf(ev.id) !== -1;
    const action = isJoined
      ? '<span class="dx-pill dark">JOINED</span><button class="btn ghost sm" data-act="leave" data-id="' + ev.id + '" type="button">Leave</button>'
      : ev.status === 'soon'
        ? '<span class="label">Opens soon</span><button class="btn sm" disabled type="button">Join now</button>'
        : '<span class="label">Open</span><button class="btn sm" data-act="join" data-id="' + ev.id + '" type="button">Join now &rarr;</button>';
    return '<article class="card dx-ev"><div class="dx-ev-top"><span class="dx-ic">' + ev.init + '</span><div><p class="label">' + ev.tag + '</p><h3>' + esc(ev.name) + '</h3></div></div>' +
      '<p class="desc">' + esc(ev.desc) + '</p>' +
      '<div class="dx-meta">' + statusPill(ev.status) + '<span class="dx-pill">' + ev.type + '</span><span class="dx-pill">' + ev.date + '</span><span class="dx-pill">' + ev.mode + '</span></div>' +
      '<div class="dx-foot">' + action + '</div></article>';
  }
  function eventsList() {
    const q = evQuery.trim().toLowerCase();
    const list = EVENTS.filter((e) => (evFilter === 'All' || e.type === evFilter) && (!q || (e.name + ' ' + e.tag + ' ' + e.type).toLowerCase().indexOf(q) !== -1));
    return list.length ? list.map(eventCard).join('') : '<p class="dx-empty">No events match your search.</p>';
  }
  function viewEvents() {
    const types = ['All', 'Hackathon', 'Quiz', 'Workshop', 'Pitch'];
    return head('Discover / Hackathons', 'Events.', 'Find hackathons, quizzes and workshops, then join the ones you like.') +
      '<div class="dx-bar"><input class="input" id="evSearch" placeholder="Search events" value="' + esc(evQuery) + '" autocomplete="off">' +
      types.map((t) => '<button class="chip' + (t === evFilter ? ' active' : '') + '" data-act="filter" data-id="' + t + '" type="button">' + t + '</button>').join('') +
      '<span class="dx-count">' + String(EVENTS.length).padStart(2, '0') + '</span></div>' +
      '<div class="dx-ev-grid" id="evList">' + eventsList() + '</div>';
  }

  function viewMyEvents() {
    const mine = EVENTS.filter((e) => joined.indexOf(e.id) !== -1);
    let body = mine.map((ev) => {
      const isRebuild = ev.id === 'rebuild';
      const rounds = isRebuild
        ? '<div class="dx-rounds"><div class="dx-round done"><b>Round 1: Recreate</b><small>Done</small></div><div class="dx-round live"><b>Round 2: Rebuild</b><small>Live until 8 PM</small></div><div class="dx-round"><b>Round 3: Interview</b><small>Shortlist only</small></div></div>'
        : '<p class="dx-note">Registered. The organisers will post the schedule here.</p>';
      return '<article class="card dx-me"><div class="dx-me-head"><span class="dx-ic">' + ev.init + '</span><div><p class="label">CampusCode presents</p><h3>' + esc(ev.name) + '</h3></div></div>' +
        '<div class="dx-me-meta"><span>Status: <b>Registered</b></span><span>Team: <b>' + (isRebuild ? esc(team) : 'Individual') + '</b></span><span>Dates: <b>' + ev.date + '</b></span></div>' + rounds +
        '<div class="dx-foot"><span class="dx-pill lime">CERTIFICATE FOR WINNERS</span><button class="btn ghost sm" data-act="leave" data-id="' + ev.id + '" type="button">Leave event</button></div></article>';
    }).join('');
    if (!mine.length) body = '<p class="dx-empty">You have not joined any events yet.</p><button class="btn" data-go="events" type="button">Browse events &rarr;</button>';
    return head('My activity / Live data', 'My events.', 'Every event you joined in one place, with its rounds and your team.') + body;
  }

  function peopleList() {
    const q = hmQuery.trim().toLowerCase();
    const list = PEOPLE.filter((p) => !q || (p.name + ' ' + p.id + ' ' + p.college + ' ' + p.skills.join(' ')).toLowerCase().indexOf(q) !== -1);
    return list.length ? list.map((p) => {
      const on = invited.indexOf(p.id) !== -1;
      return '<article class="card dx-person"><span class="dx-av">' + initials(p.name) + '</span><h3>' + p.name + '</h3><p class="sm-id">' + p.id + ' &middot; ' + p.college + '</p>' +
        '<div class="dx-meta">' + p.skills.map((s) => '<span class="dx-pill">' + s + '</span>').join('') + '</div>' +
        '<button class="btn ' + (on ? 'ghost ' : '') + 'sm" data-act="invite" data-id="' + p.id + '" type="button">' + (on ? 'Invited' : 'Invite to team') + '</button></article>';
    }).join('') : '<p class="dx-empty">No students match that search.</p>';
  }
  function viewHackmate() {
    return head('AI tools / Team finder', 'HackMate.', 'Find teammates by skill, college or CampusCode ID. ReBuild is individual, so invites are for team events. These are sample profiles.') +
      '<div class="dx-bar"><input class="input" id="hmSearch" placeholder="Search by skill, college or ID" value="' + esc(hmQuery) + '" autocomplete="off"><span class="dx-count">' + String(PEOPLE.length).padStart(2, '0') + '</span></div>' +
      '<div class="dx-people" id="hmList">' + peopleList() + '</div>';
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function scoreIdea(text) {
    const lower = text.toLowerCase();
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const h = hash(lower);
    const detail = Math.min(1, words / 60);
    const hits = ['student', 'campus', 'college', 'ai', 'community', 'mentor', 'team', 'learn', 'track', 'certificate', 'project'].filter((k) => lower.indexOf(k) !== -1).length;
    const mk = (shift, base) => Math.max(35, Math.min(96, Math.round(base + ((h >> shift) & 15) - 8)));
    const originality = mk(1, 48 + detail * 28 + hits * 2);
    const feasibility = mk(5, 52 + detail * 24);
    const impact = mk(9, 46 + detail * 20 + hits * 3);
    const overall = Math.round((originality + feasibility + impact) / 3);
    const tips = [];
    if (words < 25) tips.push('Describe the problem and your solution in 2-3 sentences.');
    if (hits < 2) tips.push('Say who it is for: students, organisers or mentors.');
    tips.push('Name one result you can measure, such as hours saved or sign-ups.');
    const verdict = overall >= 75 ? 'Strong idea. Ready to submit.' : overall >= 60 ? 'Promising. Add a little more detail.' : 'Needs more detail before you submit.';
    return { originality, feasibility, impact, overall, tips, verdict };
  }
  function meter(label, v) {
    return '<div class="dx-meter"><div class="dx-meter-top"><span>' + label + '</span><b>' + v + '</b></div><div class="dx-meter-bar"><i style="width:' + v + '%"></i></div></div>';
  }
  function ideaOut() {
    if (!ideaResult) return '<p class="dx-empty">Write your idea and press Check idea to see a score.</p>';
    const r = ideaResult;
    return '<p class="label">Overall</p><div class="dx-score">' + r.overall + '<span class="label"> / 100</span></div><p style="margin:8px 0 14px;font-weight:600">' + r.verdict + '</p>' +
      meter('Originality', r.originality) + meter('Feasibility', r.feasibility) + meter('Impact', r.impact) +
      '<ul class="dx-tips">' + r.tips.map((t) => '<li>' + t + '</li>').join('') + '</ul>' +
      '<p class="dx-note">Demo screening: scored in your browser from the text you wrote. No AI model is called.</p>';
  }
  function viewIdeacheck() {
    return head('AI tools / Idea screening', 'IdeaCheck.', 'Paste your idea and get a quick screening score with tips.') +
      '<div class="dx-idea"><section class="card"><p class="label">Your idea</p>' +
      '<textarea class="input" id="ideaText" placeholder="Example: A campus app that matches students with mentors for their hackathon projects..."></textarea>' +
      '<div class="dx-actions"><button class="btn" data-act="idea" type="button">Check idea &rarr;</button></div></section>' +
      '<section class="card" id="ideaOut">' + ideaOut() + '</section></div>';
  }

  function viewCertificates() {
    const certs = [
      ['Participation Certificate', "Issued to every participant of ReBuild '26.", 'Issues Tue 10 Nov 2026', 'file-badge'],
      ['Winner Certificate', 'For the winner of ReBuild \'26, together with the CampusCode internship.', 'Winners only', 'trophy'],
      ['Runner-up Certificate', "For the runner-up of ReBuild '26.", 'Runner-up only', 'medal']
    ];
    return head('Me / Recognition', 'Certificates.', 'Verifiable certificates with a QR code are issued by CampusCode after each event.') +
      '<div class="dx-grid-3">' + certs.map((c) =>
        '<article class="card dx-cert locked">' + icon(c[3]).replace('<i ', '<i class="big" ') + '<h3>' + c[0] + '</h3><p>' + c[1] + '</p><span class="dx-pill">' + c[2] + '</span></article>'
      ).join('') + '</div>' +
      '<p class="dx-note" style="margin-top:20px">Certificates appear here once they are issued. You have 0 certificates so far.</p>';
  }

  function viewCard() {
    return head('Me / Student pass', 'Digital card.', 'Your Student pass. Click the card to flip it and show the QR code.') +
      '<div class="dx-id-wrap"><div class="dx-id-col"><div class="dx-flip" id="flip" data-act="flip" role="button" tabindex="0" aria-label="Flip your ID card"><div class="dx-flip-inner">' +
      '<div class="dx-face front"><div class="idcard-top"><img src="/img/campuscode-logo.png" alt="CampusCode"><span class="label">Student pass</span></div>' +
      '<div class="idcard-body"><div class="idcard-name">' + esc(student.name) + '</div><div class="idcard-id">' + esc(student.id) + '</div><div class="idcard-id">' + esc(student.college) + '</div><span class="idcard-chip">ARENA ACCESS</span></div>' +
      '<div class="idcard-bar"><div class="bars"></div><span class="label">Build / Compete / Ship</span></div></div>' +
      '<div class="dx-face back"><div class="dx-qr">' + qrHtml(student.id) + '</div><span class="label">Demo QR for ' + esc(student.id) + '</span></div>' +
      '</div></div><p class="label" style="margin-top:18px">Click the card to flip it</p></div>' +
      '<section class="card"><p class="label">Card details</p><dl class="dx-dl" style="margin-top:10px">' +
      '<div><dt>Name</dt><dd>' + esc(student.name) + '</dd></div><div><dt>CampusCode ID</dt><dd>' + esc(student.id) + '</dd></div>' +
      '<div><dt>Role</dt><dd>Student</dd></div><div><dt>College</dt><dd>' + esc(student.college) + '</dd></div>' +
      '<div><dt>Email</dt><dd>' + esc(student.email || 'Not set') + '</dd></div><div><dt>Team</dt><dd>' + esc(team) + '</dd></div></dl>' +
      '<div class="dx-actions"><button class="btn" data-act="copy" type="button">Copy my ID</button><button class="btn ghost" data-go="profile" type="button">Edit details</button></div></section></div>';
  }
  function rngFrom(text) {
    let a = hash(text);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function finder(r, c, r0, c0) {
    const dr = r - r0, dc = c - c0;
    if (dr < 0 || dc < 0 || dr > 6 || dc > 6) return null;
    return dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
  }
  function qrHtml(seed) {
    const rand = rngFrom(seed);
    let html = '';
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        let on;
        let f = finder(r, c, 0, 0);
        if (f === null) f = finder(r, c, 0, 14);
        if (f === null) f = finder(r, c, 14, 0);
        if (f !== null) on = f;
        else if ((r <= 7 && c <= 7) || (r <= 7 && c >= 13) || (r >= 13 && c <= 7)) on = false;
        else on = rand() > 0.5;
        html += '<i' + (on ? ' class="on"' : '') + '></i>';
      }
    }
    return html;
  }

  function chatHtml() {
    return chat.map((m) => '<div class="dx-msg ' + (m.from === 'me' ? 'me' : 'bot') + '">' + esc(m.text) + '</div>').join('');
  }
  function viewRulebot() {
    return head('AI tools / Rules help', 'RuleBot.', "Ask about the ReBuild '26 rules, schedule, prizes and brand guidelines.") +
      '<section class="card dx-chat"><div class="dx-chat-head">' + icon('bot') + '<b>RuleBot</b><span class="dx-pill lime">DEMO</span></div>' +
      '<div class="dx-msgs" id="msgs">' + chatHtml() + '</div>' +
      '<div class="dx-chips">' + ASK.map((q) => '<button class="chip" data-act="ask" data-q="' + esc(q) + '" type="button">' + esc(q) + '</button>').join('') + '</div>' +
      '<div class="dx-chat-in"><input class="input" id="chatIn" placeholder="Ask a question..." autocomplete="off"><button class="btn" data-act="send" type="button">Send</button></div></section>';
  }
  function answer(q) {
    const text = q.toLowerCase();
    const hit = RULES.find((r) => r.k.test(text));
    return hit ? hit.a : "I only know the ReBuild '26 rules in this demo. Try asking about deadlines, fonts and colours, submission, judging, prizes or the AI code limit.";
  }
  function ask(q) {
    q = q.trim();
    if (!q) return;
    chat.push({ from: 'me', text: q });
    const box = $('#msgs');
    if (box) { box.innerHTML = chatHtml(); box.scrollTop = box.scrollHeight; }
    setTimeout(() => {
      chat.push({ from: 'bot', text: answer(q) });
      const b = $('#msgs');
      if (b) { b.innerHTML = chatHtml(); b.scrollTop = b.scrollHeight; }
    }, 350);
  }

  function accordion(items) {
    return '<div class="dx-acc">' + items.map((it, i) =>
      '<details' + (i === 0 ? ' open' : '') + '><summary><span class="num">' + String(i + 1).padStart(2, '0') + '</span>' + esc(it[0]) + '</summary><div class="body">' + esc(it[1]) + '</div></details>'
    ).join('') + '</div>';
  }
  function viewGuide() {
    return head('Help / Handbook', 'Student guide.', 'Everything you need to find events, join them, submit and get recognised.') + accordion(GUIDE);
  }

  function viewOfficial() {
    return head('Help / Announcements', 'Official communication.', 'Announcements from the CampusCode team. Updates also arrive first in the WhatsApp group.') +
      '<div class="dx-news">' + NEWS.map((n) =>
        '<article class="card dx-news-item"><span class="when">' + n.when + '</span><div><h3>' + n.title + '</h3><p>' + n.text + '</p></div><span class="dx-pill">' + n.tag + '</span></article>'
      ).join('') + '</div>';
  }

  function viewNotifications() {
    return head('Help / Inbox', 'Notifications.', unread() ? 'You have ' + unread() + ' unread.' : 'You are all caught up.') +
      '<div class="dx-actions" style="margin:0 0 16px"><button class="btn ghost sm" data-act="readall" type="button">Mark all as read</button></div>' +
      '<div class="dx-news">' + NOTES.map((n) => {
        const isUnread = readIds.indexOf(n.id) === -1;
        return '<button class="card dx-note-item' + (isUnread ? ' unread' : '') + '" data-act="read" data-id="' + n.id + '" type="button"><span class="nd"></span><div><h3>' + n.title + '</h3><p>' + n.text + '</p></div><span class="when">' + n.when + '</span></button>';
      }).join('') + '</div>';
  }

  function viewHelp() {
    return head('Help / Support', 'Help and support.', 'Common questions, and a way to reach the CampusCode team.') +
      '<div class="dx-grid-2"><div>' + accordion(FAQ) + '</div>' +
      '<section class="card"><p class="label">Contact support</p><h2 class="dx-card-title">Send a message</h2>' +
      '<div class="dx-field"><label for="hSubject">Topic</label><select class="input" id="hSubject"><option>Account and login</option><option>Events and joining</option><option>Submission problem</option><option>Certificates</option></select></div>' +
      '<div class="dx-field" style="margin-top:14px"><label for="hMsg">Message</label><textarea class="input" id="hMsg" placeholder="Tell us what happened"></textarea><p class="dx-err" id="hErr"></p></div>' +
      '<div class="dx-actions"><button class="btn" data-act="send-help" type="button">Send</button><a class="btn ghost" href="mailto:support@campuscode.co.in">Email support</a></div>' +
      '<p class="dx-note">Demo: this form does not send anything. Email support@campuscode.co.in for real help.</p></section></div>';
  }

  function viewProfile() {
    return head('Me / Account', 'Profile.', 'Edit your details. They are saved in this browser and shown across the dashboard.') +
      '<section class="card"><div class="dx-form">' +
      field('Full name', 'pName', student.name === 'Student' ? '' : student.name, 'Aarav Sharma') +
      field('Email address', 'pEmail', student.email, 'you@college.edu') +
      field('College', 'pCollege', student.college === 'CampusCode student' ? '' : student.college, 'VIT Pune') +
      field('Team name (for tracking)', 'pTeam', team, 'Your team name') +
      '<div class="dx-field"><label>Role</label><input class="input" value="Student" readonly></div>' +
      '<div class="dx-field"><label>CampusCode ID</label><input class="input" value="' + esc(student.id) + '" readonly></div></div>' +
      '<p class="dx-err" id="pErr"></p>' +
      '<div class="dx-actions"><button class="btn" data-act="save" type="button">Save changes</button><button class="btn ghost" data-act="reset" type="button">Reset demo data</button></div></section>';
  }
  function field(label, id, value, ph) {
    return '<div class="dx-field"><label for="' + id + '">' + label + '</label><input class="input" id="' + id + '" value="' + esc(value) + '" placeholder="' + ph + '" autocomplete="off"></div>';
  }

  const RENDER = {
    overview: viewOverview, events: viewEvents, 'my-events': viewMyEvents, hackmate: viewHackmate, ideacheck: viewIdeacheck,
    rulebot: viewRulebot, certificates: viewCertificates, 'digital-card': viewCard, profile: viewProfile,
    guide: viewGuide, official: viewOfficial, notifications: viewNotifications, help: viewHelp
  };

  // ---------- Render and navigate ----------
  function render() {
    const view = $('#view');
    view.innerHTML = (RENDER[current] || viewOverview)();
    view.classList.remove('enter');
    void view.offsetWidth;
    view.classList.add('enter');
    renderNav();
    renderChrome();
    drawIcons();
    const msgs = $('#msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    window.scrollTo(0, 0);
  }
  function go(id) {
    if (!RENDER[id]) id = 'overview';
    current = id;
    save('cc_view', id);
    if (location.hash !== '#' + id) { location.hash = id; }
    render();
  }

  // ---------- Events ----------
  document.addEventListener('click', (e) => {
    const goEl = e.target.closest('[data-go]');
    if (goEl) { go(goEl.dataset.go); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const id = el.dataset.id;

    if (act === 'join' && joined.indexOf(id) === -1) { joined.push(id); save('cc_joined', joined); toast('Joined. See it in My Events.'); render(); }
    else if (act === 'leave') { joined = joined.filter((x) => x !== id); save('cc_joined', joined); toast('You left the event.'); render(); }
    else if (act === 'filter') { evFilter = id; render(); }
    else if (act === 'invite') {
      invited = invited.indexOf(id) === -1 ? invited.concat(id) : invited.filter((x) => x !== id);
      save('cc_invited', invited); $('#hmList').innerHTML = peopleList();
    }
    else if (act === 'idea') {
      const text = $('#ideaText').value;
      if (text.trim().length < 10) { toast('Write a little more about your idea first.'); return; }
      ideaResult = scoreIdea(text); $('#ideaOut').innerHTML = ideaOut();
    }
    else if (act === 'flip') { $('#flip').classList.toggle('flipped'); }
    else if (act === 'copy') {
      const done = () => toast('ID copied: ' + student.id);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(student.id).then(done, () => toast(student.id));
      else toast(student.id);
    }
    else if (act === 'ask') { ask(el.dataset.q); }
    else if (act === 'send') { const i = $('#chatIn'); const q = i.value; i.value = ''; ask(q); }
    else if (act === 'read') { if (readIds.indexOf(id) === -1) { readIds.push(id); save('cc_read', readIds); } render(); }
    else if (act === 'readall') { readIds = NOTES.map((n) => n.id); save('cc_read', readIds); toast('All notifications marked as read.'); render(); }
    else if (act === 'send-help') {
      const msg = $('#hMsg');
      if (msg.value.trim().length < 5) { $('#hErr').textContent = 'Write a short message first.'; return; }
      msg.value = ''; $('#hErr').textContent = ''; toast('Demo only: nothing was sent. Email support@campuscode.co.in.');
    }
    else if (act === 'save') {
      const name = $('#pName').value.trim();
      const email = $('#pEmail').value.trim();
      const err = $('#pErr');
      if (name.length < 2) { err.textContent = 'Enter your full name.'; return; }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Enter a valid email address.'; return; }
      student = { name: name, email: email, college: $('#pCollege').value.trim() || 'CampusCode student', id: student.id };
      team = $('#pTeam').value.trim() || 'Team LUNA';
      save('cc_student', student); save('cc_team', team);
      toast('Profile saved.'); render();
    }
    else if (act === 'reset') {
      ['cc_joined', 'cc_read', 'cc_invited', 'cc_team'].forEach((k) => { try { localStorage.removeItem(k); } catch (er) {} });
      joined = ['rebuild']; readIds = []; invited = []; team = 'Team LUNA'; chat = chat.slice(0, 1); ideaResult = null;
      toast('Demo data reset.'); render();
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'evSearch') { evQuery = e.target.value; $('#evList').innerHTML = eventsList(); }
    if (e.target.id === 'hmSearch') { hmQuery = e.target.value; $('#hmList').innerHTML = peopleList(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'chatIn' && e.key === 'Enter') { e.preventDefault(); const q = e.target.value; e.target.value = ''; ask(q); }
    if (e.target.id === 'flip' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.classList.toggle('flipped'); }
  });
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id && id !== current && RENDER[id]) { current = id; save('cc_view', id); render(); }
  });
  $('#logout').addEventListener('click', () => {
    try { localStorage.removeItem('cc_session'); } catch (e) {}
    window.location.href = '/login';
  });

  // ---------- Start ----------
  const fromHash = location.hash.replace('#', '');
  current = RENDER[fromHash] ? fromHash : (RENDER[load('cc_view', '')] ? load('cc_view', '') : 'overview');
  render();
})();