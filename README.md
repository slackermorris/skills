# Skills
A personal directory of skills. Skills follow the [AGENTSKILLS](https://agentskills.io/specification) conventions, making them mostly agent-agnostic and usable across different agents (e.g. Opencode, Claude Code).

## Skills

### Project Management

Tools for planning, tracking, and progressing work across repositories.

| Skill | Description |
|-------|-------------|
| [execution-plan](./execution-plan/) | Set up and manage execution plans which are lightweight progress/decision tracking docs in version control. Skill is used once in lifetime of repository. |
| [execution-plan-progress](./execution-plan-progress/) | Sync today's daily notes and git activity into the active execution plan for a given repository. |

### Personal Knowledge Vault

Vault-specific commands, shaped by the AI-assisted PKM methodology of [Chase Adams][chase-1] and [Henrich][henrich].

| Group | Skill | Description |
|-------|-------|-------------|
| Synthesising Connections | [connect](./connect/) | Find connections between a note and the rest of the vault, suggesting `[[wikilinks]]` to weave them together. |
| Synthesising Connections | [review-using-skills](./review-using-skills/) | Evaluate a note against relevant skill knowledge to catch domain-specific gaps. |
| Searching | [search](./search/) | Deep search across the vault for a topic or question, returning a synthesized summary. |
| Boilerplating | [verify](./verify/) | Quality check notes for prose (propositional) titles, wikilink usage, and proper frontmatter. |
| Boilerplating | [setup-week](./setup-week/) | Scaffold this week's daily and weekly notes, then set weekly priorities. |
| Housekeeping | [queue-add](./queue-add/) | Add a note to the processing queue for later work. |
| Housekeeping | [queue-process](./queue-process/) | Work through notes in the processing queue — synthesize, enhance, or connect. |
| Housekeeping | [reflect](./reflect/) | Guided end-of-day reflection, synthesized into the daily note's Reflection section. |
| Housekeeping | [weekly-rollup](./weekly-rollup/) | Synthesise this week's daily notes into themes, decisions, and action items in the weekly note. |
| Housekeeping | [top-three-priorities](./top-three-priorities/) | Set today's top 3 priorities, checking yesterday's note for carry-overs. |
| Global | [done](./done/) | Capture the current session's key decisions, questions, and follow-ups into a structured session log in the vault. |

---

[chase-1]: https://curiouslychase.com/posts/ai-native-obsidian-vault-setup-guide/
[henrich]: https://x.com/arscontexta/status/2013058057836605756
