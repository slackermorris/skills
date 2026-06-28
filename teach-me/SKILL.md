---
name: teach-me
description: Teach the user a topic in a single interactive HTML lesson served in their browser, where they can highlight any phrase and ask a follow-up that goes straight to Claude and is answered in the page margin — no copy-paste, no refresh — drawn from their curated resources, never from parametric guesses. Use whenever the user wants to learn or be taught something, says "/teach-me", "teach me X", "I want to learn Y", "explain Z so it sticks", "give me a lesson on V", or "help me understand W". Distinct from /tutor, which probes existing understanding rather than building it.
disable-model-invocation: true
metadata:
  last-used: "YYYY-MM-DD"
---

# Teach Me — One Lesson, Answers In the Margin

The user has asked you to teach them something. This is a **single teaching session**: you produce one interactive HTML lesson, serve it locally, the user opens it in their browser, and you teach them through it. The session is **transitory** — when the user closes the page, the lesson is over. Nothing resumes next time; there is no course to track. Get the user a real win in this one sitting.

While the page is open, the user can **highlight any phrase and ask a follow-up** right there. Their question goes **straight to Claude** — no copy-paste — and the answer renders **in the margin of the page, beside the phrase**, like a reader's marginalia, with no refresh. A small Node companion server (`serve.js`) carries the question across and an answer is generated grounded in the curated resources (`references/ask-protocol.md`).

**Work without pausing for permission.** This session is a tight build-and-teach loop; stopping to ask "shall I write this file?" or "is it OK if I search the web?" breaks it. Write the session files (`RESOURCES.md`, the lesson HTML, the scaffolded workspace), start the server, and run the `resource-scout` web searches **without asking the user to confirm** — just do it and keep moving. The only things you stop for are the teaching questions themselves (Phase 1 framing) and the one question this skill is built to ask: **where the user wants resources sourced from** (Phase 2).

## Two cardinal rules

1. **Never teach from parametric memory.** You do not know this topic well enough to teach it; treat that as true even when it feels false. Explainer content and every in-page answer come from the user's **curated resources** (`RESOURCES.md`), not from what you happen to recall. A confident parametric explanation that is subtly wrong is the worst outcome. So before you can teach, `RESOURCES.md` must hold high-trust sources; until it does, your job is finding them (`references/resources.md`).

2. **Answers go straight to the page margin — no copy-paste, no refresh.** When the user highlights a phrase and asks, the question reaches Claude directly through the companion server; the user pastes nothing and refreshes nothing. The answer is composed **live and grounded in `RESOURCES.md`** (web only as a fallback, never parametric) and rendered as a note in the page margin beside the phrase. You **cannot predict what they'll ask**, so you pre-bake nothing — answers are generated the moment a question arrives. In normal operation the server spawns a fresh headless Claude that reads `RESOURCES.md` and writes the answer file, so the main teaching session does nothing; you only step in for the manual fallback. The full contract is in `references/ask-protocol.md`.

## Knowledge vs. skill — they are taught differently

This distinction drives the lesson you design (full treatment in `references/pedagogy.md`):

- **Knowledge** is about *acquisition* — the goal is that it sticks. You make it stick with retrieval: a quiz, recall under mild difficulty, not a passage to nod along to.
- **Skill** is about *durability and flexibility* — the goal is that the user can actually do the thing. Here **difficulty is the tool**: effortful retrieval builds storage strength. Skills are taught through interactive practice and real-world tasks, each wrapped in a **feedback loop** that is as tight, immediate, and automatic as you can make it.

Figure out whether this lesson helps the user *acquire* something or *get good at* something, and reach for the matching tools.

## The session loop

```
Phase 1 — Frame      what does the user want to learn, why, current level (brief)
Phase 2 — Resource   ASK where to source from, then gather high-trust sources into RESOURCES.md; never parametric
Phase 3 — Build      scaffold the workspace (serve.js + assets), build one tightly-scoped lesson that links them
Phase 4 — Deliver    node serve.js + open the localhost URL → user reads, highlights, asks via the in-page widget
Phase 5 — Answer     the server spawns a Claude that answers from RESOURCES.md → it renders in the margin (you usually do nothing)
Phase 6 — End        when the user closes the page, stop the server; the session is over
```

### Phase 1 — Frame

Briefly establish the mission for this session: what does the user want to be able to do or understand, why, and roughly where are they now? Two or three questions, not an intake form — the user wants to learn, not negotiate. This is the anchor: a lesson not tied to it is noise, and it tells you where the user's **zone of proximal development** is so the lesson lands just past what they can already do. Keep it in working context; you don't need to persist it.

### Phase 2 — Resource it

You cannot teach well from an empty `RESOURCES.md`, and you do not get to decide unilaterally where its contents come from. **Before you scout, ask the user where resources should be sourced from.** Two-part question, kept short: (1) what trusted sources they already have (specific books, docs, papers, experts, communities), and (2) where they want you to look for the rest — preferred sites or domains, official docs only, academic/primary sources, a particular author or community, or "use your judgement". Respect any "don't use X" they give.

Then, and only then, spawn the `resource-scout` subagent (`agents/resource-scout.md`) to find high-trust material on the parts of the topic the user has no source for — passing along the sourcing preferences they just gave you, so the scout looks where they asked. Write everything into `RESOURCES.md` in the format in `references/resources.md`. This is also what grounds every in-page answer, so don't skimp.

