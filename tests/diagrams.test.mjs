// Tests for the build-time diagram converter (tools/diagrams/).
// Run: node --test tests/diagrams.test.mjs
//
// The "real parser" tests run Mermaid (version pinned in package.json) in
// headless Chrome and pin the adapter against its actual FlowDB output, so a
// Mermaid upgrade that changes the internal model fails here, not on the site.
// They need Chrome: CHROME_PATH, or Playwright's download. Outside CI they are
// skipped when no browser is found.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { blockHash, mermaidBlocks } from '../tools/diagrams/extract.mjs';
import { fromFlowDb, labelLines, normalizeDirection, parseStyles } from '../tools/diagrams/adapter.mjs';
import { clipToShape, hasCycle, layout, nodeSize } from '../tools/diagrams/layout.mjs';

// ------------------------------------------------------------------ extract

test('finds mermaid fences, dedents indented ones, classifies them', () => {
  const md = [
    'Intro',
    '```mermaid',
    'graph LR',
    '    A --> B',
    '```',
    '',
    '=== "Tab"',
    '',
    '    ```mermaid',
    '    sequenceDiagram',
    '        A->>B: hi',
    '    ```',
    '',
    '```python',
    'print(1)',
    '```',
  ].join('\n');
  const blocks = mermaidBlocks(md);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].source, 'graph LR\n    A --> B');
  assert.equal(blocks[0].kind, 'flowchart');
  assert.equal(blocks[1].source, 'sequenceDiagram\n    A->>B: hi');
  assert.equal(blocks[1].kind, 'sequence');
  assert.equal(blocks[1].index, 1);
});

test('block hash matches hooks/diagrams.py', (t) => {
  const source = 'graph TB\n    A["8 × 100G"] -->|x| B';
  const python = process.env.PYTHON || 'python3';
  let out;
  try {
    out = execFileSync(
      python,
      ['-c', 'import sys; sys.path.insert(0, "hooks"); import diagrams; print(diagrams._block_hash(sys.stdin.read()))'],
      { input: source, encoding: 'utf8' },
    ).trim();
  } catch (err) {
    if (process.env.CI) throw err;
    t.skip(`no python with mkdocs (${err.message.split('\n')[0]})`);
    return;
  }
  assert.equal(out, blockHash(source));
});

// ------------------------------------------------------------------ adapter

test('labels: <br>, literal \\n, entities, markdown markers', () => {
  assert.deepEqual(labelLines('Is the SID<br>reachable?', 'string'), ['Is the SID', 'reachable?']);
  assert.deepEqual(labelLines('K8s Node\\n(Cilium agent)', 'string'), ['K8s Node', '(Cilium agent)']);
  assert.deepEqual(labelLines('A &amp; B &lt;x&gt; &#35;1', 'text'), ['A & B <x> #1']);
  assert.deepEqual(labelLines('**bold** and _it_', 'markdown'), ['bold and it']);
  assert.deepEqual(labelLines('', 'text'), ['']);
});

test('styles: keeps fill/stroke/color, drops anything unsafe', () => {
  assert.deepEqual(parseStyles(['fill:#1565c026', 'stroke:#1565c0', 'stroke-width:2px']), {
    fill: '#1565c026',
    stroke: '#1565c0',
    strokeWidth: '2px',
  });
  assert.equal(parseStyles(['fill:url(javascript:alert(1));x']), undefined);
  assert.equal(parseStyles(['font-size:40px']), undefined);
  assert.equal(normalizeDirection('TD'), 'TB');
});

const fakeDb = (nodes, edges, dir = 'LR') => ({ getData: () => ({ nodes, edges }), getDirection: () => dir });

