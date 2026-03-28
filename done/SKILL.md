---
name: done
description: Capture session insights to knowledge vault
disable-model-invocation: true
---

## Done

Captures the current session's key decisions, questions, and follow-ups into a structured session log in the vault. This is the "Persist" step of the Orient-Work-Persist rhythm — it ensures nothing learned in this session is lost.

### Steps

Capture this session to the knowledge vault.

1. Summarize:
   - Key decisions made
   - Questions explored
   - Follow-ups needed
   - Files created/modified
2. Ask the user for a topic name (e.g., "effect-error-handling", "react-query-setup").
3. Create session file at: `~/Documents/Kwicherbelliaken/ops/sessions/YYYY-MM-DD-{topic}.md`
4. Session file format:

   ```
   ---
   date: YYYY-MM-DD
   topic: {topic}
   project: {current working directory name}
   branch: {git branch if available, else "none"}
   ---

   ## Key Decisions
   - {decisions made}

   ## Questions Explored
   - {questions discussed}

   ## Follow-ups
   - {open items}

   ## Files Changed
   - {files created/modified}

   ## Related Notes
   - {wikilinks to relevant vault notes}
   ```

5. Confirm with the user before saving.

**Incorrect:**

Saving the session log without asking for a topic name or confirmation. Or writing a vague summary like "worked on stuff" that provides no future value.

**Correct:**

Summarizing: "This session we decided to use Effect's error channel for form validation (decision), explored whether Zod or Effect Schema was better for this (question), and need to update the CONQA checklist template (follow-up)." Then asking for a topic name, creating the file, and confirming before writing.
