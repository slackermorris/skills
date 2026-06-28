# Pedagogy — How Learning Actually Works

This file is the theory the whole skill rests on. Read it when you're deciding *how* to teach something, not just *what*. The practical, per-lesson application lives in `lesson-design.md`; this file is the why behind it.

## Knowledge vs. Skill

Everything you teach is one of two kinds, and they demand different treatment.

| | Knowledge | Skill |
|---|---|---|
| The goal | Acquisition — it **sticks** | Durability + flexibility — it **works under varied conditions** |
| What it looks like | facts, models, vocabulary, "knowing that" | "knowing how" — doing the thing |
| The main tool | retrieval practice (recall it, don't reread it) | effortful practice with feedback |
| The role of difficulty | mild desirable difficulty aids encoding | difficulty *is* the mechanism — see below |
| How you test it | quiz, recall prompts | a task performed, then judged |

Most real missions need both. "Learn French" is knowledge (vocabulary, grammar) *and* skill (forming sentences under time pressure, listening). Decide per lesson which one this lesson serves, and reach for the matching tool. A skill lesson that only quizzes facts teaches the wrong thing; a knowledge lesson dressed up as a drill wastes the user's effort.

## Making knowledge stick

Acquisition fails the same way every time: the user reads, feels fluent, and forgets. Rereading and highlighting produce that feeling of fluency without the durability. The fixes:

- **Retrieval over review.** Pulling an answer out of memory strengthens it far more than seeing it again. Every knowledge lesson ends in recall, not in a summary to nod along to.
- **Interleaving.** Mixing related items in one recall set (rather than blocking them) builds the discrimination that makes knowledge usable. Within a single lesson, this means a recall set that mixes the new idea with anything it builds on.
- **Spacing, handed off.** Durability ultimately comes from recalling a fact across days — today, in two days, next week — not from one sitting. That's beyond a single session's reach, so don't pretend to deliver it. Instead, when a lesson lands something worth retaining, tell the user plainly that the win sticks only if they come back to it, and point them at how (their own practice, the Wisdom communities in `RESOURCES.md`). Honesty about this beats a false promise of permanence from one lesson.

## Skill: difficulty is the tool

For skill acquisition, the instinct to make things easy is exactly backwards. **Effortful retrieval is what builds storage strength.** A drill the user breezes through built nothing; a drill that made them struggle, get feedback, and try again built durability. So when you design skill practice, you are deliberately introducing difficulty — then catching the user with a feedback loop so the struggle is productive, not demoralising.

This is the line you walk: hard enough to be effortful, not so hard the user can't get traction. That window is the **zone of proximal development** (see `lesson-design.md`).

## The feedback loop is the engine

Skill is built by a loop: *attempt → feedback → adjust → attempt again*. The quality of the learning is bounded by the quality of that loop, and the single biggest lever on the loop is **latency**. Feedback that arrives immediately and automatically, while the attempt is still live in the user's mind, is worth far more than feedback that arrives a minute later or that the user has to ask for. So:

- Make feedback **immediate** — the moment the user commits to an answer or action.
- Make it **automatic** — built into the lesson (the quiz grades itself, the timer shows the result), not something you have to be asked for.
- Make it **specific** — "not quite — the cleanup runs *before* the next effect, not on unmount only" beats "incorrect."

The interactive HTML lesson exists precisely because the browser can close this loop instantly and automatically in a way a chat turn cannot.

## Zone of proximal development

A lesson should sit just beyond what the user can already do alone, but within reach given this one lesson's effort and a bit of guidance. Too easy: no storage strength is built, the user is bored. Too hard: the user can't get traction, the feedback loop never closes, the user is discouraged. Every lesson you build is a bet about where that zone is right now; the framing questions in Phase 1, plus how the user responds in the page, are how you calibrate it.

## How this turns into a lesson

- Knowledge to acquire → a short explainer (sourced from `RESOURCES.md`) immediately followed by retrieval (a self-grading quiz).
- Skill to build → a small task — in-browser or real-world — with the tightest feedback loop you can engineer, pitched at the edge of the user's ability.
- Either way → one tightly-scoped thing, one tangible win, sized to working memory. That's `lesson-design.md`.
