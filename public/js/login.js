// login.js - slide your ID into the reader to log in

var form = document.getElementById('loginForm');
var emailIn = document.getElementById('email');
var passIn = document.getElementById('password');
var card = document.getElementById('loginCard');
var led = document.getElementById('led');
var readerText = document.getElementById('readerText');
var panel = document.getElementById('panel');
var busy = false;

// If this person registered earlier in this browser, we know their details.
var stored = null;
try { stored = JSON.parse(localStorage.getItem('cc_student')); } catch (e) {}

function matchesStored(email) {
  return stored && stored.email && stored.email.toLowerCase() === email.trim().toLowerCase();
}

// "aarav.sharma@vit.edu" becomes "Aarav Sharma".
function nameFromEmail(email) {
  var part = email.split('@')[0].replace(/[._\-\d]+/g, ' ').trim();
  if (!part) return 'Your name here';
  return part.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
}

function clearErrors() {
  document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
  document.querySelectorAll('.input.bad').forEach(function (i) { i.classList.remove('bad'); });
}

// Show an error, light the reader red and shake the panel.
function reject(field, errId, msg) {
  document.getElementById(errId).textContent = msg;
  field.classList.add('bad');
  led.className = 'led bad';
  readerText.textContent = 'Check your details';
  panel.classList.remove('shake');
  void panel.offsetWidth;
  panel.classList.add('shake');
}

// The card shows a name as soon as you type your email.
emailIn.addEventListener('input', function () {
  var value = emailIn.value.trim();
  if (matchesStored(value)) {
    document.getElementById('cardName').textContent = stored.name;
    document.getElementById('cardId').textContent = stored.id;
    document.getElementById('cardCollege').textContent = stored.college;
  } else {
    document.getElementById('cardName').textContent = value.indexOf('@') > 0 ? nameFromEmail(value) : 'Your name here';
    document.getElementById('cardId').textContent = 'CC-2026-0000';
    document.getElementById('cardCollege').textContent = 'CampusCode student';
  }
});

// Typing again resets the reader light.
form.addEventListener('input', function () {
  if (busy) return;
  led.className = 'led';
  readerText.textContent = 'Insert your ID';
});

// Show or hide the password.
var toggle = document.getElementById('togglePw');
toggle.addEventListener('click', function () {
  var hidden = passIn.type === 'password';
  passIn.type = hidden ? 'text' : 'password';
  toggle.textContent = hidden ? 'Hide' : 'Show';
});

// "Forgot password?" is not part of this demo, so we say so.
document.getElementById('forgot').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('hint').textContent = 'Password reset is not part of this demo.';
});

// The login itself.
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (busy) return;
  clearErrors();

  var email = emailIn.value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return reject(emailIn, 'err-email', 'Enter a valid email address.');
  if (passIn.value.length < 6) return reject(passIn, 'err-password', 'Use at least 6 characters.');

  busy = true;
  document.getElementById('loginBtn').textContent = 'Scanning...';

  // Remember who is logged in. We never save the password.
  var student = matchesStored(email) ? stored : {
    name: nameFromEmail(email),
    email: email,
    college: 'CampusCode student',
    id: 'CC-2026-' + (1000 + Math.floor(Math.random() * 9000))
  };
  try {
    localStorage.setItem('cc_student', JSON.stringify(student));
    localStorage.setItem('cc_session', 'on');
  } catch (err) {}

  // 1. The reader starts reading and the card slides in.
  led.className = 'led reading';
  readerText.textContent = 'Reading...';
  setTimeout(function () { card.classList.add('insert'); }, 200);

  // 2. Access granted.
  setTimeout(function () {
    led.className = 'led ok';
    readerText.textContent = 'Access granted';
    var chip = document.getElementById('cardChip');
    chip.textContent = 'ARENA ACCESS';
    chip.classList.remove('pending');
  }, 1200);

  // 3. Go to the dashboard.
  setTimeout(function () { window.location.href = '/student'; }, 2000);
});