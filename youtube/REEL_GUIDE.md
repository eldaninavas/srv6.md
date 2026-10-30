# Writing an SRv6.md story reel

A reel is a 30–40 second vertical video (Instagram Reels, YouTube Shorts,
TikTok) told as a story in a 3D diorama. Each one is a YAML file in
`youtube/reels/<id>.yaml`, rendered by `youtube/tools/reel3d.py`.
`youtube/reels/s01.yaml` is the reference: read it before writing a new one.

## The story

- **Start with an everyday situation and a question anyone understands**,
  never with a protocol name: "Imagine you have to send a package to a
  friend…", "What happens when the bridge you always take is closed?".
- **The viewer is the protagonist.** Talk to *you*: "you write the route",
  "your package". No third person ("the source router") and no letter names
  (no "router B", "node D").
- **Build it step by step, like a story.** A simple solution, then the
  problem it causes, then the fix, then the next problem: "so you… but…
  so you add…". Each beat is one step.
- **Name the technology only after the viewer already understands the
  idea**, then tie it back to the story in one sentence.
- End with the payoff and "Learn it for free at srv6 dot md".
- **Avoid words the voice can read two ways** (it guesses wrong): lives,
  live, read, close, lead, record, minute, wind, tear, object, present,
  content. Rephrase: "your cousin moved to…", not "your cousin lives…".
- **Short.** 30–40 seconds in total, 6–8 beats, 5–12 words per beat.
  Every sentence earns its place.
- Friendly and warm, short sentences, contractions, a few exclamations.
  The facts must still be exactly what the lesson's srv6.md page says.

## Format

```yaml
id: s01
voice: af_bella          # Kokoro voice; speed 1.0 sounds most natural
title: "SRv6 in <b>60 seconds</b>"   # big title during the first beat
ground: paper            # or grass
caption: |               # Instagram / Shorts text, link in bio
  ...
beats:
  - say: "What the voice reads."
    text: "Caption text, only if it must differ from say."
    do:                  # what happens during this beat
      - {at: "word", add: house, id: you, pos: [0, 6]}
```

`at` is a word of the caption (the action fires when it is spoken) or a
fraction of the beat (0 = start, 0.5 = middle). Positions are `[x, z]`;
the camera always frames what is visible. In a vertical reel keep x within
about -3.5…3.5 and use z from about -7 (back) to 7 (front).

| action | example |
|--------|---------|
| add an object | `{add: router, id: r1, pos: [0, 3], color: purple, label: "..."}` |
| connect two objects | `{link: [r1, r2]}`, a road `{link: [a, b], style: road}`, a river `style: river` |
| move along objects | `{move: pkt, path: [you, r1, r2], dur: 2}` (seconds) |
| highlight a path | `{route: [you, r1, r2], color: purple}`, clear all with `{unroute: true}` |
| break / repair a link | `{fail: [r1, r2]}`, `{fix: [r1, r2]}` |
| bubble over an object | `{tag: {on: r1, text: "Where to?", color: orange}}`, `{untag: r1}` |
| radio beam (follows moving objects) | `{beam: [tower1, car], color: yellow}`, faint with `weak: true`; remove with `{unbeam: [tower1, car]}` |
| bounce + ring | `{pulse: r1, color: green}` |
| remove | `{remove: car1}` |
| top card | `{card: {title: "Your route", chips: [["East side", active], ["Friend", next]]}}`; states: `active`, `next`, `done`, `repair`; hide with `{card: null}` |
| big text | `{big: "128 bits", sub: "one IPv6 address", dur: 2.5}` |
| packet modal (very simple) | `{packet: {title: "Your SRv6 packet", rows: [["Going to now", "East side", purple], ["Your route", "East side → Friend", dark], ["Inside", "Your data", orange]]}, dur: 4}` |
| camera close-up | `{camera: {on: r1, zoom: 5}}`, back with `{camera: auto}` |
| end card | `{end: true}` (in the last beat, on "Learn") |

Objects: `router`, `ship`, `house`, `building` (`height`), `datacenter`, `server`,
`gpu`, `tower`, `truck`, `car`, `person`, `tree`, `cloud`, `packet`,
`sign` (`text`), `box` (`size: [w, h, d]`). Any object takes `scale: 1.5`. Colors: purple, green, grey,
red, orange, blue, yellow, pink, teal, dark, white, brown, or `"#rrggbb"`.

## Check and render

    venv/bin/python youtube/tools/reel3d.py youtube/reels/<id>.yaml --check
    CHROME_PATH=<chromium> venv/bin/python youtube/tools/reel3d.py youtube/reels/<id>.yaml --frame 5 --frame 20
    CHROME_PATH=<chromium> venv/bin/python youtube/tools/reel3d.py youtube/reels/<id>.yaml

`--check` validates object names and word anchors without rendering.
`--frame` renders stills to check the layout. The video goes to
`youtube/out/<id>-3d/`. A recording at `youtube/voice/<id>-3d/01.wav` (one
per beat) replaces the synthetic voice.
