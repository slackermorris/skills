---
name: write-mr-description
description: Write a merge request or pull request description that leads with what the change unlocks and gives the reviewer real evidence it works, then guide the reviewer through the crucial or critical changes with inline comments on the diff that give the reasons. Use when the user wants an MR or PR description written or rewritten, or is about to open an MR or PR.
metadata:
  last-used: "2026-10-16"
---

## Write MR Description

A reviewer can already read the diff. They cannot read why the change matters, or what you did to trust it. Write those two things in the description.

A reviewer also cannot read why a crucial line is the way it is. Write that as an inline comment on that line of the diff. Do this on every run, without being asked. The description says why the change matters. The inline comments guide the reviewer through the crucial or critical changes, at the place where each decision lives.

Every description carries four qualities:

- **Unlock** — the goal the change makes possible, not the list of files it touched.
- **Evidence** — the risk you tested for, and the check that proves it.
- **Plain** — words you say out loud to a colleague, in ASD-STE100 Simplified Technical English.
- **Short** — under 200 words. This is a hard limit, not a target.

Count every word of prose. Do not count the headings, or the contents of a code block or a table. A description that runs long does not hold more information. It holds the same information in words the reviewer skips.

Works with GitLab (`glab`) and GitHub (`gh`).

### Steps

#### 1. Read the change

Find the scope:

- If the user named an MR or PR, read it and its diff (`glab mr view <n>` or `gh pr view <n> --json title,body`).
- Otherwise find the base branch (`git symbolic-ref refs/remotes/origin/HEAD`, then `main`, then `master`). Read `git diff BASE...HEAD` and `git log BASE..HEAD --oneline`.

Read the tests in the diff, not only their names. You need to know what they exercise.

If a branch name or a commit message names a ticket, read the ticket. The ticket usually holds the unlock.

Find the reasons behind the design. Step 5 needs them. Look in this order:

1. Plan, design or ticket documents. Check the repo's `docs/` (plans, decisions, SDDs), and any location your memory records for the user's plans. If the user named a document, read it in full.
2. `SPEC.md` rules and decision records that the changed code cites.
3. Commit messages, and the conversation that produced the change.

If the change makes design choices and you find no source for their reasons, ask the user where the plan or ticket is. Do not invent a reason.

**Done when** you can name each group of changed files and say why it changed, you know what the tests cover, and you hold the sources for the design reasons.

#### 2. Find the unlock

Complete this sentence with a real person and a real capability:

> After this merges, **\_\_\_** can **\_\_\_**.

Two cases need care:

- **Groundwork.** If the change only makes a later change possible, the unlock is that later change. Say so: "this is the last piece before X."
- **A fix.** The unlock is what stopped working. Name what the person could not do, and what they can do now.

If the diff and the ticket do not give you the sentence, ask the user one question. Do not guess.

**Done when** the sentence is complete and names someone outside the code: a customer, a support agent, an on-call engineer, or the next developer.

#### 3. Build the evidence

The reviewer wants to know you tested the thing most likely to break. The test files already list what you covered, so do not copy them. Give the reviewer the reason those tests exist, and say how much of the risk they close.

Write down:

1. **The risk.** The one way this change can hurt someone. Pick the worst plausible risk, not the easiest one to test.
2. **The check.** What you did that fails if the risk is real. Real data, a load you ran, a failure you caused on purpose, or a comparison against the old behavior.
3. **The confidence.** What the check earns you. A unit test over a pure function earns more than a mocked integration test. Say which one you have.
4. **The gap.** Any risk you did not cover, and why.

**Never report test mechanics.** The diff and CI already show them, and a count says nothing about whether the right thing was tested.

Cut all of these:

| Do not write | Write instead |
|---|---|
| `yarn test` over the extensions section passes, 21 tests | the extension tests cover a missing token and an expired token, so a silent auth failure cannot reach the user |
| Added 14 unit tests | the new tests drive the parser with the three malformed payloads that caused the incident |
| All tests pass / CI is green | nothing — this is the default, not evidence |
| Coverage is now 87% | the one uncovered path is the retry branch, which I tested by hand against staging |
| Ran `npm run test:unit` | nothing — name what the tests prove, not the command |
| Updated the snapshot tests | the snapshots pin the rendered markup, so they catch a layout change but not a wrong value |

Be honest about weak evidence. "The tests mock the payment gateway, so they prove the call shape and nothing about the gateway's real replies" is worth more to a reviewer than a green tick.

**Done when** the section names one risk, one check that fails if the risk is real, what that check does and does not prove, and every uncovered risk. It holds no test counts, no test file names, no test command, no coverage number, and no "all tests pass".

#### 4. Draft to the shape

