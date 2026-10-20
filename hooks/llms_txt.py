"""
MkDocs hook: generate /llms.txt and /llms-full.txt (https://llmstxt.org) after
each build. llms.txt lists every page with its title and description so AI
assistants and AI search engines can discover and cite the knowledge base;
llms-full.txt carries the full English text of every page in nav order.
"""

import os
import re
import logging

log = logging.getLogger("mkdocs.hooks.llms_txt")

SECTIONS = [
    ("ai", "SRv6 for AI networking"),
    ("topics", "Topics"),
    ("use-cases", "Use Cases"),
    ("implementations", "Implementations"),
    ("labs", "Labs"),
    ("rfcs", "RFCs & Standards"),
    ("es", "En español (Spanish)"),
    ("ja", "日本語 (Japanese)"),
]

# Translations duplicate the English text, so llms-full.txt leaves them out
_FULL_SKIP_PREFIXES = ("es/", "ja/", "tags", "knowledge-graph")

_nav_pages = []


def _split_front_matter(text):
    m = re.match(r"---\n(.*?)\n---\n?", text, re.S)
    return (m.group(1), text[m.end():]) if m else ("", text)


def _front_matter(path):
    with open(path, "r", encoding="utf-8") as f:
        meta, _ = _split_front_matter(f.read())

    def field(name):
        fm = re.search(rf"^{name}:\s*(.+)$", meta, re.M)
        return fm.group(1).strip().strip('"').replace('\\"', '"') if fm else ""

    return field("seo_title") or field("title"), field("description")


def _clean_prose(text):
    # Drop theme-only syntax and raw HTML that mean nothing outside the site
    text = re.sub(r"\{[ .#][^}\n]*\}", "", text)
    text = re.sub(r":(material|fontawesome|octicons|simple)-[a-z0-9-]+:\s?", "", text)
    text = re.sub(r"<(ul|ol)[^>]*>.*?</\1>", "", text, flags=re.S)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&nbsp;", " ")
    # "---" on its own line separates pages for llms-full.txt readers such as
    # mcp-server/src/index.js, so horizontal rules become "***"
    text = re.sub(r"^---$", "***", text, flags=re.M)
    return re.sub(r"^[ \t]+$", "", text, flags=re.M)


def _absolute_links(text, src, site_url):
    # Relative .md links only resolve inside the docs tree; give LLMs real URLs
    def repl(m):
        path = os.path.normpath(os.path.join(os.path.dirname(src), m.group(1))).replace(os.sep, "/")
        path = re.sub(r"(^|/)index\.md$", r"\1", path)
        path = re.sub(r"\.md$", "/", path)
        return f"]({site_url}{path}{m.group(2) or ''})"

    return re.sub(r"\]\((?!https?:)([^)\s#]+\.md)(#[^)\s]*)?\)", repl, text)


def _clean_body(body, src, site_url):
    # Code blocks (the 3-backtick fences) pass through untouched
    parts = re.split(r"(^```.*?^```[ \t]*$)", body, flags=re.S | re.M)
    body = "".join(
        re.sub(r"^---$", "--- ", p, flags=re.M) if i % 2
        else _absolute_links(_clean_prose(p), src, site_url)
        for i, p in enumerate(parts)
    )
    return re.sub(r"\n{3,}", "\n\n", body).strip()


def on_nav(nav, config, files, **kwargs):
    _nav_pages.clear()
    _nav_pages.extend(p.file for p in nav.pages)
    return nav


def _write_full(config, site_url):
    out = [
        "# SRv6.md - Full Content for LLMs",
        "",
        f"> {config['site_description']}. Source: {site_url} (MIT License). "
        "Each page below starts with its title, canonical URL and summary.",
        "",
    ]
    count = 0
    for f in _nav_pages:
        if f.src_uri.startswith(_FULL_SKIP_PREFIXES):
            continue
        with open(f.abs_src_path, "r", encoding="utf-8") as fh:
            meta, body = _split_front_matter(fh.read())
        title, description = _front_matter(f.abs_src_path)
        url = site_url + ("" if f.url in (".", "./") else f.url)
        out += ["", "---", "", f"# {title or f.src_uri}", "", f"URL: {url}", f"Path: {f.src_uri}"]
        if description:
            out.append(f"Summary: {description}")
        out += ["", _clean_body(body, f.src_uri, site_url), ""]
        count += 1
    with open(os.path.join(config["site_dir"], "llms-full.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))
    return count


def on_post_build(config, **kwargs):
    docs_dir = config["docs_dir"]
    site_url = config["site_url"].rstrip("/") + "/"
    lines = [
        "# SRv6.md",
        "",
        f"> {config['site_description']}.",
        "",
        "SRv6.md is a community-driven, MIT-licensed knowledge base covering SRv6 "
        "fundamentals, SRv6 for AI networking (GPU backend fabrics, OpenAI's MRC, "
        "multi-datacenter training), use cases, vendor implementations, hands-on "
        "labs, and RFC references. The full content is available at "
        f"{site_url}llms-full.txt.",
        "",
    ]
    count = 0
    for directory, heading in SECTIONS:
        root = os.path.join(docs_dir, directory)
        if not os.path.isdir(root):
            continue
        lines += [f"## {heading}", ""]
        for name in sorted(os.listdir(root), key=lambda n: (n != "index.md", n)):
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
    full = _write_full(config, site_url)
    log.info(f"llms.txt written: {count} pages; llms-full.txt: {full} pages")
