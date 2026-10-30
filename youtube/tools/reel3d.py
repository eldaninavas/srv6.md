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
# how the voice should read terms it would otherwise spell or mangle
PRONOUNCE = {r"\bSRv6\b": "S R v 6", r"\bIPv6\b": "I P v 6", r"\bIPv4\b": "I P v 4", r"\buSIDs?\b": "micro-SID",
             r"\bTI-LFA\b": "T I L F A", r"\bSRH\b": "S R H", r"\bMPLS\b": "M P L S", r"\bBGP\b": "B G P",
             r"\bIS-IS\b": "I S I S", r"\bLDP\b": "L D P", r"\bVPN\b": "V P N", r"\bGPUs?\b": "G P U"}


def voice_for(spec):
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(KOKORO, "kokoro-v1.0.onnx"), os.path.join(KOKORO, "voices-v1.0.bin"))
    lang = {"en": "en-us", "es": "es"}.get(spec.get("lang", "en"), "en-us")

    def speak(text):
        samples, sr = k.create(pron(text), voice=spec.get("voice", "af_heart"), speed=spec.get("speed", 1.05), lang=lang)
        assert sr == SR
        return samples
    return speak


TTS_PY = os.path.expanduser("~/.cache/tts-venv/bin/python")


def narrate(spec, texts, cache):
    """Synthesize every line once; cached by text and voice settings, so re-renders are instant."""
    import hashlib
    os.makedirs(cache, exist_ok=True)
    engine = spec.get("engine", "kokoro")
    keyed = []
    for text in texts:
        k = hashlib.sha1(json.dumps([engine, spec.get("voice"), spec.get("speed"), spec.get("exaggeration"),
                                     spec.get("ref"), text]).encode()).hexdigest()[:16]
        keyed.append(os.path.join(cache, k + ".wav"))
    todo = [(t, p) for t, p in zip(texts, keyed) if not os.path.exists(p)]
    if todo and engine == "chatterbox":
        job = os.path.join(cache, "job.json")
        ref = spec.get("ref")
        with open(job, "w") as f:
            json.dump({"exaggeration": spec.get("exaggeration", 0.7), "cfg": spec.get("cfg", 0.35),
                       "ref": os.path.join(YT, ref) if ref else None,
                       "items": [{"text": pron(t), "out": p} for t, p in todo]}, f)
        subprocess.run([TTS_PY, os.path.join(HERE, "tts_chatterbox.py"), job], check=True)
    elif todo:
        speak = voice_for(spec)
        for t, p in todo:
            sf.write(p, speak(t), SR)
    return [load_human(p) for p in keyed]


def pron(text):
    for a, b in PRONOUNCE.items():
        text = re.sub(a, b, text)
    return text


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
        if len(cur) == size or sum(len(x["w"]) for x in cur) >= 11 or re.search(r"[.,:;?!]$", w["w"]):
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return [{"t0": c[0]["t0"], "t1": c[-1]["t1"], "words": c} for c in out]


def norm(w):
    return re.sub(r"[^a-z0-9áéíóúñü]", "", w.lower())


