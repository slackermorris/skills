# Lesson Design — One Small Win

Read this every time before authoring a lesson. A lesson is the unit of this whole skill, and most ways teaching goes wrong are really ways a single lesson was designed wrong: too big, untethered from the mission, or with no feedback loop.

## What one lesson is

A lesson teaches **one tightly-scoped thing** and ends in **one tangible win** the user can build on. Not a chapter. Not "an introduction to X." One thing, small enough that finishing it feels like a click, not a slog.

Hold these constraints simultaneously:

1. **Tightly scoped.** One concept, or one move. If you can't name the single thing in a short phrase ("how a Service finds its Pods", "the hip hinge in a deadlift"), it's too big — split it.
2. **Short and fast to complete.** Learners' working memory is very small and we must stay inside it. A lesson that overflows working memory doesn't teach slower — it teaches nothing, because nothing gets encoded. Err shorter than feels right. One screen, a couple of minutes of active work.
3. **A single tangible win.** By the end the user can do or recall one concrete thing they couldn't before. Name that win up front so the user knows what they're reaching for.
4. **Tied to the mission.** The win must be a step toward what the user said they wanted in Phase 1. A well-made lesson on something off-mission is still off-mission.
5. **In the zone of proximal development.** Just past current ability, reachable with this one lesson's effort. See `pedagogy.md`.

When a topic is bigger than one lesson — it almost always is — your job is to *find the single most valuable lesson to teach in this session*, not to compress the topic into one page. If the user wants to keep going after their first win, you can build the next small lesson, still within this session; but don't try to teach the whole topic at once.

## Build it around a feedback loop

Every lesson is built on a feedback loop where the user receives feedback on their performance. Make the loop as tight as possible: **immediate** (the instant they commit), **automatic** (the lesson delivers it without being asked), and **specific** (names what was wrong and why). This is non-negotiable — a lesson with explanation but no loop is a document, not a lesson. See `pedagogy.md` for why latency dominates.

## The two lesson formats

### 1. Interactive lessons (quizzes and light in-browser tasks)

The explainer-then-retrieve shape, or a small task the browser can grade. Good for knowledge and for skills that live on screen (reading code, parsing a sentence, identifying a chord). The browser closes the feedback loop instantly. Built from the components in `assets/` — the quiz widget, the stylesheet, simulators.

### 2. Guided real-world step lessons

A short, ordered list of real-world steps for the user to perform — yoga poses, a knife cut, a breathing drill, a chord progression on a real guitar. The lesson is the checklist plus the cue for what "done right" feels or looks like, so the user can self-assess. Here the feedback loop is the user judging their own attempt against a crisp, concrete cue you give them — so make the cue specific and observable ("the bar should track over mid-foot, not the toes"), and where the real world supplies feedback (a mirror, a timer, a coach from the Wisdom communities), point the user at it.

## Quizzes: don't leak the answer

When a lesson uses a quiz, the quiz must actually test recall, not pattern-matching on format. The most common leak is answer length: the long, detailed option is the correct one and everybody knows it. So:

- **Every answer option is the same number of words — and the same number of characters where you can manage it.** Equal length removes the formatting tell. The `quiz.js` component will warn you in the console if options are wildly uneven; treat that as a real signal.
- No other formatting tells: don't capitalise, punctuate, hedge ("usually", "all of the above"), or phrase the correct answer differently from the distractors. The distractors should be plausible to someone who half-knows the material.
- Give specific feedback on a wrong answer — what's actually true and why — not just "wrong". A wrong answer is the highest-value moment in the lesson; spend words there.

## A workable default shape

For a knowledge lesson:

1. **The win** — one line: what you'll be able to recall by the end.
2. **The explainer** — the single concept, sourced from `RESOURCES.md`, kept inside working memory. Cut anything not needed for the win.
3. **Retrieval** — a short self-grading quiz (equal-length answers, immediate specific feedback).

For a skill lesson:

1. **The win** — what you'll be able to *do*.
2. **The setup** — minimal: what to have ready (the editor open, the mat down).
3. **The attempt** — the task or the step list, with a concrete success cue.
4. **The loop** — automatic feedback (browser-graded) or a crisp self-assessment cue, and an invitation to try again.

## Where lessons come from

Content comes from `RESOURCES.md`, never from parametric memory (`resources.md`). Code comes from `assets/`, reused not rewritten (`../assets/README.md`). Your design judgement — scope, sequence, where the ZPD is — is yours to exercise; the *facts* are not.
