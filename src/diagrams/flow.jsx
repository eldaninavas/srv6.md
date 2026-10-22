// React Flow view for flowcharts converted at build time (tools/diagrams/).
// Layout and edge routes are precomputed, so this only draws: no layout
// library ships to the browser. Mounted on every .srv6-flow placeholder;
// Material's instant navigation re-runs this script on each page swap.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  EdgeLabelRenderer,
  ViewportPortal,
  useReactFlow,
} from '@xyflow/react';
import xyCss from '@xyflow/react/dist/style.css';
import flowCss from './flow.css';
import { createSim, hasPackets } from './packets.js';

// ---------------------------------------------------------------- color mode

function subscribeScheme(cb) {
  const mo = new MutationObserver(cb);
  mo.observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
  return () => mo.disconnect();
}
const getScheme = () => (document.body.getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'light');
const useColorMode = () => useSyncExternalStore(subscribeScheme, getScheme);

const coarse = () => window.matchMedia('(pointer: coarse)').matches;

// -------------------------------------------------------------------- shapes

function outline(shape, w, h) {
  const s = 1; // half the stroke, keeps the outline inside the box
  switch (shape) {
    case 'round':
      return <rect x={s} y={s} width={w - 2 * s} height={h - 2 * s} rx="5" />;
    case 'stadium':
      return <rect x={s} y={s} width={w - 2 * s} height={h - 2 * s} rx={(h - 2 * s) / 2} />;
    case 'circle':
      return <circle cx={w / 2} cy={h / 2} r={w / 2 - s} />;
    case 'doublecircle':
      return (
        <>
          <circle cx={w / 2} cy={h / 2} r={w / 2 - s} />
          <circle cx={w / 2} cy={h / 2} r={w / 2 - 5} />
        </>
      );
    case 'diamond':
      return <polygon points={`${w / 2},${s} ${w - s},${h / 2} ${w / 2},${h - s} ${s},${h / 2}`} />;
    case 'hexagon': {
      const m = h / 2;
      return <polygon points={`${m},${s} ${w - m},${s} ${w - s},${h / 2} ${w - m},${h - s} ${m},${h - s} ${s},${h / 2}`} />;
    }
    case 'subroutine':
      return (
        <>
          <rect x={s} y={s} width={w - 2 * s} height={h - 2 * s} />
          <path d={`M8,${s}V${h - s}M${w - 8},${s}V${h - s}`} />
        </>
      );
    case 'cylinder': {
      const ry = 8;
      const rx = w / 2 - s;
      return (
        <path
          d={`M${s},${ry}A${rx},${ry} 0 0 1 ${w - s},${ry}V${h - ry}A${rx},${ry} 0 0 1 ${s},${h - ry}Z` +
            `M${s},${ry}A${rx},${ry} 0 0 0 ${w - s},${ry}`}
        />
      );
    }
    case 'odd':
      return <polygon points={`${s},${s} ${w - s},${s} ${w - s},${h - s} ${s},${h - s} ${h / 4},${h / 2}`} />;
    case 'lean_right':
      return <polygon points={`${h / 4},${s} ${w - s},${s} ${w - h / 4},${h - s} ${s},${h - s}`} />;
    case 'lean_left':
      return <polygon points={`${s},${s} ${w - h / 4},${s} ${w - s},${h - s} ${h / 4},${h - s}`} />;
    case 'trapezoid':
      return <polygon points={`${h / 4},${s} ${w - h / 4},${s} ${w - s},${h - s} ${s},${h - s}`} />;
    case 'inv_trapezoid':
      return <polygon points={`${s},${s} ${w - s},${s} ${w - h / 4},${h - s} ${h / 4},${h - s}`} />;
    default:
      return <rect x={s} y={s} width={w - 2 * s} height={h - 2 * s} />;
  }
}

const shapeStyle = (style) =>
  style && {
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    strokeDasharray: style.strokeDasharray,
  };

function Lines({ lines }) {
  return lines.map((line, i) => (
    <span key={i} className="srv6-flow__line">
      {line || ' '}
    </span>
  ));
}

const hidden = { opacity: 0, pointerEvents: 'none' };

