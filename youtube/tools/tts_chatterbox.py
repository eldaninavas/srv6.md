"""
Expressive narration with Chatterbox (free, local). Runs in its own env:
    ~/.cache/tts-venv/bin/python youtube/tools/tts_chatterbox.py jobs.json
jobs.json: {"exaggeration": 0.7, "cfg": 0.35, "ref": null, "items": [{"text": "...", "out": "a.wav"}]}
`ref` is an optional 10-20 s recording whose voice is copied.
"""
import json
import sys

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

job = json.load(open(sys.argv[1]))
device = "mps" if torch.backends.mps.is_available() else "cpu"
model = ChatterboxTTS.from_pretrained(device=device)
for it in job["items"]:
    wav = model.generate(it["text"], audio_prompt_path=job.get("ref"),
                         exaggeration=job.get("exaggeration", 0.7), cfg_weight=job.get("cfg", 0.35))
    torchaudio.save(it["out"], wav.cpu(), model.sr)
    print(it["out"], flush=True)
