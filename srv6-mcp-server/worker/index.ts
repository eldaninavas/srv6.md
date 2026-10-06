import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createSearchStateFromPages } from "../src/data/index.js";
import { createServer, SERVER_VERSION, type ServerData } from "../src/server.js";
import raw from "./generated/data.json";

interface RateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}
interface Env {
  RATE_LIMITER?: RateLimiter;
}

const MAX_BODY_BYTES = 64 * 1024;

let cached: ServerData | undefined;
const getData = (): ServerData =>
  (cached ??= {
    search: createSearchStateFromPages(raw.pages as never),
    behaviors: raw.behaviors as never,
    templates: raw.templates as never,
  });

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept, mcp-session-id, mcp-protocol-version, last-event-id",
  "access-control-expose-headers": "mcp-session-id, mcp-protocol-version",
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...CORS, ...extra } });

const LANDING = `SRv6 MCP server (srv6.md) v${SERVER_VERSION}

Free, read-only Model Context Protocol server for SRv6 knowledge.
Endpoint: POST /mcp (Streamable HTTP, stateless)

Tools: search_srv6_docs, get_endpoint_behavior, get_vendor_config

Claude Code:  claude mcp add --transport http srv6 https://mcp.srv6.md/mcp
Other clients: add a remote MCP server with URL https://mcp.srv6.md/mcp

Docs: https://srv6.md   Source: https://github.com/eldaninavas/srv6.md
`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === "/health") return json({ ok: true, version: SERVER_VERSION, pages: getData().search.pages.size });

    if (url.pathname === "/" || url.pathname === "") {
      return new Response(LANDING, { headers: { "content-type": "text/plain; charset=utf-8", ...CORS } });
    }

    if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);

    // Stateless server: no sessions, no server-initiated streams.
    if (req.method !== "POST") {
      return json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed. Use POST /mcp." }, id: null }, 405, { allow: "POST, OPTIONS" });
    }

    if (env.RATE_LIMITER) {
      const key = req.headers.get("cf-connecting-ip") ?? "unknown";
      const { success } = await env.RATE_LIMITER.limit({ key });
      if (!success) return json({ jsonrpc: "2.0", error: { code: -32029, message: "Rate limit exceeded. Retry in a minute." }, id: null }, 429, { "retry-after": "60" });
    }

    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_BODY_BYTES) return json({ error: "payload_too_large" }, 413);

    const server = createServer(getData(), (m) => console.error(m));
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    try {
      const res = await transport.handleRequest(req);
      const headers = new Headers(res.headers);
      for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
      return new Response(res.body, { status: res.status, headers });
    } catch (err) {
      console.error(`mcp request failed: ${(err as Error).stack ?? err}`);
      return json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null }, 500);
    } finally {
      await transport.close();
      await server.close();
    }
  },
};
