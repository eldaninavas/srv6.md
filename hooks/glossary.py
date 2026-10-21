"""
MkDocs hook for the SRv6 Glossary (docs/topics/glossary.md).

1. Structured data: a page with `defined_term_set: true` in its front matter
   has every "### Term {#anchor}" entry parsed into a schema.org
   DefinedTermSet (page.meta["defined_term_set_schema"]), which
   overrides/main.html emits as JSON-LD. Each DefinedTerm's description is the
   entry's first paragraph, so the markup always matches the visible text.

2. Auto-linking: on English pages, the FIRST mention of a curated set of key
   terms links to its glossary entry, with the definition as the tooltip.
   Conservative by design: only running text in paragraphs and list items,
   never inside links, code, headings, tables, admonition titles or diagrams,
   nothing after "Further Reading"/"References", at most one link per term and
   MAX_LINKS per page, never two links close together, and no link on the page
   the entry itself points to under "Learn more". A page opts out with
   `glossary_links: false`.
"""

import html
import logging
import os
import posixpath
import re

from mkdocs.utils import get_relative_url

log = logging.getLogger("mkdocs.hooks.glossary")

GLOSSARY = "topics/glossary.md"
MAX_LINKS = 10
MIN_GAP = 60  # characters of text between two auto-links
EXCLUDE_PREFIXES = ("es/", "ja/")
EXCLUDE_PAGES = {GLOSSARY, "ai/ai-glossary.md", "index.md", "tags.md", "knowledge-graph.md"}

# (regex, glossary anchor). Longer forms first: the alternation also consumes
# them after their link is spent, so "Binding SID" never yields a bare "SID".
TERMS = [
    (r"Segment Routing Headers?|SRHs?", "srh"),
    (r"Binding SIDs?|BSIDs?", "binding-sid"),
    (r"Prefix-SIDs?", "prefix-sid"),
    (r"Adj-SIDs?", "adj-sid"),
    (r"[Ss]ervice SIDs?", "service-sid"),
    (r"uSIDs?|micro-SIDs?", "usid"),
    (r"SIDs?", "sid"),
    (r"[Ll]ocators?", "locator"),
    (r"Segments Left", "segments-left"),
    (r"Last Entry", "last-entry"),
    (r"End\.B6\.Encaps(?:\.Red)?", "end-b6-encaps"),
    (r"End\.DT46", "end-dt46"),
    (r"End\.DT4", "end-dt4"),
    (r"End\.DT6", "end-dt6"),
    (r"End\.DX2", "end-dx2"),
    (r"End\.X", "end-x"),
    (r"End\.Replicate", "end-replicate"),
    (r"H\.Encaps\.Red", "h-encaps-red"),
    (r"H\.Encaps", "h-encaps"),
    (r"PSP", "psp"),
    (r"USP", "usp"),
    (r"USD", "usd"),
    (r"NEXT-C-?SID", "next-csid"),
    (r"REPLACE-C-?SID|Replace-C-SID", "replace-csid"),
    (r"G-SRv6", "g-srv6"),
    (r"End-of-Container|End-of-Carrier", "end-of-container"),
    (r"F3216", "f3216"),
    (r"uN", "un"),
    (r"uA", "ua"),
    (r"SR [Pp]olic(?:y|ies)", "sr-policy"),
    (r"[Cc]andidate paths?", "candidate-path"),
    (r"ODN", "odn"),
    (r"Automated Steering", "automated-steering"),
    (r"Flex-Algo(?:rithms?)?|Flexible Algorithms?", "flex-algo"),
    (r"FAD", "fad"),
    (r"TI-LFA", "ti-lfa"),
    (r"PLR", "plr"),
    (r"P-space", "p-space"),
    (r"Q-space", "q-space"),
    (r"PQ[- ]nodes?", "pq-node"),
    (r"SRLGs?", "srlg"),
    (r"[Mm]icro-?loops?", "microloop"),
    (r"O-flag", "o-flag"),
    (r"HMAC TLV", "hmac-tlv"),
    (r"Path Tracing", "path-tracing"),
    (r"STAMP", "stamp"),
    (r"SAI", "sai"),
    (r"seg6local", "seg6"),
]

# Not preceded by a word char, ".", "/" or "-"; not followed by a word char,
# "/", "-" or "." + word char (so "End.DT4" stays out of "End.DT46", but a sentence
# ending in "H.Encaps." still matches).
_TERM_RE = re.compile(
    "|".join(rf"(?<![\w./-])(?P<t{i}>{p})(?![\w/-]|\.\w)" for i, (p, _) in enumerate(TERMS))
)

SKIP_TAGS = {"a", "code", "pre", "kbd", "samp", "script", "style", "svg", "math",
             "h1", "h2", "h3", "h4", "h5", "h6", "table", "summary", "button",
             "label", "nav", "abbr", "figcaption", "select", "textarea", "sup"}
TEXT_TAGS = {"p", "li", "dd"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
             "meta", "source", "track", "wbr"}
STOP_IDS = {"further-reading", "references"}

