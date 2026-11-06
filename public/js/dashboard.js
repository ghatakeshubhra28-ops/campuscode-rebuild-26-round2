// dashboard.js - flip ID card, journey and events

// Who is logged in? Falls back to a default if nobody registered in this browser.
var student = { name: 'Student', email: '', college: 'CampusCode student', id: 'CC-2026-0000' };
try {
  var saved = JSON.parse(localStorage.getItem('cc_student'));
  if (saved && saved.name) student = saved;
} catch (e) {}

var initials = student.name.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
document.getElementById('firstName').textContent = student.name.split(' ')[0];
document.getElementById('avatar').textContent = initials;
document.getElementById('userName').textContent = student.name;
document.getElementById('cardName').textContent = student.name;
document.getElementById('cardId').textContent = student.id;
document.getElementById('cardCollege').textContent = student.college;
document.getElementById('qrId').textContent = student.id;

// Flip the ID card.
var flip = document.getElementById('flip');
function toggleFlip() { flip.classList.toggle('flipped'); }
flip.addEventListener('click', toggleFlip);
flip.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(); }
});

// A decorative QR pattern made from the student ID (demo only, not a real QR code).
function rngFrom(text) {
  var h = 2166136261;
  for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  var a = h >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function finder(r, c, r0, c0) {
  var dr = r - r0, dc = c - c0;
  if (dr < 0 || dc < 0 || dr > 6 || dc > 6) return null;
  var edge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
  var core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
  return edge || core;
}
function buildQr() {
  var rand = rngFrom(student.id);
  var html = '';
  for (var r = 0; r < 21; r++) {
    for (var c = 0; c < 21; c++) {
      var on;
      var f = finder(r, c, 0, 0);
      if (f === null) f = finder(r, c, 0, 14);
      if (f === null) f = finder(r, c, 14, 0);
      if (f !== null) on = f;
      else if ((r <= 7 && c <= 7) || (r <= 7 && c >= 13) || (r >= 13 && c <= 7)) on = false;
      else on = rand() > 0.5;
      html += '<i' + (on ? ' class="on"' : '') + '></i>';
    }
  }
  document.getElementById('qr').innerHTML = html;
}
buildQr();

// Events (mock data).
var EVENTS = [
  { id: 'rebuild', tag: 'Web development', name: "ReBuild '26", meta: '06-07 Nov 2026 · Individual', desc: 'Recreate and rebuild the CampusCode dashboard. Individual hackathon, frontend only.' },
  { id: 'fc2', tag: 'Open innovation', name: "FirstCommit '26 Quiz Competition 2.0", meta: 'Quiz · Open to all', desc: 'A quick quiz round on coding and tech basics.' },
  { id: 'fc1', tag: 'Open innovation', name: "FirstCommit '26 Quiz Competition", meta: 'Quiz · Open to all', desc: 'The first edition of the FirstCommit quiz.' }
];

var joined = ['rebuild'];
try {
  var stored = JSON.parse(localStorage.getItem('cc_joined'));
  if (Array.isArray(stored)) joined = stored;
} catch (e) {}
function saveJoined() {
  try { localStorage.setItem('cc_joined', JSON.stringify(joined)); } catch (e) {}
}

var view = 'all';
var grid = document.getElementById('evGrid');

function cardHtml(ev) {
  var isJoined = joined.indexOf(ev.id) !== -1;
  var foot = isJoined
    ? '<span class="tag-joined">JOINED</span><button class="btn ghost" data-act="leave" data-id="' + ev.id + '">Leave</button>'
    : '<span class="label">Open</span><button class="btn" data-act="join" data-id="' + ev.id + '">Join now &rarr;</button>';
  return '<article class="card ev">' +
    '<p class="label">' + ev.tag + '</p>' +
    '<h3>' + ev.name + '</h3>' +
    '<p class="label">' + ev.meta + '</p>' +
    '<p>' + ev.desc + '</p>' +
    '<div class="ev-foot">' + foot + '</div>' +
    '</article>';
}

function render() {
  var list = EVENTS.filter(function (ev) { return view === 'all' || joined.indexOf(ev.id) !== -1; });
  grid.innerHTML = list.length
    ? list.map(cardHtml).join('')
    : '<p class="empty">You have not joined any events yet. Open Events and press Join now.</p>';
  document.getElementById('tabAll').classList.toggle('active', view === 'all');
  document.getElementById('tabMine').classList.toggle('active', view === 'mine');
  document.getElementById('tabMine').textContent = 'My events (' + joined.length + ')';
}

document.getElementById('tabAll').addEventListener('click', function () { view = 'all'; render(); });
document.getElementById('tabMine').addEventListener('click', function () { view = 'mine'; render(); });

grid.addEventListener('click', function (e) {
  var btn = e.target.closest('button[data-act]');
  if (!btn) return;
  var id = btn.dataset.id;
  if (btn.dataset.act === 'join' && joined.indexOf(id) === -1) joined.push(id);
  if (btn.dataset.act === 'leave') joined = joined.filter(function (x) { return x !== id; });
  saveJoined();
  render();
});

render();

// Log out.
document.getElementById('logout').addEventListener('click', function () {
  try { localStorage.removeItem('cc_session'); } catch (e) {}
  window.location.href = '/login';
});