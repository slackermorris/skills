#!/usr/bin/env node
// teach-me companion server — serves the lesson + assets and bridges the
// "highlight a phrase to ask Claude" follow-up loop.
//
// When a question arrives it PUSHES the work to a fresh headless Claude
// (`claude -p …`) that consults RESOURCES.md, answers, and writes the answer
// file — no copy-paste, no polling loop on the teaching session's part. The
// browser polls only for the resulting answer and renders it in the page margin.
//
//   GET  /                -> index of lessons in this workspace
//   GET  /<path>          -> static file from the workspace (lesson .html, assets/, …)
//   POST /ask             -> log the question, spawn a Claude to answer it, return {id}
//   GET  /answers/:id     -> Claude's answer (questions/answers/<id>.md) once written, else 404
//
// Zero dependencies. Run from the workspace dir:  node serve.js   (or PORT=5174 node serve.js)
//
// Config (env):
//   PORT=5173            port to serve on
//   CLAUDE_BIN=claude    path to the claude CLI used to answer questions
//   ASK_AUTOANSWER=1     set to 0 to disable auto-answering (questions still log to the inbox)

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = __dirname;
const QUESTIONS_DIR = path.join(ROOT, "questions");
const INBOX = path.join(QUESTIONS_DIR, "inbox.jsonl");
const ANSWERS_DIR = path.join(QUESTIONS_DIR, "answers");
const PORT = Number(process.env.PORT || process.argv[2] || 5173);
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
const AUTOANSWER = process.env.ASK_AUTOANSWER !== "0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function ensureDirs() {
  fs.mkdirSync(ANSWERS_DIR, { recursive: true });
  if (!fs.existsSync(INBOX)) fs.writeFileSync(INBOX, "");
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Cache-Control": "no-store", ...headers });
  res.end(body);
}

// Count existing inbox lines so the next id is sequential & zero-padded.
function nextId() {
  let count = 0;
  try {
    const txt = fs.readFileSync(INBOX, "utf8");
    count = txt.split("\n").filter((l) => l.trim()).length;
  } catch {}
  return String(count + 1).padStart(4, "0");
}

// Push the question to a fresh headless Claude that answers it FROM RESOURCES.md
// and writes the answer file. Runs detached so the HTTP response returns at once.
function spawnAnswerer(entry) {
  if (!AUTOANSWER) return;
  const prompt =
    "A learner highlighted a phrase in a teach-me lesson and asked a follow-up.\n\n" +
    "Lesson file: " + (entry.context.lesson || "(the open lesson .html)") + "\n" +
    "Mission: " + (entry.context.missionSummary || "(general interest)") + "\n" +
    'Highlighted phrase: "' + entry.highlight + '"\n' +
    'Their question: "' + entry.question + '"\n\n' +
    "Answer it GROUNDED IN THE WORKSPACE'S RESOURCES.md — read RESOURCES.md and the " +
    "lesson first. Never answer from parametric memory; if the resources don't cover " +
    "it, use WebFetch/WebSearch as a fallback, preferring sources of the quality you'd " +
    "add to RESOURCES.md (and say so if you couldn't ground it). Pitch it at the " +
    "learner's level and keep it tight — a few short paragraphs of GitHub-flavored " +
    "markdown at most. Write your answer to questions/answers/" + entry.id + ".md and " +
    "change nothing else.";
  const args = [
    "-p", prompt,
    "--permission-mode", "acceptEdits",
    "--allowedTools", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "WebSearch",
  ];
  try {
    const child = spawn(CLAUDE_BIN, args, { cwd: ROOT, detached: true, stdio: "ignore" });
    child.on("error", function (err) {
      console.log(
        "  ⚠ could not spawn '" + CLAUDE_BIN + "' to answer [" + entry.id + "]: " +
          err.message + "\n  (set CLAUDE_BIN, or answer questions/answers/" + entry.id +
          ".md by hand)"
      );
    });
    child.unref();
    console.log("  → dispatched a Claude to answer [" + entry.id + "]");
  } catch (e) {
    console.log("  ⚠ spawn failed for [" + entry.id + "]: " + e.message);
  }
}

function handleAsk(req, res) {
  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 1e6) req.destroy(); // basic guard
  });
  req.on("end", () => {
    let payload;
    try {
      payload = JSON.parse(raw || "{}");
    } catch {
      return send(res, 400, JSON.stringify({ error: "invalid json" }), {
        "Content-Type": MIME[".json"],
      });
    }
    const id = nextId();
    const entry = {
      id,
      ts: new Date().toISOString(),
      status: "pending",
      question: String(payload.question || "").slice(0, 4000),
      highlight: String(payload.highlight || "").slice(0, 4000),
      context: {
        lesson: String(payload.context?.lesson || ""),
        title: String(payload.context?.title || ""),
        missionSummary: String(payload.context?.missionSummary || ""),
      },
      anchorText: String(payload.anchorText || payload.highlight || "").slice(0, 400),
    };
    fs.appendFileSync(INBOX, JSON.stringify(entry) + "\n");
    console.log(
      `\n✨ New question [${id}] on ${entry.context.lesson || "?"}\n` +
        `   highlight: ${entry.highlight.slice(0, 120)}\n` +
        `   Q: ${entry.question}\n` +
        `   -> answer by writing questions/answers/${id}.md\n`
    );
    spawnAnswerer(entry);
    send(res, 200, JSON.stringify({ id }), { "Content-Type": MIME[".json"] });
  });
}

function handleAnswer(res, id) {
  if (!/^\d{1,8}$/.test(id)) return send(res, 400, "bad id");
  const file = path.join(ANSWERS_DIR, `${id}.md`);
  if (!fs.existsSync(file)) return send(res, 404, "not yet");
  send(res, 200, fs.readFileSync(file), { "Content-Type": MIME[".md"] });
}

function lessonsIndex() {
  let items = [];
  try {
    items = fs
      .readdirSync(ROOT)
      .filter((f) => f.endsWith(".html"))
      .sort();
  } catch {}
  const links = items.length
    ? items.map((f) => `<li><a href="/${f}">${f}</a></li>`).join("\n")
    : "<li><em>No lessons yet.</em></li>";
  return `<!doctype html><meta charset="utf-8"><title>Lessons</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:42rem;margin:4rem auto;padding:0 1rem}
h1{font-weight:600}a{color:#2f6f4f}li{margin:.3rem 0}</style>
<h1>Lessons</h1><ul>${links}</ul>`;
}

function serveStatic(res, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const filePath = path.normalize(path.join(ROOT, decoded));
  if (!filePath.startsWith(ROOT)) return send(res, 403, "forbidden");
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, "not found");
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  if (req.method === "POST" && url === "/ask") return handleAsk(req, res);
  const answerMatch = url.match(/^\/answers\/([^/?]+)/);
  if (req.method === "GET" && answerMatch) return handleAnswer(res, answerMatch[1]);
  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    return send(res, 200, lessonsIndex(), { "Content-Type": MIME[".html"] });
  }
  if (req.method === "GET") return serveStatic(res, url);
  send(res, 405, "method not allowed");
});

ensureDirs();
server.listen(PORT, () => {
  console.log(`\nteach-me workspace serving at http://localhost:${PORT}`);
  console.log(`  questions land in: questions/inbox.jsonl`);
  console.log(`  answers are written to: questions/answers/<id>.md\n`);
});
