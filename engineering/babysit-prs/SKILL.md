---
name: babysit-prs
description: One sweep over all of my open GitHub PRs and GitLab MRs — restack stacked branches, autofix lint, triage unresolved review comments, and settle CI — tracking state so reruns skip already-handled work. Designed to be driven by /loop.
argument-hint: '[--owner <org>] [--limit <n>] [--stale <days>] [--github-only|--gitlab-only] [--no-comments] [--dry-run]'
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Skill
model: sonnet
metadata:
    last-used: "2026-10-15"
---

## Babysit PRs

Perform **one sweep** over my open pull requests and merge requests. Babysitting means watching what other people and CI are saying about a change — not forming fresh opinions about it. For each PR: keep the branch stacked correctly on its parent, autofix lint, hand unresolved review threads to `address-pr-reviews`, and settle CI. Record what was handled so the next sweep skips it.

This skill does not review code. If you want a review, run `code-review` yourself.

This skill does a single iteration on purpose. Run it continuously with the loop runner:

```text
/loop 20m /babysit-prs
/loop /babysit-prs          # self-paced
```

### Arguments

-   `--owner <org>`: only sweep repos owned by `<org>` (repeatable). Default: all my open PRs and MRs.
-   `--limit <n>`: max PRs to process this sweep (default: 10, newest activity first).
-   `--stale <days>`: treat PRs with no activity in `<days>` as stale — list them, do nothing to them (default: 90).
-   `--github-only` / `--gitlab-only`: restrict to one forge.
-   `--no-comments`: skip the `address-pr-reviews` dispatch; still count unresolved threads in the summary.
-   `--dry-run`: report what would be done. Take no fix actions, post nothing, write no state.

### State

State lives in `~/.local/state/babysit-prs/state.json`, keyed by PR/MR URL:

```json
{
    "https://gitlab.com/sharesies/retail-backend/-/merge_requests/29912": {
        "forge": "gitlab",
        "updated_at": "2026-08-06T00:14:46Z",
        "head_sha": "abc123",
        "ci_conclusion": "success",
        "stack_parent": "jack/feature/registry-holder-session-columns",
        "stack_parent_head": "e01a5d1",
        "threads_seen_at": "2026-08-05T22:10:00Z",
        "unresolved_threads": 0,
        "base_merged_sha": "abc123",
        "lint_fixed_sha": "abc123",
        "description_synced_sha": "abc123",
        "flake_reruns": 0,
        "failures": 0
    }
}
```

A PR is **quiet** (skip it) when all of these hold:

-   `ci_conclusion` is terminal-good (`success`, `skipped`, or `no_ci`) and unchanged
-   `unresolved_threads` is 0, and no thread is newer than `threads_seen_at`
-   the branch is not behind its base, or behind its stack parent
-   `description_synced_sha` equals the current head SHA

Anything else makes it **active**.

`updated_at` is a cheap pre-filter, but **only when the stored `ci_conclusion` is terminal-good**: completing check runs do not bump a PR's `updatedAt`, so a PR recorded as pending or failing still needs the per-PR fetch even when `updatedAt` is unchanged.

`stack_parent_head` is the load-bearing field. When a parent MR merges, it leaves the open list entirely and its branch may be deleted — the recorded SHA is then the only way to know where the child's own commits begin. Write it every sweep, even when nothing else changed.

### Your Task

#### Step 1: Enumerate open PRs and MRs

GitHub:

```bash
gh search prs --author=@me --state=open --limit 50 \
  --json number,title,url,repository,isDraft,updatedAt
```

GitLab — there is no cross-project `glab mr list`, so query the API directly (`glab mr list` requires a repo or `--group`, and rejects `--state`):

```bash
glab api "merge_requests?scope=created_by_me&state=opened&per_page=100" \
  | jq '[.[] | {number: .iid, title, url: .web_url,
                repository: (.references.full | split("!")[0]),
                isDraft: .draft, updatedAt: .updated_at}]'
```

Merge both lists, apply `--owner` if given, sort by `updatedAt` descending, and keep the first `--limit`. Read the state file (treat a missing file as `{}`).

Anything older than `--stale` goes straight to the summary as `stale — skipped` with no further API calls. This matters: most of my open GitHub PRs are abandoned take-homes from 2025 and earlier, and without this they would be re-fetched on every single tick forever.

#### Step 2: Build the stack graph

Do this before any per-PR work. A PR is a **stack child** when its base branch (GitHub `baseRefName`, GitLab `target_branch`) equals another enumerated PR's head branch (`headRefName` / `source_branch`). Chains go deeper than two — my retail-backend MRs run three deep.

