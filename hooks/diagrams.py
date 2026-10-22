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


_walk_js = {}


def _packet_walk(config):
    # Tiny standalone script (src/diagrams/packet-walk.js), inlined so the
    # sequence page needs no bundle. Comments are stripped; minify does the rest.
    if "js" not in _walk_js:
        path = os.path.join(os.path.dirname(config["config_file_path"]), "src", "diagrams", "packet-walk.js")
        with open(path, encoding="utf-8") as f:
            _walk_js["js"] = re.sub(r"^\s*//.*\n", "", f.read(), flags=re.M)
    return _walk_js["js"]


_HERO = re.compile(r'(?:<p>)?<div class="srv6-hero-stage"></div>(?:</p>)?')
_hero_cache = {}


def _hero_data(config):
    """The hero scene (src/diagrams/hero-scene.json) and the icon paths."""
    if "scene" not in _hero_cache:
        root = os.path.dirname(config["config_file_path"])
        with open(os.path.join(root, "src", "diagrams", "hero-scene.json"), encoding="utf-8") as f:
            _hero_cache["scene"] = json.load(f)
        with open(os.path.join(root, "src", "diagrams", "icons.mjs"), encoding="utf-8") as f:
            _hero_cache["icons"] = dict(re.findall(r"^  (\w+): '([^']+)'", f.read(), re.M))
    return _hero_cache["scene"], _hero_cache["icons"]


_HERO_ICON = {"spine": "switch", "leaf": "switch", "pe": "router", "gpu": "gpu"}


def _hero_frame(variant, s, icons):
    """The built fabric as inline SVG: the first frame, and what stays when
    there is no JavaScript. Same geometry as src/diagrams/hero.jsx."""
    pad = 10 if variant == "mobile" else 20  # PAD in src/diagrams/hero.jsx
    w, h, font = s["node"]["w"], s["node"]["h"], s["node"]["font"]
    at = {n["id"]: n for n in s["nodes"]}
    gid = f"srv6-hero-g-{variant}"
    out = [
        f'<svg class="srv6-hero-static srv6-hero-static--{variant}" viewBox="{-pad} {-pad} {s["width"] + 2 * pad} {s["height"] + 2 * pad}" '
        f'preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'
        f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" style="stop-color:var(--srv6-node-top)"/><stop offset="1" style="stop-color:var(--srv6-node-bottom)"/>'
        f"</linearGradient></defs>"
    ]
    for a, b, *tags in s["links"]:
        if "mrc" in tags:
            continue
        out.append(f'<line x1="{at[a]["x"]}" y1="{at[a]["y"]}" x2="{at[b]["x"]}" y2="{at[b]["y"]}"/>')
    for n in s["nodes"]:
        if n["kind"] == "gpu":
            continue
        text_w = len(n["label"]) * font * 0.6  # bold Inter, near enough for a first frame
        x0 = (w - (18 + 8 + text_w)) / 2
        out.append(
            f'<g transform="translate({n["x"] - w / 2} {n["y"] - h / 2})">'
            f'<rect width="{w}" height="{h}" rx="10" fill="url(#{gid})"/>'
            f'<path class="i" transform="translate({x0:.1f} {(h - 18) / 2}) scale(.75)" d="{icons[_HERO_ICON[n["kind"]]]}"/>'
            f'<text x="{x0 + 26:.1f}" y="{h / 2}" font-size="{font}" dominant-baseline="central">{html.escape(n["label"])}</text></g>'
        )
    out.append("</svg>")
    return "".join(out)


def _hero(config):
    scene, icons = _hero_data(config)
    acts = "".join(
        f'<li><a href="{html.escape(a["href"])}"><strong>{html.escape(a["title"])}</strong> '
        f'<span>{html.escape(a["note"])}</span></a></li>'
        for a in scene["acts"]
    )
    return (
        '<div class="srv6-hero-stage" role="group" aria-label="An SRv6 fabric, built step by step">'
        + _hero_frame("desktop", scene["desktop"], icons)
        + _hero_frame("mobile", scene["mobile"], icons)
        + "</div>"
        + f'<ol class="srv6-hero-acts">{acts}</ol>'
        # The act list is in the page for crawlers and screen readers; on
        # screen it only shows without JavaScript (the live scene has dots).
        + "<noscript><style>.md-typeset .srv6-hero-acts{position:static;width:auto;height:auto;clip:auto;overflow:visible}</style></noscript>"
    )


def on_page_content(content, page, config, files, **kwargs):
    found = page.meta.get("_srv6_diagrams")
    hero = _HERO.search(content)
    if not found and not hero:
        return content
    flows = 0
    if hero:
        content = _HERO.sub(lambda m: _hero(config), content, count=1)
    if found:
        entries = _manifest["pages"][page.file.src_uri]

        def render(match):
            nonlocal flows
            entry = entries[match.group(1)]
            if entry["kind"] == "sequence":
                out = f'<div class="srv6-seq">{entry["svg"]}</div>'
                if entry.get("packetWalk"):
                    svg_id = re.search(r'<svg[^>]*\sid="([^"]+)"', entry["svg"]).group(1)
                    out += f"<script>{_packet_walk(config).replace('__ID__', svg_id)}</script>"
                return out
            flows += 1
            return _flowchart(entry)

        content = _PLACEHOLDER.sub(render, content)
    if (flows or hero) and _manifest.get("script"):
        src = get_relative_url(_manifest["script"], page.url)
        # The bundle is fetched only once a diagram comes within 400px of the
        # viewport, and never before the load event, so React never competes
        # with the page's first paint (LCP). The home hero is always in view,
        # so it waits for the page to go idle as well; its static frame shows
        # the fabric meanwhile. All this space is reserved, so nothing shifts.
        # After instant navigation the bundle is already there and re-mounts
        # itself (it subscribes to document$).
        content += (
            "\n<script>(function(){var u=" + json.dumps(src) + ";"
            "function go(){if(window.__srv6Flow){window.__srv6Flow.mount();return}"
            "if(document.querySelector('script[data-srv6-flow]'))return;"
            "var s=document.createElement('script');s.src=u;s.dataset.srv6Flow='';document.head.appendChild(s)}"
            "function arm(){if(window.__srv6Flow||!('IntersectionObserver' in window))return go();"
            "if(document.querySelector('.srv6-hero-stage'))return setTimeout(function(){(window.requestIdleCallback||setTimeout)(go,{timeout:2000})},1500);"
            "var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();go()}},{rootMargin:'400px'});"
            "document.querySelectorAll('.srv6-flow').forEach(function(e){io.observe(e)})}"
            "document.readyState==='complete'?arm():addEventListener('load',arm,{once:true})})()</script>"
        )
    return content
