// login.js - slide your ID into the reader to log in

var form = document.getElementById('loginForm');
var emailIn = document.getElementById('email');
var passIn = document.getElementById('password');
var card = document.getElementById('loginCard');
var led = document.getElementById('led');
var readerText = document.getElementById('readerText');
var panel = document.getElementById('panel');
var hint = document.getElementById('hint');
var DEFAULT_HINT = hint ? hint.textContent : '';
var busy = false;

// IDs that were issued in this browser (saved by the Register page).
var accounts = {};
try { accounts = JSON.parse(localStorage.getItem('cc_accounts')) || {}; } catch (e) {}
var lastStudent = null;
try { lastStudent = JSON.parse(localStorage.getItem('cc_student')); } catch (e) {}

// Find the ID that belongs to this email, if there is one.
function findAccount(email) {
  var key = email.trim().toLowerCase();
  if (accounts[key]) return accounts[key];
  if (lastStudent && lastStudent.email && lastStudent.email.toLowerCase() === key) return lastStudent;
  return null;
}
function haveAnyAccount() {
  return Object.keys(accounts).length > 0 || !!(lastStudent && lastStudent.email);
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

// The card shows the registered name as soon as the email matches.
emailIn.addEventListener('input', function () {
  var value = emailIn.value.trim();
  var acct = findAccount(value);
  if (acct) {
    document.getElementById('cardName').textContent = acct.name;
    document.getElementById('cardId').textContent = acct.id;
    document.getElementById('cardCollege').textContent = acct.college;
    if (hint) hint.textContent = DEFAULT_HINT;
  } else {
    document.getElementById('cardName').textContent = value.indexOf('@') > 0 ? nameFromEmail(value) : 'Your name here';
    document.getElementById('cardId').textContent = 'CC-2026-0000';
    document.getElementById('cardCollege').textContent = 'CampusCode student';
    var looksComplete = /^\S+@\S+\.\S+$/.test(value);
    if (hint) {
      hint.textContent = (looksComplete && haveAnyAccount())
        ? 'No ID found for this email on this device. Use the email you registered with.'
        : DEFAULT_HINT;
    }
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
  if (hint) hint.textContent = 'Password reset is not part of this demo.';
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

  // Use the registered ID for this email. Otherwise make a demo ID. We never save the password.
  var student = findAccount(email) || {
    name: nameFromEmail(email),
    email: email,
    college: 'CampusCode student',
    id: 'CC-2026-' + (1000 + Math.floor(Math.random() * 9000))
  };
  try {
    accounts[email.toLowerCase()] = student;
    localStorage.setItem('cc_accounts', JSON.stringify(accounts));
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