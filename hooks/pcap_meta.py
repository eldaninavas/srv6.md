"""
MkDocs hook: download lines for the packet capture library.
Pages write {{ pcap:<file> }} for a full download line (link, size, SHA-256)
or {{ pcap-size:<file> }} for the size alone; the values are read from
docs/assets/pcaps/<file> at build time, so regenerating the captures with
tools/pcaps/run.sh never leaves a stale size or hash on the page.
A token naming a missing file fails the build.
"""

import hashlib
import os
import posixpath
import re

_TOKEN = re.compile(r"\{\{\s*pcap(-size)?:([\w.-]+)\s*\}\}")
GITHUB = "https://github.com/eldaninavas/srv6.md/blob/main/docs/assets/pcaps/"


def _size(n):
    return f"{n} bytes" if n < 1024 else f"{n / 1024:.1f} KB"


def on_page_markdown(markdown, page, config, **kwargs):
    if "{{" not in markdown or "pcap" not in markdown:
        return markdown

    page_dir = posixpath.dirname(page.file.src_uri)

    def render(match):
        name = match.group(2)
        path = os.path.join(config["docs_dir"], "assets", "pcaps", name)
        if not os.path.isfile(path):
            raise FileNotFoundError(f"{page.file.src_uri}: no capture docs/assets/pcaps/{name}")
        with open(path, "rb") as f:
            data = f.read()
        if match.group(1):
            return _size(len(data))
        href = posixpath.relpath(f"assets/pcaps/{name}", page_dir or ".")
        sha = hashlib.sha256(data).hexdigest()
        return (
            f'[:material-download: **{name}**]({href}){{ download="{name}" }}'
            f" &middot; {_size(len(data))} &middot; [view on GitHub]({GITHUB}{name})"
            f"<br>SHA-256 `{sha}`"
        )

    return _TOKEN.sub(render, markdown)