test('maps nodes, groups, edge styles and arrow ends', () => {
  const model = fromFlowDb(
    fakeDb(
      [
        { id: 'G', label: 'Group', labelType: 'text', isGroup: true, dir: 'LR' },
        { id: 'A', label: 'A', labelType: 'text', shape: 'diamond', parentId: 'G', cssStyles: ['fill:#fff'] },
        { id: 'B', label: 'B', labelType: 'text', shape: 'mystery', link: '/topics/ti-lfa/' },
      ],
      [
        { start: 'A', end: 'B', label: 'yes', thickness: 'normal', pattern: 'dotted', arrowTypeStart: 'none', arrowTypeEnd: 'arrow_point' },
        { start: 'B', end: 'A', label: '', thickness: 'thick', pattern: 'solid', arrowTypeStart: 'arrow_point', arrowTypeEnd: 'arrow_cross' },
        { start: 'A', end: 'B', label: '', thickness: 'normal', pattern: 'solid', arrowTypeStart: 'none', arrowTypeEnd: 'arrow_open' },
      ],
      'TD',
    ),
  );
  assert.equal(model.direction, 'TB');
  assert.deepEqual(model.groups, [{ id: 'G', label: ['Group'], parent: undefined, direction: 'LR', style: undefined }]);
  assert.equal(model.nodes[0].shape, 'diamond');
  assert.equal(model.nodes[0].parent, 'G');
  assert.deepEqual(model.nodes[0].style, { fill: '#fff' });
  assert.equal(model.nodes[1].shape, 'rect');
  assert.equal(model.nodes[1].href, '/topics/ti-lfa/');
  assert.match(model.warnings[0], /mystery/);
  assert.deepEqual(
    model.edges.map((e) => [e.stroke, e.start, e.end, e.label]),
    [
      ['dotted', 'none', 'arrow', ['yes']],
      ['thick', 'arrow', 'cross', undefined],
      ['solid', 'none', 'none', undefined],
    ],
  );
});

// Real Mermaid parser, through the same browser session the build uses.
let browser;
async function realParser(t) {
  if (browser) return browser;
  try {
    const { openBrowser } = await import('../tools/diagrams/browser.mjs');
    browser = await openBrowser();
    return browser;
  } catch (err) {
    if (process.env.CI) throw err;
    t.skip(`no Chrome for the real-parser tests (${err.message.split('\n')[0]})`);
    return null;
  }
}
test.after(() => browser?.close());

test('real parser: shapes, edge kinds, subgraphs, styles, click', async (t) => {
  const b = await realParser(t);
  if (!b) return;
  const model = await b.flowchart(
    [
      'graph TB',
      '    subgraph NIC["800G NIC (8 × 100G ports)"]',
      '      direction LR',
      '      P1((plane 1))',
      '    end',
      '    P1 --> A[rect] -.->|dotted| B{"Is it<br/>up?"}',
      '    B ==> C([stadium]) --o D[(db)] --x E{{hex}}',
      '    A --- F>odd] <--> G(round)',
      '    H["K8s Node\\n(Cilium)"]',
      '    style A fill:#1565c026,stroke:#1565c0',
      '    click G href "/topics/ti-lfa/"',
    ].join('\n'),
  );
  assert.equal(model.direction, 'TB');
  assert.deepEqual(model.warnings, []);
  const node = Object.fromEntries(model.nodes.map((n) => [n.id, n]));
  assert.deepEqual(
    Object.fromEntries(model.nodes.map((n) => [n.id, n.shape])),
    { P1: 'circle', A: 'rect', B: 'diamond', C: 'stadium', D: 'cylinder', E: 'hexagon', F: 'odd', G: 'round', H: 'rect' },
  );
  assert.equal(node.P1.parent, 'NIC');
  assert.deepEqual(model.groups.map((g) => [g.id, g.label, g.direction]), [['NIC', ['800G NIC (8 × 100G ports)'], 'LR']]);
  assert.deepEqual(node.B.label, ['Is it', 'up?']);
  assert.deepEqual(node.H.label, ['K8s Node', '(Cilium)']);
  assert.deepEqual(node.A.style, { fill: '#1565c026', stroke: '#1565c0' });
  assert.equal(node.G.href, '/topics/ti-lfa/');
  assert.ok(node.A.labelSize.width > 0 && node.B.labelSize.height === 48);
  const edge = (s, d) => model.edges.find((e) => e.source === s && e.target === d);
  assert.deepEqual(edge('A', 'B').label, ['dotted']);
  assert.equal(edge('A', 'B').stroke, 'dotted');
  assert.equal(edge('B', 'C').stroke, 'thick');
  assert.equal(edge('C', 'D').end, 'circle');
  assert.equal(edge('D', 'E').end, 'cross');
  assert.equal(edge('A', 'F').end, 'none');
  assert.deepEqual([edge('F', 'G').start, edge('F', 'G').end], ['arrow', 'arrow']);
});

