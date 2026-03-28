---
name: queue-add
description: Add a note to the processing queue
disable-model-invocation: true
metadata:
  last-used: "2026-03-29"
---

## Queue Add

Adds a note to the processing queue (`ops/queue/README.md`) so it can be picked up later by `/queue-process`. Use this when a note needs further work — synthesis, cleanup, connection — but you don't want to do it right now.

### Steps

Add to queue: $ARGUMENTS

1. Parse the note name and reason from arguments (format: "Note Name - reason" or just "Note Name").
2. Read `ops/queue/README.md`.
3. Add an entry to the "To Process" table with today's date, the note name, and the reason.
4. Confirm the addition.

**Incorrect:**

Adding an entry with no note name, or adding a note that is already in the queue without checking first.

**Correct:**

Parsing the argument "Effect Error Channel - needs wikilinks to CONQA notes", reading the queue, confirming the note isn't already listed, adding a row with today's date, and confirming: "Added [[Effect Error Channel]] to the queue (reason: needs wikilinks to CONQA notes)."
