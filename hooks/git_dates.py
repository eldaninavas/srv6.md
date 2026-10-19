"""
MkDocs hook: use each page's git history for its dates.
Sets page.update_date (sitemap <lastmod>, JSON-LD dateModified) to the last
commit touching the file, and page.meta["date_published"] to the first one.
Without this every page reports the build date, which search engines ignore.
"""

import os
import subprocess
import logging

log = logging.getLogger("mkdocs.hooks.git_dates")

_dates = {}


def on_pre_build(config, **kwargs):
    _dates.clear()
    docs_dir = config["docs_dir"]
    try:
        out = subprocess.run(
            ["git", "log", "--format=@%cs", "--name-only", "--", "."],
            cwd=docs_dir, capture_output=True, text=True, check=True,
        ).stdout
    except (OSError, subprocess.CalledProcessError) as e:
        log.warning(f"git dates unavailable, falling back to build date: {e}")
        return

    prefix = os.path.relpath(docs_dir, _repo_root(docs_dir)).replace(os.sep, "/") + "/"
    date = None
    for line in out.splitlines():
        if line.startswith("@"):
            date = line[1:]
        elif line.endswith(".md") and date:
            src = line[len(prefix):] if line.startswith(prefix) else line
            last, first = _dates.get(src, (date, date))
            _dates[src] = (last, date)  # git log is newest-first
    log.info(f"git dates loaded for {len(_dates)} pages")


def _repo_root(path):
    return subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=path, capture_output=True, text=True, check=True,
    ).stdout.strip()


def on_page_markdown(markdown, page, **kwargs):
    dates = _dates.get(page.file.src_uri)
    if dates:
        page.update_date, page.meta["date_published"] = dates
    return markdown
