"""
Build the charts and the share image for "State of SRv6 2026".

  python tools/state-of-srv6/build.py            # charts only (standard library + PyYAML)
  python tools/state-of-srv6/build.py --og       # also the 1200x630 PNG (needs Pillow)

Inputs:  tools/state-of-srv6/ietf-snapshot.json   (from fetch_ietf.py)
         tools/state-of-srv6/deployments.json     (curated, every entry sourced)
         docs/implementations/support-matrix.yml  (the vendor support matrix)
Outputs: the regions between <!-- chart:NAME --> and <!-- /chart:NAME --> in
         docs/reports/state-of-srv6-2026.md, and
         docs/assets/images/state-of-srv6-2026.png (with --og).

Charts are inline SVG coloured only with Material theme variables, so they follow
the light/dark toggle. Each one is followed by its data as a Markdown table.
"""

import collections
import datetime
import html
import json
import os
import re
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
REPORT = os.path.join(ROOT, "docs", "reports", "state-of-srv6-2026.md")
MATRIX = os.path.join(ROOT, "docs", "implementations", "support-matrix.yml")
OG_PNG = os.path.join(ROOT, "docs", "assets", "images", "state-of-srv6-2026.png")

YEARS = range(2018, 2027)
WG_ORDER = ["spring", "srv6ops", "idr", "lsr", "6man", "bess", "pce"]
CAPABILITIES = [
    ("end", "SRv6 endpoint (End / uN)"),
    ("next_csid", "uSID (NEXT-C-SID)"),
    ("isis", "IS-IS SRv6"),
    ("bgp_l3vpn", "BGP L3VPN over SRv6"),
    ("bgp_evpn", "BGP EVPN over SRv6"),
    ("sr_policy", "SRv6 SR Policy"),
    ("ti_lfa", "TI-LFA"),
    ("flex_algo", "Flex-Algo"),
    ("multicast", "Multicast"),
    ("pm", "Performance measurement"),
    ("mup", "Mobile user plane"),
]

# Shared by every chart. --md-primary-fg-color--light keeps bars bright enough
# on the dark (slate) background.
STYLE = (
    "<style>"
    ".sor-b1{fill:var(--md-primary-fg-color)}"
    ".sor-b2{fill:var(--md-primary-fg-color);fill-opacity:.32;stroke:var(--md-primary-fg-color);stroke-width:1}"
    "[data-md-color-scheme=slate] .sor-b1{fill:var(--md-primary-fg-color--light)}"
    "[data-md-color-scheme=slate] .sor-b2{fill:var(--md-primary-fg-color--light);stroke:var(--md-primary-fg-color--light)}"
    ".sor-t{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:14px}"
    ".sor-v{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:13px;font-weight:600}"
    ".sor-m{fill:var(--md-default-fg-color--light);font-family:var(--md-text-font-family,sans-serif);font-size:12px}"
    ".sor-ax{stroke:var(--md-default-fg-color--lighter);stroke-width:1}"
    ".sor-hit{fill:transparent}"
    ".sor-g:hover .sor-b1,.sor-g:hover .sor-b2{fill-opacity:.8}"
    "</style>"
)


def esc(s):
    return html.escape(str(s), quote=True)


def bar_path(x, y, w, h, r, end):
    """Rectangle with only the data end rounded ('right' or 'top')."""
    r = min(r, w if end == "right" else h, h / 2 if end == "right" else w / 2)
    if w <= 0 or h <= 0:
        return ""
    if end == "right":
        return (f"M{x:.1f},{y:.1f}h{w - r:.1f}a{r},{r} 0 0 1 {r},{r}v{h - 2 * r:.1f}"
                f"a{r},{r} 0 0 1 -{r},{r}h-{w - r:.1f}z")
    return (f"M{x:.1f},{y + h:.1f}v-{h - r:.1f}a{r},{r} 0 0 1 {r},-{r}h{w - 2 * r:.1f}"
            f"a{r},{r} 0 0 1 {r},{r}v{h - r:.1f}z")


def legend(series, y):
    out, x = [], 0
    for i, name in enumerate(series):
        out.append(f'<rect class="sor-b{i + 1}" x="{x}" y="{y - 10}" width="12" height="12" rx="2"/>'
                   f'<text class="sor-m" x="{x + 18}" y="{y}">{esc(name)}</text>')
        x += 30 + 7 * len(name)
    return "".join(out)


def svg_open(cid, width, height, title, desc):
    return (f'<svg viewBox="0 0 {width} {height}" role="img" aria-labelledby="{cid}-t {cid}-d" '
            f'xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-width:{round(width * 1.4)}px">'
            f'<title id="{cid}-t">{esc(title)}</title><desc id="{cid}-d">{esc(desc)}</desc>{STYLE}')


