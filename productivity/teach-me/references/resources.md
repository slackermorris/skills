# RESOURCES.md — The Trusted Source Set (and how to fill it)

`RESOURCES.md` is the curated set of trusted sources for the topic. Explainer content and every in-page answer are drawn from here, **never from parametric memory** — a confident parametric explanation that is subtly wrong is the worst outcome. It lives in the session's working directory (`build.md`).

**Until `RESOURCES.md` is well-populated, your job is finding sources, not teaching.** A thin file means the lesson isn't ready; close that gap first (the scout below).

## Structure

```md
# {Topic} Resources

## Knowledge
- [Book: _The Science and Practice of Strength Training_ — Zatsiorsky & Kraemer](https://example.com)
  Use for: periodisation, recovery, intensity zones.
- [Article: "How Much Should I Train?" — Greg Nuckols (Stronger By Science)](https://example.com)
  Use for: weekly set targets per muscle group.

## Wisdom (Communities)
- [r/weightroom](https://reddit.com/r/weightroom)
  Use for: programme critique, plateau troubleshooting.
- Local: Tuesday strength class at {gym}
  Use for: real-time coaching feedback on lifts.
```

**Knowledge** is written, citable material you teach *from* — books, papers, docs, recognised-expert writing. **Wisdom** is living practitioner judgement — communities, classes, mentors — that you point the user *toward* for taste, troubleshooting, and what experienced people actually do. A resource may appear in only one group.

## Rules

- **High-trust only.** Primary sources, recognised experts, peer-reviewed work, well-moderated communities. Leave out marketing dressed as education.
- **Annotate every entry** with one "Use for: ..." line. A bare link is useless in three months.
- **Surface gaps explicitly.** If no good source covers an area the mission needs, write a `## Gaps` section — it drives the next scouting pass and Phase 1 checks it before building there.
- **Prune ruthlessly.** Remove what turned out wrong, shallow, or off-mission. Five sharp sources beat thirty mediocre ones.
- **Record preferences.** If the user opted out of communities or vetoed a source, note it so you don't re-propose it.

## Answering in-page questions from resources

When the user highlights a phrase and asks (`build.md`), the answer is generated from these resources at ask-time, never pre-baked. Fall back to a web fetch only when the resources genuinely don't cover it; when a fetched source proves trustworthy, add it here so the next answer is better grounded. Every good answer should leave `RESOURCES.md` at least as strong as it found it — it's the durable artifact the session produces.

## The resource-scout subagent

Spawn this (Agent tool, `Explore` or `general-purpose` with web access) in Phase 2, or whenever a `## Gaps` entry blocks a lesson. It searches so the orchestrator doesn't fill context with raw results, returning a short, ranked, annotated list. Spawn it **without pausing for the user's permission** — web research is a normal build step. Give it fresh context: only the brief below, with the user's Phase 2 sourcing preferences folded in.

```
You are scouting high-trust learning resources on the topic: {TOPIC}.

The learner's mission: {outcome + why + starting point, from Phase 1}.
We specifically need sources for: {the gap — or "everything; fresh topic"}.
{If any: sources the user already trusts — don't re-suggest, but complement them.}

Where to look (the user's preference): {e.g. "official docs only", "primary/academic",
"stick to <site/author/community>", or "use your judgement"}.
Do NOT use: {sources the user vetoed, or "none specified"}.

Find the best sources, not the most — curation, not collection. Stay within the
"where to look" preference; if it's too narrow to fill the brief, return what you can
and note the shortfall under GAPS rather than straying to vetoed sources.

Split findings into two groups:
- KNOWLEDGE: written, citable material to teach FROM — books, papers, official docs,
  recognised-expert writing. High-trust only. Reject SEO content farms and anything
  you can't vouch for.
- WISDOM: communities and practitioners to point the learner TOWARD — well-moderated
  forums, classes, recognised mentors.

For EACH resource, return in this exact shape (drops straight into RESOURCES.md):

  - [Type: Title — Author/Source](URL)
    Use for: {what it covers and when to reach for it}.

Rank within each group, best first. Three sources you can vouch for beat thirty you can't.
If you can't find a trustworthy source for part of the brief, say so under a GAPS heading
— that's a useful result, not a failure. Don't paper over a gap with a low-quality source.
Verify links resolve. Do not invent URLs, titles, or authors.
```

**After it returns:** merge into `## Knowledge` / `## Wisdom` keeping annotations, fold any GAPS into `## Gaps`, and prune duplicates — the file should get sharper, not just longer.