_ENTRY = re.compile(r"^### +(.+?) *\{#([\w-]+)[^}]*\}\s*$", re.M)
_TOKEN = re.compile(r"(<!--.*?-->|<[^>]+>)", re.S)
_TAG = re.compile(r"<(/?)([a-zA-Z][\w-]*)([^>]*?)(/?)>", re.S)

_defs = {}  # anchor -> (name, plain definition, {src_uri of its "Learn more" pages})


def _plain(md):
    text = re.sub(r"<[^>]+>", "", md)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*|\*([^*]+)\*", lambda m: m.group(1) or m.group(2), text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return re.sub(r"\s+", " ", text).strip()


def _entries(markdown, with_refs=False):
    """Yield (heading, anchor, first paragraph[, second paragraph]) per entry."""
    for m in _ENTRY.finditer(markdown):
        rest = markdown[m.end():].lstrip("\n")
        paras = re.split(r"\n\s*\n", rest, maxsplit=2)
        entry = (_plain(m.group(1)), m.group(2), _plain(paras[0]))
        yield entry + ((paras[1] if len(paras) > 1 else ""),) if with_refs else entry


def _split_name(heading):
    m = re.match(r"(.+?) \((.+)\)$", heading)
    return (m.group(1), m.group(2)) if m else (heading, None)


def on_config(config, **kwargs):
    _defs.clear()
    path = os.path.join(config["docs_dir"], GLOSSARY)
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for heading, anchor, definition, refs in _entries(f.read(), with_refs=True):
            more = refs.partition("Learn more:")[2]
            homes = {posixpath.normpath(posixpath.join(posixpath.dirname(GLOSSARY), u.split("#")[0]))
                     for u in re.findall(r"\]\(([^)#]+\.md)(?:#[^)]*)?\)", more)}
            _defs[anchor] = (_split_name(heading)[0], definition, homes)
    for _, anchor in TERMS:
        if anchor not in _defs:
            log.warning(f"glossary: auto-link target #{anchor} not found in {GLOSSARY}")


def on_page_markdown(markdown, page, config, **kwargs):
    if not page.meta.get("defined_term_set"):
        return markdown
    base = page.canonical_url
    set_id = base + "#termset"
    terms = []
    for heading, anchor, definition in _entries(markdown):
        name, alt = _split_name(heading)
        term = {
            "@type": "DefinedTerm",
            "@id": f"{base}#{anchor}",
            "name": name,
            "description": definition,
            "url": f"{base}#{anchor}",
            "inDefinedTermSet": {"@id": set_id},
        }
        if alt:
            term["alternateName"] = alt
        terms.append(term)
    if terms:
        page.meta["defined_term_set_schema"] = {
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            "@id": set_id,
            "name": page.meta.get("title", page.title),
            "description": page.meta.get("description", ""),
            "url": base,
            "inLanguage": "en",
            "hasDefinedTerm": terms,
        }
    return markdown


def _excluded(page):
    src = page.file.src_uri
    return (src in EXCLUDE_PAGES or src.startswith(EXCLUDE_PREFIXES)
            or page.meta.get("glossary_links") is False)


def on_page_content(html_out, page, config, files, **kwargs):
    if not _defs or _excluded(page):
        return html_out
    href = get_relative_url(GLOSSARY.replace(".md", "/"), page.url)
    src = page.file.src_uri
    used = {a for a, (_, _, homes) in _defs.items() if src in homes}
    stack = []  # open elements: (tag, skip)
    out = []
    links = 0
    stopped = False
    pos = 0  # running offset in the page text, for MIN_GAP
    last = -MIN_GAP

    def link(m):
        nonlocal links, last
        i = int(m.lastgroup[1:])
        anchor = TERMS[i][1]
        if anchor in used or links >= MAX_LINKS or pos + m.start() - last < MIN_GAP:
            return m.group(0)
        used.add(anchor)
        links += 1
        last = pos + m.end()
        name, definition, _ = _defs[anchor]
        title = html.escape(f"{name}: {definition}", quote=True)
        return f'<a class="gl-term" href="{href}#{anchor}" title="{title}">{m.group(0)}</a>'

    for token in _TOKEN.split(html_out):
        if not token:
            continue
        if token.startswith("<"):
            out.append(token)
            t = _TAG.match(token)
            if not t or token.startswith("<!"):
                continue
            closing, tag, attrs, selfclose = t.group(1), t.group(2).lower(), t.group(3), t.group(4)
            if closing:
                for j in range(len(stack) - 1, -1, -1):
                    if stack[j][0] == tag:
                        del stack[j:]
                        break
            elif not selfclose and tag not in VOID_TAGS:
                skip = (tag in SKIP_TAGS or "admonition-title" in attrs or "mermaid" in attrs
                        or "headerlink" in attrs)
                stack.append((tag, skip))
                if tag in ("h2", "h3") and re.search(r'id="(%s)"' % "|".join(STOP_IDS), attrs):
                    stopped = True
            continue
        if (stopped or links >= MAX_LINKS or any(s for _, s in stack)
                or not any(tag in TEXT_TAGS for tag, _ in stack)):
            out.append(token)
        else:
            out.append(_TERM_RE.sub(link, token))
        pos += len(token)
    return "".join(out)