Order the sweep **bottom-up: parents before children**. Restacking a child before its parent has settled just guarantees a second restack next tick, and each one is a force-push.

Record `stack_parent` and `stack_parent_head` for every child. A child whose recorded `stack_parent` is no longer in the open list has had its parent merged — GitLab retargets it to the parent's base automatically, and that is the case Step 5 has to rebase for.

#### Step 3: Classify each PR

If a PR's `updatedAt` matches state AND its stored `ci_conclusion` is terminal-good, mark it quiet with no further calls — on an all-quiet sweep the two enumeration queries are the only API calls made. PRs recorded as pending or failing always get the per-PR fetch until CI concludes.

For the rest, fetch what's needed to compare against state.

GitHub:

```bash
gh pr view <url> --json headRefOid,headRefName,baseRefName,statusCheckRollup,\
mergeable,mergeStateStatus,autoMergeRequest,isDraft,body,title \
  --jq '{headRefOid, headRefName, baseRefName, mergeable, mergeStateStatus,
         autoMerge: (.autoMergeRequest != null), isDraft, body, title,
         conclusions: ([.statusCheckRollup[]?.conclusion] | unique),
         failing: [.statusCheckRollup[]? | select(.conclusion == "FAILURE") | {name, detailsUrl}]}'
```

GitLab (URL-encode the project path — `sharesies/retail-frontend` becomes `sharesies%2Fretail-frontend`):

```bash
glab api "projects/<enc>/merge_requests/<iid>" \
  | jq '{sha, source_branch, target_branch, has_conflicts, draft, description, title,
         auto_merge: .merge_when_pipeline_succeeds, merge_status}'
```

Count unresolved review threads — the same query `address-pr-reviews` uses, so the two agree on what "unresolved" means:

```bash
# GitLab — system notes are noise ("assigned to", "added 533 commits", "changed the description")
glab api "projects/<enc>/merge_requests/<iid>/discussions?per_page=100" \
  | jq '[.[] | select(.notes[0].system != true
                      and .notes[0].resolvable == true
                      and .notes[0].resolved == false)] | length'

# GitHub — resolution state exists only in GraphQL; REST /pulls/<n>/comments cannot tell you
gh api graphql -f query='query($o:String!,$r:String!,$n:Int!){
  repository(owner:$o,name:$r){ pullRequest(number:$n){
    reviewThreads(first:100){ nodes { isResolved } } } } }' \
  -f o=<owner> -f r=<repo> -F n=<number> \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)] | length'
```

#### Step 4: Locate a checkout

Every fix task needs a working tree — including comment fixes, which edit files. Resolve the clone path by forge, because the two layouts differ:

| Forge  | Layout                     | Example                           |
| ------ | -------------------------- | --------------------------------- |
| GitHub | `~/Code/<repo>`            | `~/Code/gen-ui-ne`                |
| GitLab | `~/src/<namespace>/<repo>` | `~/src/sharesies/retail-frontend` |

If no clone exists, record `skipped (no local clone)` in the summary and move on. Never clone a repo automatically.

If a clone exists, work in a **detached** worktree so the main checkout is never disturbed:

```bash
git -C <clone> fetch origin <branch> <base>
git -C <clone> worktree add --detach .claude/worktrees/babysit-prs/<branch> origin/<branch>
```

`--detach`, checking out `origin/<branch>` rather than `<branch>`, is load-bearing. A worktree that
checks out a branch **claims** it: git allows a branch in exactly one worktree, so for as long as the
sweep holds it, `git checkout <branch>` in the main clone fails with "already checked out at …". I do
not use worktrees for local development — I switch branches in the main clone — so a sweep that claims
a branch locks me out of the very branch I am working on. Detached HEAD claims nothing.

This replaces the old "never create a second worktree for a branch" rule, which existed only because
the old form claimed branches. Detached worktrees don't collide, so no `worktree list` check is needed.

Record the remote SHA you fetched. It is the lease value for any force-push in Step 5.

**Retire the worktree when the sweep is done with the PR** — successful push, flagged conflict, or
skip alike. Leaving them accumulating is what turned this into a problem in the first place:

```bash
git -C <clone> worktree remove .claude/worktrees/babysit-prs/<branch>
```

Refuse to remove one with uncommitted changes; report it in the summary instead of forcing.

#### Step 5: Handle the PR

**Before any push, check the auto-merge guard.** If GitHub reports `autoMergeRequest != null`, or GitLab reports `merge_when_pipeline_succeeds: true` or an active merge train, the PR is armed to merge on green — pushing to it either cancels the arming or races the merge. Take **no fix actions** and say so in the summary. Treat an unreadable or missing auto-merge field the same way: an unattended sweep has nobody to ask, so unknown counts as unsafe.

