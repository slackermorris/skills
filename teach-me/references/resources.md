# RESOURCES.md — The Trusted Source Set

`RESOURCES.md` is the curated set of trusted sources for the topic. Knowledge for explainers is drawn from here, not from parametric guesses. Wisdom — judgement and practice — comes from the communities listed here. It lives in the session's working directory (see `session-workspace.md`).

**Before `RESOURCES.md` is well-populated, your focus is to find high-quality resources, not to teach.** Never trust your parametric knowledge as a substitute for a real source. A thin or empty `RESOURCES.md` means the lesson isn't ready to build; close that gap first (the `resource-scout` subagent, `agents/resource-scout.md`, exists for exactly this).

## Structure

```md
# {Topic} Resources

## Knowledge

- [Book: _The Science and Practice of Strength Training_ — Zatsiorsky & Kraemer](https://example.com)
  Foundational text on programming and adaptation. Use for: anything to do with periodisation, recovery, intensity zones.
- [Article: "How Much Should I Train?" — Greg Nuckols (Stronger By Science)](https://example.com)
  Evidence-based review of volume landmarks. Use for: weekly set targets per muscle group.

## Wisdom (Communities)

- [r/weightroom](https://reddit.com/r/weightroom)
  High-signal subreddit, moderated against bro-science. Use for: programme critique, plateau troubleshooting.
- Local: Tuesday strength class at {gym name}
  Use for: real-time coaching feedback on lifts.
```

## Knowledge vs. Wisdom

- **Knowledge** is the written, citable material you teach *from* — books, papers, documentation, recognised expert writing. When you build a lesson's explainer, this is where the content comes from.
- **Wisdom** is the living judgement of practitioners — communities, classes, mentors. You don't teach *from* it directly; you point the user *toward* it for the things that don't fit in a lesson: taste, troubleshooting, what experienced people actually do. Skill durability and flexibility are ultimately built in contact with these communities.

It's fine for a resource to appear in only one group.

## Rules

- **High-trust only.** Prefer primary sources, recognised experts, peer-reviewed work, and communities with strong moderation. If a resource is marketing dressed as education, leave it out.
- **Annotate every entry.** A bare link is useless in three months. Add one line: what it covers and when to reach for it ("Use for: ...").
- **Group by Knowledge / Wisdom.** Mirrors the philosophy in `pedagogy.md`.
- **Surface gaps explicitly.** If no good resource exists for an area the mission needs, write a `## Gaps` section listing what's missing. This drives the next scouting pass — and Phase 1 checks it before building a lesson in that area.
- **Prune ruthlessly.** A resource that turned out to be wrong, shallow, or off-mission should be removed, not buried. Better five sharp sources than thirty mediocre ones.
- **Record community preferences.** If the user has opted out of joining communities, note it here so you don't keep proposing them (and so a future session on this topic, if there is one, inherits the preference).

## Using resources to answer questions

When the user highlights a phrase and asks about it (`ask-protocol.md`), the answer is generated from these resources first — at ask-time, never pre-baked (in normal operation `serve.js` spawns a headless Claude that reads this file). Only fall back to a web fetch when the resources genuinely don't cover it, and when a fetched source proves trustworthy, add it here so the next answer in the session is better grounded. Every good answer should leave `RESOURCES.md` at least as strong as it found it — it is the durable artifact the session produces.
