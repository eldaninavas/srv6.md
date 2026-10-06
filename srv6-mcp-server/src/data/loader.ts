import { promises as fs } from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";

export interface DocPage {
  id: string; // path relative to docs root, posix style (e.g. topics/sid-structure.md)
  section: string; // first path segment (topics, rfcs, ...) or "root"
  title: string;
  description: string;
  headings: string;
  body: string;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "assets" || entry.name.startsWith(".")) continue;
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      yield full;
    }
  }
}

function parseFrontMatter(raw: string): { meta: Record<string, string>; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, content: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(title|description):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return { meta, content: raw.slice(m[0].length) };
}

export function parsePage(relPath: string, raw: string): DocPage {
  const { meta, content } = parseFrontMatter(raw);
  const headingLines = content.split(/\r?\n/).filter((l) => /^#{1,6}\s/.test(l));
  const firstH1 = headingLines.find((l) => /^#\s/.test(l))?.replace(/^#\s+/, "");
  const segments = relPath.split("/");
  return {
    id: relPath,
    section: segments.length > 1 ? segments[0] : "root",
    title: meta.title || firstH1 || path.basename(relPath, ".md"),
    description: meta.description || "",
    headings: headingLines.map((l) => l.replace(/^#+\s+/, "")).join(" \n "),
    body: content,
  };
}

export async function loadDocs(docsPath: string): Promise<DocPage[]> {
  const root = path.resolve(docsPath);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) {
    throw new Error(`docs path not found or not a directory: ${root}`);
  }
  const pages: DocPage[] = [];
  for await (const file of walk(root)) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    try {
      pages.push(parsePage(rel, await fs.readFile(file, "utf8")));
    } catch (err) {
      console.error(`[srv6-mcp] skipping ${rel}: ${(err as Error).message}`);
    }
  }
  return pages;
}

export function buildIndex(pages: DocPage[]): MiniSearch<DocPage> {
  const index = new MiniSearch<DocPage>({
    fields: ["title", "description", "headings", "body"],
    storeFields: ["id", "section", "title", "description"],
    searchOptions: {
      boost: { title: 4, headings: 2, description: 1.5 },
      prefix: true,
      fuzzy: 0.15,
      combineWith: "AND",
    },
    // keep dotted/hyphenated SRv6 names (End.DT4, H.Encaps.Red, uN) searchable as one token and as parts
    tokenize: (text) => {
      const out: string[] = [];
      for (const tok of text.split(/[\s/,;:()\[\]{}"'`*|<>=]+/)) {
        if (!tok) continue;
        out.push(tok);
        if (/[.\-_]/.test(tok)) out.push(...tok.split(/[.\-_]+/).filter(Boolean));
      }
      return out;
    },
    processTerm: (term) => term.toLowerCase().replace(/^[.\-_#]+|[.\-_#]+$/g, "") || null,
  });
  index.addAll(pages);
  return index;
}
