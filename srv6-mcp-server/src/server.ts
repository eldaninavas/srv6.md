import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SearchState } from "./data/index.js";
import { searchDocs, SECTIONS } from "./tools/search.js";
import { getBehavior, type Behavior } from "./tools/behaviors.js";
import { getVendorConfig, VENDORS, type TemplateStore } from "./tools/configs.js";

export const SERVER_VERSION = "0.1.0";

export interface ServerData {
  search: SearchState;
  behaviors: Behavior[];
  templates: TemplateStore;
}

const text = (t: string, isError = false) => ({
  content: [{ type: "text" as const, text: t }],
  ...(isError ? { isError: true } : {}),
});

/** Builds an McpServer with the three srv6.md tools. Transport-agnostic (stdio or HTTP). */
export function createServer(data: ServerData, log: (msg: string) => void = () => {}): McpServer {
  const fail = (tool: string, err: unknown) => {
    log(`${tool} failed: ${(err as Error).stack ?? err}`);
    return text(`${tool} failed: ${(err as Error).message}`, true);
  };

  const server = new McpServer({ name: "srv6-mcp-server", version: SERVER_VERSION });

  server.registerTool(
    "search_srv6_docs",
    {
      description:
        "Search the srv6.md knowledge base for SRv6 technical content. Covers RFCs, architecture topics, implementation guides, labs, and use cases. Returns ranked results with source page and relevant snippets.",
      inputSchema: {
        query: z.string().min(1).max(300).describe("Natural language search query, e.g. 'how does End.DT4 work' or 'SRv6 uSID compression RFC'"),
        section: z.enum(SECTIONS).default("all").describe("Restrict search to a specific section. Defaults to 'all'."),
        max_results: z.number().int().min(1).max(10).default(5).describe("Maximum number of results to return (1-10). Default: 5."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, section, max_results }) => {
      try {
        return text(searchDocs(data.search, query, section, max_results));
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
        behavior: z.string().min(1).max(64).describe("The SRv6 behavior name, e.g. 'End.DT4', 'End.X', 'uN', 'uDT6', 'H.Encaps.Red'"),
        include_pseudocode: z.boolean().default(true).describe("Include the RFC pseudocode for this behavior. Default: true."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ behavior, include_pseudocode }) => {
      try {
        return text(getBehavior(data.behaviors, behavior, include_pseudocode));
      } catch (err) {
        return fail("get_endpoint_behavior", err);
      }
    },
  );

  server.registerTool(
    "get_vendor_config",
    {
      description:
        "Get a vendor-specific SRv6 configuration template for a given feature. Returns copy-paste ready config with notes. Templates currently exist for cisco-iosxr and frrouting.",
      inputSchema: {
        vendor: z.enum(VENDORS).describe("Target vendor/platform."),
        feature: z.string().min(1).max(64).describe("The SRv6 feature to configure, e.g. 'basic-srv6-locator', 'l3vpn-dt4', 'isis-srv6', 'usid-locator'"),
        parameters: z.record(z.string(), z.unknown()).optional().describe("Optional parameters to customize the template (locator prefix, VRF name, AS number, interface, etc)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ vendor, feature, parameters }) => {
      try {
        return text(getVendorConfig(data.templates, vendor, feature, parameters ?? {}));
      } catch (err) {
        return fail("get_vendor_config", err);
      }
    },
  );

  return server;
}
