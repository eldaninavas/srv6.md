// Home page hero: an SRv6 fabric built act by act (src/diagrams/hero-scene.json):
// leaf-spine fabric, IS-IS locators, Flex-Algo 128 plane, BGP services with a
// VPN SID and a uSID packet, then the AI act (MRC: static uSID spraying, a
// link fails, the other paths carry on). hooks/diagrams.py renders the first
// frame as static SVG; this replaces it once the page has loaded.
//
// One clock. React state changes only when the act changes (CSS classes do
// the fades); moving things are drawn imperatively in the portal layer.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, ViewportPortal, Handle, Position, useReactFlow, useStore } from '@xyflow/react';
import scene from './hero-scene.json';
import { ICONS } from './icons.mjs';

const KIND_ICON = { spine: 'switch', leaf: 'switch', pe: 'router', gpu: 'gpu' };
const DURATION = [5.5, 7.5, 6.5, 9, 10]; // seconds per act
const STARTS = DURATION.map((_, i) => DURATION.slice(0, i).reduce((a, b) => a + b, 0));
const TOTAL = DURATION.reduce((a, b) => a + b, 0);
// Scene margin, same as the static frame's viewBox (hooks/diagrams.py).
const PAD = { desktop: 20, mobile: 10 };
const MRC_FAIL_AT = 4.5; // seconds into the AI act

// What each act shows (a class on the stage); `still` is the reduced-motion
// summary: the whole built fabric at once.
const LAYERS = [
  [],
  ['show-loc'],
  ['show-loc', 'show-algo', 'show-flex'],
  ['show-loc', 'show-algo', 'show-flex', 'show-bgp'],
  ['show-gpu', 'show-mrc'],
];
const STILL = ['show-loc', 'show-algo', 'show-flex', 'show-bgp', 'show-gpu'];

const motionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const hidden = { opacity: 0, pointerEvents: 'none' };
const handles = [
  { type: 'target', position: Position.Top, x: 0, y: 0, width: 1, height: 1 },
  { type: 'source', position: Position.Bottom, x: 0, y: 0, width: 1, height: 1 },
];

function HeroNode({ data }) {
  const { w, h, label, kind, loc, algo, i } = data;
  return (
    <div className={`srv6-hero__node srv6-flow__card is-${kind}`} style={{ width: w, height: h, '--i': i }}>
      <div className="srv6-flow__content has-icon">
        <svg className="srv6-flow__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d={ICONS[KIND_ICON[kind]]} />
        </svg>
        <div className="srv6-flow__label">{label}</div>
      </div>
      {loc && <div className="srv6-hero__loc">{loc}</div>}
      {algo && <div className="srv6-hero__loc is-algo">{algo}</div>}
      <Handle type="target" position={Position.Top} style={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={hidden} isConnectable={false} />
    </div>
  );
}

function HeroLink({ data }) {
  const { a, b, tags, failed, i } = data;
  const cls = ['srv6-hero__link', ...tags.map((t) => `is-${t}`), failed ? 'is-failed' : ''].join(' ');
  return (
    <g className={cls} style={{ '--i': i }}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} pathLength="1" />
    </g>
  );
}

const nodeTypes = { hero: HeroNode };
const edgeTypes = { hero: HeroLink };

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// Position along a polyline of node centres, f in [0, 1], equal time per hop.
function along(points, f) {
  const hops = points.length - 1;
  const k = Math.min(hops - 1, Math.floor(f * hops));
  return { ...lerp(points[k], points[k + 1], f * hops - k), hop: k };
}

function bgpArc(from, to, depth) {
  const c = { x: (from.x + to.x) / 2, y: Math.max(from.y, to.y) + depth };
  return {
    d: `M${from.x},${from.y}Q${c.x},${c.y} ${to.x},${to.y}`,
    at: (t) => ({
      x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * c.x + t ** 2 * to.x,
      y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * c.y + t ** 2 * to.y,
    }),
  };
}