def compile_actions(beat_no, actions, start, dur, words, known):
    """Resolve each action's `at` (fraction of the beat, or a spoken caption word) to seconds."""
    events = []
    for a in actions or []:
        e = dict(a)
        # YAML 1.1 reads a bare `on:` key as the boolean True
        for d in [e] + [v for v in e.values() if isinstance(v, dict)]:
            if True in d:
                d["on"] = d.pop(True)
        at = e.pop("at", 0)
        if isinstance(at, str):
            hits = [w for w in words if norm(w["w"]) == norm(at)]
            if not hits:
                raise SystemExit(f"beat {beat_no}: word {at!r} is not in the caption text")
            e["t"] = hits[0]["t0"]
        else:
            e["t"] = round(start + float(at) * dur, 3)
        if "add" in e:
            if "id" not in e:
                raise SystemExit(f"beat {beat_no}: add needs an id")
            known.add(e["id"])
        refs = [e.get("move"), e.get("on")] + list(e.get("path", [])) + list(e.get("link", [])) + list(e.get("fail", [])) \
            + list(e.get("route", [])) + list(e.get("beam", [])) + list(e.get("unbeam", [])) + [x for k in ("pulse", "remove") for x in ([e[k]] if isinstance(e.get(k), str) else e.get(k, []))]
        if isinstance(e.get("tag"), dict):
            refs.append(e["tag"].get("on"))
        if isinstance(e.get("camera"), dict):
            refs.append(e["camera"].get("on"))
        for r in refs:
            if isinstance(r, str) and r not in known:
                raise SystemExit(f"beat {beat_no}: unknown object {r!r} (add it first)")
        events.append(e)
    return events


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--frame", type=float, action="append", help="render stills at these times instead of the video")
    ap.add_argument("--check", action="store_true", help="validate the story without voice or rendering")
    args = ap.parse_args()
    with open(args.spec, encoding="utf-8") as f:
        spec = yaml.safe_load(f)
    rid = spec["id"]
    out = os.path.join(YT, "out", f"{rid}-3d")
    os.makedirs(out, exist_ok=True)
    human = os.path.join(YT, "voice", f"{rid}-3d")

    audio, beats, caps, events, known = [np.zeros(int(LEAD * SR), "float32")], [], [], [], set()
    recs = [next((p for p in (os.path.join(human, f"{i:02}{e}") for e in (".wav", ".m4a")) if os.path.exists(p)), None)
            for i in range(1, len(spec["beats"]) + 1)]
    if args.check:
        clips = [np.zeros(int(len(b["say"].split()) / 2.6 * SR), "float32") for b in spec["beats"]]
    else:
        synth = narrate(spec, [b["say"] for b, r in zip(spec["beats"], recs) if not r], os.path.join(out, "tts"))
        clips = [load_human(r) if r else synth.pop(0) for r in recs]
    t = LEAD
    for i, (b, clip) in enumerate(zip(spec["beats"], clips), 1):
        dur = len(clip) / SR
        beats.append({"start": round(t, 3), "dur": round(dur + GAP, 3)})
        beat_caps = chunks(b.get("text", b["say"]), t, t + dur)
        caps += beat_caps
        events += compile_actions(i, b.get("do"), t, dur, [w for c in beat_caps for w in c["words"]], known)
        audio += [clip, np.zeros(int(GAP * SR), "float32")]
        t += dur + GAP
    if args.check:
        print(f"ok   {os.path.basename(args.spec):14} ~{t:4.1f}s, {len(events)} events")
        return
    # a caption line stays up until the next one starts (no flicker between lines)
    for a, b in zip(caps, caps[1:]):
        a["t1"] = b["t0"]
    audio.append(np.zeros(int(TAIL * SR), "float32"))
    total = t + TAIL
    events.sort(key=lambda e: e["t"])
    shown = None
    for e in events:
        if "card" in e:
            shown = (shown if e["card"] and shown is not None else (e["t"] if e["card"] else None))
            e["shown"] = shown
    end_at = next((e["t"] for e in events if e.get("end")), total - TAIL)

    wav = os.path.join(out, "narration.wav")
    sf.write(wav, np.concatenate(audio), SR)
    tl = {"events": events, "chunks": caps, "total": round(total, 3), "title": spec.get("title", ""),
          "titleUntil": beats[0]["start"] + beats[0]["dur"] - GAP, "endAt": end_at,
          "ground": spec.get("ground"), "format": spec.get("format", "vertical")}
    tl_path = os.path.join(out, "timeline.json")
    with open(tl_path, "w") as f:
        json.dump(tl, f)
    with open(os.path.join(out, "caption.txt"), "w", encoding="utf-8") as f:
        f.write(spec.get("caption", ""))

    mjs = os.path.join(HERE, "reel3d.mjs")
    if args.frame:
        pngs = [os.path.join(out, f"frame-{x:05.1f}.png") for x in args.frame]
        subprocess.run(["node", mjs, tl_path, wav, "-", "--frames", ",".join(map(str, args.frame)), ",".join(pngs)], check=True)
        print("\n".join(pngs))
    else:
        mp4 = os.path.join(out, f"{rid}.mp4")
        subprocess.run(["node", mjs, tl_path, wav, mp4], check=True)
        print(f"{mp4}  {total:.1f}s")


if __name__ == "__main__":
    main()
