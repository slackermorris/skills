---
name: search
description: Deep search across the vault for a topic or question
disable-model-invocation: true
metadata:
  last-used: "2026-03-29"
---

## Search

Performs a thorough search across the entire vault — filenames, file contents, daily notes, and subfolders — to find everything relevant to a topic or question. Returns a synthesized summary, not just a list of hits.

### Steps

Search the vault for: $ARGUMENTS

1. Run all three search tools in parallel to maximise coverage:
   - `qmd query "$ARGUMENTS" --md -n 15 --min-score 0.2` — ranked relevance with snippets
   - `qmd search "$ARGUMENTS" -n 10` — exact keyword match (good for proper nouns, tool names, identifiers)
   - `qmd vsearch "$ARGUMENTS" -n 10` — semantic/conceptual match (good for "origin of", "inspired by", "influence", or any query where the target note may not contain the exact keywords)

   Merge results across all three, deduplicate by note, and rank by score. A note that appears in multiple tool outputs should be treated as higher confidence.
2. Read the most relevant notes (up to 10) — prefer those with higher QMD scores.
3. Return a summary of what was found:
   - List each relevant note with its key points
   - Highlight connections between notes
   - Synthesize an answer to the question if one emerges from the content
   - Suggest `[[wikilinks]]` between notes that should be connected but aren't yet

**Incorrect:**

Returning raw grep output — a list of filenames and line numbers with no context or synthesis. The user has to do all the interpretive work themselves.

**Correct:**

Returning a structured summary: "Found 6 notes related to 'error handling in Effect TS'. The main reference is [[Effect Error Channel]] which covers typed errors. [[CONQA error boundaries]] discusses the practical application. These two notes are not linked yet — suggest adding a wikilink in the 'patterns' section of the CONQA note."