test('real parser: named edges keep their name, animate flags packets', async (t) => {
  const b = await realParser(t);
  if (!b) return;
  const model = await b.flowchart(
    ['graph LR', '  S((S)) p1@---|10| N((N))', '  N p2@--> D', '  S --> D', '  p1@{ animate: true }', '  p2@{ animation: fast }'].join('\n'),
  );
  const edge = Object.fromEntries(model.edges.map((e) => [e.id, e]));
  assert.equal(edge.p1.animate, 'normal');
  assert.equal(edge.p2.animate, 'fast');
  assert.deepEqual(edge.p1.label, ['10']);
  const unnamed = model.edges.find((e) => !['p1', 'p2'].includes(e.id));
  assert.match(unnamed.id, /^_e\d+$/);
  assert.equal(unnamed.animate, undefined);
});

test('real parser: diagrams.json extras still render in Mermaid itself', async (t) => {
  const b = await realParser(t);
  if (!b) return;
  const { readFileSync } = await import('node:fs');
  const config = JSON.parse(readFileSync('tools/diagrams/diagrams.json', 'utf8'));
  for (const d of config.diagrams) {
    const block = mermaidBlocks(readFileSync(`docs/${d.page}`, 'utf8'))[d.index];
    const svg = await b.sequence(block.source, `fallback-${d.index}`);
    assert.match(svg, /^<svg/, `${d.page} #${d.index}`);
  }
});

test('real parser: a node keeps the subgraph Mermaid gives it', async (t) => {
  const b = await realParser(t);
  if (!b) return;
  // N2 is first mentioned inside "Fabric", so Mermaid puts it there, not in B.
  const model = await b.flowchart(
    ['graph TB', '  subgraph A', '    P1 --> N1', '  end', '  subgraph Fabric', '    R1 --> N2', '  end', '  subgraph B', '    N2 --> P2', '  end'].join('\n'),
  );
  const parent = Object.fromEntries(model.nodes.map((n) => [n.id, n.parent]));
  assert.equal(parent.N2, model.groups.find((g) => g.label[0] === 'Fabric').id);
  assert.equal(parent.P2, model.groups.find((g) => g.label[0] === 'B').id);
});

test('real parser: sequence diagram renders to SVG themed by --md-mermaid-*', async (t) => {
  const b = await realParser(t);
  if (!b) return;
  const svg = await b.sequence('sequenceDiagram\n  A->>B: hello', 'seq-test');
  assert.match(svg, /^<svg[^>]+id="seq-test"/);
  assert.match(svg, /var\(--md-mermaid-sequence-actor-bg-color\)/);
  assert.match(svg, />hello</);
});

// ------------------------------------------------------------------- layout

test('diamond is large enough for its label inside the outline', () => {
  const label = { width: 170, height: 48 };
  const { width, height } = nodeSize('diamond', label);
  // Corner of the label box must satisfy |x|/a + |y|/b <= 1.
  assert.ok(label.width / 2 / (width / 2) + label.height / 2 / (height / 2) <= 1);
});

test('edge ends are clipped to the visible outline', () => {
  const box = { x: 0, y: 0, width: 200, height: 100 };
  assert.deepEqual(clipToShape('diamond', box, [60, 100], [60, 130]), [60, 80]);
  assert.deepEqual(clipToShape('rect', box, [60, 100], [60, 130]), [60, 100]);
});

