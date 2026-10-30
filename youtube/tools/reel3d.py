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
GAP = 0.25        # silence after each beat (spec "gap" overrides)
LEAD, TAIL = 0.3, 2.2
KOKORO = os.path.expanduser("~/.cache/kokoro")
# how the voice should read terms it would otherwise spell or mangle
# phonetic spellings: Chatterbox mangles "S R v 6" and lowercase "srv6" ("sssrrv6")
PRONOUNCE = {r"\bHow IT Connects\b": "How I.T. Connects", r"(?i)\bsrv6 dot md\b": "ess are vee six dot em dee", r"(?i)\bSRv6\b": "ess are vee six",
             r"(?i)\bIPv6\b": "eye pee vee six", r"(?i)\bIPv4\b": "eye pee vee four", r"\buSIDs?\b": "micro-SID",
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
                                     spec.get("ref"), pron(text)]).encode()).hexdigest()[:16]
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
    tempo = spec.get("tempo")
    if tempo and tempo != 1:
        # slow down (or speed up) without changing the pitch; Chatterbox has no speed knob
        for i, p in enumerate(keyed):
            q = p[:-4] + f".t{tempo}.wav"
            if not os.path.exists(q):
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-filter:a", f"atempo={tempo}", q], check=True)
            keyed[i] = q
    return [load_human(p) for p in keyed]


def mix_audio(spec, narration, events, total, out):
    """Voice on top; quiet synthesized music that ducks under the voice; sound effects from the events."""
    import zlib
    import music
    import sfx
    seed = zlib.crc32(spec["id"].encode())
    ins, graph, mixes = ["-i", narration], ["[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[v][sc]"], ["[v]"]
    if spec.get("music", "cute") != "none":
        bed = os.path.join(out, "music.wav")
        sf.write(bed, music.render(total, seed).T, music.SR)
        ins += ["-i", bed]
        graph.append(f"[{len(ins) // 2 - 1}:a]volume={spec.get('music_volume', 0.13)}[m];"
                     "[m][sc]sidechaincompress=threshold=0.015:ratio=4:attack=60:release=700[md]")
        mixes.append("[md]")
    else:
        graph[0] = graph[0].replace(",asplit=2[v][sc]", "[v]")
    if spec.get("sfx", True):
        fx = os.path.join(out, "sfx.wav")
        sf.write(fx, sfx.track(events, total, seed), sfx.SR)
        ins += ["-i", fx]
        graph.append(f"[{len(ins) // 2 - 1}:a]volume={spec.get('sfx_volume', 0.75)},pan=stereo|c0=c0|c1=c0[fx]")
        mixes.append("[fx]")
    graph.append("".join(mixes) + f"amix=inputs={len(mixes)}:duration=first:normalize=0")
    mix = os.path.join(out, "mix.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(graph), mix], check=True)
    return mix


def align(texts, clips, cache):
    """Heard word times per clip (see align.py), cached by audio; None where Whisper is not installed."""
    import hashlib
    if not os.path.exists(TTS_PY):
        return [None] * len(clips)
    os.makedirs(cache, exist_ok=True)
    items = []
    for text, clip in zip(texts, clips):
        k = hashlib.sha1(clip.tobytes() + text.encode()).hexdigest()[:16]
        items.append({"wav": os.path.join(cache, k + ".wav"), "text": text, "out": os.path.join(cache, k + ".json")})
    todo = [it for it in items if not os.path.exists(it["out"])]
    if todo:
        for it in todo:
            sf.write(it["wav"], clips[items.index(it)], SR)
        job = os.path.join(cache, "job.json")
        with open(job, "w") as f:
            json.dump({"items": todo}, f)
        subprocess.run([TTS_PY, os.path.join(HERE, "align.py"), job], check=True)
    return [json.load(open(it["out"])) for it in items]


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


def chunks(text, t0, t1, size=2, times=None):
    """Time the caption words (heard times when aligned, else spread by length); group them in short lines."""
    words = text.split()
    weights = [len(re.sub(r"\W", "", w)) + 2 for w in words]
    total, t, timed = sum(weights), t0, []
    for w, wt in zip(words, weights):
        d = (t1 - t0) * wt / total
        timed.append({"w": w, "t0": round(t, 3), "t1": round(t + d, 3)})
        t += d
    if times and len(times) == len(words):
        for w, tt in zip(timed, times):
            if tt:
                w["t0"] = round(t0 + tt[0], 3)
        for a, b in zip(timed, timed[1:]):
            b["t0"] = max(b["t0"], a["t0"] + .05)
            a["t1"] = b["t0"]
        timed[-1]["t1"] = max(timed[-1]["t0"] + .3, t1)
    out, cur = [], []
    for w in timed:
        cur.append(w)
        if len(cur) == size or sum(len(x["w"]) for x in cur) >= 12 or re.search(r"[.,:;?!]$", w["w"]):
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
        e["beat"] = beat_no - 1
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
        refs = [e.get("move"), e.get("on")] + list(e.get("path", [])) + list(e.get("link", [])) + list(e.get("fail", [])) + list(e.get("unlink", [])) \
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
    gap = spec.get("gap", GAP)
    texts = [b.get("text", b["say"]) for b in spec["beats"]]
    timing = [None] * len(clips) if args.check else align(texts, clips, os.path.join(out, "align"))
    t = LEAD
    for i, (b, clip) in enumerate(zip(spec["beats"], clips), 1):
        dur = len(clip) / SR
        beats.append({"start": round(t, 3), "dur": round(dur + gap, 3)})
        beat_caps = chunks(texts[i - 1], t, t + dur, spec.get("caption_words", 2), timing[i - 1])
        caps += beat_caps
        events += compile_actions(i, b.get("do"), t, dur, [w for c in beat_caps for w in c["words"]], known)
        audio += [clip, np.zeros(int(gap * SR), "float32")]
        t += dur + gap
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
    wav = mix_audio(spec, wav, events, total, out)
    tl = {"events": events, "chunks": caps, "total": round(total, 3), "title": spec.get("title", ""),
          "titleUntil": beats[0]["start"] + beats[0]["dur"] - gap, "endAt": end_at, "endCard": spec.get("end_card"), "brand": spec.get("brand", ""),
          "ground": spec.get("ground"), "beats": beats, "id": rid, "format": spec.get("format", "vertical")}
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
