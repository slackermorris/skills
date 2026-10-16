# Question Typology — The Kathy Sierra Angles

The premise: understanding ≠ knowing. Understanding emerges from the breadth of *angles* you've seen a thing from. A user who can deliver a textbook Definition has not necessarily wrestled with Boundary, Tradeoff, or Anti-pattern.

Each angle below names a thing the user can be probed on. The orchestrator's job is to **rotate through angles** rather than letting any single strong answer stand in for the rest.

## The Angles

### 1. Definition — *Can you state it?*

Surface check. The lowest bar — but also revealing, because users often answer with a memorised line. The follow-up signal: did they reach for canon, or did they actually compose?

**Coding flavour:**
- "What is `useEffect`, in your own words — without reaching for the React docs phrasing?"
- "Define what a Cloudflare Durable Object is, in two sentences."
- "What is structural typing in TypeScript?"

**Domain flavour:**
- "How would you define 'eventual consistency' to a peer who has never heard the term?"
- "What is a 'Ceased Farmer' in the LIC domain?" (specific to user's work; uses domain-grounded language)
- "Define 'product/market fit' in language that survives if I challenge each word."

### 2. Mechanism — *Walk me through what actually happens.*

The internals. Tests whether the user has a *model* or just a name.

**Coding flavour:**
- "Walk me through what happens when a React functional component re-renders. What does React do, step by step?"
- "When you `await` a Promise, what is actually happening to the call stack?"
- "Trace what happens when a Cloudflare Worker handles a `fetch` event and forwards it to a Durable Object."

**Domain flavour:**
- "Walk me through how a TLS handshake establishes a session."
- "When a user submits a buy order in your system, what's the lifecycle from click to settled position?"
- "How does a database B-tree index actually find a row?"

### 3. Motivation — *Why does this exist?*

Tests historical and design awareness. A user who only knows the *what* often hasn't internalised the *why*, which means they'll reach for the tool in the wrong situations.

**Coding flavour:**
- "Why does `useEffect` exist? What did people do before it in class components — and why was that worse?"
- "Why does TypeScript have `unknown` when it already has `any`? What problem does `unknown` solve that `any` doesn't?"
- "Why did the Cloudflare Agents SDK introduce communication protocols? What pain were they responding to?"

**Domain flavour:**
- "Why do we have eventual consistency at all? What problem does it solve, and what would happen if we insisted on strong consistency?"
- "Why does shape-up exist as a methodology? What was wrong with the alternatives Basecamp had tried?"
- "Why does the bridge pattern (in the Sharesies cooperative model) exist? What does it solve that a simpler integration wouldn't?"

### 4. Boundary — *Where does it stop working?*

Possibly the most diagnostic angle. Users who *understand* a tool know its limits; users who only *know* it tend to apply it everywhere or hedge with "it depends" without naming the conditions.

**Coding flavour:**
- "Give me a specific case where reaching for `useMemo` would be a mistake."
- "When does TypeScript's structural typing produce a false positive — code that type-checks but isn't actually safe? Concrete example."
- "When would you NOT use a Durable Object? Give me a case where the right answer is something else."

**Domain flavour:**
- "When does eventual consistency become unacceptable? Name a specific scenario."
- "When does shape-up break down as a methodology? Concrete case."
- "When is product/market fit *not* the right thing to be optimising for?"

### 5. Tradeoff — *What does this cost?*

Tests willingness to commit to a downside. Users in fluent-recall mode often praise a tool's strengths but go vague on its costs. The *specific* downside is the test.

**Coding flavour:**
- "What does choosing a Durable Object give up, compared to just using a Worker plus KV?"
- "Pick `useEffect` or `useLayoutEffect` — and tell me concretely what the rejected option would have given you that you're now without."
- "TypeScript over plain JS — what specifically do you lose?"

**Domain flavour:**
- "Eventual consistency gives you availability. What does it cost you, specifically, in a financial-services system?"
- "What does the bridge pattern cost compared to direct integration? Be concrete."
- "Shape-up over scrum — what do you give up?"

### 6. Anti-pattern — *Spot the misuse.*

Show the user code or a scenario that *looks* right but isn't. Tests pattern recognition under inversion.

**Coding flavour:**
- "Here's a snippet using `useEffect` to derive state from props. Walk me through what's wrong and why this is an anti-pattern." [paste snippet]
- "I've put a Durable Object in front of every API endpoint to 'serialise traffic'. Diagnose this design decision."
- "Here's a TypeScript type that uses `any` to 'unblock' a tricky case. What's the failure mode of this choice?"

**Domain flavour:**
- "An engineer says 'we'll use eventual consistency for the wallet balance, it's fine, the user will just refresh.' Diagnose this take."
- "A team is doing shape-up but they re-pitch every cycle and never close anything. What's gone wrong?"
- "A team treats every contact as a user-with-roles in their database because that's how their auth system works. What's the cost of this hack? (See user's note: *Where The Dot.*)"

### 7. Apply — *Do it cold.*

The coding equivalent of an oral viva. Hand the user a small, focused exercise; let them write code; grade what the code reveals.

**Patterns for designing apply tasks** (do not skip these — bad task design produces bad signal):

- **Tiny stub (10–30 lines).** A function with a clear input and output, constrained to use the feature being probed. Example: "Write a `useDebouncedValue<T>(value: T, ms: number): T` hook. Constraints: must clean up correctly when `value` or `ms` changes mid-flight."
- **Refactor a naive version.** Hand the user a working-but-clumsy implementation; ask them to improve it using the feature. Tests not just feature use, but *judgement* about when it pays off.
- **Spot-the-bug-and-fix.** A short snippet with a subtle defect. Tests reading + mechanism understanding.
- **Build under constraint.** "Write a small endpoint that does X. You may NOT use Y." Constraints reveal whether the user has a model or only a habit.

**Task design rules:**
- Must be 5–15 minutes of work. Anything longer is an exercise, not an exam question.
- Test *one* angle at a time. Don't ask a Tradeoff question and a Mechanism question in the same task.
- Have a clear submission target — single file, named, in the workspace dir.
- Make the constraint explicit. Vague constraints produce vague signal.

### 8. Teach — *Compress and transmit.*

"Explain X to a junior in four sentences. No analogies."

The "no analogies" clause is the key. Analogies are a known refuge for users who have a fuzzy grasp; forcing them to drop into mechanism-or-direct-claim language strips the camouflage.

**Coding flavour:**
- "Teach `useEffect` to a junior in four sentences. No analogies."
- "Teach Durable Objects in three sentences. Pretend you only get one chance."

**Domain flavour:**
- "Teach the matching-problem in our Sharesies cooperative system to a new engineer in four sentences."
- "Teach eventual consistency without using the words 'eventually' or 'consistent'."

The compression itself is diagnostic. A user who can't compress doesn't have the load-bearing version.

### 9. Counterfactual — *Reach beyond.*

"If X didn't exist, what would you reach for next? Why?"

Tests whether the user knows *the shape of the problem* (so they could find another tool) or only *this specific tool*.

**Coding flavour:**
- "If React hooks didn't exist, what would you reach for to manage component-local state? What would you give up?"
- "If you couldn't use a Durable Object for serialisation, what alternative would you reach for, and what new problems would you take on?"

**Domain flavour:**
- "If shape-up didn't exist, what methodology would you reach for? What would you have to actively guard against?"
- "If TypeScript didn't exist, what would you reach for in a JS project to get type safety? Be specific."

### 10. Cross-domain — *Where else does this shape appear?*

Tests genuine generalisation. A user who has internalised a structure can usually find it in another domain. A user who only knows it in *this* domain is at risk of pattern-matching superficially when they leave the domain.

**Examples:**
- "What is React's reconciliation algorithm structurally similar to in another domain you know?"
- "The bridge pattern in your cooperative-model work — what other system have you seen that uses the same shape?"
- "Eventual consistency — where else does this 'agree later' shape show up outside distributed systems?"

This angle is most useful late in a session, after the user has demonstrated grasp of the *thing itself* — it's diagnostic of depth, not breadth.

## Choosing the Next Angle

After each answer:

1. **Is there a soft spot?** If yes — pick a different angle that targets that soft spot. (User gave a strong textbook Definition but was vague on cleanup → next is Mechanism, drilling cleanup specifically.)
2. **No soft spot?** Rotate to a fresh angle. Don't repeat. Vary register — don't ask three abstract angles in a row; sprinkle in coding tasks, teach-its, counterfactuals.
3. **Many strong answers across many angles?** Consider proposing the debrief. The session has done its job.

## Notes On Difficulty Calibration

Don't ask a deep Mechanism question of a user whose Definition is already shaky — you'll only learn that the gap exists, which you already knew. Either:
- Get them to commit to a stronger Definition first, then probe Mechanism, OR
- Move to a different angle (Motivation often unsticks shaky Definition users by giving them ground to argue from).

Match difficulty to the depth declared in Calibration:

| User said | Default difficulty |
|---|---|
| "Basic confidence check" | Definition + Mechanism + one Apply |
| "Mid-level interview" | Add Boundary, Tradeoff, Anti-pattern |
| "Deep architectural exam" | Add Counterfactual, Cross-domain, harder Apply tasks |

But — adapt. If a user said "basic" but is breezing, push deeper. If they said "deep" but the Definition was shaky, drop down and rebuild from there. The labels are starting points, not commitments.
