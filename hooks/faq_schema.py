"""
MkDocs hook: turn a page's visible FAQ section into FAQPage structured data.
A section headed "## Frequently Asked Questions" (or "## Preguntas frecuentes",
"## よくある質問") whose questions are "### " headings is parsed into
page.meta["faq_schema"] = [{"q": ..., "a": ...}], which overrides/main.html
emits as JSON-LD. The answers stay on the page, so markup and content match.
"""

import re
import logging

log = logging.getLogger("mkdocs.hooks.faq_schema")

_FAQ_HEADING = re.compile(
    r"^## +(?::[\w-]+: +)?(Frequently Asked Questions|FAQ|Preguntas frecuentes|よくある質問)\s*$",
    re.M | re.I,
)


def _plain(text):
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    text = re.sub(r"!!!.*?\n", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)(\{[^}]*\})?", r"\1", text)
    text = re.sub(r":[a-z0-9-]+:", "", text)
    text = re.sub(r"[*_`]{1,3}([^*_`]+)[*_`]{1,3}", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"^\s*[-*] +", "", text, flags=re.M)
    return re.sub(r"\s+", " ", text).strip()


def on_page_markdown(markdown, page, **kwargs):
    m = _FAQ_HEADING.search(markdown)
    if not m:
        return markdown
    rest = markdown[m.end():]
    end = re.search(r"^## ", rest, re.M)
    section = rest[:end.start()] if end else rest
    items = []
    for block in re.split(r"^### +", section, flags=re.M)[1:]:
        question, _, answer = block.partition("\n")
        question, answer = _plain(question), _plain(answer)
        if question and answer:
            items.append({"q": question, "a": answer})
    if items:
        page.meta["faq_schema"] = items
    return markdown
