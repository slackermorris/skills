# Ask-Claude Protocol — Answers In the Margin, No Copy-Paste

This is the "highlight a phrase to ask a follow-up" mechanism. The learner selects a
phrase in a lesson, types a question, and it reaches Claude **directly** — with the
highlighted text and the lesson/mission context attached. The answer is grounded in
`RESOURCES.md` and renders **in the page margin**, beside the phrase. The user never
copies anything into the chat and never refreshes.

## How it works (push, not poll, not paste)

Answering is **event-driven and automatic**. The moment the learner submits a question,
the companion server (`serve.js`) spawns a fresh headless Claude in the workspace:

```
claude -p "<self-contained task>" --permission-mode acceptEdits \
       --allowedTools Read Write Edit Glob Grep WebFetch WebSearch
```

That spawned Claude is handed the highlighted phrase, the question, the lesson path, and
the mission summary. It reads `RESOURCES.md` and the lesson, answers **from those sources
(never parametric; web only as a fallback)**, and writes the answer to
`questions/answers/<id>.md`. The page polls only for that answer file and renders it as a
margin sidenote anchored to the highlight.

So in normal operation **the main teaching session does nothing** — there is no loop to
run, no schedule, and nothing for the user to paste. Answers appear in the page seconds
after the learner asks.

## Pieces (all live in the workspace)

- **`serve.js`** — a zero-dependency Node companion server. Serves the lessons and
  assets over `http://localhost:5173`, accepts questions at `POST /ask`, spawns the
  answerer, and serves answers back at `GET /answers/<id>`. Copied from this skill's
  `assets/serve.js` when the workspace is scaffolded.
- **`assets/ask-claude.js` + `assets/ask-claude.css`** — the in-page widget. Linked from
  every lesson with root-absolute paths so they resolve under the server.
- **`questions/inbox.jsonl`** — append-only log of questions (created at runtime).
- **`questions/answers/<id>.md`** — where answers are written (one markdown file per id).

## What every lesson must include

In the `<head>`, using **root-absolute** paths (they resolve under serve.js):

```html
<link rel="stylesheet" href="/assets/lesson.css">
<link rel="stylesheet" href="/assets/ask-claude.css">
<script type="application/json" id="lesson-context">
{"lesson":"0001-foo.html","title":"Lesson title","missionSummary":"One line distilled from Phase 1"}
</script>
<script src="/assets/ask-claude.js" defer></script>
```

- `lesson` — the lesson's own filename (keys persistence and labels questions).
- `title` — the human title of the lesson.
- `missionSummary` — one line distilled from the Phase 1 framing, so the answerer pitches
  at the learner's real goal. (This single session has no `MISSION.md`; the line you embed
  here is how the mission travels with each question.)

The widget activates on text inside the lesson's prose container — wrap lesson content in
an element with `class="lesson"` (it falls back to `<body>` if absent).

## The question wire format

When the learner submits, `serve.js` appends one JSON line to `questions/inbox.jsonl`:

```json
{"id":"0007","ts":"...","status":"pending","question":"...","highlight":"the highlighted phrase","context":{"lesson":"0001-foo.html","title":"...","missionSummary":"..."},"anchorText":"..."}
```

The server also logs the question to stdout, so it shows up in the terminal too.

## Answer style

Keep answers tight and markdown-formatted — the in-page renderer supports paragraphs,
`**bold**`, `*italic*`, `` `code` ``, fenced code blocks, bullet lists, and
`[links](https://…)`. A few short paragraphs at most. Ground every claim in `RESOURCES.md`;
if a fetched web source proves good, add it there.

## Manual fallback

Auto-answering is off when `ASK_AUTOANSWER=0`, or it fails if the `claude` binary isn't on
`PATH` (set `CLAUDE_BIN`). In those cases — or any time you want to answer yourself — do it
by hand: read `questions/inbox.jsonl`, find ids with no `questions/answers/<id>.md`
(presence of the answer file is the single source of truth), answer from `RESOURCES.md`,
and write that file. The page picks it up on its next poll.

## Persistence & known limitation

The widget stores each Q&A in the browser's `localStorage`, keyed by lesson filename, so
reopening a lesson restores past questions and answers. Restoration re-anchors a highlight
by **first exact-text match** of the highlighted string — if the identical phrase appears
more than once, the note may attach to the first occurrence. Keep highlighted spans
reasonably specific.

**Incorrect:** The user highlights "selector" and you reply in the chat, or you tell them
to paste the question, or to refresh the tab. — The answer belongs in the margin, and it
gets there on its own.

**Correct:** The user highlights "selector", clicks ✦ Ask Claude, types a question, and
hits Enter. `serve.js` spawns a Claude that reads `RESOURCES.md`, writes
`questions/answers/0007.md`, and the answer appears as a margin note beside "selector"
within seconds — no paste, no refresh.
