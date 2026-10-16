# Build & Run — Workspace, Components, the Ask Loop

How a lesson is scaffolded, served, and how the highlight-to-ask loop works on the wire. Read in Phase 3. The teaching theory is in `pedagogy.md`; this file is the machinery.

## Contents
- Workspace layout
- Components (reuse, don't rewrite)
- Scaffold once, then author
- Serving the lesson
- The ask loop: what every lesson needs
- The ask loop: wire format & answer style
- Manual fallback & persistence

## Workspace layout

A single transitory session, not a persisted course — nothing here resumes. Default location:

```
$TEACH_ME_DIR/<topic-slug>/        # $TEACH_ME_DIR defaults to ~/teach-me
├── RESOURCES.md          # curated trusted sources (resources.md)
├── serve.js              # Node companion server (copied from the skill's assets/)
├── assets/               # lesson.css, ask-claude.css, ask-claude.js, quiz.js (copied in)
├── <NNNN>-<slug>.html    # the lesson(s); link /assets/... root-absolute
└── questions/            # ask-claude inbox + answers (created at runtime)
    ├── inbox.jsonl       # one line per question
    └── answers/<id>.md   # one answer file per question (rendered in the margin)
```

`<topic-slug>` is kebab-case from what the user asked (`kubernetes-networking`, `barbell-deadlift`). If a directory exists from a past session you may **reuse its `RESOURCES.md`** (curation is expensive) — but start teaching fresh; don't resume. `RESOURCES.md` is the only durable value a session leaves behind.

## Components (reuse, don't rewrite)

Lessons are built from reusable components in `assets/`. **Reuse is the default.** When a lesson needs something new and genuinely reusable, add it to `assets/` first, then use it — never hand-roll inside one lesson what a future lesson would duplicate. If you improve a component during a session, improve it in the skill's `assets/` too.

| Component | File | What it's for |
|---|---|---|
| Companion server | `serve.js` | Zero-dependency Node server. Serves lesson + assets on `http://localhost:5173`, accepts `POST /ask`, spawns a headless Claude to answer from `RESOURCES.md`, serves answers at `GET /answers/<id>`. |
| Base stylesheet | `lesson.css` | Typography, the narrow centred prose column (leaves margin room for sidenotes), the "win" banner, explainer, quiz styling. |
| Ask-claude widget | `ask-claude.css` + `ask-claude.js` | Highlight → ✦ Ask Claude → type → POSTs to serve.js; the answer renders as a margin sidenote, no refresh. Persists Q&A in localStorage. |
| Quiz widget | `quiz.js` | Self-grading multiple-choice with immediate specific feedback; warns on unequal-length options. Mount with `mountQuiz()`. |
| Lesson skeleton | `lesson-template.html` | Worked example: `<head>` asset links + `#lesson-context`, the `class="lesson"` wrapper, win banner, explainer, mounted quiz. Author from it, not a blank file. |

## Scaffold once, then author

Lessons are **served, not opened as `file://`** (a `file://` page can't POST questions or fetch answers), so they link assets with **root-absolute paths** (`/assets/lesson.css`, …). On the **first lesson of a fresh workspace**, copy the skill's files in:

- `assets/serve.js` → `<workdir>/serve.js`
- `assets/{lesson.css, ask-claude.css, ask-claude.js, quiz.js}` → `<workdir>/assets/`

Then author each lesson:

1. Copy `assets/lesson-template.html` to `<workdir>/<NNNN>-<slug>.html`.
2. Replace the `<title>`, `#lesson-context`, win, explainer, and `mountQuiz()` data — content sourced from `RESOURCES.md` (`resources.md`). Keep the `<head>` asset links and the `class="lesson"` wrapper.
3. Keep it to one screen / one win (`pedagogy.md`).
4. **Don't author answers** — you can't predict what the user highlights; the ask loop generates them at ask-time.

## Serving the lesson

```bash
( cd "<workdir>" && node serve.js >/dev/null 2>&1 & )   # background; http://localhost:5173
open "http://localhost:5173/<NNNN>-<slug>.html"          # macOS; xdg-open on Linux
```

Tell the user once: **highlight a phrase → click ✦ Ask Claude → type → Enter.** The answer appears in the margin within seconds — nothing to paste, nothing to refresh. Stop the server when the session ends.

## The ask loop: what every lesson needs

Answering is push-based and automatic. The moment the user submits, `serve.js` spawns a fresh headless Claude in the workspace, hands it the highlighted phrase + question + lesson path + mission summary, and that Claude reads `RESOURCES.md` and the lesson, answers **from those sources (web only as fallback, never parametric)**, and writes `questions/answers/<id>.md`. The page polls only for that file and renders it as a margin sidenote. **In normal operation the main teaching session does nothing.**

Every lesson's `<head>` needs this (root-absolute paths resolve under serve.js):

```html
<link rel="stylesheet" href="/assets/lesson.css">
<link rel="stylesheet" href="/assets/ask-claude.css">
<script type="application/json" id="lesson-context">
{"lesson":"0001-foo.html","title":"Lesson title","missionSummary":"One line distilled from Phase 1"}
</script>
<script src="/assets/ask-claude.js" defer></script>
```

- `lesson` — this file's own filename (keys persistence, labels questions).
- `title` — the human title.
- `missionSummary` — one line from Phase 1 so the answerer pitches at the real goal. (No `MISSION.md` exists; this line is how the mission travels with each question.)

The widget activates on text inside `class="lesson"` (falls back to `<body>`).

## The ask loop: wire format & answer style

On submit, `serve.js` appends one JSON line to `questions/inbox.jsonl` and logs to stdout:

```json
{"id":"0007","ts":"...","status":"pending","question":"...","highlight":"phrase","context":{"lesson":"0001-foo.html","title":"...","missionSummary":"..."},"anchorText":"..."}
```

Answers are markdown — the renderer supports paragraphs, `**bold**`, `*italic*`, `` `code` ``, fenced blocks, bullet lists, and `[links](https://…)`. A few short paragraphs at most. Ground every claim in `RESOURCES.md`; if a fetched source proves good, add it there.

## Manual fallback & persistence

Auto-answering is off when `ASK_AUTOANSWER=0`, or fails if no `claude` binary is on `PATH` (set `CLAUDE_BIN`). Then answer by hand: read `questions/inbox.jsonl`, find ids with no `questions/answers/<id>.md` (the answer file is the single source of truth), answer from `RESOURCES.md`, write that file. The page picks it up on its next poll.

A **structural HTML change** to a lesson needs a reload — tell the user to refresh in that case; questions never do.

The widget stores each Q&A in `localStorage` keyed by lesson filename, so reopening restores past Q&A. Restoration re-anchors by **first exact-text match** of the highlighted string — if the same phrase appears twice, the note may attach to the first. Keep highlighted spans reasonably specific.
