---
name: synthesise
description: Ingest unprocessed raw files and synthesise connections across the vault
disable-model-invocation: true
metadata:
  last-used: ""
---

## Synthesise

Scans `raw/` for files not yet reflected in the wiki, ingests each one, then does a cross-vault synthesis pass to find and write connections. Acts immediately — no suggestions, no confirmations, no questions. **Never asks the user for anything. Ever. Not for clarification, not for missing fields, not for confirmation. If information is missing, make a best-effort determination from the content and proceed.** Creates files freely inside the vault directory; never creates executable files.

### Steps

1. **Find unprocessed files.**
   - Read `log.md` to extract the names of all raw files that have already been ingested (look for `raw/` paths in log entries).
   - List all files in `raw/` (excluding `assets/`, hidden files, README files).
   - The unprocessed set is: files in `raw/` that are not mentioned in `log.md`.
   - If there are no unprocessed files, report "Nothing new in raw/ — vault is current." and stop.

2. **For each unprocessed file, ingest it:**
   a. Read the file in full.
   b. Identify: what type of content is this (article, thread, podcast, note, etc.), what are the key themes, claims, and facts?
   c. Read the template at `templates/wiki-note.md`.
   d. Write a wiki page using the template structure in the appropriate subdirectory:
      - `wiki/topics/` — everything else (articles, podcasts, ideas, concepts, domains)
   e. The frontmatter must include: `title`, `author`, `source` (the original source — book title, web URL, podcast name, publication, etc. Extract from the raw file content; if unknown, use "unknown"), `published`, `created`, `updated`.
   f. Fill every section from the template with concrete, specific content — never leave a section blank or generic.
   g. **Delete the raw file** after the wiki page is written: `rm "raw/<filename>"`.

3. **Synthesise connections across all affected pages.**
   For each wiki page created or updated in step 2:
   a. Identify the key topics and concepts in the page.
   b. For each key theme, run:
      ```
      qmd vsearch "<theme>" -c clanker -n 10
      qmd search "<theme>" -c clanker -n 5
      ```
   c. Read every search result that scores above ~40% in full before deciding whether a connection is real.
   d. A real connection is one where you can complete this sentence in one clause: *"Page A says X; page B says the same thing from a different angle / argues the opposite / provides the mechanism / provides the example."* If you cannot complete it concisely, it is not a real connection — skip it.
   e. For each real connection:
      - Name the conceptual bridge explicitly (e.g. "turpentine = bespoke harness = the specific tuned knowledge that separates 100× practitioners").
      - In the new page, find the sentence or paragraph where that idea lives. Append a `[[wikilink]]` to the target page *at that sentence*, with a parenthetical naming the bridge: e.g. `— see also [[wiki/topics/other-page]] (same insight: bespoke harness as competitive moat)`.
      - In the target page, do the same in reverse: find the sentence where its version of the idea lives, append a reciprocal `[[wikilink]]` with the bridge named.
      - Both links must sit *inside* the relevant prose, not in a separate "Related" section at the bottom.
   f. If a connection points to a concept with no wiki page yet, create it in `wiki/topics/` using the template.
   g. Resolve any dangling `[[wikilinks]]` (target doesn't exist) by creating the missing pages using the template.

4. **Run `qmd update --collection clanker`** after all writes.

5. **Append to `log.md`** (newest first, under the existing entries):
   ```
   ## [YYYY-MM-DD] ingest | <short title>

   Ingested `raw/<filename>`. <1–2 sentences: what it was and what was added.> Connect pass: <what links were added, or "no new links — vault is sparse".> Raw file deleted.

   Pages affected: [[wiki/...]], [[wiki/...]]

   ---
   ```

**Incorrect:**

Asking the user anything — before, during, or after processing. Pausing to ask what the source is. Asking for clarification on missing metadata. Requesting confirmation before writing or deleting. Stopping to report ambiguity instead of resolving it. Listing suggested connections instead of writing them. Presenting a plan and waiting. Writing vague log entries. Using a custom page format instead of the template. Leaving raw files in place after ingest. Putting all wikilinks in a "Related" section at the bottom — connections buried there are invisible in context. Describing a connection in the summary to Jack without having written the `[[wikilink]]` into the prose of both pages. Writing a `[[wikilink]]` without naming the conceptual bridge inline.

**Correct:**

Reading the template, reading the file, writing the wiki page using the template structure, running qmd searches, reading matched pages in full, naming the conceptual bridge explicitly, writing the `[[wikilink]]` *at the sentence where the shared idea lives* in both pages with the bridge named inline — then deleting the raw file, updating the index, appending a specific log entry, and reporting what was done in one line per action.
