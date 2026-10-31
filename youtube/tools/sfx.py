"""Sound effects, synthesized and placed from the story events.

Every action makes its own sound: objects pop in, strings twang, cables
snap, good news dings, trucks rumble, big text whooshes. Nothing to download
and nothing to place by hand; reel3d.py calls track(events, total).
"""
import numpy as np

SR = 48000
LAND = .38      # objects drop in and land this long after they are added (see reel3d.html)


def _t(d):
    return np.arange(int(d * SR)) / SR


def _env(t, attack, decay):
    return np.minimum(t / attack, 1) * np.exp(-t / decay)


def _sweep(f0, f1, d):
    t = _t(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR), t


def _lowpass(x, cut):
    """One-pole low-pass; `cut` may be an array (a moving filter)."""
    a = np.exp(-2 * np.pi * np.broadcast_to(cut, x.shape) / SR)
    y, acc = np.empty_like(x), 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def pop(rng):
    s, t = _sweep(260 * rng.uniform(.9, 1.15), 720, .09)
    return s * _env(t, .002, .03) + rng.standard_normal(len(t)) * _env(t, .0005, .004) * .3


def blip(rng):
    s, t = _sweep(900, 1500, .05)
    return s * _env(t, .001, .02) * .7


def twang(rng):
    """A stretched string: a plucked tone that bends up."""
    t = _t(.45)
    f = 196 * (1 + .25 * np.minimum(t / .12, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin(k * ph) * k ** -1.2 * np.exp(-t * (6 + 3 * k)) for k in range(1, 7))
    return s * np.minimum(t / .003, 1)


def snap(rng):
    t = _t(.5)
    crack = np.diff(rng.standard_normal(len(t) + 1)) * _env(t, .0003, .012)
    thud = np.sin(2 * np.pi * 70 * t) * _env(t, .002, .09)
    crackle = rng.standard_normal(len(t)) * (rng.random(len(t)) < .004) * _env(t, .01, .15) * 2
    return crack * .8 + thud + crackle * .4


def ding(rng):
    t = _t(1.2)
    f = 1568
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in ((1, 1, 3), (2.76, .3, 8), (5.4, .1, 14))) * np.minimum(t / .002, 1) * .6


def bonk(rng):
    s, t = _sweep(330, 110, .22)
    return s * _env(t, .003, .08)


def whoosh(rng, d=.5):
    t = _t(d)
    shape = np.sin(np.pi * t / d) ** 2
    return _lowpass(rng.standard_normal(len(t)), 300 + 2500 * shape) * shape * 2.2


def impact(rng):
    t = _t(.6)
    return np.sin(2 * np.pi * 55 * t) * _env(t, .003, .16) + _lowpass(rng.standard_normal(len(t)), 900) * _env(t, .001, .05) * 2


def engine(rng, d):
    t = _t(d)
    rumble = _lowpass(rng.standard_normal(len(t)), 160) * 3
    hum = np.sign(np.sin(2 * np.pi * 48 * t * (1 + .1 * np.minimum(t / d, 1)))) * .15
    return (rumble + _lowpass(hum, 400)) * np.minimum(t / .25, 1) * np.minimum((d - t) / .35, 1)


def chime(rng):
    out = np.zeros(int(1.8 * SR))
    for i, f in enumerate((1047, 1319, 1568, 2093)):
        t = _t(1.2)
        s = (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 3) * np.minimum(t / .002, 1)
        j = int(i * .09 * SR)
        out[j:j + len(s)] += s * .5
    return out


def shimmer(rng):
    out = np.zeros(int(.9 * SR))
    for i, f in enumerate((1319, 1760, 2349)):
        t = _t(.6)
        s = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) * np.minimum(t / .002, 1)
        j = int(i * .06 * SR)
        out[j:j + len(s)] += s * .25
    return out


def track(events, total, seed=0):
    """One mono track with a sound for every event that should make one."""
    rng = np.random.default_rng(seed)
    buf = np.zeros(int((total + 3) * SR))
    last = {}
    kinds = {e["id"]: e["add"] for e in events if "add" in e}

    def put(name, at, x, gain=1.0, gap=.09):
        if at - last.get(name, -9) < gap:  # many at once: one sound, not a pile-up
            return
        last[name] = at
        i = max(int(at * SR), 0)
        x = x[: len(buf) - i]
        buf[i:i + len(x)] += x * gain

    for e in sorted(events, key=lambda e: e["t"]):
        t = e["t"]
        if "add" in e:
            if e["add"] == "cell":
                put("shimmer", t, shimmer(rng), .35, .3)
            elif e["add"] == "packet":
                put("blip", t, blip(rng), .5)
            else:
                put("pop", t + LAND, pop(rng), .55)
        elif "link" in e:
            put("twang", t, twang(rng) if e.get("style") not in ("road", "river") else whoosh(rng, .4), .35)
        elif "unlink" in e:
            put("whoosh", t, whoosh(rng, .35), .25, .3)
        elif "fail" in e:
            put("snap", t, snap(rng), .9)
        elif "fix" in e:
            put("ding", t, ding(rng), .3)
        elif "pulse" in e:
            c = e.get("color", "purple")
            put("ding" if c == "green" else "bonk" if c == "red" else "blip", t,
                ding(rng) if c == "green" else bonk(rng) if c == "red" else blip(rng), .35)
        elif "tag" in e and isinstance(e["tag"], dict):
            put("blip", t, blip(rng), .25)
        elif "big" in e or "packet" in e:
            put("whoosh", t - .2, whoosh(rng), .5, .3)
            put("impact", t + .12, impact(rng), .45)
        elif "move" in e:
            d = e.get("dur", 1.5)
            if kinds.get(e["move"]) in ("truck", "car", "ship"):
                put("engine", t, engine(rng, d + .4), .35, .2)
            else:
                put("whoosh", t, whoosh(rng, min(d, .7)), .3, .3)
        elif "route" in e:
            put("shimmer", t, shimmer(rng), .5, .3)
        elif "beam" in e:
            put("blip", t, blip(rng), .2)
        elif e.get("end"):
            put("chime", t, chime(rng), .5)
    buf = buf[: int(total * SR)]
    peak = np.abs(buf).max() or 1
    return (buf / max(peak, 1.0) * .9).astype("float32")
