---
name: code-review
description: Run a code review by spawning pr-test-analyser and silent-failure-analyser sub-agents in parallel and reporting their findings. Use this skill whenever the user wants to review code, says "review this", "run a code review", "check this code", or wants feedback on code quality.
metadata:
  last-used: "2026-04-04"
---

## Code Review

Runs a thorough code review by spawning two specialized sub-agents in parallel, then synthesizes their findings into a clear report.

### Steps

1. **Understand the scope.** Determine what code to review:
   - If the user specified files or a PR, use those.
   - If unstaged/staged changes exist, review those changes.
   - If nothing is specified, review the most recent commit or the current branch's diff against main/master.

2. **Run the review.** Use the Task tool to spawn these two sub-agents in parallel:
   - **`pr-test-analyser`** — Reviews test coverage quality and completeness.
     - Description: "Analyze test coverage"
     - Prompt: "Review the current code changes for test coverage quality and completeness. Check that tests exist for new/modified code, edge cases are covered, and test assertions are meaningful. Report any gaps."

   - **`silent-failure-analyser`** — Reviews for silent failures, inadequate error handling, and inappropriate fallback behavior.
     - Description: "Analyze error handling"
     - Prompt: "Review the current code changes for silent failures, inadequate error handling, and inappropriate fallback behavior. Look for swallowed errors, missing try/catch blocks, generic catch-alls that hide problems, and fallbacks that mask failures. Report any issues found."

3. **Collect findings.** Wait for both sub-agents to complete and gather their reports.

4. **Report findings.** Present a synthesized review to the user with this structure:

   ```
   ## Code Review Results

   ### Test Coverage (pr-test-analyser)
   - [Findings from the test analyser]

   ### Error Handling (silent-failure-analyser)
   - [Findings from the error handling analyser]

   ### Summary
   - [Brief overall assessment]
   - [Priority issues that should be addressed first]
   ```

   If either sub-agent finds no issues, state that clearly rather than leaving the section empty.

5. **Offer next steps.** If issues were found, ask the user if they want to address any of them.

**Incorrect:**

Running only one analyser, or running them sequentially when they could run in parallel. Reporting findings without clear attribution to which analyser found what.

**Correct:**

Spawning both `pr-test-analyser` and `silent-failure-analyser` in parallel using the Task tool, waiting for both to complete, then presenting a structured report that clearly separates test coverage findings from error handling findings, with a summary of priority issues.