Look for a repo template first: `.gitlab/merge_request_templates/*.md`, `.gitlab/merge_request_template.md`, or `.github/pull_request_template.md`. If one exists, fit the content into its headings and keep every heading it asks for. The 200-word limit still holds. A template with many headings means fewer words under each one.

Otherwise use this shape. The word budget after each heading is a guide, and the 200-word total is the rule:

```markdown
## What this unlocks

One or two sentences. Who can now do what. (~30 words)

## What changed

Two to four bullets. The smallest set that lets someone read the diff in the
right order. Each bullet says what the code now does, not what you did to it.
(~50 words)

## How I know it works

Under each label below, write one checkbox per noteworthy test. Use `- [x]` for
a check you did and `- [ ]` for one still to do.

**Unit Tests:** (~45 words)

Report on how the tests give confidence that this change does what it says it does, is safe, or minimises the risk. The focus should
be on what the tests contribute behaviourally.

**Manual Tests:** (~45 words)

Explain how the change was tested in an `integrated` way. Was the database configured into a certain state. What services where running. How did you prove that the change does what it says it does. Go beyond the happy path. How did you stress test the contribution.

## Where to start

Optional. Include it when the diff is large, or when one part is subtle. Name
the file and say what to check. Do not repeat the inline comments here. Say
that the reasons are inline on the diff, and name the comment to read first.
(~30 words)

## References

Optional. Paired MRs in other repos, and the order to merge them: "Follows
!32112", "Merge this straight after sharesies/registry!483", "Leave this in
Draft until uat-environments!166 merges".
```

Three additions apply in either shape, template or not:

- **Diagram.** When the change crosses services or screens, add an ASCII diagram in a code block: the request flow between services, or the path through the screens. Draw it with box-drawing characters, not Mermaid or an image. A code block does not count toward the 200 words.
- **Screenshots.** For a UI or seed-data change, add a screenshot of the result. A screenshot can stand in for the manual test: "See screenshot above."
- **References.** Always name paired MRs and the merge order. Say when one MR is a prerequisite and this one must stay in Draft.

If the template has a checklist, leave its boxes unticked. The user ticks them.

**Done when** each section is filled and no section repeats another.

#### 5. Draft inline comments on the crucial changes

Do this on every run. Do not wait for the user to ask. The aim is to guide the reviewer through the crucial or critical changes: the lines where their attention changes the outcome of the review.

**Pick the lines.** A line earns a comment when a reviewer who misreads it could approve a bug, or could "fix" a deliberate choice later. Look for:

- **Qualifying rules.** What makes a row, a record or an event count: a `WHERE`, a `HAVING`, a guard, a status gate. Say why this point, not an earlier or a later one.
- **Boundaries and invariants.** Where two concerns split the data, and what stops one reporting the other's change.
- **Ordering, paging and cursors.** What a sort key or a tie-break must guarantee, and what breaks if it does not.
- **Deliberate exclusions.** Code that leaves something out on purpose and looks like an oversight.
- **Rejected alternatives.** Where the obvious approach was tried or considered and set aside. Say why.
- **Contracts and schema.** Wire shapes, IDs, migrations, indexes, locks, and any change that breaks old clients or old data.
- **Changes in a module another team owns.** Say what changed for them, and that nothing else did.

Do not comment on renames, moved code, formatting, or a line whose docstring already gives the full reason. A comment that narrates what the code does wastes the reviewer's attention. Expect five to fifteen comments. If you need more than twenty, the MR is probably too large. Tell the user.

**Write each comment.**

- Start with a bold line that names the decision: "**Why the row is dated on the payment date.**"
- Give the reason, then the alternative you set aside, then what breaks without it. Two or three short paragraphs at most. A short list or a small table is fine.
- Take every reason from the sources you found in step 1. Name the source when it helps: a ticket, a plan section, a SPEC rule. Never invent a reason. If a reason is a guess, leave the comment out, or ask the user.
- Use the plain-language rules in **Reference: Plain language**. The 200-word limit is for the description only. It does not apply to inline comments.
- Say when a decision is still open, and who decides it.

**Anchor each comment on an added line** of the final diff. A comment on an added line is the most reliable. Read the line numbers from the new file, and confirm that each one is added: `git diff -M BASE...HEAD -- <path> | grep -n '^+'`. For a renamed file, also record the old path.

**Done when** each crucial change has one comment, each comment cites a real reason, and each anchor is an added line in the diff you will push.

#### 6. Write the title

The title names the outcome in a few words, in Title Case.