### Phase 3 — Build the lesson

Read `references/lesson-design.md` before authoring — it is the heart of this skill. The short version: one tightly-scoped thing, completable fast, sized to working memory, delivering one tangible win, built around a tight feedback loop.

**Scaffold the workspace first (once).** On the first lesson of a fresh workspace, copy this skill's `assets/serve.js` to `<workdir>/serve.js` and `assets/{lesson.css, ask-claude.css, ask-claude.js, quiz.js}` to `<workdir>/assets/`. Lessons are **served**, not opened as files, so they link these with root-absolute paths (`/assets/...`) — see `assets/README.md`. Reuse is the default: build from the copied components; if you improve one, improve it in the skill's `assets/` too.

**Author from `assets/lesson-template.html`.** Copy it to the working directory as `0001-<slug>.html` and replace the content (sourced from `RESOURCES.md`). Keep the `<head>` asset links, the `#lesson-context` block (set `lesson`, `title`, and a one-line `missionSummary` distilled from Phase 1 — it travels with every question), and the `class="lesson"` wrapper that the ask-claude widget activates inside.

**Don't author answers.** The lesson ships with the ask-claude widget; when the user highlights a phrase and asks, the question goes to `serve.js` and an answer is generated from `RESOURCES.md` and rendered in the margin (Phase 5). You can't predict what they'll highlight, so pre-writing answers wastes effort.

### Phase 4 — Deliver and listen

Lessons are served by the Node companion server so the ask-claude loop works (a `file://` page can't POST questions or fetch answers). Start it and open the lesson (do this without pausing for permission):

```bash
( cd "<workdir>" && node serve.js >/dev/null 2>&1 & )   # background; serves http://localhost:5173
open "http://localhost:5173/0001-<slug>.html"            # macOS; use xdg-open on Linux
```

Tell the user, once, how the loop works: **highlight a phrase → click ✦ Ask Claude → type a question → press Enter.** The answer appears in the margin beside the phrase within seconds — nothing to paste, nothing to refresh. See `references/ask-protocol.md`.

### Phase 5 — Answer and adapt

- A **question** — the user highlighted a phrase and asked → in normal operation **you do nothing**: `serve.js` spawns a fresh headless Claude that reads `RESOURCES.md` and the lesson, answers from them (never parametric; web as a fallback), and writes `questions/answers/<id>.md`, which the page renders in the margin. Only step in for the **manual fallback** (`ASK_AUTOANSWER=0`, or no `claude` binary on `PATH`): read `questions/inbox.jsonl`, find ids with no answer file, answer from `RESOURCES.md`, and write `questions/answers/<id>.md` yourself. See `references/ask-protocol.md`.
- A **signal the lesson missed** (too fast, too slow, confusing, wrong altitude) → revise the lesson HTML (a structural HTML change needs a reload — tell the user to refresh in that case; questions never do).

Loop as long as the user keeps engaging. If they've got their win and want the next one, build another short lesson — still within this one session.

### Phase 6 — End

When the user closes the page without further questions, the session is over. **Stop the Node server you started in Phase 4.** There's no progress to save and nothing to resume — say a brief word on what they covered if useful, and stop. The working directory can be left for the user to inspect or discarded.

## Reference files

Read each when you reach the phase that needs it; don't pre-load everything.

- `references/pedagogy.md` — knowledge-acquisition vs. skill-durability; making knowledge stick; difficulty and effortful retrieval.
- `references/lesson-design.md` — how to design the lesson: scope, working memory, ZPD, the single win, feedback loops, the two lesson formats, the equal-length quiz-answer rule.
- `references/resources.md` — the `RESOURCES.md` format and rules; Knowledge vs. Wisdom; the never-parametric mandate.
- `references/ask-protocol.md` — the ask-claude model: highlight-to-ask, the question goes straight to `serve.js` (no paste), a headless Claude answers from `RESOURCES.md`, the page renders it in the margin (no refresh); plus the wire format, the `<head>` snippet, and the manual fallback.
- `references/session-workspace.md` — where the session's files live on disk (workspace layout, the Node server).
- `agents/resource-scout.md` — the prompt for the source-finding subagent.
- `assets/README.md` — the reusable-component catalogue, the served-not-inlined rule, and the first-lesson scaffolding step.

**Incorrect:**

The user says "teach me Kubernetes networking." You write a 2,000-word HTML page from memory, with no quiz, never ask where to source from, and reply in chat "open it in your browser; ask me here if you have questions." — wrong on every axis: no mission, no sourcing question, parametric content, too much for working memory, no feedback loop, and questions land in chat instead of the page.

**Correct:**

You ask what the user needs Kubernetes networking *for* and **where they want sources from** (they say: the official Kubernetes docs and a specific book, nothing SEO-blog). You scout within those, populating `RESOURCES.md`. You scaffold the workspace (`serve.js` + `assets/`), build one short lesson — "how a Service finds its Pods" — sourced from those resources, sized to one screen, ending in a three-question recall quiz with equal-length answers, linking the ask-claude widget. You run `node serve.js` and open `http://localhost:5173/0001-...html`. The user highlights "selector", clicks ✦ Ask Claude, types a question, and hits Enter; the server spawns a Claude that reads `RESOURCES.md` and writes the answer — a note appears in the margin beside "selector" within seconds, with nothing pasted and nothing refreshed.
