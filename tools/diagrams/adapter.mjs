// Adapter between Mermaid's flowchart model and ours.
//
// Mermaid's FlowDB is internal and changes between releases. The only thing we
// read from it is `db.getData()` (the layout-agnostic model Mermaid itself hands
// to its dagre/elk renderers) plus `db.getDirection()`. Everything that depends
// on its shape lives in this file, and tests/diagrams.test.mjs pins it against
// real parser output for the mermaid version in package.json.

const SHAPES = {
  squareRect: 'rect',
  rect: 'rect',
  roundedRect: 'round',
  stadium: 'stadium',
  subroutine: 'subroutine',
  cylinder: 'cylinder',
  circle: 'circle',
  doublecircle: 'doublecircle',
  diamond: 'diamond',
  hexagon: 'hexagon',
  odd: 'odd',
  lean_right: 'lean_right',
  lean_left: 'lean_left',
  trapezoid: 'trapezoid',
  inv_trapezoid: 'inv_trapezoid',
};

const ARROWS = {
  none: 'none',
  arrow_open: 'none',
  arrow_point: 'arrow',
  arrow_circle: 'circle',
  arrow_cross: 'cross',
};

const STYLE_PROPS = {
  fill: 'fill',
  stroke: 'stroke',
  color: 'color',
  'stroke-width': 'strokeWidth',
  'stroke-dasharray': 'strokeDasharray',
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };

// Mermaid labels are sanitized HTML: <br> separates lines, markdown strings
// keep their ** / _ markers. We render plain text, one entry per line.
export function labelLines(label, labelType) {
  let text = String(label ?? '');
  if (labelType === 'markdown') text = text.replace(/\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*|_(.+?)_/g, '$1$2$3$4');
  return text
    .split(/<br\s*\/?>|\n|\\n/i) // <br>, a newline, or a literal "\n" (Mermaid breaks on all three)
    .map((line) =>
      line
        .replace(/<[^>]*>/g, '')
        .replace(/&(#?\w+);/g, (m, name) => {
          if (ENTITIES[name] !== undefined) return ENTITIES[name];
          if (/^#\d+$/.test(name)) return String.fromCodePoint(Number(name.slice(1)));
          return m;
        })
        .trim(),
    )
    .filter((line, i, all) => line || all.length === 1);
}

export function parseStyles(list) {
  const style = {};
  for (const decl of list || []) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const key = STYLE_PROPS[decl.slice(0, i).trim()];
    const value = decl.slice(i + 1).trim().replace(/\s*!important$/, '');
    if (key && /^[#\w\s.,()%-]+$/.test(value)) style[key] = value;
  }
  return Object.keys(style).length ? style : undefined;
}

export function normalizeDirection(dir) {
  const d = String(dir || 'TB').toUpperCase();
  return d === 'TD' ? 'TB' : ['TB', 'BT', 'LR', 'RL'].includes(d) ? d : 'TB';
}

// db: the FlowDB of a parsed diagram (diagram.db).
export function fromFlowDb(db) {
  const data = db.getData();
  const warnings = [];
  const groups = [];
  const nodes = [];

  for (const n of data.nodes) {
    const label = labelLines(n.label, n.labelType);
    if (n.isGroup) {
      groups.push({
        id: n.id,
        label,
        parent: n.parentId || undefined,
        direction: n.dir ? normalizeDirection(n.dir) : undefined,
        style: parseStyles([...(n.cssCompiledStyles || []), ...(n.cssStyles || [])]),
      });
      continue;
    }
    const shape = SHAPES[n.shape];
    if (!shape) warnings.push(`node ${n.id}: shape "${n.shape}" rendered as rect`);
    nodes.push({
      id: n.id,
      label,
      shape: shape || 'rect',
      parent: n.parentId || undefined,
      style: parseStyles([...(n.cssCompiledStyles || []), ...(n.cssStyles || [])]),
      href: n.link || undefined,
    });
  }

  const edges = data.edges.map((e, i) => {
    const stroke =
      e.thickness === 'invisible' || e.stroke === 'invisible'
        ? 'invisible'
        : e.pattern === 'dotted' || e.pattern === 'dashed'
          ? 'dotted'
          : e.thickness === 'thick'
            ? 'thick'
            : 'solid';
    for (const end of [e.arrowTypeStart, e.arrowTypeEnd]) {
      if (end && !ARROWS[end]) warnings.push(`edge ${e.start}->${e.end}: arrow "${end}" rendered as plain line`);
    }
    return {
      // Named edges (`A e1@--> B`) keep their name so pilot.json scenarios
      // can refer to them; the rest get an id no Mermaid name can take.
      id: e.isUserDefinedId ? e.id : `_e${i}`,
      source: e.start,
      target: e.end,
      label: e.label ? labelLines(e.label, e.labelType) : undefined,
      stroke,
      start: ARROWS[e.arrowTypeStart] || 'none',
      end: ARROWS[e.arrowTypeEnd] || 'none',
      // `e1@{ animate: true }` or `e1@{ animation: fast|slow }`
      animate: e.animate || e.animation ? e.animation || 'normal' : undefined,
    };
  });

  return { direction: normalizeDirection(db.getDirection()), groups, nodes, edges, warnings };
}
