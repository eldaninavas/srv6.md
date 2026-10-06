---
title: AI Integrations
description: Integrate SRv6.md with Claude, ChatGPT, and other AI assistants
tags:
  - community
  - integrations
  - ai
  - mcp
---

# :material-robot: AI Integrations

SRv6.md is designed to be AI-friendly. Use our knowledge base as context for your favorite AI assistant to get accurate, up-to-date answers about SRv6.

## Option 1: `llms.txt` (Any AI)

We provide standardized files that any LLM can consume:

| File | Description | Use Case |
|------|-------------|----------|
| [`/llms.txt`](https://srv6.md/llms.txt) | Index of all pages with links | Quick reference, link discovery |
| [`/llms-full.txt`](https://srv6.md/llms-full.txt) | Full content of all pages | Complete knowledge base in one file |

### How to Use

Simply paste one of these URLs in your conversation with any AI:

```
Read https://srv6.md/llms-full.txt and use it as context.
Then answer: How do I configure End.DT4 on Linux?
```

Works with **Claude**, **ChatGPT**, **Gemini**, and any AI that can fetch URLs.

---

## Option 2: Claude Project

Upload the wiki as a **Knowledge Base** in a Claude Project for persistent context.

### Steps

1. Go to [claude.ai](https://claude.ai) → **Projects** → **New Project**
2. Name it "SRv6 Expert" (or whatever you prefer)
3. Download the docs from [GitHub](https://github.com/eldaninavas/srv6.md)
4. Upload all `.md` files from `docs/` as **Knowledge**
5. Set the project instructions:

```
You are an SRv6 networking expert. Use the uploaded knowledge base
to answer questions about Segment Routing over IPv6, including
configurations, RFCs, and lab setups. Always cite the relevant
page when answering.
```

Now every conversation in that project has full SRv6 knowledge.

---

## Option 3: MCP Server (Claude, Cursor, any MCP client)

The **MCP (Model Context Protocol)** server gives your AI assistant direct tool access to the SRv6.md knowledge base. It is **free and hosted**: nothing to install, just add the URL.

```
https://mcp.srv6.md/mcp
```

### Available Tools

| Tool | Description |
|------|-------------|
| `search_srv6_docs` | Full-text search across topics, use cases, implementations, RFCs, and labs |
| `get_endpoint_behavior` | Definition, pseudocode, use cases, and vendor support for End, End.X, End.DT4, uN, H.Encaps.Red, and more |
| `get_vendor_config` | Config templates for Cisco IOS-XR and FRRouting (locator, uSID, IS-IS, L3VPN) |

### Setup for Claude Code

```bash
claude mcp add --transport http srv6 https://mcp.srv6.md/mcp
```

### Setup for Claude Desktop, claude.ai, and other clients

Add a **remote MCP server** (custom connector) with the URL `https://mcp.srv6.md/mcp`. Clients that only support local servers can bridge it with `mcp-remote`:

```json
{
  "mcpServers": {
    "srv6": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.srv6.md/mcp"]
    }
  }
}
```

### What You Can Ask

- *"What SRv6 behaviors does the Linux kernel support?"*
- *"Show me the IOS-XR config for SRv6 L3VPN"*
- *"What's the difference between End.DX4 and End.DT4?"*
- *"Give me an FRR uSID locator template with prefix fcbb:bb00:2::/48"*

!!! note "Fair use"
    The hosted server is read-only and rate limited per IP. To run your own copy, see the source in [`srv6-mcp-server/`](https://github.com/eldaninavas/srv6.md/tree/main/srv6-mcp-server).

---

## For Developers

### Build Your Own Integration

The content is available in multiple formats:

| Format | URL | Best For |
|--------|-----|----------|
| Raw Markdown | [GitHub `docs/`](https://github.com/eldaninavas/srv6.md/tree/main/docs) | Custom parsers, RAG pipelines |
| `llms.txt` | `https://srv6.md/llms.txt` | LLM index discovery |
| `llms-full.txt` | `https://srv6.md/llms-full.txt` | Single-file ingestion |
| MCP Server | `https://mcp.srv6.md/mcp` | Claude, Cursor, and other MCP clients |
| Website | `https://srv6.md` | Human browsing |

### RAG Pipeline Example

```python
# Example: Build a RAG pipeline with the wiki content
import requests

# Fetch all content
response = requests.get("https://srv6.md/llms-full.txt")
content = response.text

# Split into chunks, embed, and store in your vector DB
# Then query with your LLM of choice
```

!!! tip "All content is MIT licensed"
    You're free to use, modify, and redistribute the content for any purpose, including commercial AI applications.
