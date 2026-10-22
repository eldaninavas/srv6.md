// Build-time layout with elkjs (layered + orthogonal routing). The output keeps
// every coordinate React Flow needs, so the browser ships no layout library:
// node/group positions are relative to their parent group (React Flow's
// convention), edge points and label boxes are absolute.

import ELK from 'elkjs/lib/elk.bundled.js';

const ELK_DIRECTION = { LR: 'RIGHT', RL: 'LEFT', TB: 'DOWN', BT: 'UP' };
const PAD = { x: 16, y: 12 };
const GROUP_PAD = 16;
const ROUTING = process.env.ELK_ROUTING || 'SPLINES';

// Node box for a measured label, per shape. The label must fit inside the
// visible outline (e.g. the inscribed rectangle of a diamond).
export function nodeSize(shape, label) {
  const lw = label.width;
  const lh = label.height;
  const h = lh + 2 * PAD.y;
  switch (shape) {
    case 'circle':
    case 'doublecircle': {
      const d = Math.max(lw, lh) + 20 + (shape === 'doublecircle' ? 10 : 0);
      return { width: d, height: d };
    }
    case 'diamond': {
      const height = 2 * lh + 2 * PAD.y;
      const free = 1 - lh / height; // share of the half-width left at the label's top edge
      return { width: Math.ceil(lw / free + PAD.x), height };
    }
    case 'stadium':
      return { width: lw + 2 * PAD.x + h / 2, height: h };
    case 'hexagon':
      return { width: lw + 2 * PAD.x + h, height: h };
    case 'subroutine':
      return { width: lw + 2 * PAD.x + 16, height: h };
    case 'cylinder':
      return { width: lw + 2 * PAD.x, height: h + 16 };
    case 'odd':
    case 'lean_right':
    case 'lean_left':
    case 'trapezoid':
    case 'inv_trapezoid':
      return { width: lw + 2 * PAD.x + h / 2, height: h };
    default:
      return { width: lw + 2 * PAD.x, height: h };
  }
}

// Spacing is not inherited by a SEPARATE_CHILDREN group, so groups get it too.
const SPACING = {
    'elk.spacing.nodeNode': '32',
    'elk.layered.spacing.nodeNodeBetweenLayers': '56',
    'elk.spacing.edgeNode': '20',
    'elk.spacing.edgeEdge': '12',
    'elk.layered.spacing.edgeNodeBetweenLayers': '20',
    'elk.layered.spacing.edgeEdgeBetweenLayers': '12',
    'elk.spacing.edgeLabel': '4',
    // Keep the author's order, as Mermaid (dagre) does, also between
    // unconnected pieces of one diagram.
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    'elk.layered.considerModelOrder.components': 'MODEL_ORDER',
};

// Cycles (probe and back, A->B->A) are broken against declaration order, so
// the first-declared node stays first. Only for graphs that have a cycle:
// this ELK strategy reverses every edge that runs against declaration order.
const CYCLES = { 'elk.layered.cycleBreaking.strategy': 'MODEL_ORDER' };

export function hasCycle(edges) {
  const next = new Map();
  for (const e of edges) next.set(e.source, [...(next.get(e.source) || []), e.target]);
  const state = new Map(); // 1 = on the current path, 2 = done
  const visit = (n) => {
    if (state.get(n) === 1) return true;
    if (state.get(n) === 2) return false;
    state.set(n, 1);
    const found = (next.get(n) || []).some(visit);
    state.set(n, 2);
    return found;
  };
  return [...next.keys()].some(visit);
}

// ELK routes to the bounding box. For shapes that do not fill it, slide the
// end point along its first segment until it touches the visible outline.
function inside(shape, b, x, y) {
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  if (shape === 'diamond') return dx / (b.width / 2) + dy / (b.height / 2) <= 1;
  if (shape === 'circle' || shape === 'doublecircle') return dx * dx + dy * dy <= (b.width / 2) ** 2;
  if (shape === 'hexagon') return dy <= b.height / 2 && dx <= b.width / 2 - (b.height / 2) * (dy / (b.height / 2));
  return true;
}

