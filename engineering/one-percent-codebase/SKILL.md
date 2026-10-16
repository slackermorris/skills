---
name: one-percent-codebase
description: Make the current repo 1% better. Orchestrates parallel assessor sub-agents that each find their single highest-impact improvement, implement it, validate it, and open a focused PR with an HTML findings report. Maintains a committed ledger so progress compounds and issues are never re-proposed. Designed to run unattended on a daily schedule.
disable-model-invocation: true
metadata:
  last-used: "YYYY-MM-DD"
---

## One Percent Codebase

Improve whatever repo this is run in by 1% — every run, one ambitious change per domain, shipped as its own green PR with a visual findings report, recorded in a ledger so tomorrow picks up where today stopped.

You are the **orchestrator**. You do not assess code yourself. You discover the project, launch the assessor sub-agents in parallel, and synthesise their results. All the assessment content the sub-agents need (the quality rubric, the architecture vocabulary, the HTML report template, the React rubric) lives in the **Reference** sections at the bottom of this file — paste the relevant sections into each sub-agent's prompt so the sub-agent is fully briefed without reading anything else.

This skill is codebase-agnostic and self-contained. Nothing about any specific project is hardcoded; nothing depends on other skills or files being installed.

### Steps

#### 1. Preflight

1. **Confirm a git repo.** Run `git rev-parse --is-inside-work-tree`. If it fails, stop and tell the user this skill must run inside a git repository.
2. **Confirm a clean tree** (`git status --porcelain`). If dirty, stop and ask the user to commit or stash first — assessors create worktrees off the current state.
3. **Detect the default branch**: `git symbolic-ref refs/remotes/origin/HEAD` (fallback: `main` then `master`). Record as `BASE`.
4. **Confirm GitHub access**: `gh auth status`. If it fails, stop and tell the user to authenticate `gh`.
5. **Compute `RUN_DATE`**: `date +%Y-%m-%d`.
6. **Discover the validation commands — do NOT hardcode.** In order of preference:
   - Read the repo's `CLAUDE.md` / `AGENTS.md` / `README.md` for documented "lint / typecheck / test / check" commands.
   - Read `package.json` `scripts` for `check`, `lint`, `typecheck`, `test`, `build` (or the equivalent for other ecosystems: `Makefile`, `justfile`, `pyproject.toml`, `cargo`, `go test`, etc.).
   - Infer the toolchain from lockfiles/config (e.g. Vite+ → `vp check` / `vp test`; biome; eslint; `tsc --noEmit`; vitest/jest; pytest; `cargo check`/`cargo test`; `go vet`/`go test`).
   - Record two strings to pass to the sub-agents: `LINT_CMD` (format+lint+typecheck) and `TEST_CMD`. If you genuinely cannot find a test command, set `TEST_CMD` to empty and tell the sub-agents to gate on `LINT_CMD` + a build only.
7. **Ensure the ledger exists** at the repo root. If `.one-percent/` is missing, create it with `ledger.json` (schema in the **Reference: Ledger** section), an empty `reports/` directory, and a `README.md` (also in that section) explaining the system. These will be committed inside each PR's diff, not pushed to `BASE` directly.
8. **Build the dedup set.** Read `.one-percent/ledger.json`, then run `gh pr list --state open --search "head:one-percent/" --json number,title,headRefName,url` to learn what is currently proposed. Reconcile: for each ledger entry with status `pr-open`, check its PR — if merged mark `merged`, if closed-unmerged mark `rejected`. The **dedup set** is every entry whose status is `pr-open`, `merged`, or `rejected`. Assessors must not re-propose anything matching it.

#### 2. Launch the assessors in parallel

Spawn both sub-agents **in a single message**, each via the Agent tool with `isolation: "worktree"` (concurrent edits must not collide; pushed branches persist after the worktree is cleaned up). Give each sub-agent: `BASE`, `RUN_DATE`, `LINT_CMD`, `TEST_CMD`, the dedup set, and the relevant Reference sections pasted in full.

- **`codebase-quality-assessor`** — general code quality + architecture, any language.
  - Description: "Assess code quality, ship 1% fix"
  - Prompt: paste **Reference: Assessor contract**, **Reference: Code-quality rubric**, **Reference: Architecture vocabulary**, and **Reference: HTML report template**. Set `DOMAIN=general`, branch prefix `one-percent/general/`, report path `.one-percent/reports/<RUN_DATE>-general.html`. Instruct: explore the whole repo organically; apply the deletion test to suspected shallow modules; rank findings by the rubric's severity order; pick the **single** highest-leverage change not in the dedup set; implement it minimally.

