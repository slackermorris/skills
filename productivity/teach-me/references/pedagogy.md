# Pedagogy & Lesson Design — One Small Win

Read before authoring. This is the heart of the skill: the theory you teach by, and how a single lesson embodies it. Most ways teaching goes wrong are a lesson designed wrong — too big, untethered from the mission, or with no feedback loop.

## Contents
- Knowledge vs. Skill (they're taught differently)
- Making knowledge stick
- Skill: difficulty is the tool
- The feedback loop is the engine
- Zone of proximal development
- What one lesson is
- The two lesson formats
- Quizzes: don't leak the answer
- Default lesson shapes

## Knowledge vs. Skill

Everything you teach is one of two kinds, and they demand different treatment. Decide per lesson which one it serves.

| | Knowledge | Skill |
|---|---|---|
| Goal | Acquisition — it **sticks** | Durability + flexibility — it **works under varied conditions** |
| Looks like | facts, models, vocabulary, "knowing that" | "knowing how" — doing the thing |
| Main tool | retrieval practice (recall it, don't reread it) | effortful practice with feedback |
| Difficulty | mild desirable difficulty aids encoding | difficulty *is* the mechanism (below) |
| Test | quiz, recall prompts | a task performed, then judged |

Most missions need both ("learn French" = vocabulary *and* forming sentences under pressure). A skill lesson that only quizzes facts teaches the wrong thing; a knowledge lesson dressed as a drill wastes effort.

## Making knowledge stick

Acquisition fails the same way every time: the user reads, feels fluent, forgets. Rereading and highlighting produce fluency without durability. The fixes:

- **Retrieval over review.** Pulling an answer from memory strengthens it far more than seeing it again. Every knowledge lesson ends in recall, not a summary to nod along to.
- **Interleaving.** Within a lesson, a recall set that mixes the new idea with what it builds on creates the discrimination that makes knowledge usable.
- **Spacing, handed off.** Durability comes from recalling across days — beyond one session's reach. Don't pretend to deliver it: tell the user plainly the win sticks only if they return to it, and point them at how (their own practice, the Wisdom communities in `RESOURCES.md`).

## Skill: difficulty is the tool

For skill, the instinct to make things easy is backwards. **Effortful retrieval builds storage strength.** A drill breezed through built nothing; one that made the user struggle, get feedback, and retry built durability. So you deliberately introduce difficulty — then catch the user with a feedback loop so the struggle is productive. The line you walk: hard enough to be effortful, not so hard they can't get traction. That window is the zone of proximal development.

## The feedback loop is the engine

Skill is built by *attempt → feedback → adjust → attempt again*. The biggest lever is **latency**. Make feedback:

- **Immediate** — the instant the user commits to an answer or action.
- **Automatic** — built into the lesson (the quiz grades itself), not something to be asked for.
- **Specific** — "not quite — the cleanup runs *before* the next effect, not on unmount only" beats "incorrect."

The interactive HTML lesson exists because the browser closes this loop instantly in a way a chat turn cannot. A lesson with explanation but no loop is a document, not a lesson — non-negotiable.

## Zone of proximal development

A lesson sits just past what the user can do alone, reachable with this lesson's effort. Too easy: no storage strength, boredom. Too hard: no traction, the loop never closes, discouragement. The Phase 1 framing plus how the user responds in the page are how you calibrate where that zone is right now.

## What one lesson is

One **tightly-scoped thing** ending in **one tangible win** the user can build on. Not a chapter. Small enough that finishing feels like a click. Hold these simultaneously:

1. **Tightly scoped.** One concept or one move. If you can't name it in a short phrase ("how a Service finds its Pods", "the hip hinge in a deadlift"), split it.
2. **Short and fast.** Working memory is tiny; stay inside it. A lesson that overflows it teaches *nothing*, because nothing encodes. Err shorter than feels right — one screen, a couple of minutes of active work.
3. **A single tangible win.** Name it up front so the user knows what they're reaching for.
4. **Tied to the mission.** The win must be a step toward Phase 1. A great lesson off-mission is still off-mission.
5. **In the ZPD.**

When the topic is bigger than one lesson (it almost always is), find the single most valuable lesson for this session — don't compress the topic into one page. If the user wants more after their win, build the next small lesson within the same session.

## The two lesson formats

1. **Interactive (quiz / light in-browser task).** Explainer-then-retrieve, or a small task the browser grades — knowledge, and skills that live on screen (reading code, parsing a sentence, identifying a chord). Built from the components in `assets/` (see `build.md`).
2. **Guided real-world steps.** An ordered list of real-world actions — yoga poses, a knife cut, a chord progression on a real guitar. The lesson is the checklist plus a crisp, observable cue for what "done right" feels like ("the bar tracks over mid-foot, not the toes"), so the user self-assesses. Point them at real-world feedback where it exists (a mirror, a timer, a Wisdom community).

## Quizzes: don't leak the answer

A quiz must test recall, not pattern-matching on format. The classic leak is length — the long detailed option is obviously correct.

- **Every option is the same number of words** (and characters where you can). `quiz.js` warns in the console on wildly uneven options; treat that as real.
- No other tells: don't capitalise, punctuate, hedge ("usually", "all of the above"), or phrase the correct answer differently. Distractors should be plausible to someone who half-knows the material.
- **Spend words on the wrong-answer feedback** — what's actually true and why. A wrong answer is the highest-value moment in the lesson.

## Default lesson shapes

**Knowledge:** (1) the win — one line; (2) the explainer — single concept, sourced from `RESOURCES.md`, inside working memory, nothing extra; (3) retrieval — a short self-grading quiz.

**Skill:** (1) the win — what you'll be able to *do*; (2) minimal setup; (3) the attempt — task or step list with a concrete success cue; (4) the loop — automatic feedback or a crisp self-assessment cue, plus an invitation to retry.

Content comes from `RESOURCES.md`, never parametric memory (`resources.md`). Code comes from `assets/`, reused not rewritten (`build.md`). Scope, sequence, and where the ZPD is are your judgement; the facts are not.
