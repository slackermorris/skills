---
name: feed-clanker
description: Capture raw session output from an AI agent conversation and write it to ~/Documents/Clanker/raw. Use this skill whenever the user says "/feed-clanker", "feed clanker", "save session to clanker", "export to clanker", or wants to capture agent output/session data for downstream processing.
disable-model-invocation: true
---

## Feed Clanker

Captures a comprehensive snapshot of the current agent session — including what was built, decisions made, tools used, and outputs produced — and writes it as a raw markdown file to `~/Documents/Clanker/raw/`. This feeds the Clanker pipeline with raw session material for further processing.

The goal is to capture *enough* that Clanker can reconstruct what happened without needing to re-read the conversation. Lean toward including more rather than less.

### Steps

1. **Capture session content:**
   - What the user asked for / the goal of the session
   - What was built, written, or changed (include file paths)
   - Key decisions and the reasoning behind them
   - Tools invoked and their outputs (summarize, don't transcribe verbatim)
   - Any errors encountered and how they were resolved
   - Open questions or follow-ups
   - The working directory and project context

2. **Generate the filename** using the current timestamp:
   ```
   YYYY-MM-DD-HH-MM.md
   ```
   Use 24-hour time. Example: `2026-04-06-14-32.md`

3. **Ensure the output directory exists:**
   ```bash
   mkdir -p ~/Documents/Clanker/raw
   ```

4. **Write the file** to `~/Documents/Clanker/raw/YYYY-MM-DD-HH-MM.md` using this format:

   ```
   ---
   captured_at: YYYY-MM-DD HH:MM
   project: {current working directory name}
   branch: {git branch if available, else "none"}
   ---

   ## Session Goal
   {what the user wanted to accomplish}

   ## What Was Done
   {concrete summary of actions taken — files created/modified, commands run, etc.}

   ## Key Decisions
   - {decision}: {reasoning}

   ## Outputs
   - {file paths, URLs, artifacts produced}

   ## Tools & Commands Used
   - {notable tool calls and their results}

   ## Errors & Resolutions
   - {any errors hit and how they were fixed, or "none"}

   ## Open Questions / Follow-ups
   - {unresolved items, or "none"}
   ```

5. **Write immediately** — no need to ask for a topic name or confirmation. The timestamp filename is sufficient. Just write the file and confirm to the user with the path.

**Incorrect:**

Writing a vague summary ("did some coding", "worked on the API") or just repeating what the user asked without capturing what actually happened. Omitting file paths, specific error messages, or the reasoning behind decisions.

**Correct:**

Writing with specifics: "Session goal: Add JWT auth to the Express API. What was done: Created `src/middleware/auth.ts`, updated `src/routes/user.ts` to use it, added `jsonwebtoken` dependency. Key decisions: Used RS256 (not HS256) because the tokens need to be verifiable by a separate service without sharing a secret. Errors: Initial implementation threw 'invalid algorithm' — fixed by passing `{ algorithms: ['RS256'] }` to `jwt.verify`."
