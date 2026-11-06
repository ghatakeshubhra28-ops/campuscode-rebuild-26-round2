// tilt.js - the ID card on the landing page follows the mouse in 3D

var stage = document.querySelector('.stage');
var card = document.querySelector('.idcard');

stage.addEventListener('mousemove', function (e) {
  var r = card.getBoundingClientRect();
  var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
  var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
  card.classList.add('tilting');
  card.style.transform = 'rotateY(' + (dx * 22) + 'deg) rotateX(' + (-dy * 22) + 'deg) scale(1.03)';
});

stage.addEventListener('mouseleave', function () {
  card.classList.remove('tilting');
  card.style.transform = '';
});