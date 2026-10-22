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

// Must match src/diagrams/flow.css (.srv6-flow__label / __edge-label / __group-label).
// wrap: Mermaid's flowchart wrappingWidth; longer node and edge label lines
// break at spaces, as Mermaid does (subgraph titles do not).
export const TEXT = { fontSize: 16, lineHeight: 24, family: 'Inter', wrap: 200 };

const MATERIAL_THEME = readFileSync(join(here, 'material-mermaid-theme.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//, '').trim();

function adapterScript() {
  const src = readFileSync(join(here, 'adapter.mjs'), 'utf8').replace(/^export /gm, '');
  return `${src}\nwindow.__adapter = { fromFlowDb };`;
}

function fontFaces() {
  const dir = join(pkgDir('@fontsource/inter'), 'files');
  return ['latin', 'latin-ext'].map((subset) => ({
    subset,
    data: readFileSync(join(dir, `inter-${subset}-400-normal.woff2`)).toString('base64'),
  }));
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
      const face = new FontFace(family, bytes, { weight: '400' });
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
        ctx.font = `400 ${text.fontSize}px ${text.family}`;
        const size = (lines) => ({
          width: Math.ceil(Math.max(0, ...lines.map((l) => ctx.measureText(l).width))),
          height: lines.length * text.lineHeight,
        });
        const wrap = (lines) =>
          lines.flatMap((line) => {
            if (ctx.measureText(line).width <= text.wrap) return [line];
            const out = [];
            let cur = '';
            for (const word of line.split(' ')) {
              const next = cur ? `${cur} ${word}` : word;
              if (cur && ctx.measureText(next).width > text.wrap) {
                out.push(cur);
                cur = word;
              } else cur = next;
            }
            return cur ? [...out, cur] : out;
          });
        for (const n of model.nodes) n.labelSize = size((n.label = wrap(n.label)));
        for (const g of model.groups) g.labelSize = size(g.label);
        for (const e of model.edges) if (e.label) e.labelSize = size((e.label = wrap(e.label)));
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
