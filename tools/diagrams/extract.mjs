// Finds ```mermaid fences in a Markdown page. The hash must match
// hooks/diagrams.py (_block_hash): sha256 of the dedented source, stripped,
// first 16 hex chars. It is how the hook knows a converted diagram is current.

import { createHash } from 'node:crypto';

const FENCE = /^([ \t]*)```mermaid[ \t]*\n([\s\S]*?)\n\1```[ \t]*$/gm;

export function blockHash(source) {
  return createHash('sha256').update(source, 'utf8').digest('hex').slice(0, 16);
}

export function mermaidBlocks(markdown) {
  const blocks = [];
  for (const m of markdown.matchAll(FENCE)) {
    const indent = m[1];
    const source = m[2]
      .split('\n')
      .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
      .join('\n')
      .trim();
    blocks.push({ index: blocks.length, source, hash: blockHash(source), kind: kindOf(source) });
  }
  return blocks;
}

export function kindOf(source) {
  const first = source.split('\n').find((l) => l.trim() && !l.trim().startsWith('%%')) || '';
  if (/^\s*(graph|flowchart)\b/.test(first)) return 'flowchart';
  if (/^\s*sequenceDiagram\b/.test(first)) return 'sequence';
  return 'other';
}
