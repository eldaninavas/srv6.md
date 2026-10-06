import type MiniSearch from "minisearch";
import { buildIndex, loadDocs, type DocPage } from "./loader.js";

export interface SearchState {
  index: MiniSearch<DocPage>;
  pages: Map<string, DocPage>;
}

export async function createSearchState(docsPath: string): Promise<SearchState> {
  const pages = await loadDocs(docsPath);
  return { index: buildIndex(pages), pages: new Map(pages.map((p) => [p.id, p])) };
}

export type { DocPage };
