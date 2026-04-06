#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BUNDLED_DOCS_DIR = join(__dirname, "../docs");
const REPO_DOCS_DIR = join(__dirname, "../../docs");

const LIVE_URL = "https://srv6.md/llms-full.txt";
const LIVE_INDEX_URL = "https://srv6.md/llms.txt";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// --- Content Cache ---

let contentCache = null;
let cacheTimestamp = 0;

async function fetchLiveContent() {
  try {
    const response = await fetch(LIVE_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return parseLlmsFullTxt(text);
  } catch {
    return null;
  }
}

function parseLlmsFullTxt(text) {
  const docs = [];
  const sections = text.split("\n---\n");

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed || trimmed.startsWith("# SRv6.md")) continue;

    const titleMatch = trimmed.match(/^#\s+(.+)$/m);
    const pathMatch = trimmed.match(/^title:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1] : "Untitled";

    docs.push({
      path: pathMatch ? pathMatch[1].toLowerCase().replace(/\s+/g, "-") + ".md" : "unknown.md",
      title,
      content: trimmed,
    });
  }

  return docs;
}

function getLocalDocs(dir) {
  const docs = [];
  if (!existsSync(dir)) return docs;

  function walk(d) {
    const entries = readdirSync(d);
    for (const entry of entries) {
      const fullPath = join(d, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".md") && entry !== "index.md" && entry !== "tags.md") {
        const relPath = relative(dir, fullPath);
        const content = readFileSync(fullPath, "utf-8");
        const titleMatch = content.match(/^#\s+(.+)$/m);
        docs.push({
          path: relPath,
          title: titleMatch ? titleMatch[1] : basename(entry, ".md"),
          content,
        });
      }
    }
  }

  walk(dir);
  return docs;
}

async function getDocs() {
  const now = Date.now();

  // Return cache if fresh
  if (contentCache && now - cacheTimestamp < CACHE_TTL) {
    return contentCache;
  }

  // Try live fetch first
  const liveDocs = await fetchLiveContent();
  if (liveDocs && liveDocs.length > 0) {
    contentCache = liveDocs;
    cacheTimestamp = now;
    return contentCache;
  }

  // Fallback: bundled docs in npm package
  let localDocs = getLocalDocs(BUNDLED_DOCS_DIR);

  // Fallback: repo docs (if cloned)
  if (localDocs.length === 0) {
    localDocs = getLocalDocs(REPO_DOCS_DIR);
  }

  if (localDocs.length > 0) {
    contentCache = localDocs;
    cacheTimestamp = now;
  }

  return contentCache || [];
}

async function searchDocs(query) {
  const docs = await getDocs();
  const queryLower = query.toLowerCase();
  const terms = queryLower.split(/\s+/);

  return docs
    .map((doc) => {
      const contentLower = doc.content.toLowerCase();
      const titleLower = doc.title.toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        const matches = contentLower.split(term).length - 1;
        score += matches;
      }
      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score);
}

// --- MCP Server ---

const server = new McpServer({
  name: "srv6-knowledge-base",
  version: "1.0.0",
});

// Tool: search
server.tool(
  "search_srv6",
  "Search the SRv6.md knowledge base for information about Segment Routing over IPv6. Use this to find details about SRv6 concepts, configurations, RFCs, implementations, and lab setups.",
  {
    query: z
      .string()
      .describe(
        "Search query (e.g., 'End.DT4 behavior', 'linux kernel srv6', 'traffic engineering')"
      ),
    max_results: z
      .number()
      .optional()
      .default(3)
      .describe("Maximum number of results to return (default: 3)"),
  },
  async ({ query, max_results }) => {
    const results = (await searchDocs(query)).slice(0, max_results);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No results found for "${query}". Try broader terms like "srv6", "vpn", "linux", "traffic engineering".`,
          },
        ],
      };
    }

    const output = results
      .map(
        (r) =>
          `## ${r.title}\n**Source:** ${r.path} | **Relevance:** ${r.score}\n\n${r.content}`
      )
      .join("\n\n---\n\n");

    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: list pages
server.tool(
  "list_srv6_pages",
  "List all available pages in the SRv6.md knowledge base.",
  {},
  async () => {
    const docs = await getDocs();
    const list = docs.map((d) => `- **${d.title}** (${d.path})`).join("\n");

    return {
      content: [
        {
          type: "text",
          text: `# SRv6.md Knowledge Base\n\n${docs.length} pages available:\n\n${list}\n\n_Source: ${contentCache ? "live" : "local"}_`,
        },
      ],
    };
  }
);

// Tool: read specific page
server.tool(
  "read_srv6_page",
  "Read a specific page from the SRv6.md knowledge base by its path or title.",
  {
    query: z
      .string()
      .describe(
        "Page path (e.g., 'fundamentals/what-is-srv6.md') or title keyword (e.g., 'linux kernel')"
      ),
  },
  async ({ query }) => {
    const docs = await getDocs();
    const queryLower = query.toLowerCase();

    // Try exact path match
    let doc = docs.find((d) => d.path.toLowerCase() === queryLower);

    // Try partial path match
    if (!doc) {
      doc = docs.find((d) => d.path.toLowerCase().includes(queryLower));
    }

    // Try title match
    if (!doc) {
      doc = docs.find((d) => d.title.toLowerCase().includes(queryLower));
    }

    if (doc) {
      return {
        content: [{ type: "text", text: `# ${doc.title}\n\n${doc.content}` }],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Page not found: "${query}". Use list_srv6_pages to see available pages.`,
        },
      ],
    };
  }
);

// Resource: llms.txt
server.resource("llms-txt", "srv6://llms.txt", async (uri) => {
  try {
    const response = await fetch(LIVE_INDEX_URL, {
      signal: AbortSignal.timeout(5000),
    });
    const text = await response.text();
    return {
      contents: [{ uri: uri.href, mimeType: "text/plain", text }],
    };
  } catch {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: "Could not fetch llms.txt. Visit https://srv6.md/llms.txt",
        },
      ],
    };
  }
});

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
