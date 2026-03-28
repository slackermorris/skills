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

## Templates

Starter templates for new skills are in [`templates/`](./templates/). Because skills now encompass __commands__, I thought it worthwhile to separate the two use cases into their own templates.

| Template | Use when |
|----------|----------|
| [agent-skill.md](./templates/agent-skill.md) | The skill should trigger automatically based on context. The Agent decides when to invoke it. Description acts as a trigger specification. |
| [user-skill.md](./templates/user-skill.md) | The skill is only invoked explicitly by the user via a slash command. Includes `disable-model-invocation: true`. |

## Advanced Functionality 

### Housekeeping

Each skill tracks its last-used date in `metadata.last-used` (via the [AgentSkills][agentskills] `metadata` field). Two lifecycle hooks keep this current and flag stale skills automatically:

| Hook / Event | Agent | What it does |
|---|---|---|
| `PostToolUse` > `Skill` | Claude Code | Updates `last-used` in `SKILL.md` whenever a skill is invoked |
| `Stop` | Claude Code | Warns about skills unused for >14 days at end of session |
| `tool.execute.after` | OpenCode | Updates `last-used` on skill invocation |
| `session.idle` | OpenCode | Notifies about stale skills when session goes idle |

The scripts live in this repo as the source of truth. Installation copies them to where each agent expects them.

### Installation

**1. Set `SKILLS_DIR`** (add to `~/.zshrc` or equivalent):

```bash
export SKILLS_DIR="$HOME/path/to/this/local/skills/repository"
```

**2. Install Claude Code hooks:**

```bash
mkdir -p ~/.claude/hooks
cp "$SKILLS_DIR/.claude/hooks/housekeeping.sh" ~/.claude/hooks/
cp "$SKILLS_DIR/.claude/hooks/update-last-used.sh" ~/.claude/hooks/
chmod +x ~/.claude/hooks/housekeeping.sh ~/.claude/hooks/update-last-used.sh
```

Then add to `~/.claude/settings.json` (create if it doesn't exist):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Skill",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/update-last-used.sh", "async": true }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/housekeeping.sh", "async": true, "timeout": 10 }
        ]
      }
    ]
  }
}
```

**3. Install OpenCode plugin:**

```bash
mkdir -p ~/.config/opencode/plugins
cp "$SKILLS_DIR/.opencode/plugins/housekeeping.js" ~/.config/opencode/plugins/
```

OpenCode auto-discovers plugins in `~/.config/opencode/plugins/` — no further configuration needed.

**Re-installing after updates:** Re-run the `cp` commands whenever the hook scripts change in this repo.

---

[chase-1]: https://curiouslychase.com/posts/ai-native-obsidian-vault-setup-guide/
[henrich]: https://x.com/arscontexta/status/2013058057836605756
[agentskills]: https://agentskills.io/specification
