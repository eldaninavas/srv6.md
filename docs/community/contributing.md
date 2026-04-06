---
title: Contributing
description: How to contribute to SRv6.md
tags:
  - community
  - contributing
---

# Contributing to SRv6.md

Thank you for your interest in contributing! This guide will help you get started.

## Quick Edit (Browser)

Every page has an :material-pencil: **edit button** in the top right corner. Click it to edit directly on GitHub — no local setup required.

## Local Development

### Prerequisites

- Python 3.10+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/eldaninavas/srv6.md.git
cd srv6.md

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start local dev server
mkdocs serve
```

The site will be available at `http://localhost:8000` with live reload.

## Content Guidelines

### File Naming

- Use lowercase with hyphens: `my-new-page.md`
- Place files in the appropriate section folder

### Page Structure

Every page should include:

```markdown
---
title: Page Title
description: Brief description for SEO
tags:
  - relevant
  - tags
---

# Page Title

Introduction paragraph.

## Section 1

Content...

## Further Reading

- Links to related pages
```

### Style Tips

- Use **admonitions** for tips, warnings, and examples
- Include **code blocks** with language hints for syntax highlighting
- Add **Mermaid diagrams** to visualize network concepts
- Use **tables** for structured comparisons
- Link to **related pages** at the bottom

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test locally with `mkdocs serve`
4. Submit a PR with a clear description
5. Wait for review

!!! tip "First contribution?"
    Look for issues labeled `good first issue` on GitHub. These are great starting points!
