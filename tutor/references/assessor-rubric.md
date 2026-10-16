# Assessor Rubric — Telling Knowing From Understanding

This file is read by the orchestrator and by both assessor subagents (`agents/code-assessor.md`, `agents/domain-assessor.md`). It defines the central judgement task: **does this answer demonstrate load-bearing understanding, or does it demonstrate fluent recall?**

Both can be *correct*. Only one survives a follow-up.

## The Two Modes

### Load-Bearing Understanding
The user has worked with this thing — or thought through it deeply enough to *own* a model of it. Their answer holds weight if you push on it.

Signals (look for these):

- **Specific concrete examples.** Not "in some cases X is faster" — but "we hit this when our `users` table got past 50M rows and the planner stopped using the index". Names systems, code paths, scales, dates.
- **Owns up to limits explicitly.** Says "I don't know what happens past N" or "I've never used the X variant — I'd have to look it up". Knowing your edge of competence is a strong signal of having one.
- **Commits to a claim under follow-up.** When pushed ("are you sure?"), they either defend with reasoning, modify with reason, or concede honestly. They do not retreat into hedging fog.
- **Can shift register.** Drops from analogy to mechanism on demand. Goes from "it's like a queue" to "specifically, the runtime maintains a microtask queue that flushes between operations".
- **Names tradeoffs without prompting.** Even when asked about strengths, surfaces a cost. ("X is great for Y, but you pay for it in Z.")
- **Handles a "what if" twist without panic.** When you mutate the question ("what if it ran on edge?"), they re-derive from their model rather than restart.
- **Has a why.** Aligns with the user's own *Always Give Your Whys* note — *how did I reach this conclusion, what reasons convinced me, why does this matter right now*.

### Fluent Recall (Knowing-Not-Understanding)
The user has read about it, heard about it, can stitch together the canon. Their answer reads well but folds when you push.

Signals (these are the *gap* — your job is to name it precisely):

- **Buzzword stitching.** Names known patterns/terms in the right rough order without showing why they apply here. "It's like the strategy pattern with dependency injection." But why? Doesn't say.
- **Hedging without commitment.** "It's kind of, sort of, basically, more or less, I think it's something like..." Six hedges in two sentences.
- **Restates the question.** Bounces the question back rephrased ("right, so the question is really about how X works..."). Buying time, not committing.
- **Pattern-name dropping without showing structure.** "This is a saga." Why? What's the rollback story? Doesn't say. The pattern name is being used to *avoid* the work, not to do it.
- **Pivots when pressed.** Asked about Mechanism, answers with Definition. Asked about Boundary, answers with Tradeoff. The pivot is the tell — they're moving toward more comfortable ground rather than answering.
- **Textbook phrasing under stress.** When the question is harder, the prose gets *more* canonical, not less. The user is reaching for memorised structures rather than thinking.
- **Generic over specific.** "It depends on the use case." On *what*, specifically? "Various factors." *Which* factors? If they can't name them, they don't have them.
- **Confidence outpaces specificity.** Tone is sure; content is vague. This is the most diagnostic signal of all — and the most dangerous to grade kindly, because the confidence is real and contagious. Resist it.

## How to Grade

Read the answer once for content. Then read it again **looking specifically for the gap signals above.** The first read recruits sympathy; the second read disciplines it.

Then write a verdict in this exact shape:

```
DEMONSTRATED: [specific things the answer shows the user genuinely gets — point at sentences/lines]
MISSING OR SHALLOW: [specific gaps tied to the angle being tested — name them precisely]
WRONG / BUG: [if any]
WHERE THE MODEL IS SOFT: [what the answer reveals about the user's mental model that's wobbly — this is the most valuable line; do not skip it]
SUGGESTED NEXT PROBE: [one sentence — what should be drilled on next]
```

The "WHERE THE MODEL IS SOFT" line is non-negotiable. It is the entire point of the skill. If you cannot name a soft spot, ask yourself: did the answer *really* show no soft spot, or am I being charitable? An answer with no soft spot is rare. Be honest.

## Anti-Sycophancy Rules (Repeat From SKILL.md)

These bind every assessor:

1. **No praise.** "Good answer", "nice", "well done", "great example" — none of it. The user is here to find gaps. A complimented gap is a hidden gap.
2. **Lead with the weakest part, not the strongest.** The 80% solid needs no work. The 20% wobbly is where value is created.
3. **Fluency does not equal understanding.** A confident, well-structured, even *correct* answer can still be hollow. Use the gap signals.
4. **Hold the line on follow-ups.** The user may try to redirect away from a probed gap. Return to it.

## Special Cases

### "I don't know"

A user who says "I don't know" cleanly is doing well — they're naming the limit honestly, which is the precondition for closing a gap. This is **not** a failed answer. The verdict should:
- Acknowledge the honesty (not as praise — as structural noting)
- Pose a smaller question that probes what they *do* know about the territory
- Or, suggest they study the specific thing and come back

### "It depends"

"It depends" is fine if the user names *what* it depends on, with specifics. It's a fluency tell if they don't. The follow-up is always: "Depends on what? Walk me through one case where the answer is X, and one where it's Y."

### Long, well-structured, technical-sounding answers

These are the *highest risk* for sycophantic grading. The fluency is camouflage. Read them twice — the second time, hunt for: (a) any specific named system or scale or example, (b) any committed claim that could be wrong, (c) any acknowledged limit. If those are absent and the prose is just well-organised canon, the answer is fluent recall. Grade accordingly.

### Code that "just works"

The code passing tests is necessary, not sufficient. The code-assessor must look at:
- Does the *shape* of the code reveal a model of the feature being probed, or did it stitch together boilerplate?
- Did they reach for the simplest correct construct, or pile on machinery?
- Did they handle the angle being tested specifically, or just produce something that runs?
- Did they make any decisions that reveal awareness of tradeoffs (e.g., a comment, a chosen API, a missing-but-considered branch)?

Working code that reveals no model is the coding equivalent of fluent recall. Name it as such.

## Reminder of Why This Matters

This rubric exists because the user — explicitly, in their own notes — wants to escape the trap where they can speak fluently *about* a thing without being able to wield it. Soft assessment reproduces the trap. The cost of an honest verdict is short-term discomfort. The cost of a soft verdict is that they walk away thinking they understand X when they don't, and the gap stays invisible until it bites them in production or in a meeting.

The user has consented to honesty. Honour that consent.
