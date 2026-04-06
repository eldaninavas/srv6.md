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

## Option 3: MCP Server (Claude Code / Claude Desktop)

The **MCP (Model Context Protocol)** server gives Claude direct tool access to search and read the wiki.

### Available Tools

| Tool | Description |
|------|-------------|
| `search_srv6` | Search the knowledge base by keyword |
| `list_srv6_pages` | List all available wiki pages |
| `read_srv6_page` | Read a specific page by its path |

### Setup for Claude Desktop

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

### Setup for Claude Code

```bash
claude mcp add srv6 npx srv6-mcp-server
```

### What You Can Ask

Once the MCP server is connected, Claude can directly query the knowledge base:

- *"What SRv6 behaviors does the Linux kernel support?"*
- *"Show me the IOS-XR config for SRv6 L3VPN"*
- *"What's the difference between End.DX4 and End.DT4?"*
- *"How do I build an SRv6 lab with Containerlab?"*

### Source Code

The MCP server source is in the [`mcp-server/`](https://github.com/eldaninavas/srv6.md/tree/main/mcp-server) directory of the repository.

---

## For Developers

### Build Your Own Integration

The content is available in multiple formats:

| Format | URL | Best For |
|--------|-----|----------|
| Raw Markdown | [GitHub `docs/`](https://github.com/eldaninavas/srv6.md/tree/main/docs) | Custom parsers, RAG pipelines |
| `llms.txt` | `https://srv6.md/llms.txt` | LLM index discovery |
| `llms-full.txt` | `https://srv6.md/llms-full.txt` | Single-file ingestion |
| MCP Server | `npx srv6-mcp-server` | Claude integrations |
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
