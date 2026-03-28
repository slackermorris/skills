---
name: queue-process
description: Work through notes in the processing queue
disable-model-invocation: true
---

## Queue Process

Works through the notes waiting in the processing queue (`ops/queue/README.md`). Reads each queued note, offers processing options (synthesize, enhance, connect), and removes it from the queue once done.

### Steps

1. Read `ops/queue/README.md`.
2. List all items in the "To Process" table.
3. Ask the user which note to process.
4. Read that note and offer to:
   - Synthesize it into a new polished note in `Notes/`
   - Enhance the existing note (add structure, fill gaps, improve prose)
   - Connect it to related notes via `[[wikilinks]]`
5. After processing, remove the entry from the queue.

**Incorrect:**

Processing all queued notes automatically without asking the user which one to work on, or removing an entry from the queue without actually doing any work on it.

**Correct:**

Listing the 3 queued items, asking the user to pick one, reading the selected note, offering specific options based on its content ("This note has good raw content but no wikilinks — I can connect it to 4 related notes"), then executing the chosen option and removing it from the queue.