Then run the tasks **in this order**, because each one moves the head SHA and would otherwise invalidate a CI reading taken too early.

**1. Stack and base freshness.**

-   _Stack child, parent still open, child behind parent_ → `git rebase origin/<parent-branch>`.
-   _Stack child, parent merged_ → the parent's commits are now in the base in squashed form, so a plain rebase would replay them as duplicates. Cut them off at the recorded SHA:

    ```bash
    git rebase --onto origin/<new-base> <stack_parent_head>
    ```

    No recorded `stack_parent_head` → flag `needs manual restack` and do nothing. Guessing the cut point rewrites history wrongly, and that is worse than waiting for me.

    Note the missing final `<branch>` argument, here and above: the worktree is detached, so every
    rebase acts on HEAD. Naming the branch would ask git to check it out — reintroducing the claim
    that `--detach` exists to avoid.

-   _Not stacked, behind base_ → `git merge origin/<base>`. Merge rather than rebase here: nothing needs rewriting, so don't take the force-push risk for free.

Then decide whether to push, by what the operation actually decided:

| Outcome                                     | Gate                                                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean rebase or clean merge, zero conflicts | Nothing was decided by a machine. Run the repo's test command if one is runnable, then push. If no runnable test command exists, push anyway — CI is the real verdict. |
| Conflicts resolved                          | A machine made choices. Tests are **mandatory**. Push only if they pass; otherwise `git rebase --abort` / `git merge --abort` and flag `conflicts — needs you`.        |

Not every repo has a runnable test command in a worktree — `~/src/sharesies/retail-backend` needs a live database and its `.venv` lives in the main checkout, so its suite cannot run here. That is exactly why the gate is scoped to conflict resolution rather than applied to every push.

Push a merge normally. Push a rebase with a lease pinned to the SHA fetched in Step 4. A detached
worktree has no branch to push, so name the destination ref explicitly with `HEAD:<branch>`:

```bash
git push --force-with-lease=<branch>:<sha-fetched-this-sweep> origin HEAD:<branch>
```

Take `<sha-fetched-this-sweep>` from `git ls-remote origin <branch>`, never by expanding a short SHA
by hand. A hand-written full SHA is a guess, and git rejects the push as `stale info` — which reads
exactly like the dangerous case below, so it wastes the one signal that matters.

A rejected lease means someone pushed between the fetch and now. Do not retry, do not escalate to `--force` — abort and flag the PR.

**Then re-point the local branch, but only if nothing has it checked out.** The push updated origin;
the clone's own `refs/heads/<branch>` still points at the pre-rebase commit, so my next checkout of it
would silently hand me stale work. Move the ref — unless the branch is checked out somewhere, in which
case leave it alone, because that is me working in it and moving a ref under a live working tree
corrupts its state:

```bash
git -C <clone> worktree list --porcelain | grep -q "^branch refs/heads/<branch>$" \
  || git -C <clone> update-ref refs/heads/<branch> <new-sha>
```

`worktree list --porcelain` reports the main clone as well as every worktree, so the one grep covers
both. When it does match, say so in the summary — the branch is checked out and now behind origin, and
only `git pull --rebase` in that working tree can reconcile it.

-   **Never hand-resolve a lockfile conflict.** Take the base's version and regenerate (`npm install`, `yarn install`) so the lockfile matches the merged manifest.
-   If a conflict is in a file the test suite doesn't exercise, abort and flag rather than guess.

**2. Lint/format autofix.** Only where an autofix command actually exists — the Sharesies repos have inconsistent Makefile targets and several declare no fix command at all, so this table is the source of truth. Edit it as repos change; do not infer a fix command that isn't listed.

| Repo                                | Autofix                                           | Verify                                                                                                 |
| ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `~/Code/gen-ui-ne`                  | `npx oxlint --type-aware --fix && npx oxfmt .`    | `npm run lint && npm run format:check`                                                                 |
| `~/src/sharesies/enterprise-portal` | `npm run format:packages && npm run format:tools` | `npm run format:packages:ci && npm run format:tools:ci && npm run lint:packages && npm run lint:tools` |
| `~/src/sharesies/retail-frontend`   | `yarn stylelint --fix "{src,showcase}/**/*.scss"` | `yarn stylelint`                                                                                       |
| `~/src/sharesies/registry`          | none declared — skip                              | `make lint` (report only)                                                                              |
| `~/src/sharesies/retail-backend`    | none declared — skip                              | —                                                                                                      |

Commit only if the working tree actually changed, with `chore: lint/format autofix`, and push.

