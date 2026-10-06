import type MiniSearch from "minisearch";
import { buildIndex, loadDocs, type DocPage } from "./loader.js";

export interface SearchState {
  index: MiniSearch<DocPage>;
  pages: Map<string, DocPage>;
}

export function createSearchStateFromPages(pages: DocPage[]): SearchState {
  return { index: buildIndex(pages), pages: new Map(pages.map((p) => [p.id, p])) };
}

export async function createSearchState(docsPath: string): Promise<SearchState> {
  return createSearchStateFromPages(await loadDocs(docsPath));
}

export type { DocPage };