export function clipToShape(shape, box, end, next) {
  if (!['diamond', 'circle', 'doublecircle', 'hexagon'].includes(shape)) return end;
  const len = Math.hypot(end[0] - next[0], end[1] - next[1]);
  if (!len) return end;
  const ux = (end[0] - next[0]) / len;
  const uy = (end[1] - next[1]) / len;
  // Walk from `next` through `end` into the box; the first point inside the
  // shape is on the outline.
  for (let t = 0; t <= len + box.width + box.height; t += 0.5) {
    const x = next[0] + ux * t;
    const y = next[1] + uy * t;
    if (inside(shape, box, x, y)) return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }
  return end; // the line misses the shape entirely: keep ELK's point
}

function rootOptions(direction, cyclic) {
  return {
    ...(cyclic ? CYCLES : {}),
    'elk.algorithm': 'layered',
    'elk.direction': ELK_DIRECTION[direction],
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.edgeRouting': ROUTING,
    ...SPACING,
    'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
    'elk.json.edgeCoords': 'ROOT',
    'elk.padding': '[top=8,left=8,bottom=8,right=8]',
  };
}

// A subgraph none of whose nodes link outside it is laid out on its own, in
// its own `direction`, or else turned a quarter from its parent's (Mermaid:
// rankdir = dir || (parent === 'TB' ? 'LR' : 'TB')). ELK can only do that for
// a separately laid-out child graph.
function isolated(groupId, model, parentOf) {
  const inside = (id) => {
    for (let p = id; p; p = parentOf.get(p)) if (p === groupId) return true;
    return false;
  };
  return model.edges.every((e) => inside(e.source) === inside(e.target));
}

