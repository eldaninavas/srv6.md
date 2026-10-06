import type { SearchState } from "../data/index.js";

export const SECTIONS = ["topics", "use-cases", "implementations", "rfcs", "labs", "all"] as const;
export type Section = (typeof SECTIONS)[number];

const SNIPPET_LEN = 280;

function makeSnippet(body: string, terms: string[]): string {
  const text = body.replace(/```[\s\S]*?```/g, (m) => m).replace(/\s+/g, " ");
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase());
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  const start = Math.max(0, (at === -1 ? 0 : at) - 80);
  const slice = text.slice(start, start + SNIPPET_LEN).trim();
  return `${start > 0 ? "…" : ""}${slice}${start + SNIPPET_LEN < text.length ? "…" : ""}`;
}

export function searchDocs(state: SearchState, query: string, section: Section, maxResults: number): string {
  const limit = Math.min(Math.max(Math.trunc(maxResults) || 5, 1), 10);
  const hits = state.index
    .search(query, section === "all" ? {} : { filter: (r) => r.section === section })
    .slice(0, limit);

  if (hits.length === 0) {
    // AND matching is strict; retry loosely before giving up
    const loose = state.index
      .search(query, { combineWith: "OR", filter: section === "all" ? undefined : (r) => r.section === section })
      .slice(0, limit);
    if (loose.length === 0) return `No results for "${query}"${section === "all" ? "" : ` in section "${section}"`}.`;
    return format(state, loose, "No exact match; showing partial matches.");
  }
  return format(state, hits);
}

function format(state: SearchState, hits: { id: string; score: number; terms: string[] }[], note?: string): string {
  const lines = hits.map((h, i) => {
    const page = state.pages.get(h.id)!;
    return [
      `${i + 1}. **${page.title}** (${page.section}) - docs/${page.id} [score ${h.score.toFixed(1)}]`,
      page.description ? `   ${page.description}` : "",
      `   > ${makeSnippet(page.body, h.terms)}`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [note, ...lines].filter(Boolean).join("\n\n");
}