- **`react-quality-assessor`** — React-specific.
  - Description: "Assess React quality, ship 1% fix"
  - Prompt: paste **Reference: Assessor contract**, **Reference: React rubric**, **Reference: Architecture vocabulary**, and **Reference: HTML report template**. Set `DOMAIN=react`, branch prefix `one-percent/react/`, report path `.one-percent/reports/<RUN_DATE>-react.html`. Instruct: first detect React (`react` in `package.json` dependencies/devDependencies anywhere in the repo); if absent, return `{skipped, reason:"no React in this repo"}` and open nothing. Otherwise run `npx react-doctor@latest` at the React app root, parse its findings, and pick the single highest-impact one not in the dedup set. If react-doctor cannot run, fall back to the inline React rubric.

Each assessor returns either `{title, rationale, files, severity, branch, pr_url, report_path}` or `{skipped, reason}` (including `"abandoned after 3 attempts"` when it could not get validation green).

#### 3. Synthesise

Per the parallel-then-synthesise pattern: wait for both, then reconcile.

1. **Resolve overlap.** If both assessors touched the same file(s), keep the higher-severity PR and tell the other to defer — it records a `deferred` ledger entry and closes/abandons its branch without a PR. (Detect overlap from the returned `files`; if you must intervene after the fact, do it via a follow-up message to the sub-agent.)
2. **Do not restate** the assessors' full reports. Surface a brief verdict to the user:
   - Which PRs were opened, with links and one-line titles.
   - What was skipped or deferred, and why.
   - The running count of merged 1% improvements from the ledger (the compounding story).
3. **Do not push to `BASE`.** Each assessor already committed its ledger entry + HTML report inside its own PR branch, so the ledger grows in `BASE` naturally when PRs merge.

**Incorrect:**

A run that opens one big PR titled "code quality improvements" bundling a rename, a dependency bump, and three unrelated refactors; or opens a PR whose CI is red because tests fail; or proposes the same "extract validation helper" change that was opened (still unmerged) yesterday; or pastes the sub-agents' entire reports back to the user. Also wrong: the assessor naming `~/Code/open-source/...` or another skill as the source of its rubric — the rubric must travel inside the prompt.

**Correct:**

A run that, on a clean default branch, opens up to two small focused PRs — e.g. `one-percent/general/2026-06-28-collapse-order-intake-pipeline` (one ambitious structural deepening, lint+tests green) and `one-percent/react/2026-06-28-remove-array-index-keys` (one react-doctor finding fixed, green) — each carrying a self-contained HTML report under `.one-percent/reports/` and a new `ledger.json` entry in its diff, with concise markdown summaries in the PR bodies. The user sees a three-line verdict: the two PR links, anything skipped, and "14 one-percent improvements merged to date." If React is absent or a clean change can't be reached in 3 attempts, that domain opens nothing and the ledger records why.

---

## Reference: Assessor contract

You are a `<DOMAIN>` assessor for the **one-percent-codebase** routine. You are running inside an isolated git worktree of a repository whose default branch is `BASE`. Your job is to make this repo measurably 1% better with **one** focused, ambitious, behaviour-preserving change, and ship it as a single green PR. Everything you need is in this prompt — do not look for external skills, files, or machine paths.

**Inputs given to you:** `BASE`, `RUN_DATE`, `LINT_CMD`, `TEST_CMD`, the **dedup set** (a list of `{domain, title, files, status}` for changes already proposed/merged/rejected), and your `DOMAIN`, branch prefix, and report path.

**Procedure:**

1. **Assess.** Explore the codebase and identify candidate improvements using the rubric in this prompt. Apply the deletion test to anything you suspect is shallow.
2. **Select one.** Rank candidates by the rubric's severity order. Pick the single highest-leverage change whose `(domain, normalised-title)` and primary file(s) do **not** overlap anything in the dedup set, and that is not `rejected`. Prefer changes that delete complexity over changes that rearrange it. If every worthwhile candidate is already in the dedup set, return `{skipped, reason:"nothing new above the bar"}`.
3. **Implement** the change minimally and behaviour-preservingly. Keep it small and reviewable — this is 1%, not a rewrite. Do not push a file past ~1000 lines; decompose instead.
4. **Validate with retry (max 3 attempts).** Run `LINT_CMD` and `TEST_CMD`. If either fails, read the failure, fix your change, and re-run. After **3** failed attempts, revert your edits, return `{skipped, reason:"abandoned after 3 attempts: <summary>"}`, and open no PR. **Never open a red PR.**
5. **Write the HTML report** to your report path using the **HTML report template**. Self-contained, single file.
6. **Record the ledger entry.** Append your entry to `.one-percent/ledger.json` and add a `runs` entry for `RUN_DATE` (see **Reference: Ledger**). Set `status: "pr-open"`.
7. **Commit, push, open the PR.**
   - Branch: `<prefix><RUN_DATE>-<kebab-slug-of-title>`.
   - Commit the code change, the HTML report, and the ledger update together.
   - `git push -u origin <branch>`.
   - `gh pr create --base BASE --title "1% (<DOMAIN>): <title>" --body <markdown summary>`. The body must contain: the problem (one sentence), the change (one sentence), the wins (bullets), the validation result (lint+tests green), and a line pointing to the committed HTML report path. End the body with `Generated with Claude Code`.
