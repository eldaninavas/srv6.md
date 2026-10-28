"""
Validate SRv6.md Academy video scripts without rendering them.

    venv/bin/python youtube/tools/check_script.py youtube/scripts/*.yaml

Checks the fields video.py needs, that every image exists, that record
scenes point at srv6.md, that the id and title match youtube/academy.yaml,
that YouTube will accept the chapters (first at the start, at least three),
and estimates the narrated length (about 150 words per minute in English
and Spanish).
"""

import os
import re
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
YT = os.path.dirname(HERE)
REPO = os.path.dirname(YT)

FIELDS = {
    "title": ["title"], "bullets": ["heading", "bullets"], "image": ["image"], "big": ["value", "caption"],
    "code": ["heading", "code"], "compare": ["heading", "columns"], "end": ["heading", "url"],
    "record": ["url"],
}


def lessons():
    with open(os.path.join(YT, "academy.yaml"), encoding="utf-8") as f:
        a = yaml.safe_load(f)
    return {l["id"]: l for t in a["tracks"] for l in t["lessons"]}


def check(path, catalog):
    errors, warnings = [], []
    with open(path, encoding="utf-8") as f:
        sc = yaml.safe_load(f)
    for k in ("id", "lang", "title", "description", "scenes", "thumbnail", "links", "tags"):
        if k not in sc:
            errors.append(f"missing {k}")
    vid = sc.get("id")
    if vid not in catalog:
        errors.append(f"id {vid} not in academy.yaml")
    elif catalog[vid]["title"] != sc.get("title"):
        warnings.append(f"title differs from academy.yaml: {catalog[vid]['title']!r}")
    if len(sc.get("title", "")) > 100:
        errors.append("title over YouTube's 100 characters")
    words, chapters = 0, []
    for i, s in enumerate(sc.get("scenes", []), 1):
        t = s.get("type")
        if t not in FIELDS:
            errors.append(f"scene {i}: unknown type {t}")
            continue
        for k in FIELDS[t] + ["say"]:
            if k not in s:
                errors.append(f"scene {i}: missing {k}")
        if t == "image" and not os.path.exists(os.path.join(REPO, s.get("image", ""))):
            errors.append(f"scene {i}: image not found {s.get('image')}")
        if t == "record" and not str(s.get("url", "")).startswith("https://srv6.md/"):
            errors.append(f"scene {i}: record url must be an srv6.md page")
        if t == "bullets" and len(s.get("bullets", [])) > 5:
            warnings.append(f"scene {i}: more than 5 bullets will not fit")
        if s.get("chapter"):
            chapters.append(i)
        words += len(re.findall(r"\w+", str(s.get("say", ""))))
    if chapters and chapters[0] != 1:
        errors.append("first chapter must be on scene 1 (YouTube needs one at 0:00)")
    if sc.get("format") != "short" and len(chapters) < 3:
        errors.append("YouTube needs at least 3 chapters")
    minutes = words / 150
    if sc.get("format") == "short" and minutes > 0.95:
        errors.append(f"Short too long: ~{minutes * 60:.0f}s of narration (max ~57s)")
    return errors, warnings, minutes


def main():
    catalog = lessons()
    bad = 0
    for path in sys.argv[1:]:
        errors, warnings, minutes = check(path, catalog)
        status = "FAIL" if errors else "ok"
        print(f"{status:4} {os.path.basename(path):12} ~{minutes:4.1f} min")
        for e in errors:
            print(f"     error: {e}")
        for w in warnings:
            print(f"     warn:  {w}")
        bad += bool(errors)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