function ShapeNode({ data }) {
  const { w, h, shape, label, style, href } = data;
  const text = <Lines lines={label} />;
  return (
    <div className="srv6-flow__node" style={{ width: w, height: h }}>
      <svg className="srv6-flow__shape" width={w} height={h} style={shapeStyle(style)} aria-hidden="true">
        {outline(shape, w, h)}
      </svg>
      <div className="srv6-flow__label" style={style?.color ? { color: style.color } : undefined}>
        {href ? <a href={href}>{text}</a> : text}
      </div>
      <Handle type="target" position={Position.Top} style={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={hidden} isConnectable={false} />
    </div>
  );
}

function ClusterNode({ data }) {
  const { w, h, label, style } = data;
  return (
    <div className="srv6-flow__group" style={{ width: w, height: h, ...shapeStyle(style), background: style?.fill }}>
      <div className="srv6-flow__group-label">
        <Lines lines={label} />
      </div>
      <Handle type="target" position={Position.Top} style={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={hidden} isConnectable={false} />
    </div>
  );
}

// --------------------------------------------------------------------- edges

const ARROW = 10;

// Orthogonal polyline with rounded corners through ELK's points.
function roundedPath(pts, r = 8) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(x - px, y - py);
    const d2 = Math.hypot(nx - x, ny - y);
    const k = Math.min(r, d1 / 2, d2 / 2);
    const ax = x - ((x - px) / d1) * k;
    const ay = y - ((y - py) / d1) * k;
    const bx = x + ((nx - x) / d2) * k;
    const by = y + ((ny - y) / d2) * k;
    d += `L${ax},${ay}Q${x},${y} ${bx},${by}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d}L${lx},${ly}`;
}

// ELK can repeat a point (a control point on its end point). Harmless in a
// Bézier, but it would divide by zero in roundedPath.
const distinct = (pts) => pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.01);

// The nearest point that gives a direction away from pts[i] (for markers).
function away(pts, i, step) {
  for (let j = i + step; j >= 0 && j < pts.length; j += step) {
    if (Math.hypot(pts[j][0] - pts[i][0], pts[j][1] - pts[i][1]) > 0.5) return pts[j];
  }
  return pts[i + step] || pts[i];
}

// ELK spline sections: start point, then (control, control, end) triples.
function splinePath(pts) {
  if ((pts.length - 1) % 3 !== 0) return roundedPath(distinct(pts));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 3) {
    d += `C${pts[i][0]},${pts[i][1]} ${pts[i + 1][0]},${pts[i + 1][1]} ${pts[i + 2][0]},${pts[i + 2][1]}`;
  }
  return d;
}

// Pulls an end point back along its segment so the line stops at the marker.
function trim(pts, atEnd, by) {
  const p = pts.map((q) => [...q]);
  const a = atEnd ? p.length - 1 : 0;
  const [bx, by2] = away(pts, a, atEnd ? -1 : 1);
  const len = Math.hypot(bx - p[a][0], by2 - p[a][1]) || 1;
  const k = Math.min(by, len / 2) / len;
  p[a][0] += (bx - p[a][0]) * k;
  p[a][1] += (by2 - p[a][1]) * k;
  return p;
}

