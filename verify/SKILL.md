---
name: verify
description: Quality check notes for prose titles and wikilink usage
disable-model-invocation: true
---

## Verify

Checks whether a note follows the vault's core conventions: prose (propositional) titles, wikilinks used for reasoning rather than mere cross-referencing, and proper frontmatter. This is a quick structural quality pass — it does not assess domain accuracy.

### Steps

Verify note quality for: $ARGUMENTS

1. Read the note(s) specified.
2. Check:
   - **Title**: Is it prose (proposition) or just a topic label? A good title reads naturally after "Since [[...]], ...".
   - **Wikilinks**: Are they used for reasoning ("Since [[other note]], the implication is..."), not just appended as "See also" references?
   - **Frontmatter**: Does it have a `description` field and a `type` field where appropriate?
3. Report issues found.
4. Suggest specific improvements for each issue.

**Incorrect:**

Reporting "title is fine" for a note titled "React Hooks". This is a topic label, not a proposition — it passes nothing and teaches nothing.

**Correct:**

Flagging "React Hooks" as a topic label and suggesting a prose alternative like "React hooks need stable refs to avoid stale closures", which captures a specific insight and reads naturally in a `[[wikilink]]` context.
