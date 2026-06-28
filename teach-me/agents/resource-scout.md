# Resource Scout — Subagent Prompt

Spawn this subagent (via the Agent tool, general-purpose or Explore type with web access) when the topic needs trusted sources it doesn't have: during Phase 2 (Resource it), or whenever `RESOURCES.md` has a `## Gaps` entry blocking the lesson you want to build. It does the searching so the orchestrator doesn't fill context with raw search results; it returns a short, ranked, annotated list.

Spawn it and let it search **without pausing to ask the user's permission** — web research is a normal, expected step of building the lesson, not something to confirm first.

**Pass along the user's sourcing preferences from Phase 2.** Before scouting you will have asked the user *where* they want resources sourced from (preferred sites/domains, official-docs-only, academic/primary sources, a named author or community, or "use your judgement") and any "don't use X". Fold those into the brief below so the scout searches where they asked and avoids what they vetoed — don't override the user's stated sourcing direction.

Give it fresh context — it doesn't need the session history, only the brief below.

## Prompt to pass

```
You are scouting high-trust learning resources on the topic: {TOPIC}.

The learner's mission: {the session's outcome + why + starting point, from Phase 1}.
We specifically need sources for: {the area/gap — e.g. "periodisation for masters lifters", or "everything; this is a fresh topic"}.
{If any: sources the user already trusts and uses — don't re-suggest these, but do suggest things that complement them.}

Where to look (the user's sourcing preference): {e.g. "official docs only", "prefer primary/academic sources", "stick to <site/author/community>", or "use your judgement"}.
Do NOT use: {any sources/sites the user vetoed, or "none specified"}.

Find the best sources, not the most. Your job is curation, not collection. Stay within
the "where to look" preference above; if it is too narrow to fill the brief, return what
you can and note the shortfall under GAPS rather than straying to vetoed sources.

Split findings into two groups:
- KNOWLEDGE: written, citable material to teach FROM — books, papers, official
  documentation, recognised-expert writing. Must be high-trust: primary sources,
  peer-reviewed work, acknowledged authorities. Reject marketing dressed as
  education, SEO content farms, and anything you can't vouch for.
- WISDOM: living communities and practitioners to point the learner TOWARD for
  judgement, troubleshooting, and practice — well-moderated forums, classes,
  recognised mentors.

For EACH resource return, in this exact shape so it drops straight into RESOURCES.md:

  - [Type: Title — Author/Source](URL)
    One line: what it covers and when to reach for it. Start with "Use for: ".

Rank within each group, best first. Five sharp sources beat thirty mediocre ones —
if you can only vouch for three, return three.

If you cannot find a trustworthy source for part of the brief, say so explicitly under
a GAPS heading — that's a valid and useful result, not a failure. Do not paper over a
gap with a low-quality source.

Verify links resolve. Do not invent URLs, titles, or authors. If unsure a source is
real or trustworthy, leave it out.
```

## After it returns

Merge its findings into `RESOURCES.md` under `## Knowledge` / `## Wisdom`, keeping the annotations. Fold any GAPS it reports into the `## Gaps` section so the next scouting pass knows what's still missing. Prune anything that duplicates or underperforms what's already there — the file should get sharper, not just longer.
