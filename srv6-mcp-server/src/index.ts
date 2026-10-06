#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createSearchState } from "./data/index.js";
import { searchDocs, SECTIONS } from "./tools/search.js";
import { getBehavior, loadBehaviors } from "./tools/behaviors.js";
import { getVendorConfig, VENDORS } from "./tools/configs.js";

// stdout is the MCP transport: log to stderr only.
const log = (msg: string) => console.error(`[srv6-mcp] ${msg}`);

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const knowledgeDir = path.join(packageRoot, "knowledge");

function parseDocsPath(argv: string[]): string {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--docs-path" && argv[i + 1]) return path.resolve(argv[i + 1]); // relative to cwd
    if (argv[i].startsWith("--docs-path=")) return path.resolve(argv[i].slice("--docs-path=".length));
  }
  return path.resolve(packageRoot, "..", "docs"); // default: sibling docs/ in the srv6.md repo
}

const text = (t: string, isError = false) => ({ content: [{ type: "text" as const, text: t }], ...(isError ? { isError: true } : {}) });
const fail = (tool: string, err: unknown) => {
  log(`${tool} failed: ${(err as Error).stack ?? err}`);
  return text(`${tool} failed: ${(err as Error).message}`, true);
};

async function main() {
  const docsPath = parseDocsPath(process.argv.slice(2));
  log(`docs path: ${docsPath}`);
  const search = await createSearchState(docsPath);
  const behaviors = await loadBehaviors(knowledgeDir);
  log(`indexed ${search.pages.size} pages, ${behaviors.length} behaviors`);

  const server = new McpServer({ name: "srv6-mcp-server", version: "0.1.0" });

  server.registerTool(
    "search_srv6_docs",
    {
      description:
        "Search the srv6.md knowledge base for SRv6 technical content. Covers RFCs, architecture topics, implementation guides, labs, and use cases. Returns ranked results with source page and relevant snippets.",
      inputSchema: {
        query: z.string().min(1).describe("Natural language search query, e.g. 'how does End.DT4 work' or 'SRv6 uSID compression RFC'"),
        section: z.enum(SECTIONS).default("all").describe("Restrict search to a specific section. Defaults to 'all'."),
        max_results: z.number().int().min(1).max(10).default(5).describe("Maximum number of results to return (1-10). Default: 5."),
      },
    },
    async ({ query, section, max_results }) => {
      try {
        return text(searchDocs(search, query, section, max_results));
      } catch (err) {
        return fail("search_srv6_docs", err);
      }
    },
  );

  server.registerTool(
    "get_endpoint_behavior",
    {
      description:
        "Get detailed information about a specific SRv6 endpoint behavior: definition, pseudocode, use cases, vendor support, and RFC reference. Covers both classic SRv6 (RFC 8986) and uSID (RFC 9800) behaviors.",
      inputSchema: {
        behavior: z.string().min(1).describe("The SRv6 behavior name, e.g. 'End.DT4', 'End.X', 'uN', 'uDT6', 'H.Encaps.Red'"),
        include_pseudocode: z.boolean().default(true).describe("Include the RFC pseudocode for this behavior. Default: true."),
      },
    },
    async ({ behavior, include_pseudocode }) => {
      try {
        return text(getBehavior(behaviors, behavior, include_pseudocode));
      } catch (err) {
        return fail("get_endpoint_behavior", err);
      }
    },
  );

  server.registerTool(
    "get_vendor_config",
    {
      description:
        "Get a vendor-specific SRv6 configuration template for a given feature. Returns copy-paste ready config with inline comments explaining each block. Templates currently exist for cisco-iosxr and frrouting.",
      inputSchema: {
        vendor: z.enum(VENDORS).describe("Target vendor/platform."),
        feature: z.string().min(1).describe("The SRv6 feature to configure, e.g. 'basic-srv6-locator', 'l3vpn-dt4', 'isis-srv6', 'usid-locator'"),
        parameters: z.record(z.string(), z.unknown()).optional().describe("Optional parameters to customize the template (locator prefix, VRF name, AS number, interface, etc)."),
      },
    },
    async ({ vendor, feature, parameters }) => {
      try {
        return text(await getVendorConfig(knowledgeDir, vendor, feature, parameters ?? {}));
      } catch (err) {
        return fail("get_vendor_config", err);
      }
    },
  );

  await server.connect(new StdioServerTransport());
  log("ready (stdio)");
}

main().catch((err) => {
  log(`fatal: ${(err as Error).message}`);
  process.exit(1);
});