def hbar(cid, rows, series, title, desc, unit):
    """Horizontal bars, one row per category; values stack left to right."""
    width, label_w, row_h, bar_h = 420, 178, 30, 16
    top = 26 if len(series) > 1 else 6
    height = top + row_h * len(rows) + 6
    vmax = max(sum(v) for _, v in rows) or 1
    plot_w = width - label_w - 36
    out = [svg_open(cid, width, height, title, desc)]
    if len(series) > 1:
        legend_w = sum(30 + 7 * len(n) for n in series) - 30
        out.append(f'<g transform="translate({max(0, width - legend_w - 8)},0)">{legend(series, 16)}</g>')
    out.append(f'<line class="sor-ax" x1="{label_w}" y1="{top - 2}" x2="{label_w}" y2="{height - 4}"/>')
    for i, (label, values) in enumerate(rows):
        y = top + i * row_h + (row_h - bar_h) / 2
        x = label_w
        total = sum(values)
        parts = [f"{n}: {v}" for n, v in zip(series, values)] if len(series) > 1 else []
        tip = f"{label}: {total} {unit}" + (f" ({', '.join(parts)})" if parts else "")
        g = [f'<g class="sor-g"><title>{esc(tip)}</title>',
             f'<rect class="sor-hit" x="0" y="{top + i * row_h}" width="{width}" height="{row_h}"/>',
             f'<text class="sor-t" x="{label_w - 8}" y="{y + bar_h - 3}" text-anchor="end">{esc(label)}</text>']
        nonzero = [k for k, v in enumerate(values) if v]
        for k, v in enumerate(values):
            if not v:
                continue
            w = v / vmax * plot_w
            gap = 2 if k != nonzero[-1] else 0
            if k == nonzero[-1]:
                g.append(f'<path class="sor-b{k + 1}" d="{bar_path(x, y, w, bar_h, 4, "right")}"/>')
            else:
                g.append(f'<rect class="sor-b{k + 1}" x="{x:.1f}" y="{y}" width="{max(w - gap, 1):.1f}" height="{bar_h}"/>')
            x += w
        g.append(f'<text class="sor-v" x="{x + 6:.1f}" y="{y + bar_h - 3}">{total}</text></g>')
        out.append("".join(g))
    out.append("</svg>")
    return "".join(out)


def columns(cid, rows, title, desc, unit):
    """Vertical columns for a time series of counts."""
    width, height, left, bottom, top = 420, 220, 8, 30, 24
    plot_h = height - top - bottom
    vmax = max(v for _, v in rows) or 1
    slot = (width - 2 * left) / len(rows)
    bar_w = min(32, slot * 0.6)
    base = height - bottom
    out = [svg_open(cid, width, height, title, desc),
           f'<line class="sor-ax" x1="{left}" y1="{base}" x2="{width - left}" y2="{base}"/>']
    for i, (label, v) in enumerate(rows):
        cx = left + slot * i + slot / 2
        h = v / vmax * plot_h
        g = [f'<g class="sor-g"><title>{esc(f"{label}: {v} {unit}")}</title>',
             f'<rect class="sor-hit" x="{cx - slot / 2:.1f}" y="{top - 20}" width="{slot:.1f}" height="{plot_h + 40}"/>']
        if v:
            g.append(f'<path class="sor-b1" d="{bar_path(cx - bar_w / 2, base - h, bar_w, h, 4, "top")}"/>')
        g.append(f'<text class="sor-v" x="{cx:.1f}" y="{base - h - 6:.1f}" text-anchor="middle">{v}</text>')
        g.append(f'<text class="sor-m" x="{cx:.1f}" y="{base + 18}" text-anchor="middle">{esc(label)}</text></g>')
        out.append("".join(g))
    out.append("</svg>")
    return "".join(out)


STAGES = ["RFC Editor queue", "IETF Last Call", "IESG evaluation", "WG Last Call", "WG document"]


def stage(states):
    """One readable stage from a draft's datatracker states, furthest along first."""
    if "RFC Ed Queue" in states:
        return "RFC Editor queue"
    if "In Last Call" in states:
        return "IETF Last Call"
    for st in states:
        if st.startswith("IESG Evaluation"):
            return "IESG evaluation (deferred)" if "Defer" in st else "IESG evaluation"
    return "WG Last Call" if "In WG Last Call" in states else "WG document"


def table(headers, rows):
    lines = ["| " + " | ".join(headers) + " |", "|" + "|".join(["---"] + [":---:"] * (len(headers) - 1)) + "|"]
    lines += ["| " + " | ".join(str(c) for c in r) + " |" for r in rows]
    return lines