test('cycle detection: only real directed cycles count', () => {
  const e = (source, target) => ({ source, target });
  assert.equal(hasCycle([e('A', 'B'), e('B', 'A')]), true);
  assert.equal(hasCycle([e('A', 'B'), e('B', 'C'), e('C', 'A')]), true);
  assert.equal(hasCycle([e('R1', 'T'), e('R2', 'T'), e('T', 'DB')]), false);
});

test('real parser: long labels wrap at 200px like Mermaid', async (t) => {
  const b = await realParser(t);
  if (!b) return;
  const model = await b.flowchart('graph LR\n  A["Fix: Check BGP SRv6 locator and SID allocation on every PE"] -->|short| B');
  const a = model.nodes.find((n) => n.id === 'A');
  assert.ok(a.label.length > 1, a.label.join(' | '));
  assert.equal(a.label.join(' '), 'Fix: Check BGP SRv6 locator and SID allocation on every PE');
  assert.ok(a.labelSize.width <= 200);
  assert.deepEqual(model.edges[0].label, ['short']);
});

test('layout: an isolated subgraph turns a quarter from its parent, like Mermaid', async () => {
  const size = (lines) => ({ width: 40, height: 24 * lines.length });
  const n = (id, parent) => ({ id, label: [id], shape: 'rect', parent, labelSize: size([id]) });
  const out = await layout({
    direction: 'TB',
    groups: [{ id: 'G', label: ['G'], labelSize: size(['G']) }],
    nodes: [n('a', 'G'), n('b', 'G')],
    edges: [{ id: 'e', source: 'a', target: 'b', stroke: 'solid', start: 'none', end: 'arrow' }],
  });
  const [a, b] = ['a', 'b'].map((id) => out.nodes.find((x) => x.id === id));
  assert.equal(a.y, b.y, 'TB parent: the isolated subgraph runs left to right');
  assert.ok(b.x > a.x);
});

test('layout: an edge may share its name with a node', async () => {
  const size = (lines) => ({ width: 40, height: 24 * lines.length });
  const out = await layout({
    direction: 'LR',
    groups: [],
    nodes: ['A', 'B'].map((id) => ({ id, label: [id], shape: 'rect', labelSize: size([id]) })),
    edges: [{ id: 'A', source: 'A', target: 'B', stroke: 'solid', start: 'none', end: 'arrow', animate: 'normal' }],
  });
  assert.equal(out.edges[0].id, 'A');
  assert.equal(out.edges[0].animate, 'normal');
  assert.ok(out.edges[0].points.length >= 2);
});

test('layout: positions, routes, groups before children, isolated subgraph direction', async () => {
  const size = (lines) => ({ width: 40 * lines[0].length, height: 24 * lines.length });
  const n = (id, parent) => ({ id, label: [id], shape: 'rect', parent, labelSize: size([id]) });
  const model = {
    direction: 'TB',
    groups: [
      { id: 'inner', label: ['inner'], parent: 'outer', direction: 'LR', labelSize: size(['inner']) },
      { id: 'outer', label: ['outer'], labelSize: size(['outer']) },
    ],
    nodes: [n('a', 'inner'), n('b', 'inner'), n('c')],
    edges: [{ id: 'e0', source: 'a', target: 'b', stroke: 'solid', start: 'none', end: 'arrow' }],
  };
  const out = await layout(model);
  assert.deepEqual(out.groups.map((g) => g.id), ['outer', 'inner']);
  const a = out.nodes.find((x) => x.id === 'a');
  const b = out.nodes.find((x) => x.id === 'b');
  assert.equal(a.y, b.y, 'inner subgraph is laid out left to right');
  assert.ok(b.x > a.x);
  assert.ok(out.edges[0].points.length >= 2);
  assert.ok(out.width > 0 && out.height > 0);
});