export async function layout(model) {
  const elk = new ELK();
  const parentOf = new Map([...model.groups, ...model.nodes].map((n) => [n.id, n.parent]));
  const elkNodes = new Map();

  const cyclic = hasCycle(model.edges);
  const depthOf = (id) => (parentOf.get(id) ? 1 + depthOf(parentOf.get(id)) : 0);
  const flowDir = new Map(); // effective direction inside each group
  const dirOf = (id) => (id ? flowDir.get(id) : model.direction);
  for (const g of [...model.groups].sort((a, b) => depthOf(a.id) - depthOf(b.id))) {
    const outer = dirOf(g.parent);
    const own = isolated(g.id, model, parentOf) ? g.direction || (outer === 'TB' ? 'LR' : 'TB') : outer;
    flowDir.set(g.id, own);
    const options = {
      ...SPACING,
      ...(cyclic ? CYCLES : {}),
      'elk.padding': `[top=${g.labelSize.height + GROUP_PAD},left=${GROUP_PAD},bottom=${GROUP_PAD},right=${GROUP_PAD}]`,
      'elk.nodeSize.constraints': 'MINIMUM_SIZE',
      'elk.nodeSize.minimum': `(${g.labelSize.width + 2 * GROUP_PAD}, ${g.labelSize.height + 2 * GROUP_PAD})`,
    };
    if (own !== outer) {
      options['elk.hierarchyHandling'] = 'SEPARATE_CHILDREN';
      options['elk.direction'] = ELK_DIRECTION[own];
    }
    elkNodes.set(g.id, { id: g.id, layoutOptions: options, children: [] });
  }
  for (const n of model.nodes) {
    elkNodes.set(n.id, { id: n.id, ...nodeSize(n.shape, n.labelSize) });
  }

  const root = { id: '__root', layoutOptions: rootOptions(model.direction, cyclic), children: [], edges: [] };
  for (const item of [...model.groups, ...model.nodes]) {
    const parent = item.parent ? elkNodes.get(item.parent) : root;
    parent.children.push(elkNodes.get(item.id));
  }
  // ELK ids share one namespace with nodes; Mermaid edge names may not.
  root.edges = model.edges.map((e) => ({
    id: `edge:${e.id}`,
    sources: [e.source],
    targets: [e.target],
    // ELK ignores labels without `text`.
    // `inline` is a label property: the label sits on its edge, as in Mermaid.
    labels: e.label
      ? [{ text: e.label.join(' '), width: e.labelSize.width + 8, height: e.labelSize.height, layoutOptions: { 'elk.edgeLabels.inline': 'true' } }]
      : [],
  }));

  // ELK 0.12 crashes on some graphs whose edges cross subgraph borders when
  // the model-order options are set (cycle breaking, or model order inside
  // subgraphs). Those fall back, one step at a time, to ELK's defaults.
  const fallbacks = [
    (node, isRoot) => delete node.layoutOptions?.['elk.layered.cycleBreaking.strategy'],
    (node, isRoot) => !isRoot && delete node.layoutOptions?.['elk.layered.considerModelOrder.strategy'],
  ];
  let out;
  for (let step = 0; ; step++) {
    try {
      out = await elk.layout(structuredClone(root));
      break;
    } catch (err) {
      if (step === fallbacks.length) throw err;
      const strip = (node, isRoot) => {
        fallbacks[step](node, isRoot);
        for (const child of node.children || []) strip(child, false);
      };
      strip(root, true);
    }
  }

  const boxes = new Map();
  const walk = (node, parentId) => {
    for (const child of node.children || []) {
      boxes.set(child.id, { x: child.x, y: child.y, width: child.width, height: child.height, parent: parentId });
      walk(child, child.id);
    }
  };
  walk(out, undefined);

  const round = (v) => Math.round(v * 10) / 10;
  const box = (id) => {
    const b = boxes.get(id);
    return { x: round(b.x), y: round(b.y), width: round(b.width), height: round(b.height) };
  };

  const absBox = (id) => {
    const b = boxes.get(id);
    let { x, y } = b;
    for (let p = b.parent; p; p = boxes.get(p).parent) {
      x += boxes.get(p).x;
      y += boxes.get(p).y;
    }
    return { x, y, width: b.width, height: b.height };
  };

  // Parents before children: React Flow requires it.
  const depth = (id) => (parentOf.get(id) ? 1 + depth(parentOf.get(id)) : 0);
  const groups = [...model.groups]
    .sort((a, b) => depth(a.id) - depth(b.id))
    .map((g) => ({ id: g.id, parent: g.parent, label: g.label, style: g.style, ...box(g.id) }));
  const nodes = model.nodes.map((n) => ({
    id: n.id,
    parent: n.parent,
    shape: n.shape,
    label: n.label,
    style: n.style,
    href: n.href,
    ...box(n.id),
  }));

  const edges = model.edges.map((e) => {
    const laid = out.edges.find((x) => x.id === `edge:${e.id}`);
    const section = laid.sections?.[0];
    const points = section
      ? [section.startPoint, ...(section.bendPoints || []), section.endPoint].map((p) => [round(p.x), round(p.y)])
      : [];
    if (points.length >= 2) {
      const src = model.nodes.find((n) => n.id === e.source);
      const dst = model.nodes.find((n) => n.id === e.target);
      if (src) points[0] = clipToShape(src.shape, absBox(e.source), points[0], points[1]);
      if (dst) points[points.length - 1] = clipToShape(dst.shape, absBox(e.target), points[points.length - 1], points[points.length - 2]);
    }
    const lbl = laid.labels?.[0];
    const labelBox = lbl ? { x: round(lbl.x), y: round(lbl.y), width: round(lbl.width), height: round(lbl.height) } : undefined;
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      stroke: e.stroke,
      start: e.start,
      end: e.end,
      animate: e.animate,
      label: e.label,
      labelBox,
      curve: ROUTING === 'SPLINES' ? 'spline' : 'orthogonal',
      points,
    };
  });

  return { direction: model.direction, width: Math.ceil(out.width), height: Math.ceil(out.height), groups, nodes, edges };
}
