---
name: adr
description: Create, assess, and lazy-load Architecture Decision Records (ADRs) using the MADR format. Invoking /adr writes a new ADR and enforces quality via an assessor subagent loop before writing the file. Use /adr assess to evaluate a draft against the quality rubric, or /adr read [reference] to load a specific ADR into context on demand.
metadata:
  last-used: "YYYY-MM-DD"
---

## ADR

Architecture Decision Records capture significant architectural decisions alongside the code they affect. An ADR is immutable once ratified — only its status can change (deprecated, superseded). The collection of ADRs forms the project's decision log.

This skill manages three operations:

- **`/adr`** (default) — Write a new ADR. Drafts, assesses, and writes the file.
- **`/adr assess`** — Evaluate an ADR draft against the quality rubric. Called by the write flow as a subagent, but can also be run standalone against an existing draft.
- **`/adr read [reference]`** — Lazy-load a specific ADR into context on demand.

---

## `/adr` — Write a new ADR

### 1. Find or scaffold the ADR directory

Look for existing ADRs in this order:
1. `docs/adrs/`
2. `docs/decisions/`
3. `adr/`

If none exist, create `docs/adrs/` and an `index.md` with this content:

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for this project.

An ADR captures a single architectural decision. It is immutable once accepted — only its status can change.

## Status lifecycle

`draft` → `proposed` → `accepted` → (`deprecated` | `superseded by [NNN](filename.md)`)

## Browsing

ADRs are numbered sequentially. Read them in order to follow the project's architectural history.
```

### 2. Infer the naming convention

Scan the existing ADR files to detect the naming convention in use:
- `PREFIX-ADR-NNN.md` (e.g. `PAAS-ADR-036.md`) — team-prefixed sequential
- `YYYYMMDD-short-title.md` — date-based (MADR default)
- `NNN-short-title.md` — sequential with title

If no existing ADRs, use `YYYYMMDD-short-title.md` unless the user specifies otherwise.

Determine the next number or date prefix from existing files.

### 3. Gather context

Collect what you need to write the ADR. If the user has described the decision in their message, use that. Otherwise ask:
- What is the decision to record?
- What options were considered?
- What was chosen and why?

Check `CLAUDE.md` or project docs for any relevant context (existing patterns, constraints, related ADRs) before drafting.

### 4. Draft the ADR

Write a complete draft using the MADR template below. Fill every section — do not leave placeholder text. Infer reasonable content from the context at hand; it is better to write something specific and have the assessor push back than to leave sections vague.

```markdown
# [short title of solved problem and solution]

- Status: draft
- Deciders: [list everyone involved in the decision]
- Date: [YYYY-MM-DD]
- Tags: [space and/or comma separated list of tags]

Technical Story: [description | ticket/issue URL]

## Context and Problem Statement

[Describe the context and problem statement in two to three sentences. Articulate the problem as a question where helpful.]

## Decision Drivers

- [driver 1 — a force, facing concern, constraint]
- [driver 2]

## Considered Options

- [option 1]
- [option 2]
- [option 3]

## Decision Outcome

Chosen option: "[option 1]", because [specific justification — which criterion it meets, which concern it resolves, why it comes out best].

### Positive Consequences

- [improvement of quality attribute, follow-up decisions enabled, ...]

### Negative Consequences

- [compromising quality attribute, follow-up decisions required, ...]

## Pros and Cons of the Options

### [option 1]

- Good, because [argument a]
- Good, because [argument b]
- Bad, because [argument c]

### [option 2]

- Good, because [argument a]
- Bad, because [argument b]
- Bad, because [argument c]

### [option 3]

- Good, because [argument a]
- Bad, because [argument b]

## Links

