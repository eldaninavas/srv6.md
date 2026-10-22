// Converts every Mermaid flowchart and sequence diagram under docs/ at build
// time, except those excluded in tools/diagrams/diagrams.json (which also
// holds per-diagram extras: failure scenarios, packet walk). Run before
// `mkdocs build`; hooks/diagrams.py swaps the blocks.
//
//   flowchart -> parsed by Mermaid, measured in Inter, laid out by elkjs,
//                drawn by React Flow (docs/assets/diagrams/flow.<hash>.js)
//   sequence  -> rendered once by Mermaid to inline SVG themed with
//                var(--md-mermaid-*), so no Mermaid at runtime
//
// Outputs (both gitignored): build/diagrams/manifest.json and the bundle.
// Excluded diagrams, other Mermaid types and any diagram that fails to
// convert stay on Mermaid. A page whose source no longer matches the manifest
// hash also stays on Mermaid, so a stale build never shows an outdated diagram.

import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { openBrowser } from './browser.mjs';
import { mermaidBlocks } from './extract.mjs';
import { assignIcons } from './icons.mjs';
import { layout } from './layout.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const docs = join(repo, 'docs');
const outDir = join(repo, 'build', 'diagrams');
const assetDir = join(docs, 'assets', 'diagrams');

const started = Date.now();
const config = JSON.parse(readFileSync(join(repo, 'tools', 'diagrams', 'diagrams.json'), 'utf8'));
const key = (page, index) => `${page}#${index}`;
const excluded = new Map(config.exclude.map((x) => [key(x.page, x.index), x.why]));
const extras = new Map(config.diagrams.map((x) => [key(x.page, x.index), x]));

function markdownPages(dir = docs) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) return markdownPages(path);
    return ent.name.endsWith('.md') ? [relative(docs, path)] : [];
  });
}

// Page titles (English) for click-to-navigate: a node whose whole label is a
// page title links to that page.
function titleIndex() {
  const index = new Map();
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, ent.name);
      const rel = relative(docs, path);
      if (ent.isDirectory()) {
        if (!['es', 'ja', 'assets'].includes(rel)) walk(path);
        continue;
      }
      if (!ent.name.endsWith('.md')) continue;
      const md = readFileSync(path, 'utf8');
      const title = md.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] || md.match(/^#\s+(.+)$/m)?.[1];
      if (!title) continue;
      const url = '/' + rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '/');
      index.set(title.trim().toLowerCase(), url);
    }
  };
  walk(docs);
  return index;
}

async function bundle() {
  const result = await esbuild.build({
    entryPoints: [join(repo, 'src', 'diagrams', 'flow.jsx')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    jsx: 'automatic',
    loader: { '.css': 'text' },
    define: { 'process.env.NODE_ENV': '"production"' },
    legalComments: 'none',
    write: false,
  });
  // A second evaluation (instant navigation re-runs page scripts) must not
  // load a second React: re-mount through the first copy instead.
  const code = `if(window.__srv6Flow){window.__srv6Flow.mount()}else{${result.outputFiles[0].text}}`;
  const hash = createHash('sha256').update(code).digest('hex').slice(0, 10);
  rmSync(assetDir, { recursive: true, force: true });
  mkdirSync(assetDir, { recursive: true });
  const name = `flow.${hash}.js`;
  writeFileSync(join(assetDir, name), code);
  return { path: `assets/diagrams/${name}`, bytes: Buffer.byteLength(code) };
}

// Scenario edge names must exist in the diagram: a typo would silently show
// a failover that fails nothing.
function scenarios(item, diagram) {
  if (!item.scenarios) return undefined;
  const ids = new Set(diagram.edges.map((e) => e.id));
  return item.scenarios.map((sc) => {
    for (const key of ['fail', 'idle', 'reroute']) {
      for (const id of sc[key] || []) {
        if (!ids.has(id)) throw new Error(`${item.page} #${item.index}: scenario "${sc.label}" names unknown edge "${id}"`);
      }
    }
    if (!sc.fail?.length) throw new Error(`${item.page} #${item.index}: scenario "${sc.label}" fails no edge`);
    return { label: sc.label, restore: sc.restore, note: sc.note, fail: sc.fail, idle: sc.idle || [], reroute: sc.reroute || [] };
  });
}

const titles = titleIndex();
const browser = await openBrowser();
const pages = {};
const report = [];

const unused = new Set([...excluded.keys(), ...extras.keys()]);
const failed = [];

try {
  for (const page of markdownPages().sort()) {
    for (const block of mermaidBlocks(readFileSync(join(docs, page), 'utf8'))) {
      const id = key(page, block.index);
      unused.delete(id);
      if (excluded.has(id) || block.kind === 'other') continue;
      const item = extras.get(id) || { page, index: block.index };
      if (item.kind && item.kind !== block.kind) throw new Error(`${id}: diagrams.json expects ${item.kind}, found ${block.kind}`);
      let entry;
      try {
        if (block.kind === 'flowchart') {
          const model = await browser.flowchart(block.source);
          for (const n of model.nodes) n.href ||= titles.get(n.label.join(' ').toLowerCase());
          const icons = assignIcons(model);
          const laid = await layout(model);
          laid.scenarios = scenarios(item, laid);
          entry = { kind: 'flowchart', source: block.source, diagram: laid };
          report.push(`${id} flowchart ${laid.nodes.length}n ${laid.edges.length}e ${laid.groups.length}g ` +
            `${laid.width}x${laid.height}` +
            (laid.edges.some((e) => e.animate) ? `, ${laid.edges.filter((e) => e.animate).length} animated` : '') +
            (laid.scenarios ? `, ${laid.scenarios.length} scenario(s)` : '') +
            (icons ? `, ${icons} icons` : '') +
            (model.warnings.length ? `\n  warn: ${model.warnings.join('\n  warn: ')}` : ''));
        } else {
          const svg = await browser.sequence(block.source, `srv6-seq-${block.hash}`);
          entry = { kind: 'sequence', source: block.source, svg, packetWalk: !!item.packetWalk };
          report.push(`${id} sequence ${(svg.length / 1024).toFixed(1)} KB SVG${item.packetWalk ? ', packet walk' : ''}`);
        }
      } catch (err) {
        // Scenario mistakes are ours to fix; a diagram Mermaid can't parse stays on Mermaid.
        if (/scenario/.test(err.message)) throw err;
        failed.push(`${id}: ${err.message.split('\n')[0]}`);
        continue;
      }
      (pages[page] ||= {})[block.hash] = entry;
    }
  }
} finally {
  await browser.close();
}

const script = await bundle();
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ script: script.path, pages }));

console.log(report.join('\n'));
if (failed.length) console.log(`left on Mermaid (could not convert):\n  ${failed.join('\n  ')}`);
// An exclusion or extra that matches no block is a stale entry: the page moved
// or its diagrams were reordered, so it would now apply to the wrong diagram.
if (unused.size) throw new Error(`diagrams.json names blocks that do not exist: ${[...unused].join(', ')}`);
const count = Object.values(pages).reduce((n, p) => n + Object.keys(p).length, 0);
console.log(`${count} diagrams converted, ${excluded.size} excluded, ${failed.length} failed`);
console.log(`bundle ${script.path} ${(script.bytes / 1024).toFixed(1)} KB; done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
