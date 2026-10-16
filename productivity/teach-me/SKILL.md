---
name: teach-me
description: Teach the user a topic in a single interactive HTML lesson served in their browser, where they can highlight any phrase and ask a follow-up that goes straight to Claude and is answered in the page margin — no copy-paste, no refresh — drawn from their curated resources, never from parametric guesses. Use whenever the user wants to learn or be taught something, says "/teach-me", "teach me X", "I want to learn Y", "explain Z so it sticks", "give me a lesson on V", or "help me understand W". Distinct from /tutor, which probes existing understanding rather than building it.
disable-model-invocation: true
metadata:
  last-used: "2026-08-30"
---

# Teach Me — One Lesson, Answers In the Margin

The user has asked you to teach them something. This is a **single, transitory teaching session**: you produce one interactive HTML lesson, serve it locally, and teach through it. When the user closes the page the session is over — nothing resumes, there's no course to track. Get them a real win in this one sitting.

While the page is open the user can **highlight any phrase and ask a follow-up** right there. The question goes straight to Claude (no copy-paste) and the answer renders **in the page margin beside the phrase** (no refresh), like a reader's marginalia. A small Node companion server (`serve.js`) carries it across; the mechanics are in `references/build.md`.

**Work without pausing for permission.** This is a tight build-and-teach loop. Write the session files, start the server, and run the resource scout **without asking to confirm** — just do it. The only things you stop for are the Phase 1 framing questions and the Phase 2 question about where to source resources.

## Two cardinal rules

1. **Never teach from parametric memory.** Treat yourself as not knowing this topic well enough to teach it, even when it feels false. Explainer content and every in-page answer come from the user's curated `RESOURCES.md`, not from recall. A confident parametric explanation that is subtly wrong is the worst outcome. Until `RESOURCES.md` holds high-trust sources, your job is finding them, not teaching (`references/resources.md`).
2. **Answers go to the page margin — no copy-paste, no refresh.** A highlighted question reaches Claude directly through `serve.js`, which spawns a headless Claude that answers from `RESOURCES.md` (web only as fallback) and writes an answer file the page renders in the margin. You can't predict what they'll ask, so pre-bake nothing. In normal operation you do nothing here; you only step in for the manual fallback (`references/build.md`).

## Knowledge vs. skill — taught differently

Decide per lesson which kind this is (full treatment in `references/pedagogy.md`):

- **Knowledge** is about *acquisition* — making it stick. The tool is retrieval: a quiz, recall under mild difficulty, not a passage to nod along to.
- **Skill** is about *durability and flexibility* — being able to do the thing. Here **difficulty is the tool**: effortful retrieval builds storage strength, wrapped in a feedback loop as tight, immediate, and automatic as you can make it.

## The session loop

```
Phase 1 — Frame      what does the user want to learn, why, current level (brief)
Phase 2 — Resource   ASK where to source from, then scout high-trust sources into RESOURCES.md; never parametric
Phase 3 — Build      scaffold the workspace, build one tightly-scoped lesson sourced from RESOURCES.md
Phase 4 — Deliver    node serve.js + open the localhost URL → user reads, highlights, asks
Phase 5 — Answer     the server spawns a Claude that answers from RESOURCES.md → renders in the margin (you usually do nothing)
Phase 6 — End        when the user closes the page, stop the server; the session is over
```

**Phase 1 — Frame.** Two or three questions, not an intake form: what the user wants to be able to do or understand, why, and roughly where they are now. This anchors everything and locates their zone of proximal development so the lesson lands just past current ability. Keep it in working context.

**Phase 2 — Resource it.** Before scouting, **ask where resources should come from**: (1) trusted sources they already have, and (2) where to look for the rest (preferred sites, official docs only, academic/primary, a named author/community, or "use your judgement"), plus any "don't use X". Then spawn the `resource-scout` subagent (its prompt is in `references/resources.md`), passing those preferences along, and write findings into `RESOURCES.md`.

**Phase 3 — Build.** Read `references/pedagogy.md` (how to design the lesson) and `references/build.md` (scaffold the workspace, reuse the `assets/` components, author from `lesson-template.html`). One tightly-scoped thing, sized to working memory, one tangible win, built around a tight feedback loop. Don't author answers.

**Phase 4 — Deliver.** Start `serve.js` and open the lesson over `http://localhost:5173` (never `file://`). Tell the user once how the ask loop works (`references/build.md`).

**Phase 5 — Answer and adapt.** For a **question**, normally do nothing — the server answers from `RESOURCES.md` and the page renders it (step in only for the manual fallback). For a **signal the lesson missed** (too fast/slow, confusing, wrong altitude), revise the lesson; a structural HTML change needs a reload. Loop as long as the user engages; build another short lesson if they want the next win.

**Phase 6 — End.** When the user closes the page, **stop the Node server**. Nothing to save, nothing to resume — say a brief word on what they covered if useful, and stop.

## Reference files

Read each when you reach the phase that needs it; don't pre-load everything. All one level deep.

- `references/pedagogy.md` — the teaching theory and how to design a lesson: knowledge vs. skill, making knowledge stick, difficulty and feedback loops, ZPD, scope, the two formats, the equal-length quiz rule.
- `references/resources.md` — the `RESOURCES.md` format and never-parametric mandate, Knowledge vs. Wisdom, and the resource-scout subagent prompt.
- `references/build.md` — the machinery: workspace layout, the reusable `assets/` components, scaffolding, serving, and the ask-claude loop (head snippet, wire format, manual fallback).

**Incorrect:** The user says "teach me Kubernetes networking." You write 2,000 words from memory, no quiz, never ask where to source from, and reply "open it in your browser; ask me here if you have questions." — wrong on every axis: no mission, no sourcing question, parametric content, too much for working memory, no feedback loop, questions in chat instead of the page.

**Correct:** You ask what they need it *for* and **where to source from** (the official docs and a specific book, nothing SEO-blog). You scout within those into `RESOURCES.md`, scaffold the workspace, and build one short lesson — "how a Service finds its Pods" — sourced from those resources, sized to one screen, ending in a three-question recall quiz with equal-length answers. You run `node serve.js` and open the localhost URL. The user highlights "selector", clicks ✦ Ask Claude, types a question, hits Enter; a margin note appears beside "selector" within seconds — nothing pasted, nothing refreshed.