def block(svg, caption, headers, rows, data_title):
    out = ['<figure class="srv6-figure sor-figure" style="width:100%">', svg, f"<figcaption>{caption}</figcaption>", "</figure>", "",
           f'??? note "{data_title}"', ""]
    out += ["    " + line for line in table(headers, rows)]
    return "\n".join(out)


def matrix_counts():
    with open(MATRIX, encoding="utf-8") as f:
        m = yaml.safe_load(f)
    platforms = [p["name"] for p in m["platforms"]]
    counts = []
    for key, label in CAPABILITIES:
        full = partial = 0
        for p in m["platforms"]:
            s = (m["cells"].get(p["id"], {}).get(key) or {}).get("s")
            full += s is True or s == "yes"
            partial += s == "partial"
        counts.append((label, full, partial))
    verified = m["verified"]
    if isinstance(verified, str):
        verified = datetime.date.fromisoformat(verified)
    return platforms, verified.strftime("%-d %B %Y"), counts


def build_charts():
    with open(os.path.join(HERE, "ietf-snapshot.json"), encoding="utf-8") as f:
        ietf = json.load(f)
    with open(os.path.join(HERE, "deployments.json"), encoding="utf-8") as f:
        dep = json.load(f)
    charts = {}

    as_of = datetime.date.fromisoformat(ietf["retrieved"]).strftime("%-d %B %Y")
    per_year = collections.Counter(r["year"] for r in ietf["rfcs"])
    rows = [(str(y), per_year.get(y, 0)) for y in YEARS]
    total = len(ietf["rfcs"])
    charts["rfc-timeline"] = block(
        columns("sor-rfc", rows, "SRv6 RFCs published per year, 2018–2026",
                f"Column chart. {total} RFCs mention SRv6 in their title or abstract. "
                + ", ".join(f"{y}: {v}" for y, v in rows) + f". 2026 counts RFCs published by {as_of}.", "RFCs"),
        f"SRv6 RFCs by year of publication ({total} in total; 2026 up to {as_of}). "
        "Source: IETF Datatracker and RFC Editor.",
        ["Year", "RFCs"], rows, "Data: SRv6 RFCs per year")

    d = ietf["drafts"]
    rows = [(wg, [len(d[wg]["adopted"]), len(d[wg]["individual"])]) for wg in WG_ORDER]
    rows.sort(key=lambda r: -sum(r[1]))
    n_ad = sum(v[0] for _, v in rows)
    n_in = sum(v[1] for _, v in rows)
    charts["drafts-by-wg"] = block(
        hbar("sor-wg", rows, ["Working-group drafts", "Individual drafts"],
             "Active SRv6 Internet-Drafts by IETF working group",
             f"Bar chart. {n_ad + n_in} active drafts mention SRv6: {n_ad} adopted by a working group and "
             f"{n_in} individual drafts aimed at one. "
             + "; ".join(f"{wg}: {a} adopted, {i} individual" for wg, (a, i) in rows) + ".", "drafts"),
        f"Active Internet-Drafts that mention SRv6, by working group, on {as_of}. "
        "Source: IETF Datatracker API.",
        ["Working group", "WG-adopted", "Individual", "Total"],
        [(f"`{wg}`", a, i, a + i) for wg, (a, i) in rows] + [("**All seven**", n_ad, n_in, n_ad + n_in)],
        "Data: active SRv6 drafts by working group")

    orgs = dep["organizations"]
    for key, name, cid in (("region", "region", "sor-reg"), ("sector", "sector", "sor-sec")):
        c = collections.Counter(o[key] for o in orgs)
        rows = sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))
        charts[f"deployments-by-{key}"] = block(
            hbar(cid, [(k, [v]) for k, v in rows], ["Organizations"],
                 f"Public SRv6 deployments by {name}",
                 f"Bar chart of {len(orgs)} organizations with a public account of SRv6 in their network, by {name}: "
                 + ", ".join(f"{k} {v}" for k, v in rows) + ".", "organizations"),
            f"Organizations with publicly documented SRv6 deployments, by {name} ({len(orgs)} in total).",
            [name.capitalize(), "Organizations"], rows, f"Data: deployments by {name}")

    platforms, verified, counts = matrix_counts()
    rows = [(label, [full, partial]) for label, full, partial in counts]
    charts["implementations"] = block(
        hbar("sor-impl", rows, ["Supported", "Partial"],
             f"SRv6 capabilities across {len(platforms)} implementations",
             f"Bar chart. Number of the {len(platforms)} implementations in the SRv6.md support matrix "
             f"({', '.join(platforms)}) whose documentation shows each capability, fully or partially. "
             + "; ".join(f"{l}: {f} full, {p} partial" for l, f, p in counts) + ".", "implementations"),
        f"How many of {len(platforms)} tracked implementations document each capability "
        f"(support matrix verified {verified}). Unknown counts as not supported.",
        ["Capability", "Supported", "Partial", f"Of {len(platforms)}"],
        [(l, f, p, len(platforms)) for l, f, p in counts], "Data: implementations by capability")

    rows = []
    for r in ietf["rfcs"]:
        page = os.path.join(ROOT, "docs", "rfcs", f"rfc{r['rfc']}.md")
        link = (f"../rfcs/rfc{r['rfc']}.md" if os.path.exists(page)
                else f"https://datatracker.ietf.org/doc/rfc{r['rfc']}/")
        rows.append((f"[RFC {r['rfc']}]({link})", r["title"], r["published"], r["status"].title(),
                     f"`{r['group']}`" if r["group"] else "—"))
    charts["rfc-list"] = "\n".join(table(["RFC", "Title", "Published", "Status", "WG"], rows))

    rows = []
    for wg in WG_ORDER:
        for x in d[wg]["adopted"]:
            rows.append((f"[{x['name']}](https://datatracker.ietf.org/doc/{x['name']}/)", x["title"],
                         f"`{wg}`", x["rev"], stage(x["states"])))
    rows.sort(key=lambda r: STAGES.index(r[4].split(" (")[0]))
    charts["wg-drafts"] = "\n".join(table(["Draft", "Title", "WG", "Rev", "Stage"], rows))

    with open(REPORT, encoding="utf-8") as f:
        text = f.read()
    for name, content in charts.items():
        pattern = re.compile(rf"(<!-- chart:{name} -->\n)(?:.*?\n)?(<!-- /chart:{name} -->)", re.S)
        if not pattern.search(text):
            sys.exit(f"marker for chart '{name}' not found in {REPORT}")
        text = pattern.sub(lambda m: m.group(1) + content + "\n" + m.group(2), text)
    with open(REPORT, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"{len(charts)} charts written to {os.path.relpath(REPORT, ROOT)}")
    return ietf, dep


