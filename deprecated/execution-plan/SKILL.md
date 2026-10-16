---
name: execution-plan
description: Set up and manage execution plans for a project — lightweight progress/decision tracking documents that live in version control alongside the code. Use this skill whenever the user wants to track a feature, bug fix, or piece of work with a structured plan, says "start an execution plan", "set up exec-plans", "scaffold exec plans", "create a plan for this work", or wants to initialize the execution plan system in a project. Also trigger when the user wants to create a new plan for a specific piece of work (a feature, bug, refactor, etc.) even if they don't use the term "execution plan".
metadata:
  last-used: "2026-03-29"
---

## What execution plans are

Execution plans are markdown documents that live in the repo and track the progress, decisions, and associated work for a specific piece of work. They combine lightweight project planning, progress logging, and decision recording — designed to be human-readable and machine-readable.

Each plan lives in `exec-plans/active/` while in progress, then moves to `exec-plans/completed/` when done.

---

## Sub-commands

This skill has two sub-commands:

- **`/execution-plan scaffold`** — One-time setup. Creates the directory structure and template in the current repo. Run this once per repo before creating any plans.
- **`/execution-plan`** (default) — Creates a new active plan for the current piece of work. If the scaffold doesn't exist yet, runs scaffold first, then creates the plan.

---

## `scaffold` — One-time repo setup

> Run this once per repo. If `exec-plans/` (or `docs/exec-plans/`) already exists with the right structure, skip this entirely and tell the user it's already set up.

Check for an existing scaffold at:
- `docs/exec-plans/` (preferred if a `docs/` directory already exists)
- `exec-plans/` at the project root (if no `docs/` dir)

If it doesn't exist, create the following structure:

```
{exec-plans-root}/
├── INDEX.md
├── active/
├── completed/
└── templates/
    └── EXECUTION-PLAN-TEMPLATE.md
```

Write `INDEX.md` with this content:

```markdown
# Execution Plans

This directory contains execution plans that track progress and decisions for work in the repository.
Execution plans are lightweight artifacts that combine elements of project planning, progress tracking,
and decision logging in a format that is both human-readable and potentially usable by automated agents.

## Structure

- `active/` - Currently executing plans
- `completed/` - Finished or archived plans
- `templates/` - Templates for creating new plans

## Naming Convention

Files are named using the pattern: `{TYPE}-{DESCRIPTION}.md`

Where:
- `TYPE` is one of: FEAT (feature), BUG (bug fix), REFI (refactor), DOC (documentation), TEST, CHORE
- `DESCRIPTION` is a short, kebab-case description of the work

Example: `FEAT-user-authentication.md`

Each plan also includes an ID in the metadata: `{TYPE}-{YYYYMMDD}-{SEQUENCE}`

Example: `FEAT-20260312-001`

## Usage

1. To start a new piece of work:
   - Copy the template from `templates/EXECUTION-PLAN-TEMPLATE.md` to `active/` with an appropriate name
   - Fill in the metadata (ID, type, goal, etc.)
   - Begin logging progress and decisions as work proceeds

2. During work:
   - Update the Progress Log after completing meaningful accomplishments
   - Update the Decision Log immediately after making significant decisions
   - Keep the Associated Work section current with related PR numbers and commit hashes
   - Update the Updated timestamp regularly

3. When work is complete:
   - Move the plan from `active/` to `completed/` with a date prefix (e.g., `2026-03-12-FEAT-user-auth.md`)
   - Update the status to "Completed"
   - Fill in any final metrics or notes

## Agent-Friendly Design

These plans are designed to be:
- **Machine-readable**: Consistent structure, ISO timestamps, clear delimiters
- **Traceable**: Direct links to PRs, issues, and commits
- **Reasoning-transparent**: Decision logs capture the rationale behind choices
- **Progress-oriented**: Verb-object accomplishments in progress logs

## Maintenance

- Plans in `active/` should be updated at least daily during active work
- Stale plans (no updates for >3 days) should be reviewed for blockers or completion
- Completed plans are kept for historical reference and can be referenced in future work
```

