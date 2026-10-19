"""
MkDocs hook: generate /llms.txt (https://llmstxt.org) after each build.
Lists every page with its title and description so AI assistants and
AI search engines can discover and cite the knowledge base.
"""

import os
import re
import logging

log = logging.getLogger("mkdocs.hooks.llms_txt")

SECTIONS = [
    ("topics", "Topics"),
    ("use-cases", "Use Cases"),
    ("implementations", "Implementations"),
    ("labs", "Labs"),
    ("rfcs", "RFCs & Standards"),
]


def _front_matter(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    meta = m.group(1) if m else ""

    def field(name):
        fm = re.search(rf"^{name}:\s*(.+)$", meta, re.M)
        return fm.group(1).strip().strip('"').replace('\\"', '"') if fm else ""

    return field("seo_title") or field("title"), field("description")


def on_post_build(config, **kwargs):
    docs_dir = config["docs_dir"]
    site_url = config["site_url"].rstrip("/") + "/"
    lines = [
        "# SRv6.md",
        "",
        f"> {config['site_description']}.",
        "",
        "SRv6.md is a community-driven, MIT-licensed knowledge base covering SRv6 "
        "fundamentals, use cases, vendor implementations, hands-on labs, and RFC "
        "references. The full content is available at "
        f"{site_url}llms-full.txt.",
        "",
    ]
    count = 0
    for directory, heading in SECTIONS:
        root = os.path.join(docs_dir, directory)
        if not os.path.isdir(root):
            continue
        lines += [f"## {heading}", ""]
        for name in sorted(os.listdir(root)):
            if not name.endswith(".md"):
                continue
            title, description = _front_matter(os.path.join(root, name))
            slug = "" if name == "index.md" else name[:-3] + "/"
            entry = f"- [{title}]({site_url}{directory}/{slug})"
            lines.append(f"{entry}: {description}" if description else entry)
            count += 1
        lines.append("")

    with open(os.path.join(config["site_dir"], "llms.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    log.info(f"llms.txt written: {count} pages")
