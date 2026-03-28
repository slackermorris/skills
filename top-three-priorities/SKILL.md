---
name: top-three-priorities
description: Set today's top 3 priorities
disable-model-invocation: true
metadata:
  last-used: "2026-03-29"
---

## Top Three Priorities

Sets the day's focus by writing the user's top 3 priorities into today's daily note. Checks yesterday's note first for carry-over action items so nothing falls through the cracks.

### Steps

1. Read today's daily note from `Daily/`.
2. Read yesterday's daily note to check for carry-over action items.
3. Show the user yesterday's incomplete action items if any exist.
4. Ask the user: "What are your top 3 priorities for today?"
5. Write the user's answers into the `# Top 3` section of today's daily note.

**Incorrect:**

Skipping yesterday's note and going straight to asking for priorities. The user misses carry-over items and may forget something important from the day before.

**Correct:**

Reading yesterday's note, finding 2 incomplete action items ("finish PR review", "reply to design feedback"), showing them to the user, then asking for today's top 3. The user might carry one forward or decide it's handled — either way, the decision is conscious.
