#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSearchState } from "./data/index.js";
import { loadBehaviors } from "./tools/behaviors.js";
import { loadTemplates } from "./tools/configs.js";
import { createServer } from "./server.js";

// stdout is the MCP transport: log to stderr only.
const log = (msg: string) => console.error(`[srv6-mcp] ${msg}`);

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const knowledgeDir = path.join(packageRoot, "knowledge");

function resolveDocsPath(argv: string[]): string {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--docs-path" && argv[i + 1]) return path.resolve(argv[i + 1]); // relative to cwd
    if (argv[i].startsWith("--docs-path=")) return path.resolve(argv[i].slice("--docs-path=".length));
  }
  const bundled = path.join(packageRoot, "docs"); // present in the published npm package
  return existsSync(bundled) ? bundled : path.resolve(packageRoot, "..", "docs"); // else the srv6.md repo layout
}

async function main() {
  const docsPath = resolveDocsPath(process.argv.slice(2));
  log(`docs path: ${docsPath}`);
  const data = {
    search: await createSearchState(docsPath),
    behaviors: await loadBehaviors(knowledgeDir),
    templates: await loadTemplates(knowledgeDir),
  };
  log(`indexed ${data.search.pages.size} pages, ${data.behaviors.length} behaviors`);
  await createServer(data, log).connect(new StdioServerTransport());
  log("ready (stdio)");
}

main().catch((err) => {
  log(`fatal: ${(err as Error).message}`);
  process.exit(1);
});
