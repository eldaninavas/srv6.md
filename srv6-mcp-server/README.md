# @srv6md/mcp-server

An [MCP](https://modelcontextprotocol.io) server over the [srv6.md](https://srv6.md) knowledge base. It runs locally over stdio and exposes three tools.

| Tool | What it does |
|------|--------------|
| `search_srv6_docs` | Full-text search (MiniSearch) over every Markdown page in `docs/`. Ranked results with source path and snippet. Filter by `section`: `topics`, `use-cases`, `implementations`, `rfcs`, `labs`, `all`. |
| `get_endpoint_behavior` | Definition, condensed RFC pseudocode, use cases and vendor support for an SRv6 behavior (End, End.X, End.T, End.DT4/DT6, End.DX4/DX6, End.B6.Encaps(.Red), H.Encaps(.Red), uN, uA, uDT4, uDT6). Data: `knowledge/behaviors.json`. |
| `get_vendor_config` | Config template for a vendor and feature, with parameter substitution. Data: `knowledge/config-templates/<vendor>/<feature>.yaml`. |

Config templates exist today for `cisco-iosxr` and `frrouting`: `basic-srv6-locator`, `usid-locator`, `isis-srv6`, `l3vpn-dt4`. Other vendors return the list of what is available. Templates are starting points; verify syntax against your software release.

## Setup

From the repo root:

```bash
cd srv6-mcp-server
npm install
npm run build
node dist/index.js --docs-path ../docs
```

`--docs-path` defaults to the `docs/` directory next to this package (the srv6.md repo layout). A relative value is resolved against the current working directory. Logs go to stderr; stdout is reserved for the MCP transport.

Once published, `npx @srv6md/mcp-server --docs-path /path/to/srv6.md/docs` works the same way. The published package does not bundle `docs/`, so `--docs-path` is required there.

## Connect

Claude Code:

```bash
claude mcp add srv6 -- node /absolute/path/to/srv6.md/srv6-mcp-server/dist/index.js
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "srv6": {
      "command": "node",
      "args": ["/absolute/path/to/srv6.md/srv6-mcp-server/dist/index.js", "--docs-path", "/absolute/path/to/srv6.md/docs"]
    }
  }
}
```

## Layout

```
src/index.ts          entry point, tool registration
src/tools/            search.ts, behaviors.ts, configs.ts
src/data/             loader.ts (reads docs/, builds index), index.ts
knowledge/            behaviors.json, config-templates/
```

## Adding a config template

Create `knowledge/config-templates/<vendor>/<feature>.yaml` with `description`, `parameters` (defaults), optional `notes`, and a `template` using `{{param}}` placeholders.

Note: the repo also contains an older `mcp-server/` (fetch-based, plain JS). This package is a separate, local-docs implementation.
