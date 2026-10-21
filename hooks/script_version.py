"""
MkDocs hook: content-hash the URLs of page-level scripts.
Cloudflare tells browsers to cache assets for hours, so a <script> tag in a
page that loads docs/assets/javascripts/<name>.js gets ?v=<hash of the file>
appended, and a changed script is fetched under a new URL. Runs after
hooks/generate_graph.py, which already versions knowledge-graph.js.
"""

import hashlib
import os
import re

_SCRIPT_SRC = re.compile(r'(assets/javascripts/([\w.-]+\.js))(?=")')
_hashes = {}


def on_pre_build(config, **kwargs):
    _hashes.clear()


def on_page_markdown(markdown, page, config, **kwargs):
    if "assets/javascripts/" not in markdown:
        return markdown

    def versioned(match):
        path = os.path.join(config["docs_dir"], "assets", "javascripts", match.group(2))
        if not os.path.isfile(path):
            return match.group(0)
        if path not in _hashes:
            with open(path, "rb") as f:
                _hashes[path] = hashlib.sha256(f.read()).hexdigest()[:12]
        return f"{match.group(1)}?v={_hashes[path]}"

    return _SCRIPT_SRC.sub(versioned, markdown)
