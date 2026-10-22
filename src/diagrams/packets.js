// Packets on converted flowcharts: edges marked `e1@{ animate: true }` in the
// Mermaid source carry a stream of packets, and a pilot.json scenario can
// fail links and move the stream onto backup links.
//
// One clock per diagram. Packet k leaves its source at k*GAP (+ a per-source
// phase, so several sources take turns, like per-packet spraying), and every
// edge starts where its upstream path ends. So a packet reaching a node moves
// on to the next edge, and copies leave a replicating node together.
// A failure is a window [tf, tr) on that clock:
//   fail    - packets that enter after tf are not sent; those in flight drop at the X
//   idle    - carry only packets that got past the fault before it happened
//   reroute - carry the packets that reach the repair point while it is down
// Imperative on purpose: it moves a few dozen SVG nodes per frame.

const NS = 'http://www.w3.org/2000/svg';
const GAP = 90; // flow px between packets
const SPEED = { slow: 60, normal: 95, fast: 140 }; // flow px per second
const DROP = 0.5; // seconds a dropped packet stays at the fault
const STILL = 4.2; // clock value drawn when motion is reduced

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)');

// Where on a link the X goes: mid-link, or the nearest point towards the
// source that is clear of the edge label (labels sit mid-link).
function faultAt(path, len, e) {
  const box = e.labelBox;
  const clear = (t) => {
    if (!box) return true;
    const p = path.getPointAtLength(t * len);
    const m = 14;
    return p.x < box.x - m || p.x > box.x + box.width + m || p.y < box.y - m || p.y > box.y + box.height + m;
  };
  for (let t = 0.5; t > 0.05; t -= 0.02) if (clear(t)) return t * len;
  return 0.5 * len;
}

export function hasPackets(diagram) {
  return diagram.edges.some((e) => e.animate) || (diagram.scenarios || []).some((s) => s.reroute.length);
}

// Start distance of every stream edge: longest upstream path, plus a phase
// per source so that sources alternate.
function offsets(streams) {
  const into = new Map();
  for (const s of streams) into.set(s.target, (into.get(s.target) || 0) + 1);
  const sources = [...new Set(streams.map((s) => s.source))].filter((n) => !into.has(n));
  const at = new Map(sources.map((n, i) => [n, (i * GAP) / sources.length]));
  const pending = new Map(into);
  const queue = [...sources];
  const done = new Set();
  while (queue.length) {
    const n = queue.shift();
    for (const s of streams) {
      if (s.source !== n || done.has(s)) continue;
      done.add(s);
      s.o = at.get(n);
      const reach = s.o + s.usable;
      at.set(s.target, Math.max(at.get(s.target) ?? 0, reach));
      pending.set(s.target, pending.get(s.target) - 1);
      if (pending.get(s.target) === 0) queue.push(s.target);
    }
  }
  for (const s of streams) if (!done.has(s)) s.o = at.get(s.source) ?? 0; // cycles
}

function el(name, attrs, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent.appendChild(node);
  return node;
}

