"""
MkDocs hook: swap allowlisted Mermaid blocks for their build-time conversions.

tools/diagrams/build.mjs (run before `mkdocs build`) writes
build/diagrams/manifest.json: per page, the hash of each converted block and
either a laid-out flowchart (drawn by React Flow) or a pre-rendered sequence
SVG. A block converts only when its current source hashes to an entry, so a
missing or stale manifest just leaves Mermaid in place.

The hash must match tools/diagrams/extract.mjs (blockHash).
"""

import hashlib
import html
import json
import logging
import os
import re

from mkdocs.utils import get_relative_url

log = logging.getLogger("mkdocs.hooks.diagrams")

_FENCE = re.compile(r"^([ \t]*)```mermaid[ \t]*\n(.*?)\n\1```[ \t]*$", re.M | re.S)
_PLACEHOLDER = re.compile(r'(?:<p>)?<div class="srv6-diagram-ph" data-hash="([0-9a-f]{16})"></div>(?:</p>)?')

_manifest = {}

# Must match bounds() in src/diagrams/flow.jsx: 8px around the layout.
FIT_PAD = {"x": 16, "y": 16}


def _block_hash(source):
    return hashlib.sha256(source.encode("utf-8")).hexdigest()[:16]


def _dedent(indent, body):
    lines = [line[len(indent):] if line.startswith(indent) else line for line in body.split("\n")]
    return "\n".join(lines).strip()


def on_config(config, **kwargs):
    _manifest.clear()
    path = os.path.join(os.path.dirname(config["config_file_path"]), "build", "diagrams", "manifest.json")
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            _manifest.update(json.load(f))
    else:
        log.info("diagrams: no build/diagrams/manifest.json, all diagrams stay on Mermaid")


def on_page_markdown(markdown, page, config, **kwargs):
    entries = _manifest.get("pages", {}).get(page.file.src_uri)
    if not entries:
        return markdown
    found = []

    def swap(match):
        indent, body = match.group(1), match.group(2)
        digest = _block_hash(_dedent(indent, body))
        if digest not in entries:
            return match.group(0)
        found.append(digest)
        return f'{indent}<div class="srv6-diagram-ph" data-hash="{digest}"></div>'

    markdown = _FENCE.sub(swap, markdown)
    missing = set(entries) - set(found)
    if missing:
        log.warning("diagrams: %s changed since build/diagrams was generated; %d diagram(s) stay on Mermaid "
                    "(run `npm run diagrams`)", page.file.src_uri, len(missing))
    page.meta["_srv6_diagrams"] = found
    return markdown


def _describe(diagram):
    names = {n["id"]: " ".join(n["label"]) for n in diagram["nodes"]}
    names.update({g["id"]: " ".join(g["label"]) for g in diagram["groups"]})
    items = []
    for e in diagram["edges"]:
        text = f'{names.get(e["source"], e["source"])} → {names.get(e["target"], e["target"])}'
        if e.get("label"):
            text += f' ({" ".join(e["label"])})'
        items.append(f"<li>{html.escape(text)}</li>")
    return "".join(items)


def _flowchart(entry):
    d = entry["diagram"]
    w, h = d["width"] + FIT_PAD["x"], d["height"] + FIT_PAD["y"]
    # An attribute, not <script type="application/json">: Material's instant
    # navigation re-creates content scripts without their type and runs them.
    data = html.escape(json.dumps(d, ensure_ascii=False, separators=(",", ":")), quote=True)
    return (
        f'<div class="srv6-flow" role="group" aria-label="Flowchart" data-diagram="{data}" '
        f'style="aspect-ratio: {w} / {h}; max-height: {h}px">'
        f'<ul class="srv6-flow__text">{_describe(d)}</ul>'
        f'<noscript><pre class="mermaid-source"><code>{html.escape(entry["source"])}</code></pre></noscript>'
        f"</div>"
    )


def on_page_content(content, page, config, files, **kwargs):
    found = page.meta.get("_srv6_diagrams")
    if not found:
        return content
    entries = _manifest["pages"][page.file.src_uri]
    flows = 0

    def render(match):
        nonlocal flows
        entry = entries[match.group(1)]
        if entry["kind"] == "sequence":
            return f'<div class="srv6-seq">{entry["svg"]}</div>'
        flows += 1
        return _flowchart(entry)

    content = _PLACEHOLDER.sub(render, content)
    if flows:
        src = get_relative_url(_manifest["script"], page.url)
        content += f'\n<script src="{src}"></script>'
    return content
