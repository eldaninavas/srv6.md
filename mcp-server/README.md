# SRv6 MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI assistants access to the [SRv6.md](https://srv6.md) knowledge base.

## How It Works

```
┌─────────────────────────────────────────────┐
│  User's machine                             │
│                                             │
│  ┌───────────┐   stdio   ┌───────────────┐ │
│  │  Claude   │◄─────────►│  MCP Server   │ │
│  │  Desktop  │           │               │ │
│  │  or Code  │           │  1. fetch from │ │
│  └───────────┘           │  srv6.md/      │ │
│                          │  (live)        │ │
│                          │                │ │
│                          │  2. fallback:  │ │
│                          │  bundled .md   │ │
│                          │  (offline)     │ │
│                          └───────────────┘ │
└─────────────────────────────────────────────┘
```

The server runs **locally** on the user's machine. It fetches live content from `https://srv6.md` and caches it for 5 minutes. If offline, it falls back to bundled Markdown files.

## Tools

| Tool | Description |
|------|-------------|
| `search_srv6` | Search the knowledge base by keyword |
| `list_srv6_pages` | List all available wiki pages |
| `read_srv6_page` | Read a specific page by path or title |

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "srv6": {
      "command": "npx",
      "args": ["srv6-mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add srv6 npx srv6-mcp-server
```

### Local Development

```bash
cd mcp-server
npm install
npm start
```

## Example Usage

Once connected, Claude can:

- "What SRv6 behaviors are available on Linux kernel?"
- "Show me the End.DT4 configuration for Cisco IOS-XR"
- "Explain the difference between SRv6 and SR-MPLS"
- "How do I set up an SRv6 lab with Containerlab?"

## License

MIT