export function createSim({ svg, diagram, host, pathFor, trimEnd }) {
  const scenarios = diagram.scenarios || [];
  const backup = new Set(scenarios.flatMap((s) => s.reroute));
  const level = diagram.edges.find((e) => e.animate)?.animate;
  const v = SPEED[level] || SPEED.normal;

  const streams = diagram.edges
    .filter((e) => (e.animate || backup.has(e.id)) && e.points.length >= 2 && e.stroke !== 'invisible')
    .map((e) => {
      const path = el('path', { d: pathFor(e), fill: 'none', stroke: 'none' }, svg);
      const len = path.getTotalLength();
      const usable = Math.max(1, len - (e.end !== 'none' ? trimEnd : 0));
      const group = el('g', { class: 'srv6-flow__packets', 'data-edge': e.id }, svg);
      return { id: e.id, source: e.source, target: e.target, path, usable, fault: faultAt(path, usable, e), group, pool: [], backupOnly: !e.animate };
    });
  offsets(streams);
  const byId = new Map(streams.map((s) => [s.id, s]));

  const plans = scenarios.map((sc) => {
    const roles = new Map();
    for (const id of sc.fail) roles.set(id, 'fail');
    for (const id of sc.idle) roles.set(id, 'idle');
    for (const id of sc.reroute) roles.set(id, 'reroute');
    const first = byId.get(sc.fail[0]);
    const repair = sc.reroute.map((id) => byId.get(id)).filter(Boolean);
    const markers = sc.fail.map((id) => {
      const s = byId.get(id) || { path: null };
      const edge = diagram.edges.find((e) => e.id === id);
      const probe = s.path || el('path', { d: pathFor(edge), fill: 'none', stroke: 'none' }, svg);
      const p = probe.getPointAtLength(s.path ? s.fault : faultAt(probe, probe.getTotalLength(), edge));
      const g = el('g', { class: 'srv6-flow__fault', transform: `translate(${p.x} ${p.y})`, style: 'display:none' }, svg);
      el('circle', { r: 9 }, g);
      el('path', { d: 'M-4,-4L4,4M-4,4L4,-4' }, g);
      return g;
    });
    return {
      roles,
      markers,
      oFault: first ? first.o + first.fault : 0,
      oRepair: repair.length ? Math.min(...repair.map((s) => s.o)) : 0,
    };
  });

  let clock = 0;
  let last = 0;
  let frame = 0;
  let visible = false;
  let current = null; // index of the scenario in play (active or draining)
  let tf = Infinity;
  let tr = Infinity;
  const motion = reduced();

  const inWindow = (t) => t >= tf && t < tr;

  function packet(s, n) {
    if (!s.pool[n]) s.pool[n] = el('rect', { class: 'srv6-flow__packet', x: -8, y: -4.5, width: 16, height: 9, rx: 4.5 }, s.group);
    return s.pool[n];
  }

  function draw() {
    const plan = current === null ? null : plans[current];
    const active = plan && tr === Infinity;
    for (const p of plans) for (const m of p.markers) m.style.display = p === plan && active ? '' : 'none';
    const head = clock * v;
    for (const s of streams) {
      const role = plan?.roles.get(s.id);
      let n = 0;
      if (!s.backupOnly || role === 'reroute') {
        const kmin = Math.ceil((head - s.o - s.usable - DROP * v) / GAP);
        const kmax = Math.floor((head - s.o) / GAP);
        for (let k = kmin; k <= kmax; k++) {
          const x = head - k * GAP - s.o;
          let at = x;
          let drop = 0;
          if (role === 'reroute') {
            if (!inWindow((k * GAP + plan.oRepair) / v)) continue;
          } else if (role === 'fail') {
            if (inWindow((k * GAP + s.o) / v)) continue;
            if (inWindow((k * GAP + plan.oFault) / v) && x >= s.fault) {
              drop = (x - s.fault) / (DROP * v);
              if (drop > 1) continue;
              at = s.fault;
            }
          } else if (role === 'idle') {
            if (inWindow((k * GAP + plan.oFault) / v)) continue;
          }
          if (!drop && x > s.usable) continue;
          const p = s.path.getPointAtLength(at);
          const q = s.path.getPointAtLength(Math.min(at + 1, s.usable));
          const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          const node = packet(s, n++);
          node.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle})`);
          node.setAttribute('class', drop ? 'srv6-flow__packet is-drop' : 'srv6-flow__packet');
          node.style.opacity = drop ? String(1 - drop) : '';
          node.style.display = '';
        }
      }
      for (let i = n; i < s.pool.length; i++) s.pool[i].style.display = 'none';
    }
  }

  function tick(now) {
    clock += Math.min(0.1, (now - last) / 1000);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  // Runs only while on screen, in a visible tab, with motion allowed.
  function sync() {
    const run = visible && !document.hidden && !motion.matches;
    if (run && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (motion.matches) {
      clock = STILL;
      draw();
    }
  }

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    sync();
  });
  io.observe(host);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  draw();

  return {
    // index: scenario to fail, or null to restore. With reduced motion the
    // new state shows at once instead of draining.
    setScenario(index) {
      const still = motion.matches;
      if (index !== null) {
        current = index;
        tf = still ? clock - 1000 : clock;
        tr = Infinity;
      } else if (current !== null) {
        tr = still ? clock - 999 : clock;
      }
      draw();
    },
    setDim(dim) {
      for (const s of streams) s.group.classList.toggle('is-dim', !!dim && dim.has(s.id));
    },
    destroy() {
      cancelAnimationFrame(frame);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
      svg.replaceChildren();
    },
  };
}
