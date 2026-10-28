"""
Render an SRv6.md YouTube video from a script.

    venv/bin/python youtube/tools/video.py youtube/scripts/<id>.yaml [--voice NAME]

Each script is a YAML file with metadata (title, description, links,
thumbnail) and a list of scenes. Every scene has narration text and one
visual (title, bullets, image, big, code, compare, record, end). The
renderer:

1. draws each scene as a 1920x1080 frame (1080x1920 for Shorts) in the
   site's brand, through Chromium (youtube/tools/shoot.mjs), or records a
   live srv6.md page with its animated diagrams (youtube/tools/record.mjs);
2. narrates it with macOS `say`, unless a human recording exists at
   youtube/voice/<id>/<scene number>.wav (or .m4a), which always wins;
3. joins the scenes with ffmpeg into out/<id>/<id>.mp4;
4. writes <id>.srt (captions), description.txt (with chapters) and
   thumbnail.png, ready to upload.

Chromium comes from CHROME_PATH, as for tools/diagrams.
"""

import argparse
import base64
import html
import json
import os
import re
import shutil
import subprocess
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
YT = os.path.dirname(HERE)
REPO = os.path.dirname(YT)
FONTS = os.path.join(REPO, "node_modules", "@fontsource", "inter", "files")
LOGO = os.path.join(REPO, "docs", "assets", "images", "logo.svg")

DEFAULT_VOICES = {"en": "Samantha", "es": "Paulina", "ja": "Kyoko"}
RATE = {"en": 178, "es": 172, "ja": 190}


