"""
MkDocs hook: pair Spanish pages (docs/es/) with their English originals.
A Spanish page declares `translation_of: <english src path>` in its front
matter. Both pages then get hreflang alternates (page.meta["alternates"])
and a visible link to the other language.
"""

import os
import re
import logging

log = logging.getLogger("mkdocs.hooks.i18n")

_es_to_en = {}
_en_to_es = {}


def on_files(files, config, **kwargs):
    _es_to_en.clear()
    _en_to_es.clear()
    for f in files.documentation_pages():
        if not f.src_uri.startswith("es/"):
            continue
        with open(f.abs_src_path, "r", encoding="utf-8") as fh:
            m = re.search(r"^translation_of:\s*(\S+)\s*$", fh.read(4000), re.M)
        if not m:
            continue
        en_src = m.group(1)
        if files.get_file_from_path(en_src) is None:
            log.warning(f"{f.src_uri}: translation_of target not found: {en_src}")
            continue
        _es_to_en[f.src_uri] = en_src
        _en_to_es[en_src] = f.src_uri
    log.info(f"i18n: {len(_es_to_en)} Spanish translations paired")
    return files


def _url(file):
    # The homepage's file.url is "./"; hreflang must match the canonical URL.
    return "" if file.url in (".", "./") else file.url


def _rel(from_src, to_src):
    return os.path.relpath(to_src, os.path.dirname(from_src) or ".").replace(os.sep, "/")


def _after_h1(markdown, line):
    m = re.search(r"^# .+$", markdown, re.M)
    if not m:
        return line + "\n\n" + markdown
    return markdown[:m.end()] + "\n\n" + line + "\n" + markdown[m.end():]


def on_page_markdown(markdown, page, files, **kwargs):
    src = page.file.src_uri
    if src in _en_to_es:
        es_src = _en_to_es[src]
        en_url, es_url = _url(page.file), _url(files.get_file_from_path(es_src))
        page.meta["alternates"] = {"en": en_url, "es": es_url}
        link = f'<p class="srv6-lang-switch" lang="es" markdown>:material-translate: [Leer en español]({_rel(src, es_src)})</p>'
        return _after_h1(markdown, link)
    if src in _es_to_en:
        en_src = _es_to_en[src]
        en_url, es_url = _url(files.get_file_from_path(en_src)), _url(page.file)
        page.meta["alternates"] = {"en": en_url, "es": es_url}
        link = f'<p class="srv6-lang-switch" lang="en" markdown>:material-translate: [Read in English]({_rel(src, en_src)})</p>'
        return _after_h1(markdown, link)
    return markdown
