# SRv6.md

> The open-source knowledge base for **Segment Routing over IPv6 (SRv6)**.

[![Deploy](https://github.com/eldaninavas/srv6.md/actions/workflows/deploy.yml/badge.svg)](https://github.com/eldaninavas/srv6.md/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/community/contributing.md)

## About

[SRv6.md](https://srv6.md) is a community-driven wiki covering everything about SRv6: fundamentals, use cases, vendor implementations, hands-on labs, and RFC references.

## Local Development

```bash
# Clone
git clone https://github.com/eldaninavas/srv6.md.git
cd srv6.md

# Install dependencies
pip install -r requirements.txt

# Serve locally (with live reload)
mkdocs serve

# Build static site
mkdocs build
```

Diagrams are written in Mermaid. The ones listed in `tools/diagrams/pilot.json` are
converted at build time (flowcharts to React Flow, sequence diagrams to inline SVG);
without this step they simply stay on Mermaid. Packets run on edges you name and
mark in the Mermaid source (`A e1@--> B` plus `e1@{ animate: true }`), and a
diagram's `scenarios` in `pilot.json` add a link-failure toggle. Needs Node 20+ and Chrome
(`CHROME_PATH`, or Playwright's browser):

```bash
npm ci
npm run diagrams   # before mkdocs build/serve
npm test           # SID decoder + diagram converter
```

## Contributing

We welcome contributions! See our [Contributing Guide](docs/community/contributing.md) for details.

**Quick edit:** Every page on the site has an edit button (pencil icon) that takes you directly to the file on GitHub.

## Structure

```
docs/
  ├── fundamentals/     # Core SRv6 concepts
  ├── use-cases/        # Real-world applications
  ├── implementations/  # Platform-specific guides
  ├── labs/             # Hands-on lab environments
  ├── rfcs/             # RFC summaries
  └── community/        # Contributing guidelines
```

## License

MIT License - see [LICENSE](LICENSE) for details.
