// Headless Chrome session for the build: Mermaid's parser needs a DOM
// (DOMPurify), label sizes must be measured in the site font, and sequence
// diagrams are rendered by Mermaid itself. Chrome comes from CHROME_PATH (CI
// points it at the runner's Google Chrome) or Playwright's own download.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const pkgDir = (name) => dirname(require.resolve(`${name}/package.json`));

// Must match src/diagrams/flow.css (.srv6-flow__label, __edge-label,
// __group-label). Weights are 400/700 only: the site loads Inter 300/400/700.
// wrap: Mermaid's flowchart wrappingWidth; longer node and edge label lines
// break at spaces, as Mermaid does (subgraph titles do not).
export const TEXT = {
  family: 'Inter',
  wrap: 200,
  node: { size: 15, line: 22, weight: 400 },
  edge: { size: 13, line: 18, weight: 400 },
  group: { size: 11, line: 14, weight: 700, spacing: 0.66, upper: true },
};

const MATERIAL_THEME = readFileSync(join(here, 'material-mermaid-theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//, '').trim();

function adapterScript() {
  const src = readFileSync(join(here, 'adapter.mjs'), 'utf8').replace(/^export /gm, '');
  return `${src}\nwindow.__adapter = { fromFlowDb };`;
}

function fontFaces() {
  const dir = join(pkgDir('@fontsource/inter'), 'files');
  return ['latin', 'latin-ext'].flatMap((subset) =>
    ['400', '700'].map((weight) => ({
      weight,
      data: readFileSync(join(dir, `inter-${subset}-${weight}-normal.woff2`)).toString('base64'),
    })),
  );
}

export async function openBrowser() {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: join(pkgDir('mermaid'), 'dist', 'mermaid.min.js') });
  await page.addScriptTag({ content: adapterScript() });
  await page.evaluate(async ({ faces, family }) => {
    for (const f of faces) {
      const bytes = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
      const face = new FontFace(family, bytes, { weight: f.weight });
      document.fonts.add(await face.load());
    }
    window.mermaid.initialize({ startOnLoad: false });
  }, { faces: fontFaces(), family: TEXT.family });

  return {
    async flowchart(source) {
      return page.evaluate(async ({ source, text }) => {
        const diagram = await window.mermaid.mermaidAPI.getDiagramFromText(source);
        const model = window.__adapter.fromFlowDb(diagram.db);
        const ctx = document.createElement('canvas').getContext('2d');
        const use = (k) => {
          ctx.font = `${k.weight} ${k.size}px ${text.family}`;
          ctx.letterSpacing = `${k.spacing || 0}px`;
        };
        const width = (k, l) => ctx.measureText(k.upper ? l.toUpperCase() : l).width;
        const size = (k, lines) => {
          use(k);
          return { width: Math.ceil(Math.max(0, ...lines.map((l) => width(k, l)))), height: lines.length * k.line };
        };
        const wrap = (k, lines) => {
          use(k);
          return lines.flatMap((line) => {
            if (width(k, line) <= text.wrap) return [line];
            const out = [];
            let cur = '';
            for (const word of line.split(' ')) {
              const next = cur ? `${cur} ${word}` : word;
              if (cur && width(k, next) > text.wrap) {
                out.push(cur);
                cur = word;
              } else cur = next;
            }
            return cur ? [...out, cur] : out;
          });
        };
        for (const n of model.nodes) n.labelSize = size(text.node, (n.label = wrap(text.node, n.label)));
        for (const g of model.groups) g.labelSize = size(text.group, g.label);
        for (const e of model.edges) if (e.label) e.labelSize = size(text.edge, (e.label = wrap(text.edge, e.label)));
        return model;
      }, { source, text: TEXT });
    },

    // Same initialize() options Material uses, so geometry matches the live
    // Mermaid render; colors stay var(--md-mermaid-*) and follow the scheme.
    async sequence(source, id) {
      return page.evaluate(async ({ source, id, themeCSS }) => {
        window.mermaid.initialize({
          startOnLoad: false,
          themeCSS,
          sequence: { actorFontSize: '16px', messageFontSize: '16px', noteFontSize: '16px' },
        });
        const { svg } = await window.mermaid.render(id, source);
        window.mermaid.initialize({ startOnLoad: false });
        return svg;
      }, { source, id, themeCSS: MATERIAL_THEME });
    },

    close: () => browser.close(),
  };
}