function Hero({ host, acts }) {
  // Same breakpoint as the static frame (custom.css), so the swap is seamless.
  const narrow = () => window.matchMedia('(max-width: 599px)').matches;
  const [variant, setVariant] = useState(narrow() ? 'mobile' : 'desktop');
  const s = scene[variant];
  const [act, setAct] = useState(0);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [still, setStill] = useState(() => motionQuery().matches);
  const { fitBounds } = useReactFlow();
  const layer = useRef(null);
  const clock = useRef(0);
  // The static frame already shows the built fabric, so the first pass skips
  // fabric's build-up; it plays from the first loop on (or on a jump to it).
  const rebuild = useRef(false);

  const byId = useMemo(() => new Map(s.nodes.map((n) => [n.id, n])), [s]);
  const nodes = useMemo(
    () =>
      s.nodes.map((n, i) => ({
        id: n.id,
        type: 'hero',
        position: { x: n.x - s.node.w / 2, y: n.y - s.node.h / 2 },
        width: s.node.w,
        height: s.node.h,
        handles,
        data: { ...n, w: s.node.w, h: s.node.h, i },
      })),
    [s],
  );
  const failKey = s.mrc.fail.join('-');
  const edges = useMemo(
    () =>
      s.links.map(([a, b, ...tags], i) => ({
        id: `${a}-${b}`,
        source: a,
        target: b,
        type: 'hero',
        data: { a: byId.get(a), b: byId.get(b), tags, i, failed: failed && [`${a}-${b}`, `${b}-${a}`].includes(failKey) },
      })),
    [s, byId, failed, failKey],
  );

  const fit = useCallback(
    () => {
      const p = PAD[variant];
      fitBounds({ x: -p, y: -p, width: s.width + 2 * p, height: s.height + 2 * p }, { padding: 0 });
    },
    [fitBounds, s, variant],
  );

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setVariant(narrow() ? 'mobile' : 'desktop');
      requestAnimationFrame(fit);
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [host, fit]);

  // Refit whenever React Flow has measured a new size for itself (it does so
  // after the host resizes, so fitting on the host's resize alone is early).
  const rfWidth = useStore((st) => st.width);
  const rfHeight = useStore((st) => st.height);
  useEffect(() => {
    if (!rfWidth || !rfHeight) return undefined;
    const id = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(id);
  }, [fit, variant, rfWidth, rfHeight]);

  // ------------------------------------------------------------ moving parts
  const engine = useMemo(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const pts = (ids) => ids.map((id) => byId.get(id));
    const arc = bgpArc(byId.get(s.bgp.from), byId.get(s.bgp.to), s.bgp.depth);
    const links = s.links.map(([a, b, ...tags]) => ({ a: byId.get(a), b: byId.get(b), tags }));
    const failA = byId.get(s.mrc.fail[0]);
    const failB = byId.get(s.mrc.fail[1]);
    let svg = null;
    let html = null;
    const pool = { pulse: [], packet: [] };
    const take = (kind, n) => {
      while (pool[kind].length <= n) {
        const c = document.createElementNS(NS, kind === 'pulse' ? 'circle' : 'rect');
        if (kind === 'pulse') c.setAttribute('r', '4');
        else Object.entries({ x: -8, y: -4.5, width: 16, height: 9, rx: 4.5 }).forEach(([k, v]) => c.setAttribute(k, v));
        c.setAttribute('class', kind === 'pulse' ? 'srv6-hero__pulse' : 'srv6-flow__packet');
        svg.appendChild(c);
        pool[kind].push(c);
      }
      return pool[kind][n];
    };
    const put = (el, p, extra = '') => {
      el.setAttribute('transform', `translate(${p.x} ${p.y})${extra}`);
      el.style.display = '';
    };
    let sid;
    let da;
    let fault;
    let arcPath;

    function draw(t, act) {
      if (!svg) return;
      let pulses = 0;
      let packets = 0;
      const lt = t - STARTS[act];
      sid.style.display = 'none';
      da.style.display = 'none';
      fault.style.display = 'none';
      arcPath.classList.toggle('is-on', act === 3);

      if (act === 1) {
        // IS-IS: every router floods its LSP to its neighbours, in waves.
        links.forEach((l, i) => {
          if (l.tags.includes('mrc')) return;
          for (const [from, to, delay] of [[l.a, l.b, 0], [l.b, l.a, 0.35]]) {
            const f = (lt - 0.6 - (i % 6) * 0.18 - delay) / 0.9;
            if (f > 0 && f < 1) put(take('pulse', pulses++), lerp(from, to, f));
          }
        });
      }
      if (act === 3) {
        // BGP: PE-B advertises its VPN SID to PE-A, then a packet follows it.
        const f = (lt - 0.6) / 1.8;
        if (f > 0 && f < 1) {
          const p = arc.at(f);
          sid.style.display = '';
          sid.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        }
        const g = (lt - 2.8) / 4.8;
        if (g > 0 && g < 1) {
          const path = pts(s.packet.path);
          const p = along(path, g);
          put(take('packet', packets++), p);
          da.style.display = '';
          da.style.transform = `translate(${p.x}px, ${p.y - 26}px) translate(-50%, -100%)`;
          const text = g > 0.97 ? s.packet.da[s.packet.da.length - 1] : `DA ${s.packet.da[p.hop]}`;
          if (da.textContent !== text) da.textContent = text;
        }
      }
      if (act === 4) {
        // MRC: the NIC sprays over static uSID paths; one link fails, its path
        // stops being used, the others carry on.
        const failAt = MRC_FAIL_AT;
        s.mrc.paths.forEach((ids, k) => {
          const path = pts(ids);
          const hops = path.length - 1;
          const hitsFault = ids.some((id, j) => j && [ids[j - 1], id].sort().join() === [s.mrc.fail[0], s.mrc.fail[1]].sort().join());
          const faultHop = ids.findIndex((id, j) => j && [ids[j - 1], id].sort().join() === [s.mrc.fail[0], s.mrc.fail[1]].sort().join());
          for (let n = 0; n < 6; n++) {
            const born = 0.8 + k * 0.32 + n * 1.35;
            const f = (lt - born) / 2.6;
            if (f <= 0 || f >= 1) continue;
            if (hitsFault && lt >= failAt) {
              if (born > failAt) continue; // the NIC no longer uses this path
              const reach = born + (faultHop - 0.5) / hops * 2.6; // time it gets to the fault
              if (reach > failAt && f * hops > faultHop - 0.5) continue; // dropped there
            }
            put(take('packet', packets++), along(path, f));
          }
        });
        if (lt >= failAt) {
          fault.style.display = '';
          const m = lerp(failA, failB, 0.5);
          fault.setAttribute('transform', `translate(${m.x} ${m.y})`);
        }
      }
      for (let i = pulses; i < pool.pulse.length; i++) pool.pulse[i].style.display = 'none';
      for (let i = packets; i < pool.packet.length; i++) pool.packet[i].style.display = 'none';
    }

    return {
      attach(svgEl, htmlEl) {
        svg = svgEl;
        html = htmlEl;
        svg.replaceChildren();
        html.replaceChildren();
        pool.pulse = [];
        pool.packet = [];
        arcPath = document.createElementNS(NS, 'path');
        arcPath.setAttribute('d', arc.d);
        arcPath.setAttribute('class', 'srv6-hero__bgp');
        svg.appendChild(arcPath);
        fault = document.createElementNS(NS, 'g');
        fault.setAttribute('class', 'srv6-flow__fault');
        fault.innerHTML = '<circle r="10"></circle><path d="M-4.5,-4.5L4.5,4.5M-4.5,4.5L4.5,-4.5"></path>';
        svg.appendChild(fault);
        fault.style.display = 'none';
        sid = document.createElement('div');
        sid.className = 'srv6-hero__sid';
        sid.style.display = 'none';
        sid.textContent = `VPN SID ${s.bgp.sid} · ${s.bgp.behavior}`;
        da = document.createElement('div');
        da.className = 'srv6-hero__da';
        da.style.display = 'none';
        html.append(sid, da);
      },
      draw,
    };
  }, [s, byId]);

  // The clock: runs while playing, on screen, in a visible tab, with motion.
  useEffect(() => {
    const motion = motionQuery();
    let frame = 0;
    let last = 0;
    let visible = true;
    let current = -1;
    const tick = (now) => {
      const next = clock.current + Math.min(0.1, (now - last) / 1000);
      if (next >= TOTAL) rebuild.current = true;
      clock.current = next % TOTAL;
      last = now;
      const t = clock.current;
      let a = 0;
      while (a + 1 < STARTS.length && t >= STARTS[a + 1]) a++;
      if (a !== current) {
        current = a;
        setAct(a);
        setFailed(false);
      }
      if (a === 4 && t - STARTS[4] >= MRC_FAIL_AT) setFailed(true);
      engine.draw(t, a);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      setStill(motion.matches);
      const run = playing && visible && !document.hidden && !motion.matches;
      if (run && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      sync();
    });
    io.observe(host);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
    };
  }, [engine, playing, host]);

  const jump = (i) => {
    rebuild.current = true;
    clock.current = STARTS[i] + 0.001;
    setAct(i);
    setFailed(false);
    if (still) engine.draw(clock.current, i);
  };

  const layers = still ? STILL : LAYERS[act];
  const a = acts[act];
  const svgRef = useCallback((el) => el && layer.current && engine.attach(el, layer.current), [engine]);

  return (
    <div
      style={{ '--hero-font': `${s.node.font}px`, '--hero-chip': `${s.node.chip}px` }}
      className={`srv6-hero-scene ${layers.join(' ')} ${act === 0 && !still && rebuild.current ? 'is-building' : ''} ${still ? 'is-still' : ''}`}>
      <div className="srv6-hero__flow">
      <ReactFlow
        key={variant}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={fit}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <ViewportPortal>
          <div className="srv6-hero__layer" ref={layer} />
          <svg ref={svgRef} className="srv6-hero__fx" width="1" height="1" aria-hidden="true" />
        </ViewportPortal>
      </ReactFlow>
      </div>
      <div className="srv6-hero__bar">
        <div className="srv6-hero__caption" aria-live="polite">
          <span className="srv6-hero__step">
            {act + 1}/{acts.length}
          </span>
          <strong>{a.title}</strong>
          <span className="srv6-hero__note">{a.note}</span>
          <a href={a.href}>Learn more →</a>
        </div>
        <div className="srv6-hero__controls">
          <button
            type="button"
            className="srv6-hero__play"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause animation' : 'Play animation'}
            title={playing ? 'Pause' : 'Play'}
            disabled={still}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={playing && !still ? 'M14 19h4V5h-4M6 19h4V5H6z' : 'M8 5.14v14l11-7z'} />
            </svg>
          </button>
          {acts.map((x, i) => (
            <button
              key={x.id}
              type="button"
              className={`srv6-hero__dot${i === act ? ' is-on' : ''}`}
              onClick={() => jump(i)}
              aria-label={`${i + 1}. ${x.title}`}
              aria-current={i === act ? 'step' : undefined}
              title={x.title}
            >
              <span>{x.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const heroActs = scene.acts;
export { Hero };
