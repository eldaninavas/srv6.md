"""
MkDocs hook: pair translated pages (docs/<lang>/) with their English originals.
A translated page declares `translation_of: <english src path>` in its front
matter. Every page of a translation group (the English original plus all its
translations) gets hreflang alternates for every language in the group
(page.meta["alternates"]) and a visible link to each of the other languages.
"""

import os
import re
import logging

from mkdocs.plugins import event_priority

log = logging.getLogger("mkdocs.hooks.i18n")

# Language code -> label of the link pointing TO that language. English is the
# source language; the others are subdirectories of docs/. Order is the order
# of the hreflang tags and of the links in the switch.
LANGUAGES = {
    "en": "Read in English",
    "es": "Leer en español",
    "ja": "日本語で読む",
}

# English src path -> {lang: src path}, and member src path -> English src path
_groups = {}
_member_of = {}


def on_files(files, config, **kwargs):
    _groups.clear()
    _member_of.clear()
    counts = {}
    for f in files.documentation_pages():
        lang = f.src_uri.split("/", 1)[0]
        if lang == "en" or lang not in LANGUAGES or "/" not in f.src_uri:
            continue
        with open(f.abs_src_path, "r", encoding="utf-8") as fh:
            m = re.search(r"^translation_of:\s*(\S+)\s*$", fh.read(4000), re.M)
        if not m:
            continue
        en_src = m.group(1)
        if files.get_file_from_path(en_src) is None:
            log.warning(f"{f.src_uri}: translation_of target not found: {en_src}")
            continue
        group = _groups.setdefault(en_src, {"en": en_src})
        if lang in group:
            log.warning(f"{f.src_uri}: {en_src} already has a {lang} translation: {group[lang]}")
            continue
        group[lang] = f.src_uri
        _member_of[en_src] = en_src
        _member_of[f.src_uri] = en_src
        counts[lang] = counts.get(lang, 0) + 1
    log.info("i18n: translations paired: " + (", ".join(f"{k}={v}" for k, v in sorted(counts.items())) or "none"))
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
    if src not in _member_of:
        return markdown
    group = _groups[_member_of[src]]
    members = [(lang, group[lang]) for lang in LANGUAGES if lang in group]
    page.meta["alternates"] = {
        lang: _url(files.get_file_from_path(member)) for lang, member in members
    }
    links = " · ".join(
        f'[{LANGUAGES[lang]}]({_rel(src, member)}){{ lang="{lang}" hreflang="{lang}" }}'
        for lang, member in members if member != src
    )
    return _after_h1(markdown, f'<p class="srv6-lang-switch" markdown>:material-translate: {links}</p>')


# Run before the minify plugin: htmlmin drops a lang attribute equal to the
# document's, which would strip lang="en" from "Read in English".
@event_priority(50)
def on_post_page(output, page, config, **kwargs):
    # theme.language is site-wide; give translated pages their own <html lang>.
    lang = page.file.src_uri.split("/", 1)[0]
    if lang != "en" and lang in LANGUAGES and "/" in page.file.src_uri:
        output = output.replace('<html lang="en"', f'<html lang="{lang}"', 1)
    return output
