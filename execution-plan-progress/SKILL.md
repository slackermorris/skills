---
name: execution-plan-progress
description: Update the currently active execution plan with progress from today's daily notes and git activity. Use this skill whenever the user says "/execution-plan-progress", "update the plan", "log today's progress", "update my exec plan", "mark progress on the plan", or wants to sync their daily note or git commits into an execution plan. Also trigger when the user has been doing work and wants to capture what got done into a structured plan document.
---

## Purpose

This skill syncs real progress into the active execution plan. It pulls from two sources:
1. **Today's daily note** — a collection of gotchas, learnings, decisions and reflections
2. **Git activity** — commits and file changes on the current branch

The goal is a plan that accurately reflects what actually happened, written in a way that's useful for both the user and future automated readers.

---

## Step 1: Read today's daily note

Look for today's daily note at ${DAILY_NOTE_DIRECTORY}, using todays date.

If the file doesn't exist, note that and proceed with git data only. Don't block on a missing daily note.

From the daily note, extract content and use it to fill in the sections of the active execution plan:
- `Notes & Blockers`: any mention of some unplanned inconvenience or interesting learning worth capturing.
- `Decision Log`: wherever a path was committed to at the expense of another, record trade-offs and justifications.
- `Progress Log`: records of steps taken, work completed.

---

## Step 2: Check git activity

Run:
```bash
git log --since="yesterday" --oneline --no-merges
```

Also check current branch status:
```bash
git status --short
git branch --show-current
```

From git output, extract:
- Recent commit hashes and messages (for Associated Work → Commits)
- Any PR numbers referenced in commit messages (look for `#NNN` patterns)
- Modified files to understand what work was actually done

---

## Step 3: Find the active execution plan

Look in these locations (in order):
1. `docs/exec-plans/active/`
2. `exec-plans/active/`

If multiple plans are found, show a numbered list and ask the user which one to update before proceeding.

If none are found, let the user know and suggest running `/execution-plan` to set up the structure and create a plan.

---

## Step 4: Update the plan

Modify **only** these sections — never touch Metadata (except `Updated`) or Goal:

### Progress Log
Add new entries at the top (most recent first) for completed work. Format:
```
- [YYYY-MM-DD HH:MM] [Verb + object accomplishment]
```
Draw from completed action items in the daily note and what can be inferred from commit messages. Be specific — "Implemented JWT refresh token endpoint" not "Did auth work".

### Decision Log
Add new entries for decisions from the `# Decisions` and `#Inbox` section of the daily note. Format:
```
- [YYYY-MM-DD HH:MM] [Decision made] → [Rationale]
```

### Associated Work
Append any new commit hashes from git log to **Commits**. If PR numbers appear in commits or daily notes, add them to **Pull Requests**. Don't remove existing entries.

### Checkpoints
If any checkpoints can be inferred as completed based on the work done, mark them with `[x]`. Don't mark things complete unless it's clear from the evidence.

### Notes & Blockers
Replace or append (use judgment) based on the `# Notes & Connections` and `# Reflection` sections from the daily note. This section is a snapshot of current state, so it's OK to replace stale blockers if they're clearly resolved.

### Metadata → Updated
Set `Updated` to the current timestamp: `YYYY-MM-DD HH:MM`.

---

## Step 5: Confirm with the user

After writing the update, briefly summarize what was added:
- N progress log entries added
- N decisions recorded
- N commits linked
- Any checkpoints marked done
- Any blockers updated

Keep it short — the user can read the plan if they want detail.
