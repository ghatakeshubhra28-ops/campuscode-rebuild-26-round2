// register.js - 3-step sign up. The ID card fills in live.

var nameIn = document.getElementById('name');
var emailIn = document.getElementById('email');
var collegeIn = document.getElementById('college');
var passIn = document.getElementById('password');
var ageIn = document.getElementById('age');
var otpBoxes = document.querySelectorAll('.otp input');
var panes = document.querySelectorAll('.pane');
var segs = document.querySelectorAll('.seg');
var card = document.getElementById('card');

// Make a random student ID and show it on the card.
var studentId = 'CC-2026-' + (1000 + Math.floor(Math.random() * 9000));
document.getElementById('cardId').textContent = studentId;

// Show one pane and update the progress bar.
function show(step) {
  panes.forEach(function (p) { p.classList.toggle('active', Number(p.dataset.step) === step); });
  segs.forEach(function (s) { s.classList.toggle('on', Number(s.dataset.seg) <= step); });
}

// Show an error under a field.
function fail(field, errId, msg) {
  document.getElementById(errId).textContent = msg;
  if (field) field.classList.add('bad');
  return false;
}
function clearErrors() {
  document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
  document.querySelectorAll('.input.bad').forEach(function (i) { i.classList.remove('bad'); });
}

// The card updates while you type.
nameIn.addEventListener('input', function () {
  document.getElementById('cardName').textContent = nameIn.value.trim() || 'Your name here';
});
collegeIn.addEventListener('input', function () {
  document.getElementById('cardCollege').textContent = collegeIn.value.trim() || 'Your college';
});

// Step 1
document.getElementById('next1').addEventListener('click', function () {
  clearErrors();
  if (nameIn.value.trim().length < 2) return fail(nameIn, 'err-name', 'Enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(emailIn.value.trim())) return fail(emailIn, 'err-email', 'Enter a valid email address.');
  show(2);
});

// Step 2
document.getElementById('back2').addEventListener('click', function () { show(1); });
document.getElementById('next2').addEventListener('click', function () {
  clearErrors();
  if (collegeIn.value.trim().length < 2) return fail(collegeIn, 'err-college', 'Enter your college name.');
  if (passIn.value.length < 8) return fail(passIn, 'err-password', 'Use at least 8 characters.');
  if (!ageIn.checked) return fail(null, 'err-age', 'Confirm that you are 18 or older.');
  show(3);
  otpBoxes[0].focus();
});

// Show or hide the password.
var toggle = document.getElementById('togglePw');
toggle.addEventListener('click', function () {
  var hidden = passIn.type === 'password';
  passIn.type = hidden ? 'text' : 'password';
  toggle.textContent = hidden ? 'Hide' : 'Show';
});

// Step 3: the six boxes. Typing a digit jumps to the next box.
otpBoxes.forEach(function (box, i) {
  box.addEventListener('input', function () {
    box.value = box.value.replace(/\D/g, '');
    if (box.value && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
  });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && !box.value && i > 0) otpBoxes[i - 1].focus();
  });
});

document.getElementById('back3').addEventListener('click', function () { show(2); });
document.getElementById('verify').addEventListener('click', function () {
  clearErrors();
  var code = Array.prototype.map.call(otpBoxes, function (b) { return b.value; }).join('');
  if (code.length < 6) return fail(null, 'err-otp', 'Enter the 6-digit code.');

  // Save the student in the browser. We never save the password.
  var student = {
    name: nameIn.value.trim(),
    email: emailIn.value.trim(),
    college: collegeIn.value.trim(),
    id: studentId
  };
  try { localStorage.setItem('cc_student', JSON.stringify(student)); } catch (e) {}

  // Press the stamp on the card.
  card.classList.add('issued');
  var chip = document.getElementById('cardChip');
  chip.textContent = 'ARENA ACCESS';
  chip.classList.remove('pending');

  document.getElementById('doneText').textContent =
    'Welcome, ' + student.name.split(' ')[0] + '. Your ID is ' + studentId + '.';
  show(4);
});