- **Start with a verb in the imperative**: Add, Support, Fix, Refactor, Proxy, Pass Through, Cut Over, Seed, Return, Report, Disclose, Align, Show, Drop, Record, Retire. For a feature a person uses, write it as the capability: "Shareholder can Update Their Email".
- **Title Case.** Capitalize each major word. Write a, an, the, and, or, to, of, on, in, for, from, with, as and can in lower case, unless the word starts the title.
- **Keep code tokens as they are**: GET /holder, /retail/v1, holder_event, instrument_id. Keep acronyms in capitals: FIN, CSN, HN, JWT, API. Do not put backticks in a title.
- **A type word is the first word, with no colon**: "Refactor Extract Session Mechanics From …", "Fix Registry Start-up Command". Do not use commit prefixes such as `feat:` or `fix:`.
- **An experiment** is "Draft: Experiment: …".
- **A stacked series** is "<Series Name> 2/5: <This Part>", or ends with "(2/3)".
- **Paired MRs in other repos** start with the same words, so a reviewer can tell they go together: "Cut Over /retail/v1 Auth From Shared Bearer to Asymmetric JWT Assertion" and "Cut Over Registry Client Auth From a Shared Bearer to Asymmetric JWT Assertion".
- Use 4 to 12 words. No ticket ID and no full stop at the end. In retail repos, write "Sharesies Registry" in full.

**Correct:** Disclose Retail FIN Lock as 403 VERIFICATION_LOCKED · Proxy Shareholder Email and Address Updates to Sharesies Registry · Registry Holder Cache 3/5: Registry Holders as Profile Slices

**Incorrect:** feat: registry fin lock · Updated holder.py and tests · Improvements to registry client

**Done when** the title starts with a verb or a capability, follows the case rules, and is 4 to 12 words.

#### 7. Make it plain and short

Run the seven-point self-lint in **Reference: Plain language** over the draft. Fix every hit.

Then count the words. Write the draft to a file and count it, rather than guessing:

```bash
sed '/^#/d' FILE | wc -w
```

If the count is 200 or more, cut. Cut in this order:

1. Any sentence that repeats the diff.
2. Any sentence that says the same thing twice in different words.
3. "Where to start", if the diff is small enough to read without it.
4. Words inside the sentences you keep. Ten sentences of eighteen words beat six of thirty.

Never cut the risk, the check, or the gap to reach the limit. If the evidence alone runs past 200 words, the MR is too large. Tell the user to split it.

**Done when** the self-lint finds nothing and the count is under 200.

#### 8. Show it, then offer to apply

Show the finished description to the user in full. Under it, list the inline comments from step 5: for each one, the `path:line` and the bold first line.

Read `git remote get-url origin` to pick the tool:

| Remote contains | Find the MR/PR | Update | Create |
|---|---|---|---|
| `gitlab` | `glab mr view --output json` | `glab mr update <n> --description "$(cat FILE)"` | `glab mr create --description "$(cat FILE)"` |
| `github.com` | `gh pr view --json number` | `gh pr edit <n> --body-file FILE` | `gh pr create --body-file FILE` |

Write the description to a file in the scratchpad directory first. The markdown then survives the shell.

Ask the user before you run the update or the create command. The whole team sees the result. Ask once, for the description and the inline comments together. If the user approves, post the comments in step 9 without asking again. If the user asked you to open or update the MR without a review, do both without asking.

**Incorrect:**

```markdown
## Summary
Refactors OrderIntakeService to leverage the new validation abstraction,
decoupling the pipeline from the legacy adapter layer and improving testability.

## Changes
- Refactored `order-intake.ts`
- Added `validateOrder()` helper
- Updated tests

## Testing
- Added 14 unit tests in `order-intake.test.ts`
- All tests pass
- Ran `npm run test`
```

Nobody learns anything here. The summary names classes, not people. "Changes" repeats the file list the reviewer already sees. "Testing" reports mechanics the reviewer can read off the diff and the CI run: a count, a file name, a command, a green tick. Fourteen tests over the wrong thing is worse than two over the right thing, and this tells the reviewer which one it is. They still have no reason to trust the change. And leverage, decoupling and testability hide the idea instead of stating it.

**Correct:**

```markdown
## What this unlocks

Support can now fix a rejected order without a deploy. Before, a bad postcode
failed silently at checkout. Only an engineer could find the cause.

## What changed

- Checkout validates an order before the payment step. A bad order stops early
  and shows the customer a message they can act on.
- The service writes each rejection reason to the order record. Support reads
  this field.

## How I know it works

The risk was that the new checks reject good orders and stop real sales. I ran
the checks over three months of production orders, read-only. All 41,206 orders
that passed before still pass. The 87 that failed now give a reason a person can
act on. I also broke the checker on purpose. Checkout showed the message, not a
blank error page.

The unit tests run against the real validator, not a mock, so they hold for the
production code path. They say nothing about the checkout UI, which I checked by
hand.

Not covered: orders from the bulk import job. That job skips this path and needs
its own change.

## Where to start

`order-intake.ts` writes the rejection reasons before the transaction commits. A
rollback drops them. This is deliberate. A rolled-back order has nothing to
explain.
```

