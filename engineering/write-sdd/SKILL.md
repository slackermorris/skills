---
name: write-sdd
description: Write a Software Design Document (SDD) for a software feature or change. Use this skill when asked to write a design doc, SDD, software design document, or technical spec, or when the user describes a feature they want to design before implementing. Also trigger when the user says "design this feature", "write a spec for", "let's design X", "document the technical approach", "help me think through the design", or wants to plan out an implementation at an architectural level before writing code. Prefer this skill over ad-hoc planning when the work is non-trivial or spans multiple modules.
---

## What this skill produces

A Software Design Document: a structured artifact that is clear enough for engineering leadership and product managers to understand, while including the technical depth engineers need to evaluate feasibility.

---

## Process

### 1. Gather context

Before exploring any code, invite the user to share sources they already have. Say something like:

> "Before I explore the codebase, do you have any existing context to share? For example: links to tickets, docs, or Slack threads; a specific area of git history worth reviewing; a previous design doc; or any other background. Anything helps."

If they have nothing to add, that's fine — proceed. If they share links, read them. If they mention git history, run `git log --oneline` (or a filtered variant) on the relevant paths and review the relevant commits.

Then confirm you understand:
- **Problem**: What is the user trying to solve, and why does it matter?
- **Requirements**: What must the solution do? (functional outcomes)
- **Constraints**: What limits the solution? (performance, compatibility, team conventions, deadlines, existing contracts)

If the prompt already answers these, proceed without asking. Otherwise ask — but cap yourself at 3 questions at once so the conversation stays moving. You can infer reasonable defaults and flag your assumptions in the document later.

### 2. Explore the codebase

Explore the parts of the repo relevant to the feature. You're looking for:
- **Existing modules** that will need to change
- **Data models** and schema relevant to the feature
- **Patterns for similar features** — how has the team solved analogous problems? (auth flows, API design, error handling, background jobs, etc.)
- **Test patterns** — how does the codebase test things today?

As you explore, actively identify **deep modules**: components that encapsulate significant functionality behind a simple, stable interface. These are prime candidates for new additions, and understanding existing ones tells you what idiom to design in.

A deep module is one you can test in isolation because its interface rarely changes and it doesn't leak internals. Shallow modules (thin wrappers, pure delegation, tiny adapters) often add complexity without earning their keep — flag these if you spot them.

### 3. Sketch the module design

Based on your exploration, sketch the major modules to build or modify. For each, note:
- Its **responsibility** (what it owns)
- Its **interface** (how other code will interact with it — inputs, outputs, events)
- Whether it's **new** or a **modification** to something existing

Aim for deep over shallow. If you find yourself proposing a module that just wraps another, ask whether it's genuinely adding abstraction value or just adding indirection.

### 4. Check in with the user

Before writing the full document, present the module sketch:
- List each module with a one-line summary
- Call out any assumptions you made about scope
- Ask two questions:
  1. Do these modules match what you had in mind, or is anything wrong/missing?
  2. Which of these do you want tests written for?

Wait for the user's response before writing the document. This is the moment to catch misalignments cheaply.

### 5. Write the SDD

Using the confirmed module design and your understanding of requirements and constraints, produce the document using the template below.

---

## Document template

Fill in each section. The section headers `## Problem`, `## Requirements`, `## Constraints`, and `## [THE SOLUTION]` are part of the template — replace `[THE SOLUTION]` with the actual solution name.

```
## Problem
[State the problem clearly. Write it from the perspective of whoever experiences it — user, developer, operator.]

## Requirements
[What the solution must do. Functional outcomes, not implementation details.]

## Constraints
[Technical, organisational, or other limits that shape the solution space. E.g. "must not break existing API contracts", "must work within the existing auth model", "no new infrastructure".]

## [SOLUTION NAME]

### 1. Executive Summary
[3–4 sentences: what's the problem, what's the solution, and what's the biggest risk or trade-off?]

### 2. Solution Overview
[Explain the solution conceptually before any technical detail. A product manager should fully understand this section. Use an analogy if it helps.]

[ASCII diagram showing:]
[  - The main components]
[  - How they connect/communicate (interfaces, data flow)]
[  - External dependencies and integration points]

### 3. Requirements Analysis
[For each requirement, state explicitly:]
- ✅ How the solution satisfies it, OR
- ⚠️ How it partially satisfies it (and what's missing), OR
- ❌ Why it cannot be satisfied (and what trade-off was made)

### 4. Constraints Analysis
[For each constraint, confirm how the solution respects it. If a constraint created significant design pressure, explain how it shaped the solution.]

### 5. Technical Considerations

**Key design decisions**: What alternatives were considered? Why was this approach chosen over them?

**Dependencies**: What systems, services, libraries, or teams does this depend on? Flag any that are unstable, unproven, or owned by another team.

**Trade-offs**: What was sacrificed to get this solution? (e.g. complexity vs. flexibility, consistency vs. performance, speed to ship vs. extensibility)

### 6. Risks & Uncertainties
[For each risk:]
- **Description**: What is uncertain or could go wrong?
- **Impact**: High / Medium / Low
- **Likelihood**: High / Medium / Low  
- **Mitigation**: Proposed approach — spike, prototype, fallback plan, or "accept and monitor"

[Sort by impact × likelihood, highest first.]

### 7. Pros & Cons Summary
| Pros | Cons |
|------|------|
| [strength] | [weakness] |
```

---

## Writing guidelines

- Lead with **what** and **why** before **how**
- Define technical terms on first use, or replace with a simpler word
- When going deep technically, give a plain-language one-sentence summary first
- If requirements or constraints are ambiguous, state your interpretation explicitly before proceeding
- Don't invent requirements — if something is unspecified, surface it in Risks & Uncertainties
- Don't include specific file paths or code snippets — they go stale quickly and belong in the implementation, not the design doc