8. **Return** `{title, rationale, files, severity, branch, pr_url, report_path}`.

Commit message footer must end with:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Reference: Code-quality rubric

Be **ambitious** about structure. Don't stop at "this could be a bit cleaner." Hunt for "code judo" moves: restructurings that preserve behaviour while making the implementation dramatically simpler, smaller, more direct. Prefer the change that makes the code feel inevitable in hindsight, and prefer deleting complexity over rearranging it.

**Standards (in priority order):**

0. **Ambitious simplification.** Look for the move that makes whole branches, helpers, modes, conditionals, or layers disappear. If you can delete complexity rather than relocate it, that is the change to pick.
1. **File size.** Treat pushing a file from under ~1000 lines to over it as a strong smell. Extract focused modules instead.
2. **No spaghetti growth.** Be suspicious of new ad-hoc conditionals or one-off branches bolted onto unrelated flows. Push logic into a dedicated abstraction, helper, state model, or separate module.
3. **Clean the design, don't rubber-stamp working code.** If behaviour can stay the same while structure becomes meaningfully cleaner, do that. Prefer removing moving pieces over spreading complexity around.
4. **Direct, boring code over magic.** Flag brittle, ad-hoc, or "magic" behaviour, thin abstractions, identity wrappers, and pass-through helpers that add indirection without clarity.
5. **Type & boundary cleanliness.** Question unnecessary optionality, `any`/`unknown`, and cast-heavy code where a clearer typed boundary could exist. Prefer explicit models over loosely-shaped ad-hoc objects.
6. **Canonical layer & reuse.** Call out feature logic leaking into shared paths and bespoke helpers that duplicate a canonical utility. Push code to the module/package that already owns the concept.
7. **Orchestration.** Flag needlessly sequential work and non-atomic updates when the cleaner structure is obvious.

**Preferred remedies:** delete a layer of indirection; reframe the state model so conditionals disappear; move the ownership boundary so the feature is a natural extension of an existing abstraction; turn special-cases into a simpler default; extract a helper or pure function; split a large file; replace condition chains with a typed model or dispatcher; separate orchestration from business logic; collapse duplicate branches; reuse the canonical helper; make a type boundary explicit; relocate logic to its owning module.

**Severity order for ranking candidates:**
1. Structural regressions / missed dramatic simplifications (code-judo)
2. Spaghetti / branching complexity
3. Boundary / abstraction / type-contract problems
4. File-size & decomposition
5. Modularity & abstraction
6. Legibility & maintainability

Pick a high-conviction structural change over a pile of cosmetic nits. A rename or comment tweak is **not** an acceptable 1% — the change must materially improve structure, behaviour-preservingly.

---

## Reference: Architecture vocabulary

Design **deep modules**: a lot of behaviour behind a small interface, at a clean seam, testable through that interface. Use these terms exactly in the report and PR body — don't substitute "component", "service", "API", or "boundary".

- **Module** — anything with an interface and an implementation (function, class, package, slice). Avoid: unit, component, service.
- **Interface** — everything a caller must know to use the module correctly: signature, invariants, ordering, error modes, config, performance. Avoid: API, signature (too narrow).
- **Implementation** — what's inside the module.
- **Depth** — leverage at the interface: behaviour exercised per unit of interface learned. **Deep** = small interface, lots of behaviour. **Shallow** = interface nearly as complex as the implementation (avoid).
- **Seam** — a place where you can alter behaviour without editing in that place; where the interface lives. Avoid: boundary.
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth: one implementation pays back across N call sites and M tests.
- **Locality** — what maintainers get: change, bugs, and verification concentrate in one place.

**Principles:**
- Depth is a property of the interface, not the implementation. A deep module can be internally composed of small swappable parts that aren't part of its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam.
- **One adapter = a hypothetical seam; two adapters = a real one.** Don't introduce a seam unless something actually varies across it.

Phrasings that fit: "the Order intake module is shallow — interface nearly matches the implementation"; "pricing leaks across the seam"; "deepen: one interface, one place to test". Win bullets name the gain in these terms ("locality: bugs concentrate in one module", "leverage: one interface, N call sites") — not "easier to maintain" or "cleaner code".

---

## Reference: React rubric

