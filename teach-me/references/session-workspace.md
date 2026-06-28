# Session Workspace — Where This Session's Files Live

This is a **single teaching session**, not a persisted course. Nothing here is meant to resume next time — there's no progress to track and no curriculum to pick back up. The workspace just gives the session's files a place to live while it's running.

## Where

A working directory for this session's topic. Default:

```
$TEACH_ME_DIR/<topic-slug>/        # $TEACH_ME_DIR defaults to ~/teach-me
```

`<topic-slug>` is a short kebab-case slug derived from what the user asked to learn (`kubernetes-networking`, `barbell-deadlift`, `french-subjunctive`). If a directory for the topic already exists from a previous session, you may reuse the `RESOURCES.md` in it (resource curation is expensive and worth keeping) — but you do **not** resume teaching from where a past session left off. Start the session fresh.

## Layout

```
<topic-slug>/
├── RESOURCES.md          # curated trusted sources (see resources.md)
├── serve.js              # Node companion server (copied from the skill's assets/)
├── assets/               # lesson.css, ask-claude.css, ask-claude.js, quiz.js (copied in)
├── <lesson>.html         # the lesson(s) built this session; link /assets/... root-absolute
└── questions/            # the ask-claude inbox + answers (created at runtime)
    ├── inbox.jsonl       # one line per question the learner submits
    └── answers/<id>.md   # one answer file per question (rendered in the page margin)
```

**Components are copied into the workspace, not inlined.** On the first lesson of a fresh workspace, scaffold it by copying the skill's `assets/` (`lesson.css`, `ask-claude.css`, `ask-claude.js`, `quiz.js`) into `./assets/` and the skill's `assets/serve.js` into `./serve.js`. Lessons then link `/assets/...` with root-absolute paths. See `../assets/README.md`.

The lesson is **served by `node serve.js` rooted at this directory** (not opened as a `file://` page), so the ask-claude widget can POST questions and the page can fetch answers. The push-based answer loop (server spawns a headless Claude that grounds in `RESOURCES.md` and writes `questions/answers/<id>.md`) is in `ask-protocol.md`.

## RESOURCES.md

The one file worth keeping. It holds the curated, high-trust sources you teach from and that ground every in-page answer. It is also the only durable value a session leaves behind, so if the user revisits the topic later, reusing it saves re-scouting. Format and rules: `resources.md`.
