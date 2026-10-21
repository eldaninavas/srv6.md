"""
Snapshot the IETF data behind "State of SRv6" (docs/reports/state-of-srv6-2026.md).

  python tools/state-of-srv6/fetch_ietf.py

Writes tools/state-of-srv6/ietf-snapshot.json. Standard library only.

Rule used for both RFCs and drafts: a document counts as SRv6-related when its
title or abstract contains one of TERMS (case-insensitive). The datatracker API
does the matching; publication dates come from the RFC Editor's per-RFC JSON.
"""

import datetime
import json
import os
import re
import urllib.parse
import urllib.request

DT = "https://datatracker.ietf.org"
TERMS = ["srv6", "segment routing over ipv6", "segment routing over the ipv6",
         "ipv6 segment routing", "segment routing header"]
WGS = ["spring", "srv6ops", "idr", "lsr", "6man", "bess", "pce"]
ACTIVE = 1  # datatracker state id of draft state "Active"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ietf-snapshot.json")


def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.load(r)


def documents(params):
    url = f"{DT}/api/v1/doc/document/?" + urllib.parse.urlencode({**params, "format": "json", "limit": 1000})
    objs = []
    while url:
        d = get(url)
        objs += d["objects"]
        url = DT + d["meta"]["next"] if d["meta"]["next"] else None
    return objs


def related(o):
    text = (o["title"] + " " + (o["abstract"] or "")).lower()
    return any(t in text for t in TERMS)


_states = {}


def state_names(o):
    names = []
    for uri in o["states"]:
        if uri not in _states:
            s = get(f"{DT}{uri}?format=json")
            _states[uri] = (get(f"{DT}{s['type']}?format=json")["slug"], s["name"])
        kind, name = _states[uri]
        if kind != "draft":
            names.append(name)
    return names


def rfcs():
    found = {}
    for field in ("title__icontains", "abstract__icontains"):
        for t in TERMS:
            for o in documents({"type": "rfc", field: t}):
                found[o["name"]] = o
    out = []
    for name, o in sorted(found.items(), key=lambda kv: kv[1]["rfc_number"]):
        ed = get(f"https://www.rfc-editor.org/rfc/{name}.json")
        group = get(f"{DT}{o['group']}?format=json")["acronym"] if o["group"] else None
        out.append({
            "rfc": o["rfc_number"], "title": o["title"], "published": ed["pub_date"],
            "year": int(re.search(r"\d{4}", ed["pub_date"]).group()),
            "status": ed["pub_status"], "group": group,
        })
    return out


def drafts():
    out = {}
    for wg in WGS:
        adopted = [o for o in documents({"type": "draft", "group__acronym": wg, "states": ACTIVE})
                   if o["name"].startswith(f"draft-ietf-{wg}-")]
        # Individual drafts name their target WG: draft-<author>-<wg>-...
        individual = [o for o in documents({"type": "draft", "name__contains": f"-{wg}-", "states": ACTIVE})
                      if re.match(rf"draft-(?!ietf-)[a-z0-9]+-{wg}-", o["name"])]
        out[wg] = {
            "adopted_total": len(adopted),
            "individual_total": len(individual),
            "adopted": [{"name": o["name"], "title": o["title"], "rev": o["rev"], "states": state_names(o)}
                        for o in sorted(adopted, key=lambda o: o["name"]) if related(o)],
            "individual": [{"name": o["name"], "title": o["title"], "rev": o["rev"]}
                           for o in sorted(individual, key=lambda o: o["name"]) if related(o)],
        }
        print(f"{wg}: {len(out[wg]['adopted'])} adopted, {len(out[wg]['individual'])} individual")
    return out


if __name__ == "__main__":
    snapshot = {
        "retrieved": datetime.date.today().isoformat(),
        "rule": "title or abstract contains: " + ", ".join(TERMS),
        "rfcs": rfcs(),
        "drafts": drafts(),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, indent=1, ensure_ascii=False)
        f.write("\n")
    print(f"{len(snapshot['rfcs'])} RFCs -> {OUT}")
