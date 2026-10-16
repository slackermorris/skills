# Skills
A personal directory of skills. Skills follow the [AGENTSKILLS](https://agentskills.io/specification) conventions, making them mostly agent-agnostic and usable across different agents (e.g. Opencode, Claude Code).

## Skills

Skills are grouped into top-level folders by what they're for. Nothing is installed by default: link a skill into `~/.claude/skills/` to expose it, e.g. `ln -s ~/Code/skills/productivity/tutor ~/.claude/skills/tutor`.

### Productivity

Tools for thinking, learning, and running a personal knowledge vault. The vault commands are shaped by the AI-assisted PKM methodology of [Chase Adams][chase-1] and [Henrich][henrich].

| Group | Skill | Description |
|-------|-------|-------------|
| Vault | [connect](./productivity/connect/) | Find connections between a note and the rest of the vault, suggesting `[[wikilinks]]` to weave them together. |
| Vault | [review-using-skills](./productivity/review-using-skills/) | Evaluate a note against relevant skill knowledge to catch domain-specific gaps. |
| Vault | [search](./productivity/search/) | Deep search across the vault for a topic or question, returning a synthesized summary. |
| Vault | [verify](./productivity/verify/) | Quality check notes for prose (propositional) titles, wikilink usage, and proper frontmatter. |
| Vault | [setup-week](./productivity/setup-week/) | Scaffold this week's daily and weekly notes, then set weekly priorities. |
| Vault | [weekly-rollup](./productivity/weekly-rollup/) | Synthesise this week's daily notes into themes, decisions, and action items in the weekly note. |
| Vault | [done](./productivity/done/) | Capture the current session's key decisions, questions, and follow-ups into a structured session log in the vault. |
| Clanker | [feed-clanker](./productivity/feed-clanker/) | Capture a snapshot of the current agent session and write it as a raw markdown file to `~/Documents/Clanker/raw/` for ingestion into [Clanker](../Clanker/), an AI-only knowledge vault. |
| Learning | [teach-me](./productivity/teach-me/) | Teach a topic in a single, self-contained interactive HTML lesson delivered in Plannotator. The user highlights any phrase to get an instant in-page answer, drawn live from a curated `RESOURCES.md` — never parametric guesses. Complements `tutor`. |
| Learning | [tutor](./productivity/tutor/) | Test your understanding of a topic one question at a time, varying the angle, with assessor sub-agents grading answers without sycophancy. Probes existing understanding rather than building it. |

### Engineering

Tools for designing, building, reviewing, and shipping code.

| Group | Skill | Description |
|-------|-------|-------------|
| Planning | [write-sdd](./engineering/write-sdd/) | Write a Software Design Document for a feature or change before implementing it. |
| Reviewing | [code-reviewer](./engineering/code-reviewer/) | Run a code review by spawning pr-test-analyser and silent-failure-analyser sub-agents in parallel and reporting their findings. Named to avoid clashing with Claude Code's built-in `/code-review`. |
| Reviewing | [one-percent-codebase](./engineering/one-percent-codebase/) | Make the current repo 1% better: parallel assessor sub-agents each find, implement, and validate their single highest-impact improvement, then open a focused PR. Keeps a committed ledger so progress compounds. |
| Shipping | [write-mr-description](./engineering/write-mr-description/) | Write a merge request or pull request description that leads with what the change unlocks, names the risk you tested for, and reads like one human talking to another. Uses ASD-STE100 Simplified Technical English. Detects GitLab or GitHub and offers to apply the description. |
| Shipping | [babysit-prs](./engineering/babysit-prs/) | One sweep over all open GitHub PRs and GitLab MRs — restack stacked branches onto their parents, merge the base in, autofix lint, hand unresolved review threads to [address-pr-reviews](./engineering/address-pr-reviews/), and settle CI. Tracks state so reruns skip handled work. Built for `/loop`. |
| Shipping | [address-pr-reviews](./engineering/address-pr-reviews/) | Work through the unresolved review threads on one PR or MR — fix what is legitimate, explain what is not. Detects GitLab or GitHub. Closes bot threads on its own; always leaves a human reviewer's thread for you to answer. |
| Design | [muller-brockmann-grid](./engineering/muller-brockmann-grid/) | Build editorial/magazine pages on a genuine Müller-Brockmann modular grid — one CSS-variable source of truth, a toggleable overlay sharing the content box, subgrid bands, baseline lock, and runtime optical alignment. Ships a scaffold generator and a zero-dependency verification harness that proves 0px adherence. |

### Deprecated

No longer used. Kept for reference; don't link these.

| Skill | Description |
|-------|-------------|
| [adr](./deprecated/adr/) | Create, assess, and lazy-load Architecture Decision Records in the MADR format. |
| [execution-plan](./deprecated/execution-plan/) | Set up and manage execution plans which are lightweight progress/decision tracking docs in version control. |
| [execution-plan-progress](./deprecated/execution-plan-progress/) | Sync today's daily notes and git activity into the active execution plan for a given repository. |
| [queue-add](./deprecated/queue-add/) | Add a note to the processing queue for later work. |
| [queue-process](./deprecated/queue-process/) | Work through notes in the processing queue — synthesize, enhance, or connect. |
| [reflect](./deprecated/reflect/) | Guided end-of-day reflection, synthesized into the daily note's Reflection section. |
| [synthesise](./deprecated/synthesise/) | Ingest unprocessed raw files from `~/Documents/Clanker/raw/` into the wiki, then synthesise connections across the vault. |

### Vendored

Skills maintained elsewhere, pulled into [`vendor/`](./vendor/) rather than authored here. Don't edit them by hand; update from upstream instead.

| Source | Path | How it's vendored | Update with |
|--------|------|-------------------|-------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | [`vendor/mattpocock-skills/`](./vendor/mattpocock-skills/) | git subtree | `git subtree pull --prefix vendor/mattpocock-skills https://github.com/mattpocock/skills.git main --squash` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | [`vendor/vercel-agent-skills/`](./vendor/vercel-agent-skills/) | git subtree | `git subtree pull --prefix vendor/vercel-agent-skills https://github.com/vercel-labs/agent-skills.git main --squash` |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | [`vendor/last30days-skill/`](./vendor/last30days-skill/) | git submodule | `git submodule update --remote vendor/last30days-skill` |

Each vendored repo keeps its skills in `skills/` (Matt's are further grouped as `skills/<category>/<name>/`). Link only the ones you want.

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
