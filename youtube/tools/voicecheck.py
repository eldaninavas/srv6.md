"""Transcribe a reel's narration with Whisper and flag words that differ from
the script, so dropped, mumbled or mispronounced words show up without
listening. Run with the TTS env (faster-whisper):

    ~/.cache/tts-venv/bin/python youtube/tools/voicecheck.py youtube/reels/l01.yaml
"""
import difflib
import os
import re
import sys

from faster_whisper import WhisperModel

YT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def words(s):
    return re.findall(r"[a-z0-9']+", s.lower().replace("srv6.md", "srv6 dot md"))


def main(path):
    import yaml
    spec = yaml.safe_load(open(path))
    script = " ".join(b["say"] for b in spec["beats"])
    wav = os.path.join(YT, "out", f"{spec['id']}-3d", "narration.wav")
    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(wav)  # no prompt: it would bias toward the script
    heard = " ".join(s.text for s in segs)
    a, b = words(script), words(heard)
    bad = 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes():
        if op != "equal":
            bad += 1
            print(f"{op:8} script: {' '.join(a[i1:i2]) or '-':40} heard: {' '.join(b[j1:j2]) or '-'}")
    print(f"{spec['id']}: {len(a)} words, {bad} differences")


if __name__ == "__main__":
    main(sys.argv[1])
