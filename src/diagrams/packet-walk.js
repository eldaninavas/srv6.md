// One packet walks a pre-rendered sequence diagram message by message, in
// the order the diagram reads (Mermaid emits message lines in that order).
// Inlined by hooks/diagrams.py after the SVG, with __ID__ replaced by its id.
// No library; stops when off screen, in a hidden tab, or detached by instant
// navigation; does nothing when the reader prefers reduced motion.
(function () {
  var svg = document.getElementById('__ID__');
  if (!svg || svg.dataset.walk) return;
  svg.dataset.walk = '1';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var steps = [].slice.call(svg.querySelectorAll('.messageLine0, .messageLine1')).map(function (el) {
    var len = el.getTotalLength();
    return { el: el, len: len, dur: Math.max(0.7, len / 170) };
  });
  if (!steps.length) return;
  var PAUSE = 0.35;
  var REST = 1.2;
  var total = REST;
  steps.forEach(function (s) {
    s.start = total - REST;
    total += s.dur + PAUSE;
  });
  var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('r', '6');
  dot.setAttribute('class', 'srv6-seq__packet');
  dot.style.display = 'none';
  svg.appendChild(dot);
  var clock = 0;
  var last = 0;
  var frame = 0;
  var visible = false;

  function draw() {
    var t = clock % total;
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      if (t >= s.start && t < s.start + s.dur + PAUSE) {
        var p = s.el.getPointAtLength(Math.min(1, (t - s.start) / s.dur) * s.len);
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        dot.style.display = '';
        return;
      }
    }
    dot.style.display = 'none';
  }

  function tick(now) {
    if (!svg.isConnected) return stop();
    clock += Math.min(0.1, (now - last) / 1000);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!svg.isConnected) {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    }
  }

  function sync() {
    var run = visible && !document.hidden && !motion.matches && svg.isConnected;
    if (run && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!run && frame) stop();
    if (motion.matches) dot.style.display = 'none';
  }

  var io = new IntersectionObserver(function (entries) {
    visible = entries.some(function (e) {
      return e.isIntersecting;
    });
    sync();
  });
  io.observe(svg);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
})();