function Marker({ kind, tip, from }) {
  if (kind === 'none') return null;
  const dx = tip[0] - from[0];
  const dy = tip[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  if (kind === 'circle') {
    return <circle className="srv6-flow__marker" cx={tip[0] - ux * 5} cy={tip[1] - uy * 5} r="4.5" />;
  }
  if (kind === 'cross') {
    const cx = tip[0] - ux * 6;
    const cy = tip[1] - uy * 6;
    const s = 4.5;
    return (
      <path
        className="srv6-flow__marker srv6-flow__marker--cross"
        d={`M${cx - s},${cy - s}L${cx + s},${cy + s}M${cx - s},${cy + s}L${cx + s},${cy - s}`}
      />
    );
  }
  const bx = tip[0] - ux * ARROW;
  const by = tip[1] - uy * ARROW;
  const hw = ARROW * 0.45;
  return (
    <polygon
      className="srv6-flow__marker"
      points={`${tip[0]},${tip[1]} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`}
    />
  );
}

function RoutedEdge({ data }) {
  const { curve, stroke, start, end, label, labelBox, className } = data;
  const points = curve === 'spline' && (data.points.length - 1) % 3 === 0 ? data.points : distinct(data.points);
  if (points.length < 2 || stroke === 'invisible') return null;
  let line = points;
  if (end !== 'none') line = trim(line, true, ARROW - 2);
  if (start !== 'none') line = trim(line, false, ARROW - 2);
  const last = points.length - 1;
  return (
    <>
      <g className={`srv6-flow__edge srv6-flow__edge--${stroke} ${className || ''}`}>
        <path d={curve === 'spline' ? splinePath(line) : roundedPath(line)} fill="none" />
        <Marker kind={end} tip={points[last]} from={away(points, last, -1)} />
        <Marker kind={start} tip={points[0]} from={away(points, 0, 1)} />
      </g>
      {label && labelBox && (
        <EdgeLabelRenderer>
          <div
            className={`srv6-flow__edge-label ${className || ''}`}
            style={{
              transform: `translate(${labelBox.x}px, ${labelBox.y}px)`,
              width: labelBox.width,
              height: labelBox.height,
            }}
          >
            <Lines lines={label} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Not 'group': React Flow ships default padding/border styles for that type.
// Handles declared up front (React Flow's SSR path) so edges draw without
// waiting for DOM measurement, e.g. inside a closed content tab.
const handles = (w, h) => [
  { type: 'target', position: Position.Top, x: w / 2, y: 0, width: 1, height: 1 },
  { type: 'source', position: Position.Bottom, x: w / 2, y: h - 1, width: 1, height: 1 },
];

const nodeTypes = { shape: ShapeNode, cluster: ClusterNode };
const edgeTypes = { routed: RoutedEdge };

// ------------------------------------------------------------------- diagram

function toFlow(diagram) {
  const nodes = [
    ...diagram.groups.map((g) => ({
      id: g.id,
      type: 'cluster',
      position: { x: g.x, y: g.y },
      parentId: g.parent,
      width: g.width,
      height: g.height,
      handles: handles(g.width, g.height),
      zIndex: -1,
      data: { w: g.width, h: g.height, label: g.label, style: g.style },
    })),
    ...diagram.nodes.map((n) => ({
      id: n.id,
      type: 'shape',
      position: { x: n.x, y: n.y },
      parentId: n.parent,
      width: n.width,
      height: n.height,
      handles: handles(n.width, n.height),
      data: { w: n.width, h: n.height, shape: n.shape, label: n.label, style: n.style, href: n.href },
    })),
  ];
  const edges = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'routed',
    zIndex: 1,
    data: { ...e },
  }));
  return { nodes, edges };
}

const edgePath = (e) => (e.curve === 'spline' ? splinePath(e.points) : roundedPath(distinct(e.points)));

// Packets and fault markers, in flow coordinates above the edges. The portal
// target only exists after React Flow's first render, hence the callback ref.
function PacketLayer({ diagram, host, simRef }) {
  const [svg, setSvg] = useState(null);
  useEffect(() => {
    if (!svg) return undefined;
    const sim = createSim({ svg, diagram, host, pathFor: edgePath, trimEnd: ARROW });
    simRef.current = sim;
    return () => {
      sim.destroy();
      simRef.current = null;
    };
  }, [svg, diagram, host, simRef]);
  return (
    <ViewportPortal>
      <svg ref={setSvg} className="srv6-flow__packet-layer" width="1" height="1" aria-hidden="true" />
    </ViewportPortal>
  );
}

const SCENARIO_CLASS = { fail: 'is-failed', idle: 'is-idle', reroute: 'is-reroute' };

// Fit the whole laid-out area (edge labels can stick out past the nodes, which
// is all fitView looks at). hooks/diagrams.py sizes the view to the same box
// (FIT_PAD), so the inline fit lands at zoom <= 1, like Mermaid's SVG.
function bounds(diagram, full) {
  const p = full ? 24 : 8;
  return { x: -p, y: -p, width: diagram.width + 2 * p, height: diagram.height + 2 * p };
}

const ICONS = {
  out: 'M19 13H5v-2h14v2Z',
  in: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2Z',
  fit: 'M5 5h5v2H7v3H5V5m9 0h5v5h-2V7h-3V5m3 9h2v5h-5v-2h3v-3m-7 3v2H5v-5h2v3h3Z',
  full: 'M10 21v-2H6.41l4.5-4.5-1.41-1.41-4.5 4.5V14H3v7h7m4.5-10.09 4.5-4.5V10h2V3h-7v2h3.59l-4.5 4.5 1.41 1.41Z',
  bolt: 'M11 15H6l7-14v8h5l-7 14v-8Z',
  restore: 'M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8Z',
  exit: 'M19.5 3.09 15 7.59V4h-2v7h7V9h-3.59l4.5-4.5-1.41-1.41M4 13v2h3.59l-4.5 4.5 1.41 1.41 4.5-4.5V20h2v-7H4Z',
};

function Tool({ icon, label, onClick }) {
  return (
    <button type="button" className="srv6-flow__tool" onClick={onClick} title={label} aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={ICONS[icon]} />
      </svg>
    </button>
  );
}

function Diagram({ diagram, host, noteSlot }) {
  const base = useMemo(() => toFlow(diagram), [diagram]);
  const [hover, setHover] = useState(null);
  const [full, setFull] = useState(false);
  const colorMode = useColorMode();
  const { fitBounds, zoomIn, zoomOut } = useReactFlow();
  const fit = useCallback(() => fitBounds(bounds(diagram, full)), [fitBounds, diagram, full]);
  const touch = useMemo(coarse, []);

  const scenarios = useMemo(() => diagram.scenarios || [], [diagram]);
  const [failed, setFailed] = useState(null); // index of the scenario whose links are down
  const sim = useRef(null);
  const animated = useMemo(() => hasPackets(diagram) || scenarios.length > 0, [diagram, scenarios.length]);

  const { nodes, edges, dimEdges } = useMemo(() => {
    const roles = new Map();
    const sc = failed === null ? null : scenarios[failed];
    if (sc) for (const key of ['fail', 'idle', 'reroute']) for (const id of sc[key]) roles.set(id, SCENARIO_CLASS[key]);
    if (!hover && !sc) return { ...base, dimEdges: null };
    const hot = new Set([hover]);
    const hotEdges = new Set();
    for (const e of base.edges) {
      if (hover && (e.source === hover || e.target === hover)) {
        hot.add(e.source);
        hot.add(e.target);
        hotEdges.add(e.id);
      }
    }
    const lit = (e) => (hover ? (hotEdges.has(e.id) ? 'is-hot' : 'is-dim') : '');
    return {
      nodes: hover
        ? base.nodes.map((n) => (n.type === 'cluster' ? n : { ...n, className: hot.has(n.id) ? 'is-hot' : 'is-dim' }))
        : base.nodes,
      edges: base.edges.map((e) => ({
        ...e,
        data: { ...e.data, className: `${lit(e)} ${roles.get(e.id) || ''}`.trim() },
      })),
      dimEdges: hover ? new Set(base.edges.filter((e) => !hotEdges.has(e.id)).map((e) => e.id)) : null,
    };
  }, [base, hover, failed, scenarios]);

  useEffect(() => sim.current?.setDim(dimEdges), [dimEdges]);

  const toggleScenario = useCallback(
    (i) => {
      const next = failed === i ? null : i;
      setFailed(next);
      sim.current?.setScenario(next);
    },
    [failed],
  );

  // Native fullscreen where the element supports it (not iPhone Safari);
  // otherwise a fixed overlay.
  const toggleFull = useCallback(() => {
    if (document.fullscreenElement === host) document.exitFullscreen();
    else if (host.requestFullscreen && !full) host.requestFullscreen().catch(() => setFull(true));
    else setFull((f) => !f);
  }, [host, full]);

  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === host);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [host]);

  // Refit when the column changes width (window resize, phone rotation), as
  // Mermaid's SVG rescales by itself.
  useEffect(() => {
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    ro.observe(host);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [host, fit]);

  useEffect(() => {
    host.classList.toggle('srv6-flow--full', full);
    const id = requestAnimationFrame(fit);
    if (!full) return () => cancelAnimationFrame(id);
    const onKey = (e) => e.key === 'Escape' && !document.fullscreenElement && setFull(false);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
    };
  }, [full, host, fit]);

  // Toolbar under the diagram, not over it. On touch screens one-finger drag
  // scrolls the page, so inline zoom would be a trap: only full screen is offered.
  const zoomable = full || !touch;
  return (
    <>
      <div className="srv6-flow__view" aria-hidden="true">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      colorMode={colorMode}
      onInit={fit}
      minZoom={0.2}
      maxZoom={3}
      zoomOnScroll={full}
      panOnScroll={false}
      preventScrolling={full}
      zoomOnDoubleClick={false}
      panOnDrag={full || !touch}
      zoomOnPinch={full}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      onNodeMouseEnter={(_, n) => n.type !== 'cluster' && setHover(n.id)}
      onNodeMouseLeave={() => setHover(null)}
      proOptions={{ hideAttribution: true }}
    >
      {animated && <PacketLayer diagram={diagram} host={host} simRef={sim} />}
    </ReactFlow>
      {noteSlot && createPortal(failed !== null ? scenarios[failed].note : '', noteSlot)}
      </div>
      <div className="srv6-flow__toolbar" role="toolbar" aria-label="Diagram controls">
        {scenarios.map((sc, i) => (
          <button
            key={i}
            type="button"
            className="srv6-flow__scenario"
            aria-pressed={failed === i}
            onClick={() => toggleScenario(i)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={ICONS[failed === i ? 'restore' : 'bolt']} />
            </svg>
            {failed === i ? sc.restore || 'Restore' : sc.label}
          </button>
        ))}
        <span className="srv6-flow__spacer" />
        {zoomable && (
          <>
            <Tool icon="out" label="Zoom out" onClick={() => zoomOut()} />
            <Tool icon="in" label="Zoom in" onClick={() => zoomIn()} />
            <Tool icon="fit" label="Fit diagram" onClick={fit} />
          </>
        )}
        <Tool icon={full ? 'exit' : 'full'} label={full ? 'Exit full screen' : 'Full screen'} onClick={toggleFull} />
      </div>
    </>
  );
}

// --------------------------------------------------------------------- mount

const roots = new Map();

function injectCss() {
  if (document.getElementById('srv6-flow-css')) return;
  const style = document.createElement('style');
  style.id = 'srv6-flow-css';
  style.textContent = xyCss + flowCss;
  document.head.appendChild(style);
}

function mount() {
  for (const [el, root] of roots) {
    if (!el.isConnected) {
      root.unmount();
      roots.delete(el);
    }
  }
  const hosts = document.querySelectorAll('.srv6-flow:not([data-mounted])');
  if (!hosts.length) return;
  injectCss();
  for (const host of hosts) {
    host.dataset.mounted = '1';
    try {
      const diagram = JSON.parse(host.dataset.diagram);
      const canvas = document.createElement('div');
      canvas.className = 'srv6-flow__canvas';
      host.appendChild(canvas);
      let noteSlot = null;
      if (diagram.scenarios?.length) {
        noteSlot = document.createElement('div');
        noteSlot.className = 'srv6-flow__note';
        noteSlot.setAttribute('role', 'status');
        noteSlot.setAttribute('aria-live', 'polite');
        host.after(noteSlot);
      }
      const root = createRoot(canvas);
      root.render(
        <ReactFlowProvider>
          <Diagram diagram={diagram} host={host} noteSlot={noteSlot} />
        </ReactFlowProvider>,
      );
      roots.set(host, root);
    } catch (err) {
      host.classList.add('srv6-flow--failed');
      console.error('srv6-flow: could not render diagram', err);
    }
  }
}

window.__srv6Flow = { mount };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
if (window.document$ && !window.__srv6FlowSubscribed) {
  window.__srv6FlowSubscribed = true;
  window.document$.subscribe(() => mount());
}
