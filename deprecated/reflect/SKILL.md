---
name: reflect
description: Guided daily reflection
disable-model-invocation: true
metadata:
  last-used: "2026-03-29"
---

## Reflect

Walks through a guided end-of-day reflection using today's daily note as context. Reviews what was captured during the day, asks reflective questions one at a time, then synthesizes the answers into the note's Reflection section.

### Steps

1. Read today's daily note from `Daily/`.
2. Review what was captured in it.
3. Ask the user these questions one at a time (wait for each answer before asking the next):
   - What went well today?
   - What was difficult or frustrating?
   - What did I learn?
   - Is there anything I want to carry forward to tomorrow?
4. After all answers, write a concise synthesis into the `# Reflection` section of today's daily note.
5. If the reflections connect to existing notes in the vault, suggest `[[wikilinks]]` to add. In finding connections, use `qmd`, see the '/search' command for how to use this tool.

**Incorrect:**

Asking all four questions at once, or writing the reflection before the user has answered. The point is a guided conversation, not a form to fill out.

**Correct:**

Reading today's note, seeing there were 3 action items and a decision about API design, then asking "What went well today?" and waiting. After the user responds, asking the next question. Finally, synthesising all answers into a short paragraph in the Reflection section, linking to [[API design patterns]] where relevant.