Drive React findings from `npx react-doctor@latest` (run at the React app root). It deterministically scans for issues across **state & effects, performance, architecture, security, and accessibility**, and reports rule-named findings (e.g. `react-doctor/no-array-index-as-key`). Parse its output, then pick the single highest-impact finding not in the dedup set.

If react-doctor cannot run (offline, unsupported), fall back to assessing these by hand, in roughly this severity order:
1. **State & effects** — effects that should be derived state or event handlers; missing/over-broad dependency arrays; effects that sync state better computed during render; subscriptions without cleanup.
2. **Performance** — unstable references defeating memoisation; unnecessary re-renders; array-index keys; expensive work in render.
3. **Architecture** — prop drilling where a deep module/context belongs; god components; logic that belongs in a custom hook; mixing data-fetching with presentation.
4. **Security** — `dangerouslySetInnerHTML` with unsanitised input; injection via hrefs/URLs.
5. **Accessibility** — missing labels/roles/alt text; non-semantic interactive elements; keyboard traps.

Apply the same depth/seam vocabulary: a custom hook is a module; its return value is its interface; prefer deep hooks over shallow ones. Implement one fix, behaviour-preservingly, and validate with the project's commands plus react-doctor re-run to confirm the finding is resolved.

---

## Reference: HTML report template

Write a single self-contained HTML file to the report path. Tailwind and Mermaid come from CDNs. Mermaid handles graph-shaped diagrams; hand-built divs/SVG handle editorial visuals. The diagram is the centrepiece — prose is sparse and uses the architecture vocabulary.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>One Percent — {{repo}} — {{RUN_DATE}} — {{DOMAIN}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header><!-- repo, date, domain, compact legend: solid box = module, dashed = seam, red arrow = leakage, thick dark box = deep module --></header>
      <section id="chosen"><!-- THE change shipped this run, see card spec --></section>
      <section id="runners-up"><!-- other findings considered but not chosen, terse --></section>
    </main>
  </body>
</html>
```

**The chosen-change card** (one `<article>`):
- **Title** — names the change ("Collapse the Order intake pipeline").
- **Badge row** — recommendation strength: `Strong` (emerald), `Worth exploring` (amber), `Speculative` (slate); plus severity.
- **Files** — monospaced list (`font-mono text-sm`).
- **Before / After diagram** — two columns side by side, ~320px tall. Use a Mermaid `flowchart` for call/dependency mess (colour leakage edges red, deep module dark via `classDef`), or hand-built boxes/SVG for "one thick deep module with greyed internals", or a mass diagram for "interface as wide as implementation".
- **Problem** — one sentence.
- **Solution** — one sentence.
- **Wins** — bullets, ≤6 words, in vocabulary terms ("locality: bugs in one module", "leverage: one interface, N call sites").
- **Validation** — lint + tests green.

Style: editorial not corporate-dashboard, generous whitespace, one accent colour plus red (leakage) and amber (warnings), `text-xs uppercase tracking-wider` for schematic module labels. No hedging, no throat-clearing. If a diagram needs a paragraph to be understood, redraw it.

---

## Reference: Ledger

`.one-percent/ledger.json` lives at the repo root and is committed inside each PR's diff (never pushed straight to the default branch).

```json
{
  "version": 1,
  "runs": [
    { "date": "2026-06-28", "general": "general-2026-06-28-collapse-order-intake", "react": null }
  ],
  "entries": [
    {
      "id": "general-2026-06-28-collapse-order-intake",
      "date": "2026-06-28",
      "domain": "general",
      "title": "Collapse the Order intake pipeline",
      "rationale": "Four shallow wrappers; deletion test concentrates complexity.",
      "files": ["src/order/intake.ts", "src/order/validate.ts"],
      "severity": "high",
      "status": "pr-open",
      "pr_url": "https://github.com/owner/repo/pull/123",
      "report_path": ".one-percent/reports/2026-06-28-general.html"
    }
  ]
}
```

- `status`: `pr-open` (PR live), `merged`, `rejected` (closed unmerged), `deferred` (lost an overlap resolution this run), `abandoned` (couldn't reach green in 3 attempts).
- **Dedup rule:** never propose a change whose `(domain, normalised title)` or primary file overlaps an entry that is `pr-open`, `merged`, or `rejected`.
- The orchestrator reconciles `pr-open` entries against live PR state at preflight each run.

`.one-percent/README.md` (seed on first run):

```markdown
# .one-percent

State for the `one-percent-codebase` routine — one ambitious, behaviour-preserving
improvement per domain per run, each shipped as its own PR.

- `ledger.json` — every proposed change and its status. Prevents re-proposing the
  same issue and tells the compounding story over time.
- `reports/` — the self-contained HTML findings report committed with each PR.

Status of an entry advances when you merge or close its PR; the next run reconciles.
```
