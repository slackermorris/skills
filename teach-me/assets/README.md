# Components — Read This Before Building a Lesson

Lessons are built from reusable components kept here: the stylesheet, the ask-claude
widget, the self-grading quiz, plus the Node companion server. **Reuse is the default,
not the exception.** Read this directory before authoring a lesson and build from what's
already here. When a lesson needs something new and genuinely reusable, add it here
first and then use it — never hand-roll, inside a single lesson, code a future lesson
would duplicate.

## Served, not inlined — scaffold the workspace once

The lesson is **served over a local Node server** (`serve.js`), so lessons link assets
with **root-absolute paths** (`/assets/lesson.css`, `/assets/ask-claude.js`, …) instead
of inlining them. This keeps the source DRY (edit a component in one place) and is what
makes the ask-claude loop work — a `file://` page can't POST questions or fetch answers.

On the **first lesson of a fresh workspace**, scaffold it by copying this skill's files
into the session working directory (`../references/session-workspace.md`):

- `assets/serve.js`        → `<workdir>/serve.js`
- `assets/lesson.css`      → `<workdir>/assets/lesson.css`
- `assets/ask-claude.css`  → `<workdir>/assets/ask-claude.css`
- `assets/ask-claude.js`   → `<workdir>/assets/ask-claude.js`
- `assets/quiz.js`         → `<workdir>/assets/quiz.js`

Then author lessons from `lesson-template.html`. Improve the copied components as the
session grows; if you improve one, improve it **here** too so future sessions benefit.

## Catalogue

| Component | File | What it's for |
|---|---|---|
| Companion server | `serve.js` | Zero-dependency Node server. Serves the lesson + assets, accepts questions at `POST /ask`, spawns a headless Claude to answer them from `RESOURCES.md`, and serves answers at `GET /answers/<id>`. Run with `node serve.js`. See `../references/ask-protocol.md`. |
| Base stylesheet | `lesson.css` | Typography, the narrow centred prose column (leaves margin room for sidenotes), the "win" banner, the explainer, and quiz styling. Link in every lesson's `<head>`. |
| Ask-claude widget | `ask-claude.css` + `ask-claude.js` | Highlight a phrase → ✦ Ask Claude → type a question → it POSTs straight to serve.js (no copy-paste); the answer renders as a margin sidenote, live (no refresh). Persists Q&A in localStorage. Link both in every lesson. |
| Quiz widget | `quiz.js` | Self-grading multiple-choice quiz with immediate, specific feedback. Enforces the equal-length-answer rule (warns in console on violation). Link it, then mount with `mountQuiz()`. |
| Lesson skeleton | `lesson-template.html` | A complete worked example: the `<head>` asset links + `#lesson-context`, the `class="lesson"` wrapper, the "win" banner, an explainer, and a mounted quiz. Copy it and replace the content; don't author from a blank file. |

## How answers happen (don't pre-write them)

You do **not** author answers. When the user highlights a phrase and asks, the ask-claude
widget POSTs the question (plus the highlight and the `#lesson-context`) to `serve.js`,
which spawns a fresh headless Claude that consults `RESOURCES.md`, writes
`questions/answers/<id>.md`, and the widget renders it in the margin within seconds. No
copy-paste, no refresh, and nothing for the main teaching session to do. The full contract
— wire format, the `<head>` snippet, the answerer prompt, and the manual fallback — is in
`../references/ask-protocol.md`.

## Building a lesson, concretely

1. If the workspace is fresh, scaffold it (copy `serve.js` + `assets/*` in — see above).
2. Copy `lesson-template.html` to the working directory as `0001-<slug>.html`.
3. Replace the `<title>`, the `#lesson-context` (lesson filename, title, one-line mission),
   the win, the explainer, and the `mountQuiz()` data — content sourced from `RESOURCES.md`
   (`../references/resources.md`). Keep the `<head>` asset links and the `class="lesson"` wrapper.
4. Keep it to one screen / one win (`../references/lesson-design.md`).
5. Run `node serve.js` and open `http://localhost:5173/0001-<slug>.html` — never `file://`.
