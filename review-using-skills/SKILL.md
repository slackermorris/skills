---
name: review-using-skills
description: Evaluate a note against relevant skill knowledge
disable-model-invocation: true
---

## Review Using Skills

The agent has loadable skills (via the Read tool) that contain domain-specific guidelines, conventions, and patterns. This command uses those skills as a rubric to evaluate whether a note follows, contradicts, or is missing guidance that a relevant skill provides. This catches domain-specific gaps that general vault checks would miss.

### Steps

Review note using skills: $ARGUMENTS

1. Read the specified note.
2. Detect the primary topic or domain of the note.
3. Determine which available skill(s) are relevant to that topic. Use the Read tool to load the relevant skill file from `~/.claude/skills/<skill-name>/SKILL.md`. Available skills:

   **Vault:** `vault-navigation`, `periodic-notes`

   **React/Next.js:** `react-best-practices` (index), `async-defer-await`, `async-dependencies`, `async-parallel`, `async-suspense-boundaries`, `async-api-routes`, `bundle-barrel-imports`, `bundle-conditional`, `bundle-defer-third-party`, `bundle-dynamic-imports`, `bundle-preload`, `client-event-listeners`, `client-swr-dedup`, `rerender-defer-reads`, `rerender-dependencies`, `rerender-derived-state`, `rerender-lazy-state-init`, `rerender-memo`, `rerender-transitions`, `rendering-activity`, `rendering-animate-svg-wrapper`, `rendering-conditional-render`, `rendering-content-visibility`, `rendering-hoist-jsx`, `rendering-hydration-no-flicker`, `rendering-svg-precision`, `advanced-event-handler-refs`, `advanced-use-latest`

   **JavaScript:** `js-batch-dom-css`, `js-cache-function-results`, `js-cache-property-access`, `js-cache-storage`, `js-combine-iterations`, `js-early-exit`, `js-hoist-regexp`, `js-index-maps`, `js-length-check-first`, `js-min-max-loop`, `js-set-map-lookups`, `js-tosorted-immutable`

   **Node.js:** `node-async-patterns`, `node-error-handling`, `node-flaky-tests`, `node-modules`, `node-modules-exploration`, `node-streams`, `node-testing`

   **Server:** `server-cache-lru`, `server-cache-react`, `server-parallel-fetching`, `server-serialization`

   For broad React/Next.js tasks, start with `react-best-practices` to identify which specific skills to load next.
4. Evaluate the note against the loaded skill's guidelines, conventions, and patterns.
5. Report:
   - **Aligned**: What the note already does well per the skill.
   - **Gaps**: What the skill covers that the note omits or contradicts.
   - **Suggestions**: Specific improvements, with quotes from the skill to justify each one.
6. If no available skill matches the note's topic, say so and fall back to general vault conventions from CLAUDE.md.

**Incorrect:**

Reviewing a note about React performance by only checking vault conventions (prose title, wikilinks, frontmatter) without loading the `react-best-practices` skill. This misses domain-specific guidance entirely — the agent never learns what the skill knows.

**Correct:**

Reviewing a note about React performance by loading `react-best-practices` via the Read tool, then checking whether the note covers critical patterns (e.g., deferred awaits, avoiding barrel imports, Suspense boundaries) and flagging any advice in the note that contradicts the skill's guidelines. The output clearly separates what is aligned, what is missing, and what to change.