Write `templates/EXECUTION-PLAN-TEMPLATE.md` with this content:

```markdown
# Execution Plan: [TYPE]-[SHORT-DESCRIPTION]

## Metadata
- **ID**: [AUTO-GENERATED: TYPE-YYYYMMDD-SEQ] (e.g., FEAT-20260312-001)
- **Type**: [FEAT | BUG | REFI | DOC | TEST | CHORE]
- **Status**: [Active | Completed | Cancelled | On Hold]
- **Created**: [YYYY-MM-DD HH:MM]
- **Updated**: [YYYY-MM-DD HH:MM]
- **Estimated Effort**: [Optional: e.g., 2d, 5h]
- **Related Issue**: [#123 or N/A]
- **Related PR**: [#456 or N/A (filled when opened)]

## Goal
[One sentence describing the specific outcome]
[Acceptance criteria if applicable, e.g., "User can reset password via email"]

## Progress Log
- [YYYY-MM-DD HH:MM] [Specific accomplishment - verb + object]
- [YYYY-MM-DD HH:MM] [Specific accomplishment - verb + object]
- [YYYY-MM-DD HH:MM] [Specific accomplishment - verb + object]

## Decision Log
- [YYYY-MM-DD HH:MM] [Decision made] → [Clear rationale]
- [YYYY-MM-DD HH:MM] [Decision made] → [Clear rationale]
- [YYYY-MM-DD HH:MM] [Decision made] → [Clear rationale]

## Associated Work
- **Pull Requests**: [#456, #789] (auto-updated when PR opened)
- **Commits**: [abc123def, gh456ijk] (auto-updated on commit)
- **Issues**: [#123] (links to source)

## Checkpoints (Optional but Recommended)
- [ ] [Milestone description] (Target: YYYY-MM-DD)
- [ ] [Milestone description] (Target: YYYY-MM-DD)

## Quality Metrics (Optional)
- [Test Coverage]: [Current%] [Target: ≥80%]
- [Lint Errors]: [Current count] [Target: 0]
- [Performance]: [Metric] [Target: <Xms]

## Notes & Blockers
[Context, dependencies, waiting on, or impediments]
```

After scaffolding, confirm to the user that setup is complete and tell them to run `/execution-plan` to create their first plan.

---

## Default — Create a new active plan

When invoked as `/execution-plan` (with or without a description of the work):

**1. Check scaffold exists.** Look for `docs/exec-plans/active/` or `exec-plans/active/`. If neither exists, run the scaffold steps above first, then continue.

**2. Create the plan.**

- Determine the type (FEAT, BUG, REFI, DOC, TEST, CHORE) from context. When in doubt, ask — it matters for the historical record.
- Generate an ID: `{TYPE}-{YYYYMMDD}-{SEQ}` where SEQ is 001 unless other plans were created today (check `active/` and `completed/` for today's date).
- Pick a descriptive kebab-case filename: `{TYPE}-{description}.md`
- Write the file to `active/{TYPE}-{description}.md` using the template, filling in:
  - **ID**, **Type**, **Status** (Active), **Created** (now), **Updated** (now)
  - **Goal** — one clear sentence describing the outcome; infer from context if possible, otherwise ask
  - Leave Progress Log, Decision Log, Associated Work as template placeholders
  - Fill in **Checkpoints** if the work has clear milestones the user mentioned
  - Leave Quality Metrics and Notes & Blockers unless the user provided relevant context

**3. Confirm.** Tell the user where the plan was created. Remind them that `/execution-plan-progress` can update it with daily progress.

---

## Naming and type guidance

| Type  | Use for |
|-------|---------|
| FEAT  | New features or user-facing functionality |
| BUG   | Bug fixes |
| REFI  | Refactoring, cleanup, internal restructuring |
| DOC   | Documentation work |
| TEST  | Test coverage improvements |
| CHORE | Deps, CI, tooling, config |
