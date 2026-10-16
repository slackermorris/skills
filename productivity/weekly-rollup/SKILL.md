---
name: weekly-rollup
description: Synthesize this week's daily notes into the weekly summary
disable-model-invocation: true
metadata:
  last-used: "2026-03-29"
---

## Weekly Rollup

Reads all of this week's daily notes and synthesizes them into the weekly note's Rollup and Insights sections. Pulls out themes, decisions, action items, and cross-vault connections across the full week.

### Steps

1. Determine the current week number (YYYY-[W]WW format).
2. Read all daily notes in the `Daily/` folder whose `date` frontmatter falls within this week (Monday through today).
3. Read the corresponding weekly note in `Weekly/`.
4. Synthesize the daily notes into the weekly note's `# Rollup` section. Include:
   - Key themes and recurring topics
   - Decisions made
   - Completed and outstanding action items
   - Notable `[[wikilinks]]` to other vault notes — call out connections
   - Any patterns or insights across the week
5. Also update the `# Insights & Patterns` section if there are observations that connect to broader themes in the vault.
6. Preserve all existing content in the weekly note. Only write into the Rollup and Insights sections.

**Incorrect:**

Overwriting the entire weekly note, or producing a flat list of bullet points copied from each daily note. A rollup that's just a concatenation adds no value — the user could read the daily notes themselves.

**Correct:**

Reading 4 daily notes, identifying that "API error handling" came up on 3 separate days, synthesizing this into a theme ("Error handling was a recurring focus this week — see [[Effect Error Channel]] and [[CONQA error boundaries]]"), noting 2 outstanding action items, and writing this into the Rollup section while preserving the existing Top 3 and other sections.
