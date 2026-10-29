"""
Render the YouTube channel artwork into youtube/branding/:
avatar.png (800x800), banner.png (2560x1440, text inside the 1546x423 safe
area every device shows) and watermark.png (150x150, transparent).

    venv/bin/python youtube/tools/branding.py
"""

import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from video import FONTS, LOGO, REPO, YT, data_uri, font_css  # noqa: E402

OUT = os.path.join(YT, "branding")
BG = "radial-gradient(ellipse at 25% 0%,#4a148c 0%,#1d0f2b 55%,#120a1c 100%)"


def doc(body, w, h, bg=BG):
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>{font_css()}"
            f"*{{margin:0;padding:0;box-sizing:border-box}}html,body{{width:{w}px;height:{h}px;overflow:hidden}}"
            f"body{{background:{bg};font-family:Inter,sans-serif;color:#f5eefa}}</style></head><body>{body}</body></html>")


def main():
    os.makedirs(OUT, exist_ok=True)
    logo = data_uri(LOGO)
    jobs = [
        {"out": "avatar.png", "width": 800, "height": 800, "html": doc(
            f"<div style='height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px'>"
            f"<img src='{logo}' style='width:330px;height:330px'>"
            f"<div style='font-size:118px;font-weight:800;letter-spacing:-2px'>SRv6<span style='color:#ce93d8'>.md</span></div></div>",
            800, 800)},
        {"out": "banner.png", "width": 2560, "height": 1440, "html": doc(
            # safe area: x 507..2053, y 508..931
            "<div style='position:absolute;left:507px;top:508px;width:1546px;height:423px;display:flex;align-items:center;gap:56px'>"
            f"<img src='{logo}' style='width:250px;height:250px;flex:none'>"
            "<div><div style='font-size:112px;font-weight:800;letter-spacing:-2px;line-height:1'>SRv6<span style='color:#ce93d8'>.md</span></div>"
            "<div style='font-size:52px;color:#e1bee7;margin-top:26px;font-weight:600'>The free SRv6 course: Segment Routing over IPv6, explained</div>"
            "<div style='font-size:40px;color:#ce93d8;margin-top:18px'>Foundations · Labs · TI-LFA · L3VPN · SRv6 for AI · srv6.md</div></div></div>"
            # faint network lines outside the safe area for TV/desktop
            "<svg width='2560' height='1440' style='position:absolute;inset:0;opacity:.18'>"
            "<g stroke='#ce93d8' stroke-width='3' fill='#ab47bc'>"
            "<line x1='120' y1='260' x2='420' y2='720'/><line x1='420' y1='720' x2='180' y2='1180'/>"
            "<line x1='2440' y1='240' x2='2180' y2='700'/><line x1='2180' y1='700' x2='2420' y2='1200'/>"
            "<circle cx='120' cy='260' r='22'/><circle cx='420' cy='720' r='28'/><circle cx='180' cy='1180' r='22'/>"
            "<circle cx='2440' cy='240' r='22'/><circle cx='2180' cy='700' r='28'/><circle cx='2420' cy='1200' r='22'/></g></svg>",
            2560, 1440)},
        {"out": "watermark.png", "width": 150, "height": 150, "transparent": True, "html": doc(
            f"<img src='{logo}' style='width:150px;height:150px'>", 150, 150, bg="transparent")},
    ]
    for j in jobs:
        j["out"] = os.path.join(OUT, j["out"])
    path = os.path.join(OUT, "jobs.json")
    with open(path, "w") as f:
        json.dump(jobs, f)
    subprocess.run(["node", os.path.join(YT, "tools", "shoot.mjs"), path], cwd=REPO, check=True,
                   env=dict(os.environ, NODE_PATH=os.path.join(REPO, "node_modules")))
    os.remove(path)


if __name__ == "__main__":
    main()
