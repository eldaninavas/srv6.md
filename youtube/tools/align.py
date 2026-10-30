"""Word timings for the captions: Whisper listens to each narration clip and
the heard words are matched back to the script words. Runs in the TTS env:

    ~/.cache/tts-venv/bin/python align.py job.json

job.json: {"items": [{"wav": "a.wav", "text": "...", "out": "a.json"}]}
Each out file gets a list with [t0, t1] (seconds) or null for every script word.
"""
import difflib
import json
import re
import sys

from faster_whisper import WhisperModel


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def main(job):
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    for it in json.load(open(job))["items"]:
        segs, _ = model.transcribe(it["wav"], word_timestamps=True)
        heard = [(norm(w.word), w.start, w.end) for s in segs for w in s.words]
        script = [norm(w) for w in it["text"].split()]
        times = [None] * len(script)
        sm = difflib.SequenceMatcher(None, script, [h[0] for h in heard], autojunk=False)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
                for k in range(i2 - i1):
                    times[i1 + k] = [round(heard[j1 + k][1], 3), round(heard[j1 + k][2], 3)]
            elif op == "replace" and j2 > j1:  # n script words heard as m words: share the span
                a, b = heard[j1][1], heard[j2 - 1][2]
                for k in range(i2 - i1):
                    times[i1 + k] = [round(a + (b - a) * k / (i2 - i1), 3), round(a + (b - a) * (k + 1) / (i2 - i1), 3)]
        json.dump(times, open(it["out"], "w"))


if __name__ == "__main__":
    main(sys.argv[1])