**3. Review comments.** If Step 3 counted unresolved threads and `--no-comments` was not given, invoke the `address-pr-reviews` skill with the PR URL and `--unattended`. It fixes and closes bot-authored threads, and reports human-authored ones without replying to them. It pushes its own commits.

Record the newest thread timestamp as `threads_seen_at` and the remaining count as `unresolved_threads`.

**4. CI.** Re-read the head SHA — steps 1–3 have very likely moved it — then check the pipeline.

-   GitHub: a repo with no `.github/workflows` records `ci_conclusion: no_ci` and is not chased.
-   GitLab: pipelines for an MR run against `refs/merge-requests/<iid>/merge`, a synthetic merge-result commit. **The pipeline SHA never equals the MR head SHA.** Match on the newest pipeline, never by SHA:

    ```bash
    glab api "projects/<enc>/merge_requests/<iid>/pipelines" | jq '.[0] | {id, status, ref}'
    glab api "projects/<enc>/pipelines/<pipeline_id>/jobs?scope[]=failed" | jq '[.[] | {id, name}]'
    glab api --method POST "projects/<enc>/jobs/<job_id>/retry"
    ```

-   Retry each failed job **at most once per head SHA** (`flake_reruns` in state). Passing on retry means flaky — name the job in the summary. A deterministic failure is not a flake and must not be retried at all: a schema-compatibility, type, or lint assertion fails identically every time, so read the job trace before spending a retry on it. Report those by name with the failing assertion.

**5. Description sync.** Compare the PR body against the diff, judging drift by the criteria in the `write-mr-description` skill. If it materially drifts — describes work that is no longer there, or omits a substantial part of the change — invoke that skill to regenerate and apply it; it already detects GitLab vs GitHub. Skip cosmetic drift; rewriting a description every tick is noise.

If a dispatch fails twice for the same PR, increment `failures`, record it in the summary, and move on. Don't retry within the sweep.

#### Step 6: Update state and summarize

Write each PR's current `updated_at`, `head_sha`, `ci_conclusion`, `stack_parent`, `stack_parent_head`, `threads_seen_at`, `unresolved_threads`, `base_merged_sha`, `lint_fixed_sha`, `description_synced_sha`, and `flake_reruns` back to state. Drop any keys not present in the Step 1 results, so merged and closed PRs don't accumulate. Skip this entirely under `--dry-run`.

End with a summary table:

| PR                         | Status                    | Action taken                                                                                |
| -------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| [retail-backend!29911](…)  | CI red, behind main       | Merged main in, pushed `def456`; `test_schema_compat` fails deterministically — not retried |
| [retail-backend!29912](…)  | stack child, parent moved | Rebased onto parent, force-with-lease pushed `aa12cd`                                       |
| [retail-backend!29913](…)  | 2 bot threads             | 1 fixed, 1 dismissed and resolved                                                           |
| [registry!257](…)          | conflicts                 | Conflicts need you — tests failed after resolve, rebase aborted                             |
| [enterprise-portal!231](…) | auto-merge armed          | No pushes                                                                                   |
| [where-the-dot#13](…)      | stale (172d)              | skipped                                                                                     |
| [gen-ui-ne#38](…)          | quiet                     | skipped                                                                                     |

If every PR was quiet, the summary is the single line: `All <n> open PRs quiet; nothing to do.`

### Never

-   Force-push with anything but `--force-with-lease` pinned to the SHA fetched this sweep, and only to restack a stack child.
-   Rebase a PR that is not a stack child. Merge its base in instead.
-   Rebase a stack child whose parent has merged without a recorded `stack_parent_head`.
-   Merge, close, approve, request changes on, or mark ready-for-review any PR.
-   Push to a base or default branch.
-   Clone a repo that isn't already on disk.
-   Push to a PR with auto-merge or a merge train armed.
-   Push a conflict resolution that hasn't passed the repo's tests.
-   Reply to or resolve a human reviewer's thread.

**Incorrect:**

Reading CI first, then restacking and pushing — the recorded conclusion belongs to a SHA that no longer exists, and the next sweep sees stale-green CI on new code. Or: matching GitLab pipelines by MR head SHA, finding nothing because pipelines run on `refs/merge-requests/<iid>/merge`, and recording `no_ci` for a repo whose pipeline is actually red. Or: restacking `!29913` before `!29912`, so `!29912`'s own restack immediately invalidates it and next tick force-pushes both again.

**Correct:**

Sort the stack bottom-up, restack `!29911` → `!29912` → `!29913` in that order, autofix lint, let `address-pr-reviews` land its commits, then re-read the head SHA and take CI's verdict on that final SHA. Next sweep finds the head unchanged, CI terminal-good, and zero unresolved threads, and skips all three without a single write.