def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    mime = {".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
            ".woff2": "font/woff2", ".webp": "image/webp"}[ext]
    with open(path, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"


def font_css():
    faces = []
    for weight in (400, 600, 700, 800):
        src = data_uri(os.path.join(FONTS, f"inter-latin-{weight}-normal.woff2"))
        faces.append(f"@font-face{{font-family:Inter;font-weight:{weight};src:url({src}) format('woff2')}}")
    return "\n".join(faces)


FONT_CSS = None


def page(body, w, h, extra_css=""):
    global FONT_CSS
    FONT_CSS = FONT_CSS or font_css()
    vertical = h > w
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
{FONT_CSS}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:{w}px;height:{h}px;overflow:hidden}}
body{{font-family:Inter,'Hiragino Sans','Helvetica Neue',Arial,sans-serif;color:#f5eefa;
 background:radial-gradient(ellipse at 20% 0%,#4a148c 0%,#1d0f2b 55%,#120a1c 100%);
 padding:{'110px 80px' if vertical else '90px 120px'};position:relative}}
.brand{{position:absolute;{'top:60px;left:80px' if vertical else 'bottom:46px;left:120px'};display:flex;align-items:center;gap:14px;
 font-weight:700;font-size:{34 if vertical else 30}px;color:#e1bee7;opacity:.95}}
.brand img{{width:{48 if vertical else 44}px;height:{48 if vertical else 44}px}}
.kicker{{font-size:{34 if vertical else 30}px;font-weight:700;color:#ce93d8;letter-spacing:.06em;text-transform:uppercase;margin-bottom:22px}}
h1{{font-size:{92 if vertical else 96}px;line-height:1.05;font-weight:800;letter-spacing:-.02em}}
h2{{font-size:{68 if vertical else 64}px;line-height:1.1;font-weight:800;letter-spacing:-.01em;margin-bottom:{50 if vertical else 44}px}}
.sub{{font-size:{44 if vertical else 40}px;line-height:1.35;color:#e1bee7;margin-top:34px;font-weight:400}}
ul{{list-style:none}}
li{{font-size:{48 if vertical else 44}px;line-height:1.3;margin:0 0 {34 if vertical else 28}px 0;padding-left:56px;position:relative}}
li:before{{content:'';position:absolute;left:0;top:.42em;width:26px;height:26px;border-radius:50%;
 background:linear-gradient(135deg,#ce93d8,#7b1fa2)}}
li b{{color:#f3c7ff}}
.big{{font-size:{220 if vertical else 240}px;font-weight:800;line-height:1;background:linear-gradient(135deg,#f3c7ff,#ab47bc);
 -webkit-background-clip:text;color:transparent}}
.imgwrap{{display:flex;justify-content:center;align-items:center;height:{1400 if vertical else 760}px}}
.imgwrap img{{max-width:100%;max-height:100%;border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.45)}}
pre{{font-family:'JetBrains Mono',Menlo,monospace;font-size:{34 if vertical else 36}px;line-height:1.5;background:rgba(0,0,0,.35);
 border:1px solid rgba(206,147,216,.35);border-radius:20px;padding:40px 48px;color:#f3e5f5;white-space:pre-wrap}}
.cols{{display:grid;grid-template-columns:{'1fr' if vertical else '1fr 1fr'};gap:40px}}
.col{{background:rgba(255,255,255,.06);border:1px solid rgba(206,147,216,.3);border-radius:24px;padding:40px 44px}}
.col h3{{font-size:46px;font-weight:800;margin-bottom:26px;color:#f3c7ff}}
.col li{{font-size:{40 if vertical else 36}px}}
.center{{height:100%;display:flex;flex-direction:column;justify-content:center}}
.url{{display:inline-block;margin-top:40px;font-size:{52 if vertical else 50}px;font-weight:800;color:#120a1c;
 background:linear-gradient(135deg,#f3c7ff,#ce93d8);padding:18px 34px;border-radius:18px}}
{extra_css}
</style></head><body>{body}
<div class="brand"><img src="{data_uri(LOGO)}">SRv6.md</div></body></html>"""


def esc(s):
    # Allow **bold** in script text
    s = html.escape(str(s))
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)


def scene_body(sc, script_dir):
    kind = sc["type"]
    if kind == "title":
        kicker = f'<div class="kicker">{esc(sc["kicker"])}</div>' if sc.get("kicker") else ""
        sub = f'<div class="sub">{esc(sc["subtitle"])}</div>' if sc.get("subtitle") else ""
        return f'<div class="center">{kicker}<h1>{esc(sc["title"])}</h1>{sub}</div>'
    if kind == "bullets":
        items = "".join(f"<li>{esc(b)}</li>" for b in sc["bullets"])
        return f'<h2>{esc(sc["heading"])}</h2><ul>{items}</ul>'
    if kind == "image":
        path = os.path.normpath(os.path.join(REPO, sc["image"]))
        head = f'<h2 style="margin-bottom:30px">{esc(sc["heading"])}</h2>' if sc.get("heading") else ""
        return f'{head}<div class="imgwrap"><img src="{data_uri(path)}"></div>'
    if kind == "big":
        return (f'<div class="center"><div class="big">{esc(sc["value"])}</div>'
                f'<div class="sub" style="font-size:52px;color:#f5eefa;font-weight:600">{esc(sc["caption"])}</div></div>')
    if kind == "code":
        return f'<h2>{esc(sc["heading"])}</h2><pre>{html.escape(sc["code"].rstrip())}</pre>'
    if kind == "compare":
        cols = "".join(
            f'<div class="col"><h3>{esc(c["title"])}</h3><ul>' + "".join(f"<li>{esc(i)}</li>" for i in c["items"]) + "</ul></div>"
            for c in sc["columns"])
        return f'<h2>{esc(sc["heading"])}</h2><div class="cols">{cols}</div>'
    if kind == "end":
        return (f'<div class="center"><h2 style="margin-bottom:10px">{esc(sc["heading"])}</h2>'
                f'<div class="sub">{esc(sc.get("subtitle", ""))}</div><div><span class="url">{esc(sc["url"])}</span></div></div>')
    raise ValueError(f"unknown scene type {kind}")


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f"command failed: {' '.join(cmd)}\n{r.stderr[-2000:]}")
    return r.stdout


def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())


def narration_audio(text, lang, voice, out_base, human_dir, n):
    for ext in (".wav", ".m4a", ".mp3", ".aiff"):
        rec = os.path.join(human_dir, f"{n}{ext}")
        if os.path.exists(rec):
            return rec, True
    txt = out_base + ".txt"
    with open(txt, "w", encoding="utf-8") as f:
        f.write(text)
    aiff = out_base + ".aiff"
    run(["say", "-v", voice, "-r", str(RATE.get(lang, 175)), "-f", txt, "-o", aiff])
    return aiff, False


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def yt_time(t):
    t = int(t)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02}:{s:02}" if h else f"{m}:{s:02}"


def captions(text, start, dur):
    # Split narration into sentence chunks, timed by length
    parts = [p.strip() for p in re.split(r"(?<=[.!?。？！])\s+", text) if p.strip()]
    chunks = []
    for p in parts:
        words = p.split()
        while len(words) > 14:
            chunks.append(" ".join(words[:12]))
            words = words[12:]
        if words:
            chunks.append(" ".join(words))
    total = sum(len(c) for c in chunks) or 1
    t, out = start, []
    for c in chunks:
        d = dur * len(c) / total
        out.append((t, t + d, c))
        t += d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--voice", help="macOS voice for narration (overrides the language default)")
    args = ap.parse_args()

    with open(args.script, encoding="utf-8") as f:
        sc = yaml.safe_load(f)
    vid = sc["id"]
    lang = sc.get("lang", "en")
    vertical = sc.get("format") == "short"
    W, H = (1080, 1920) if vertical else (1920, 1080)
    voice = args.voice or sc.get("voice") or DEFAULT_VOICES[lang]
    out = os.path.join(YT, "out", vid)
    work = os.path.join(out, "work")
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work, exist_ok=True)
    human_dir = os.path.join(YT, "voice", vid)

    # 1. frames
    jobs, records = [], []
    for i, s in enumerate(sc["scenes"], 1):
        if s["type"] == "record":
            records.append({"url": s["url"], "selector": s.get("selector"), "click": s.get("click"),
                            "clickAt": s.get("click_at", 0), "seconds": s.get("seconds", 12),
                            "width": W, "height": H, "out": os.path.join(work, f"{i:02}.webm")})
        else:
            hp = os.path.join(work, f"{i:02}.html")
            with open(hp, "w", encoding="utf-8") as f:
                f.write(page(scene_body(s, os.path.dirname(args.script)), W, H))
            jobs.append({"html": hp, "out": os.path.join(work, f"{i:02}.png"), "width": W, "height": H})
    # thumbnail
    th = sc.get("thumbnail", {})
    thumb_html = os.path.join(work, "thumb.html")
    with open(thumb_html, "w", encoding="utf-8") as f:
        f.write(page(f'<div class="center"><div class="kicker" style="font-size:44px">{esc(th.get("kicker", "SRv6.md"))}</div>'
                     f'<h1 style="font-size:150px">{esc(th.get("text", sc["title"]))}</h1></div>', 1280, 720,
                     ".brand{bottom:34px;left:120px;font-size:34px}"))
    jobs.append({"html": thumb_html, "out": os.path.join(out, "thumbnail.png"), "width": 1280, "height": 720})
    jobs_path = os.path.join(work, "jobs.json")
    with open(jobs_path, "w") as f:
        json.dump(jobs, f)
    env = dict(os.environ, NODE_PATH=os.path.join(REPO, "node_modules"))
    run(["node", os.path.join(HERE, "shoot.mjs"), jobs_path], cwd=REPO, env=env)
    if records:
        rec_path = os.path.join(work, "records.json")
        with open(rec_path, "w") as f:
            json.dump(records, f)
        run(["node", os.path.join(HERE, "record.mjs"), rec_path], cwd=REPO, env=env)

    # 2. narration + 3. per-scene clips
    clips, cues, chapters, t, human = [], [], [], 0.0, 0
    for i, s in enumerate(sc["scenes"], 1):
        audio, is_human = narration_audio(s["say"], lang, voice, os.path.join(work, f"{i:02}"), human_dir, i)
        human += is_human
        a_dur = duration(audio)
        d = max(a_dur + s.get("pause", 0.7), s.get("min_seconds", 3.0))
        clip = os.path.join(work, f"{i:02}.mp4")
        vf = f"scale={W}:{H},fps=30,format=yuv420p,fade=t=in:st=0:d=0.25,fade=t=out:st={d - 0.3:.2f}:d=0.3"
        if s["type"] == "record":
            src = ["-stream_loop", "-1", "-i", os.path.join(work, f"{i:02}.webm")]
        else:
            src = ["-loop", "1", "-i", os.path.join(work, f"{i:02}.png")]
        run(["ffmpeg", "-y", *src, "-i", audio, "-t", f"{d:.2f}", "-vf", vf,
             "-af", f"apad,afade=t=out:st={d - 0.3:.2f}:d=0.3", "-c:v", "libx264", "-preset", "medium",
             "-crf", "20", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-shortest", clip])
        clips.append(clip)
        cues += captions(s["say"], t + 0.15, a_dur)
        if s.get("chapter"):
            chapters.append((t, s["chapter"]))
        t += d

    concat = os.path.join(work, "concat.txt")
    with open(concat, "w") as f:
        f.writelines(f"file '{c}'\n" for c in clips)
    final = os.path.join(out, f"{vid}.mp4")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", "-movflags", "+faststart", final])

    # 4. captions, description
    with open(os.path.join(out, f"{vid}.srt"), "w", encoding="utf-8") as f:
        for n, (a, b, c) in enumerate(cues, 1):
            f.write(f"{n}\n{srt_time(a)} --> {srt_time(b)}\n{c}\n\n")
    if chapters and chapters[0][0] > 0:
        chapters[0] = (0.0, chapters[0][1])
    lines = [sc["title"], "", sc["description"].strip(), ""]
    if len(chapters) >= 3:
        lines += ["Chapters:" if lang == "en" else ("Capítulos:" if lang == "es" else "チャプター:")]
        lines += [f"{yt_time(ct)} {name}" for ct, name in chapters] + [""]
    if sc.get("links"):
        lines += [f"{label}: {url}" for label, url in sc["links"].items()] + [""]
    lines += [" ".join(sc.get("hashtags", []))]
    with open(os.path.join(out, "description.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines).strip() + "\n")
    with open(os.path.join(out, "upload.json"), "w", encoding="utf-8") as f:
        json.dump({"title": sc["title"], "tags": sc.get("tags", []), "playlist": sc.get("playlist"),
                   "language": lang, "short": vertical, "duration_s": round(t, 1),
                   "voice": "human" if human == len(sc["scenes"]) else (f"tts:{voice}" if not human else "mixed")},
                  f, indent=2, ensure_ascii=False)
    shutil.rmtree(work, ignore_errors=True)
    print(f"{final}  {yt_time(t)}  ({'human voice' if human == len(sc['scenes']) else 'TTS ' + voice})")


if __name__ == "__main__":
    main()
