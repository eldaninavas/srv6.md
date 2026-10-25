"""
MkDocs hook: write static redirect pages for renamed or mistyped URLs.
GitHub Pages has no server-side redirects, so each old path gets an
index.html with an instant meta refresh, rel=canonical to the target and
a JS location.replace fallback. The pages are written after the build,
so they never appear in sitemap.xml.
"""

import html
import os
import logging

log = logging.getLogger("mkdocs.hooks.redirects")

# old path -> new path, both relative to site_url
REDIRECTS = {
    "use-cases/boost-mobile/": "use-cases/cloud-native-backbone/",
    "topics/srv6/": "topics/what-is-srv6/",
    "topics/what-s-srv6/": "topics/what-is-srv6/",
    "topics/when-is-srv6/": "topics/what-is-srv6/",
    "topics/srv6-v-sr-mpls/": "topics/srv6-vs-sr-mpls/",
    "documentation/": "docs/",
    "topics/srv6-vs-mpls/": "topics/srv6-vs-sr-mpls/",
    "whitepapers/": "white-papers/",
    "white-paper/": "white-papers/srv6-white-paper-2026/",
}

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting…</title>
<link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0; url={url}">
<script>location.replace({js_url} + location.hash)</script>
</head>
<body>
<p>This page has moved to <a href="{url}">{url}</a>.</p>
</body>
</html>
"""


def on_post_build(config, **kwargs):
    site_dir = config["site_dir"]
    site_url = config["site_url"].rstrip("/") + "/"
    written = 0
    for old, new in REDIRECTS.items():
        target = os.path.join(site_dir, new, "index.html")
        if not os.path.exists(target):
            log.warning(f"redirect target does not exist: /{new}")
            continue
        out = os.path.join(site_dir, old, "index.html")
        if os.path.exists(out):
            log.warning(f"redirect source is a real page, skipping: /{old}")
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)
        url = site_url + new
        with open(out, "w", encoding="utf-8") as f:
            f.write(TEMPLATE.format(url=html.escape(url), js_url=repr(url)))
        written += 1
    log.info(f"redirects: wrote {written} redirect pages")
