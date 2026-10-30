"""
Render a 3D vertical reel (Instagram Reels, YouTube Shorts, TikTok) from a
beat file in youtube/reels/<id>.yaml.

    CHROME_PATH=<chromium> venv/bin/python youtube/tools/reel3d.py youtube/reels/s01.yaml
    ... --frame 12.5   # one still at t=12.5 s, to check the look quickly

1. narrates every beat with Kokoro (free, local; model files in
   ~/.cache/kokoro), unless youtube/voice/<id>/<beat>.wav exists, which wins;
2. times the on-screen caption words across each beat;
3. renders youtube/tools/reel3d.html frame by frame (reel3d.mjs) and muxes
   the narration.

Output in youtube/out/<id>-3d/: <id>.mp4, caption.txt.
"""

import argparse
import json
import os
import re
import subprocess

import numpy as np
import soundfile as sf
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
YT = os.path.dirname(HERE)
SR = 24000
GAP = 0.25        # silence after each beat
LEAD, TAIL = 0.3, 2.2
KOKORO = os.path.expanduser("~/.cache/kokoro")


def voice_for(spec):
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(KOKORO, "kokoro-v1.0.onnx"), os.path.join(KOKORO, "voices-v1.0.bin"))
    lang = {"en": "en-us", "es": "es"}.get(spec.get("lang", "en"), "en-us")

    def speak(text):
        samples, sr = k.create(text, voice=spec.get("voice", "af_heart"), speed=spec.get("speed", 1.05), lang=lang)
        assert sr == SR
        return samples
    return speak


def load_human(path):
    data, sr = sf.read(path, dtype="float32", always_2d=True)
    data = data.mean(axis=1)
    if sr != SR:
        data = np.interp(np.arange(0, len(data), sr / SR), np.arange(len(data)), data).astype("float32")
    return data


def chunks(text, t0, t1, size=3):
    """Spread the caption words over [t0, t1] by length; group them in short lines."""
    words = text.split()
    weights = [len(re.sub(r"\W", "", w)) + 2 for w in words]
    total, t, timed = sum(weights), t0, []
    for w, wt in zip(words, weights):
        d = (t1 - t0) * wt / total
        timed.append({"w": w, "t0": round(t, 3), "t1": round(t + d, 3)})
        t += d
    out, cur = [], []
    for w in timed:
        cur.append(w)
        if len(cur) == size or re.search(r"[.,:;?!]$", w["w"]):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return [{"t0": c[0]["t0"], "t1": c[-1]["t1"], "words": c} for c in out]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--frame", type=float, help="render one still at this time instead of the video")
    args = ap.parse_args()
    with open(args.spec, encoding="utf-8") as f:
        spec = yaml.safe_load(f)
    rid = spec["id"]
    out = os.path.join(YT, "out", f"{rid}-3d")
    os.makedirs(out, exist_ok=True)
    human = os.path.join(YT, "voice", f"{rid}-3d")

    speak, audio, beats, caps = None, [np.zeros(int(LEAD * SR), "float32")], [], []
    t = LEAD
    for i, b in enumerate(spec["beats"], 1):
        rec = next((p for p in (os.path.join(human, f"{i:02}{e}") for e in (".wav", ".m4a")) if os.path.exists(p)), None)
        if rec:
            clip = load_human(rec)
        else:
            speak = speak or voice_for(spec)
            clip = speak(b["say"])
        dur = len(clip) / SR
        beats.append({"act": b["act"], "start": round(t, 3), "dur": round(dur + GAP, 3)})
        caps += chunks(b.get("text", b["say"]), t, t + dur)
        audio += [clip, np.zeros(int(GAP * SR), "float32")]
        t += dur + GAP
    # a caption line stays up until the next one starts (no flicker between lines)
    for a, b in zip(caps, caps[1:]):
        a["t1"] = b["t0"]
    beats[-1]["dur"] += TAIL
    audio.append(np.zeros(int(TAIL * SR), "float32"))
    total = t + TAIL

    wav = os.path.join(out, "narration.wav")
    sf.write(wav, np.concatenate(audio), SR)
    tl = {"beats": beats, "chunks": caps, "total": round(total, 3), "title": spec.get("title", "")}
    tl_path = os.path.join(out, "timeline.json")
    with open(tl_path, "w") as f:
        json.dump(tl, f)
    with open(os.path.join(out, "caption.txt"), "w", encoding="utf-8") as f:
        f.write(spec.get("caption", ""))

    mjs = os.path.join(HERE, "reel3d.mjs")
    if args.frame is not None:
        png = os.path.join(out, f"frame-{args.frame:05.1f}.png")
        subprocess.run(["node", mjs, tl_path, wav, "-", "--frame", str(args.frame), png], check=True)
        print(png)
    else:
        mp4 = os.path.join(out, f"{rid}.mp4")
        subprocess.run(["node", mjs, tl_path, wav, mp4], check=True)
        print(f"{mp4}  {total:.1f}s")


if __name__ == "__main__":
    main()