- [Link type](link to related ADR or issue)
```

### 5. Assess the draft

Invoke `/adr assess` as a subagent, passing the full draft content. Use this prompt:

> "You are running /adr assess. Evaluate the following ADR draft against the quality rubric and return your assessment.
>
> [paste full draft here]"

Wait for the subagent to return its assessment.

### 6. Loop until the assessor is satisfied

If the assessment is **fail**:
- Read the specific feedback
- Revise the draft to address every issue raised
- Re-invoke the assessor subagent
- Repeat until the assessment is **pass**

Do not write the file until the assessor returns pass.

### 7. Write the file

Write the ADR to the detected directory using the detected naming convention. Confirm the file path to the user.

---

## `/adr assess` — Evaluate an ADR draft

Evaluate the provided ADR against the rubric below. Return a structured assessment with a clear **pass** or **fail** verdict and specific, actionable feedback for every criterion that fails.

This sub-command is invoked by the write flow as a subagent, but can also be called directly by the user against an existing file:

> `/adr assess docs/adrs/PAAS-ADR-036.md`

### Quality rubric

Evaluate every criterion. A **pass** requires all criteria to pass.

| # | Criterion | Pass condition |
|---|-----------|----------------|
| 1 | **Template used correctly** | All required sections are present and in order. No placeholder text remains (e.g. "[option 1]", "[YYYY-MM-DD]"). |
| 2 | **Problem clearly stated** | Context and Problem Statement is 2–3 sentences. A reader unfamiliar with the project understands what problem is being solved. |
| 3 | **Genuine options considered** | At least two options are listed and analysed. The rejected options have real pros/cons — not strawmen. |
| 4 | **Decision outcome is specific** | The chosen option is named explicitly. The justification is specific: it names which driver or criterion it satisfies, not just "it was the best option". |
| 5 | **Consequences are honest** | Negative consequences are listed and candid. A section that only lists positive consequences is a red flag. |
| 6 | **Pros and cons are substantive** | Each pro/con is a real argument, not a restatement of the option name. |
| 7 | **Decision drivers are real constraints** | Drivers describe actual forces — performance requirements, compliance, team capability — not generic values like "simplicity" without context. |

### Output format

```
## ADR Assessment

**Verdict: PASS** / **Verdict: FAIL**

### Criteria

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Template used correctly | ✅ Pass / ❌ Fail | [specific issue if fail] |
| 2 | Problem clearly stated | ✅ Pass / ❌ Fail | [specific issue if fail] |
| 3 | Genuine options considered | ✅ Pass / ❌ Fail | [specific issue if fail] |
| 4 | Decision outcome is specific | ✅ Pass / ❌ Fail | [specific issue if fail] |
| 5 | Consequences are honest | ✅ Pass / ❌ Fail | [specific issue if fail] |
| 6 | Pros and cons are substantive | ✅ Pass / ❌ Fail | [specific issue if fail] |
| 7 | Decision drivers are real constraints | ✅ Pass / ❌ Fail | [specific issue if fail] |

### Required fixes

[Only present if verdict is FAIL. List each fix as a concrete instruction, not a general suggestion.]

- Criterion 3: Add a third option — [suggestion based on context]. The current "do nothing" option has no real pros/cons analysis.
- Criterion 5: Add at least one negative consequence. Every architectural decision has a downside; state it honestly.
```

---

## `/adr read [reference]` — Lazy-load an ADR on demand

Load a specific ADR into context. The reference can be:
- A file path: `docs/adrs/PAAS-ADR-036.md`
- An ADR number or code: `ADR-036`, `PAAS-ADR-036`, `036`
- A code annotation: `# PAAS-ADR-036` (strip the comment prefix and resolve)

### Steps

1. Resolve the reference to a file path by scanning the ADR directory.
2. Read the file.
3. Summarise the decision in 2–3 sentences: what was decided, why, and what the key consequence is.
4. Make the full content available in context for the current task.

This sub-command is designed to be triggered by annotations in code. When working through a task and encountering a comment like `# PAAS-ADR-036` or `// See ADR-012`, invoke `/adr read` to load the relevant decision before proceeding.

---

**Incorrect:**

Writing an ADR file before the assessor has returned pass. Leaving placeholder text in the template. Treating the assess sub-command as optional. Skipping the read step when a code annotation references an ADR.

**Correct:**

Drafting the ADR fully, invoking the assessor as a subagent, revising until pass, then writing the file. When assessing, giving specific actionable feedback for each failing criterion rather than general comments. When reading, summarising the decision upfront before making the full content available.
