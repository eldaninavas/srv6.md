# Writing an SRv6.md course video script

Every video is a YAML file in `youtube/scripts/<id>.yaml`, rendered by
`youtube/tools/video.py`. The id, title, lesson page, target keyword and
length come from `youtube/course.yaml`. `youtube/scripts/f06.yaml` (SRv6 vs
MPLS) is the reference script: read it before writing a new one.

## Source of truth

- Teach **only what the lesson's srv6.md page says**, plus the RFCs it cites.
  Read the whole page first. Do not invent numbers, CLI commands, release
  versions, customer names or vendor claims. Configuration or commands shown
  on screen must be copied verbatim from the page.
- Keep the site's tone: vendor-neutral, precise, no hype. Say what a
  technology costs, not only what it gives.
- Never mention Telecom District or CTX.

## Structure

- **Long lessons:** 8–14 scenes, length within ±20% of the lesson's `minutes`
  (about 150 narrated words per minute).
  - Scene 1 is a `title` with `kicker: "SRv6.md · Track N · Lesson M"`.
  - The opening says what the viewer will be able to do after the lesson.
  - The last scene is an `end` that sends the viewer to the written lesson
    (`url: "srv6.md/<path>"`) and the next lesson.
- **Shorts** (`format: short`): 4–6 scenes and at most 55 seconds of
  narration. Vertical 1080x1920, so use `title`, `big`, `bullets` (at most 3)
  or `image`; no `record` scenes (wide diagrams become tiny). End on
  "The full lesson is on srv6 dot md."
- **Chapters:** set `chapter:` on at least 3 scenes of a long lesson, and
  always on scene 1. Chapters become YouTube timestamps.

## Scene types

| type | fields | use |
|------|--------|-----|
| `title` | `kicker`, `title`, `subtitle` | Opening |
| `bullets` | `heading`, `bullets` (max 5, short; `**bold**` allowed) | Key points |
| `compare` | `heading`, `columns` (2 × `{title, items}`) | X vs Y |
| `big` | `value`, `caption` | One number or phrase that matters |
| `code` | `heading`, `code` | Config or CLI copied from the page |
| `image` | `heading`, `image` (path from the repo root) | Existing figures only: `docs/assets/images/srv6-packet-format.png`, `docs/assets/images/srv6-vs-mpls-overhead.png`, `docs/assets/images/state-of-srv6-2026.png` |
| `record` | `url` (an srv6.md page), `index` (which diagram on the page, from 0), `click`, `click_at`, `seconds` | Records the page's animated diagram. Check the page has a ```` ```mermaid ```` flowchart; `index` counts the page's flowcharts in order. `click` is text from a scenario button (labels are in `tools/diagrams/diagrams.json`, e.g. "Fail") |
| `end` | `heading`, `subtitle`, `url` | Call to action |

Every scene has `say:`, the narration for that scene.

## Narration (`say`)

- Write for the ear: short sentences, second person, one idea per scene.
  The narration explains the visual and should not read it aloud word by word.
- Write words the text-to-speech voice pronounces well:
  - "micro-SID" for uSID, "srv6 dot md" for the site.
  - "T I L F A" for TI-LFA, "five F zero zero, slash sixteen" for 5f00::/16.
  - "S R H" for SRH, "RFC 8754" for RFC numbers.
- No markdown in `say`.

## Metadata

- `title`: exactly the lesson title in `course.yaml` (100 characters max).
- `description`: two short paragraphs. The first states what the video
  covers, using the target keyword naturally; the second is "This is lesson M
  of Track N (name) in the free SRv6.md course."
- `links`: the written lesson first, then `https://srv6.md/learn/`, then the
  previous and next lessons when they exist.
- `tags`: 8–12, the target keyword first. `hashtags`: 3–4.
- `thumbnail`: `kicker` (topic, 1–3 words) and `text` (at most ~15
  characters, a hook such as a number or a question).
- `playlist`: the track title from `course.yaml`. `lang`: `en` or `es`.

## Check

    venv/bin/python youtube/tools/check_script.py youtube/scripts/<id>.yaml

It must print `ok`. Render with:

    CHROME_PATH=<chromium> venv/bin/python youtube/tools/video.py youtube/scripts/<id>.yaml

A human voice recording at `youtube/voice/<id>/<scene number>.wav` replaces
the text-to-speech voice for that scene.
