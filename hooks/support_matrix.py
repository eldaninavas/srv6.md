"""
MkDocs hook: render the SRv6 support matrix from
docs/implementations/support-matrix.yml into any page that contains the
<!-- support-matrix --> placeholder.

The YAML is the single source of truth. The hook emits plain Markdown (a pipe
table plus footnotes), so link checking in `mkdocs build --strict`, footnote
tooltips and llms-full.txt all work on the generated text. Each cell links to
its source through a footnote; a cell with a note gets its own footnote, cells
without one share the footnote of their source.
"""

import os
import re

import yaml

PLACEHOLDER = "<!-- support-matrix -->"
VERIFIED = "<!-- support-matrix-verified -->"
DATA_FILE = "implementations/support-matrix.yml"

# status -> (css class, symbol, label)
STATUS = {
    "yes": ("smx-y", "✓", "Supported"),
    "partial": ("smx-p", "◐", "Partial"),
    "no": ("smx-n", "✗", "Not supported"),
    "unknown": ("smx-u", "?", "Unknown"),
}


def load(docs_dir):
    with open(os.path.join(docs_dir, DATA_FILE), encoding="utf-8") as f:
        return yaml.safe_load(f)


def _esc(text):
    # Pipe-table cells and footnote text: no raw pipes or newlines
    return str(text).replace("|", "\\|").replace("\n", " ").strip()


def _attr(text):
    return str(text).replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def render(data, plain=False):
    platforms = data["platforms"]
    sources = data.get("sources", {})
    cells = data.get("cells", {})
    notes = []  # footnote definitions, in order of first use
    used = set()

    def footnote(pid, rid, cell):
        src = cell.get("src")
        if not src:
            return ""
        keys = src if isinstance(src, list) else [src]
        links = []
        for k in keys:
            s = sources[pid][k]
            links.append(f"[{_esc(s['title'])}]({s['url']})")
        if cell.get("note"):
            fid = f"smx-{pid}-{rid}"
            text = f"{_esc(cell['note'])} Source: " + "; ".join(links)
        else:
            fid = f"smx-{pid}-{'-'.join(keys)}"
            text = "; ".join(links)
        if fid not in used:
            used.add(fid)
            plat = next(p for p in platforms if p["id"] == pid)
            notes.append(f"[^{fid}]: **{plat.get('full', plat['name'])}:** {text}")
        return f"[^{fid}]"

    def plat_head(p):
        name = f'[{p["name"]}]({os.path.basename(p["page"])})' if p.get("page") else p["name"]
        return name if plain else f'<span data-p="{p["id"]}">{name}</span>'

    head = ["Capability"] + [plat_head(p) for p in platforms]
    lines = [
        "| " + " | ".join(head) + " |",
        "|" + "---|" + ":-:|" * len(platforms),
    ]
    for cat in data["categories"]:
        cat_label = f"**{cat['name']}**" if plain else (
            f'<span class="smx-cat" id="{cat["id"]}" data-cat="{cat["id"]}">{cat["name"]}</span>')
        lines.append(f"| {cat_label} |" + " |" * len(platforms))
        for row in cat["rows"]:
            label = row["name"]
            if row.get("link"):
                label = f"[{label}]({row['link']})"
            if row.get("ref"):
                label += f' <small>{row["ref"]}</small>'
            first = label if plain else (
                f'<span class="smx-row" id="{row["id"].replace("_", "-")}" data-cat="{cat["id"]}"></span>{label}')
            out = [first]
            for p in platforms:
                cell = (cells.get(p["id"]) or {}).get(row["id"]) or {"s": "unknown"}
                status = cell.get("s", "unknown")
                if status is True:  # YAML 1.1 reads a bare yes as a boolean
                    status = "yes"
                elif status is False:
                    status = "no"
                cls, sym, text = STATUS[status]
                rel = cell.get("r", "")
                title = text + (f" since {rel}" if rel and status in ("yes", "partial") else "")
                if cell.get("note"):
                    title += f" — {cell['note']}"
                if plain:
                    body = text + (f" {_esc(rel)}" if rel else "")
                else:
                    body = f'<span class="smx-s {cls}" title="{_attr(title)}"><span aria-hidden="true">{sym}</span>'
                    body += f'<span class="smx-sr">{text}</span>'
                    if rel:
                        body += f' {_esc(rel)}'
                    body += "</span>"
                body += footnote(p["id"], row["id"], cell)
                out.append(body)
            lines.append("| " + " | ".join(out) + " |")

    table = "\n".join(lines)
    if plain:
        return table + "\n", "\n\n".join(notes)
    md = f'{_controls(data)}\n\n<div class="smx" markdown>\n\n{table}\n\n</div>\n'
    return md, "\n\n".join(notes)


def _controls(data):
    # Hidden until custom.js wires them up, so no-JS readers never see dead controls
    plats = "".join(
        f'<label class="smx-chip"><input type="checkbox" value="{p["id"]}" checked> {p.get("full", p["name"])}</label>'
        for p in data["platforms"]
    )
    cats = '<option value="">All capabilities</option>' + "".join(
        f'<option value="{c["id"]}">{c["name"]}</option>' for c in data["categories"]
    )
    return (
        '<details class="smx-controls" hidden><summary>Filter platforms and capabilities</summary>'
        '<div class="smx-controls-body">'
        f'<fieldset class="smx-plats"><legend>Platforms</legend>{plats}'
        '<button type="button" class="smx-btn" data-smx="all">All</button>'
        '<button type="button" class="smx-btn" data-smx="none">None</button></fieldset>'
        f'<label class="smx-catsel">Category <select>{cats}</select></label>'
        "</div></details>"
    )


def render_text(docs_dir, markdown, plain=False):
    """Expand the placeholders in a page's Markdown. llms_txt.py passes
    plain=True for a text-only table without the HTML badges and filters."""
    if PLACEHOLDER not in markdown and VERIFIED not in markdown:
        return markdown
    data = load(docs_dir)
    table, notes = render(data, plain)
    markdown = markdown.replace(VERIFIED, str(data["verified"]))
    markdown = markdown.replace(PLACEHOLDER, table)
    return markdown.rstrip() + "\n\n" + notes + "\n"


def on_page_markdown(markdown, page, config, **kwargs):
    return render_text(config["docs_dir"], markdown)
