"""Cute, quiet background music, synthesized (no samples, no licenses).

A ukulele-style strum, a little glockenspiel tune, a soft bass and a room
reverb over a happy four-chord loop. The tune is seeded by the reel id, so
every reel gets its own melody but re-renders are identical.

    python youtube/tools/music.py 60 out.wav [seed]
"""
import sys

import numpy as np

SR = 48000
BPM = 96
BEAT = 60 / BPM
# C - G - Am - F, as MIDI notes (ukulele voicings, bass root)
CHORDS = [([60, 64, 67, 72], 48), ([59, 62, 67, 71], 43), ([60, 64, 69, 72], 45), ([60, 65, 69, 72], 41)]
PENTA = [72, 74, 76, 79, 81, 84]  # C major pentatonic, the octave above the strum
_cache = {}


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def pluck(m, dur=1.6):
    """Nylon-string pluck: harmonics that fade faster the higher they are."""
    key = ("p", m)
    if key not in _cache:
        t = np.arange(int(dur * SR)) / SR
        f = hz(m)
        s = sum(np.sin(2 * np.pi * f * k * t) * k ** -1.3 * np.exp(-t * (2.2 + 1.6 * k)) for k in range(1, 9) if f * k < 9000)
        s *= np.minimum(t / .004, 1)
        _cache[key] = (s / np.abs(s).max()).astype("float32")
    return _cache[key]


def bell(m, dur=2.2):
    """Glockenspiel: a sine with the inharmonic partials of a metal bar."""
    key = ("b", m)
    if key not in _cache:
        t = np.arange(int(dur * SR)) / SR
        f = hz(m)
        s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in ((1, 1, 2.2), (2.76, .35, 5), (5.4, .15, 9), (8.93, .06, 14)))
        s *= np.minimum(t / .002, 1)
        _cache[key] = (s / np.abs(s).max()).astype("float32")
    return _cache[key]


def bass(m, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * hz(m) * t) + .25 * np.sin(4 * np.pi * hz(m) * t)
    return (s * np.minimum(t / .02, 1) * np.exp(-t * 1.8)).astype("float32")


def add(buf, x, at, gain, pan):
    i = int(at * SR)
    if i >= buf.shape[1]:
        return
    x = x[: buf.shape[1] - i] * gain
    buf[0, i:i + len(x)] += x * (1 - pan) ** .5
    buf[1, i:i + len(x)] += x * (1 + pan) ** .5


def reverb(buf, secs=1.4, mix=.22, seed=7):
    rng = np.random.default_rng(seed)
    n = int(secs * SR)
    t = np.arange(n) / SR
    out = np.empty_like(buf)
    size = 1 << int(np.ceil(np.log2(buf.shape[1] + n)))
    for c in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 4.5)
        ir[: int(.012 * SR)] = 0  # pre-delay
        ir /= np.sqrt((ir ** 2).sum())
        wet = np.fft.irfft(np.fft.rfft(buf[c], size) * np.fft.rfft(ir, size), size)[: buf.shape[1]]
        out[c] = buf[c] * (1 - mix) + wet * mix
    return out


def tune(rng):
    """An 8-bar melody: a 2-bar motif, repeated with small changes (A A' A B)."""
    def motif():
        notes, pos = [], 0.0
        while pos < 8:
            step = rng.choice([1, 1, 2, .5]) if pos % 1 == 0 else .5
            if rng.random() < .72:
                notes.append((pos, int(rng.integers(len(PENTA)))))
            pos += step
        return notes
    a, b = motif(), motif()
    a2 = [(p, min(len(PENTA) - 1, i + (1 if rng.random() < .3 else 0))) for p, i in a]
    return [(p + off, PENTA[i]) for off, part in ((0, a), (8, a2), (16, a), (24, b)) for p, i in part]


def render(seconds, seed=0):
    rng = np.random.default_rng(seed)
    bar = 4 * BEAT
    buf = np.zeros((2, int((seconds + 3) * SR)), "float32")
    melody = tune(rng)
    strum = [(0, 1, .9), (1, 1, .55), (1.5, -1, .45), (2.5, -1, .5), (3, 1, .6), (3.5, -1, .4)]  # beat, direction, force
    n_bars = int(seconds / bar) + 1
    for b in range(n_bars):
        t0 = b * bar
        notes, root = CHORDS[b % 4]
        for beat, direction, force in strum:
            order = notes if direction > 0 else notes[::-1]
            for k, m in enumerate(order):
                add(buf, pluck(m), t0 + beat * BEAT + k * .012, .16 * force * (1 + rng.uniform(-.1, .1)), -.25)
        add(buf, bass(root, bar * .5), t0, .30, 0)
        add(buf, bass(root, bar * .5), t0 + 2 * BEAT, .22, 0)
        if b >= 2:  # bells come in after two bars
            loop = (b - 2) % 8
            for p, m in melody:
                if loop * 4 <= p < loop * 4 + 4:
                    add(buf, bell(m), t0 + (p - loop * 4) * BEAT, .22, .3)
    buf = reverb(buf)[:, : int(seconds * SR)]
    fade_in, fade_out = np.minimum(np.arange(buf.shape[1]) / (1.5 * SR), 1), np.minimum((buf.shape[1] - np.arange(buf.shape[1])) / (2.5 * SR), 1)
    buf *= fade_in * fade_out
    return (buf / np.abs(buf).max() * .89).astype("float32")


if __name__ == "__main__":
    import soundfile as sf
    sf.write(sys.argv[2], render(float(sys.argv[1]), int(sys.argv[3]) if len(sys.argv) > 3 else 0).T, SR)