def font(size, bold=False):
    from PIL import ImageFont
    for path, index in (("/System/Library/Fonts/HelveticaNeue.ttc", 1 if bold else 0),
                        ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
                         else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 0)):
        if os.path.exists(path):
            return ImageFont.truetype(path, size, index=index)
    return ImageFont.load_default(size)


def build_og(ietf, dep):
    """1200x630 share card in the colours of the site's default og-image.png."""
    from PIL import Image, ImageDraw

    bg, ink, muted, purple, rule = "#0a0b17", "#eceaf5", "#a9a6bd", "#b065d6", "#3a2f55"
    n_drafts = sum(len(v["adopted"]) + len(v["individual"]) for v in ietf["drafts"].values())
    stats = [
        (str(len(ietf["rfcs"])), "SRv6 RFCs", "published since 2020"),
        (str(n_drafts), "active SRv6", "IETF drafts"),
        (str(len(dep["organizations"])), "organizations with", "public SRv6 deployments"),
    ]
    img = Image.new("RGB", (1200, 630), bg)
    d = ImageDraw.Draw(img)
    # Faint segment-list motif: nodes joined by a path, top right
    pts = [(820, 70), (920, 120), (1010, 80), (1100, 140), (1150, 60)]
    d.line(pts, fill=rule, width=3)
    for x, y in pts:
        d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=purple)
    d.text((72, 64), "SRv6.md  ·  DATA REPORT", font=font(26, True), fill=purple)
    d.text((72, 108), "State of SRv6 2026", font=font(78, True), fill=ink)
    d.line((72, 222, 1128, 222), fill=rule, width=2)
    col = (1200 - 144) / 3
    for i, (num, l1, l2) in enumerate(stats):
        x = 72 + col * i
        d.text((x, 252), num, font=font(132, True), fill=purple)
        d.text((x, 410), l1, font=font(32), fill=ink)
        d.text((x, 450), l2, font=font(32), fill=ink)
    retrieved = datetime.date.fromisoformat(ietf["retrieved"]).strftime("%-d %B %Y")
    d.text((72, 548), f"Data as of {retrieved}  ·  srv6.md/reports/state-of-srv6-2026",
           font=font(24), fill=muted)
    img.save(OG_PNG, optimize=True)
    print(f"share image written to {os.path.relpath(OG_PNG, ROOT)}")


if __name__ == "__main__":
    ietf_data, dep_data = build_charts()
    if "--og" in sys.argv:
        build_og(ietf_data, dep_data)