This description is 198 words. It holds the unlock, one risk, the check that closes it, what the tests do not prove, and one uncovered path. Every word earns its place.

#### 9. Post the inline comments

Post the comments after the final push. A comment is anchored to a commit. If you push again later, GitLab marks the comment as outdated.

Write a small script file in the scratchpad. Do not use `python -c`; a hook can block it. Use `jq` to build each payload. Keep the comments in a JSON file, one `{path, old_path?, line, body}` per comment.

**Before you post, skip duplicates.** On a re-run, list the existing discussions and skip any comment you already posted at the same path and line.

**GitLab.**

1. Get the project ID with `glab repo view --output json | jq .id`, or take it from the repo's `CLAUDE.md`.
2. Get the diff refs: `glab api projects/<id>/merge_requests/<iid> | jq .diff_refs`. GitLab computes them a few seconds after a push. If `head_sha` is not your last commit, wait and read them again.
3. Post each comment as a discussion with a `text` position:

   ```bash
   jq -n --arg body "$BODY" --arg base "$BASE" --arg start "$START" --arg head "$HEAD" \
     --arg new "$NEW_PATH" --arg old "$OLD_PATH" --argjson line "$LINE" \
     '{body:$body, position:{position_type:"text", base_sha:$base, start_sha:$start,
       head_sha:$head, new_path:$new, old_path:$old, new_line:$line}}' > payload.json
   glab api -X POST projects/<id>/merge_requests/<iid>/discussions \
     -H 'Content-Type: application/json' --input payload.json
   ```

   - `old_path` is the same as `new_path` unless git shows the file as renamed.
   - `new_line` alone anchors to an added line. A context line needs `old_line` as well. A deleted line needs `old_line` only.
4. Post the first comment alone. Check that the response has `.notes[0].position.new_line`. If the position is missing, GitLab posted a general comment instead of an inline one. Delete it, fix the position, and try again. Then post the rest.

**GitHub.** Post all the comments as one review, so the reviewer gets one notification:

```bash
jq -n --arg commit "$HEAD_SHA" --slurpfile c comments.json \
  '{commit_id:$commit, event:"COMMENT",
    comments:[$c[0][] | {path, line, side:"RIGHT", body}]}' > review.json
gh api repos/<owner>/<repo>/pulls/<n>/reviews --input review.json
```

**Done when** every comment shows on its line in the diff view, and you reported the count and the MR link to the user.

---

## Reference: Plain language

ASD-STE100 Simplified Technical English is a controlled writing standard from the aerospace industry. It exists so a reader who is tired, rushed, or not a native English speaker gets the meaning on the first pass. A reviewer is all three.

A description is general prose, so use the STE-flavored mode: keep the sentence, paragraph and active-voice discipline, and keep enough vocabulary to read naturally. Save full strict STE for procedures and error messages.

**Words**

- Use one name for one thing. If the code calls it an order, call it an order every time. Not a request, a submission, or a payload.
- Use the short common word. Give each word one meaning.
- Cut marketing adjectives: seamless, robust, powerful, effortless, holistic.
- American spelling.

**Verbs**

- Active voice. "The parser reads the file", not "the file is read by the parser".
- Use a verb for an action. "Analyze the log", not "perform an analysis of the log".
- One tense, no stacked auxiliaries. Write "this cuts checkout errors", not "it is important to note that this may help to improve checkout errors".
- Present tense for what the code does. Past tense for what you did.

**Sentences**

- One idea per sentence. 25 words or fewer for description, 20 for an instruction.
- No contractions. Keep the articles: a, an, the, this, these.

**Punctuation**

- No semicolons. Write two sentences.

**Structure**

- One topic per paragraph, six sentences at most.
- Put a condition before its command.

Swap these words:

| Instead of | Write |
|---|---|
| leverage, utilize | use |
| facilitate, enable | let, help |
| ensure | make sure |
| prior to, subsequent to | before, after |
| decouple A from B | A no longer needs B |
| improve testability | we can now test A on its own |
| performant | fast |
| surface, expose | show |
| in order to | to |
| a number of | three, several |
| refactor | what moved, and where it moved to |

**Self-lint before you show the description**

1. Any sentence over 25 words? Split it.
2. Any semicolon? Replace it with a period.
3. Any contraction? Expand it.
4. Any passive voice with a known actor? Make it active.
5. Any nominalization ("perform an analysis") or phrasal verb ("spin up")? Use a plain verb.
6. One thing named two ways? Pick one name.
7. Any test count, test file name, test command, coverage number or "all tests pass"? Delete it. Say what the tests prove instead.

Then count the prose words, headings excluded. 200 or more? Cut, in the order given in step 7.

These seven checks fix the form. They cannot make a hollow paragraph true. If the unlock or the evidence is thin, go back to step 2 or step 3.

The standard is free to read: https://asd-ste100.org
