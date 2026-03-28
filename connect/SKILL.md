---
name: connect
description: Find connections between a note and the rest of the vault
disable-model-invocation: true
---

## Connect

Notes gain value through connections. This command finds other vault notes that share concepts, themes, or topics with a given note, and suggests `[[wikilinks]]` to weave them together. It also flags any broken or dangling links that point to notes that don't exist yet.

### Steps

Find connections for: $ARGUMENTS

1. Read the note specified (search by filename if needed).
2. Identify the key topics, concepts, and themes in this note.
3. For each key theme, run `qmd vsearch "<theme>" -n 10` to find notes that are conceptually related — even if they use different vocabulary. Supplement with `qmd search "<theme>" -n 5` for exact keyword matches.
4. For each connection found, explain:
   - Which note it connects to
   - What the shared concept or theme is
   - A suggested `[[wikilink]]` to add and where
5. Also flag if any existing `[[wikilinks]]` in the note point to notes that don't exist yet (potential notes to create).

**Incorrect:**

Listing every note in the vault that shares a single common keyword (e.g., "React") without explaining the conceptual relationship. A dump of filenames is not useful — the user needs to understand why two notes should be linked.

**Correct:**

Identifying that "React hooks need stable refs" and "Effect TS resource lifecycle" both discuss cleanup patterns and side-effect management, then suggesting a `[[wikilink]]` at the specific paragraph where the connection is strongest, with a sentence explaining the shared concept.
