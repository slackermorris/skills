// housekeeping.js — OpenCode plugin for skills housekeeping
//
// Handles two lifecycle events:
//   tool.execute.after  → updates metadata.last-used in SKILL.md when a skill is invoked
//   session.idle        → warns about skills not used in over 14 days
//
// Install: copy to ~/.config/opencode/plugins/ (auto-discovered by OpenCode).
// Requires SKILLS_DIR env var pointing to your skills repo (add to ~/.zshrc).
//
// See README for full installation instructions.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const THRESHOLD_DAYS = 14;
const SKILLS_DIR = process.env.SKILLS_DIR ?? join(process.env.HOME ?? "~", "Code", "skills");

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSkillFile(skillName) {
  return join(SKILLS_DIR, skillName, "SKILL.md");
}

function extractLastUsed(content) {
  // Parse the last-used value from the metadata block in YAML frontmatter.
  // Handles:
  //   metadata:
  //     last-used: "YYYY-MM-DD"
  const match = content.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+last-used:\s*"?([^"\n]+)"?/m);
  return match ? match[1].trim() : null;
}

function updateLastUsed(filePath, today) {
  let content = readFileSync(filePath, "utf8");
  // Replace last-used value inside the metadata block, preserving indentation
  content = content.replace(
    /(^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?)([ \t]+last-used:\s*)"?[^"\n]+"?/m,
    (_, before, indent) => `${before}${indent}"${today}"`
  );
  writeFileSync(filePath, content, "utf8");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(dateStr) {
  const then = Date.parse(dateStr);
  if (isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function getSkillNames() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => existsSync(join(SKILLS_DIR, name, "SKILL.md")));
}

// ─── Plugin export ───────────────────────────────────────────────────────────

export default async function plugin(ctx) {
  // Update last-used when a skill tool fires
  ctx.on("tool.execute.after", (event) => {
    // OpenCode exposes skill invocations — match tool names that look like skill calls.
    // The tool name format may vary; adjust the condition below if needed.
    const toolName = event?.tool?.name ?? "";
    const skillName = event?.tool?.input?.skill ?? event?.tool?.input?.name ?? null;

    if (!skillName) return;

    const skillFile = getSkillFile(skillName);
    if (!existsSync(skillFile)) return;

    try {
      updateLastUsed(skillFile, todayISO());
    } catch {
      // Non-critical — silently skip
    }
  });

  // Check for stale skills when the session goes idle
  ctx.on("session.idle", () => {
    if (!existsSync(SKILLS_DIR)) return;

    const stale = [];
    const missing = [];

    for (const skillName of getSkillNames()) {
      const skillFile = getSkillFile(skillName);
      const content = readFileSync(skillFile, "utf8");
      const lastUsed = extractLastUsed(content);

      if (!lastUsed) {
        missing.push(skillName);
        continue;
      }

      const age = daysSince(lastUsed);
      if (age !== null && age > THRESHOLD_DAYS) {
        stale.push(`${skillName} (last used: ${lastUsed})`);
      }
    }

    if (stale.length === 0 && missing.length === 0) return;

    const lines = ["", "╔══════════════════════════════════════════╗", "║       Skills Housekeeping Notice        ║", "╚══════════════════════════════════════════╝"];

    if (stale.length > 0) {
      lines.push("", `Skills not used in the last ${THRESHOLD_DAYS} days:`);
      for (const s of stale) lines.push(`  • ${s}`);
      lines.push("", "Consider removing these skills or updating their last-used date.");
    }

    if (missing.length > 0) {
      lines.push("", "Skills with no last-used date:");
      for (const s of missing) lines.push(`  • ${s}`);
    }

    lines.push("");

    // OpenCode displays ctx.notify() messages in the session UI
    ctx.notify(lines.join("\n"));
  });
}
