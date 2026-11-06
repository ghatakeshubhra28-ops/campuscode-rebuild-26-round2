// fx.js - effects shared by every page

(function () {
  var glow = document.querySelector('.cursor-glow');
  var x = window.innerWidth / 2, y = window.innerHeight / 2;
  var gx = x, gy = y;

  // 1. Track the mouse and feed the position to the spotlight grids.
  document.addEventListener('mousemove', function (e) {
    x = e.clientX;
    y = e.clientY;
    document.querySelectorAll('.spot').forEach(function (el) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // 2. The glow follows the mouse a little late, which feels smooth.
  function follow() {
    gx += (x - gx) * 0.12;
    gy += (y - gy) * 0.12;
    if (glow) glow.style.transform = 'translate(' + (gx - 180) + 'px,' + (gy - 180) + 'px)';
    requestAnimationFrame(follow);
  }
  follow();

  // 3. Reveal elements when they scroll into view.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.on-scroll').forEach(function (el) { io.observe(el); });

    // 4. Count numbers up when they scroll into view.
  var counter = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = Number(el.dataset.count);
      var start = null;
      function step(t) {
        if (!start) start = t;
        var progress = Math.min((t - start) / 900, 1);
        el.textContent = Math.round(target * progress);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counter.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { counter.observe(el); }); })();
