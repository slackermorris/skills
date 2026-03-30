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
import { join } from "path";

const THRESHOLD_DAYS = 14;

function getSkillsDir() {
  return process.env.SKILLS_DIR ?? join(process.env.HOME ?? "~", ".config", "opencode", "skills");
}

function getSkillFile(skillName) {
  return join(getSkillsDir(), skillName, "SKILL.md");
}

function extractLastUsed(content) {
  const match = content.match(
    /^---\s*\n.*?metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]*last-used:\s*"?([^"\n]+)"?/ms
  );
  return match ? match[1].trim() : null;
}

function updateLastUsed(filePath, today) {
  let content = readFileSync(filePath, "utf8");
  content = content.replace(
    /(metadata:\s*\n(?:[ \t]+[^\n]*\n)*?)([ \t]*last-used:\s*)"?[^"\n]+"?/,
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
  const dir = getSkillsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => existsSync(join(dir, name, "SKILL.md")));
}

function checkStaleSkills() {
  const missing = [];
  const stale = [];

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

  const lines = [
    "",
    "╔══════════════════════════════════════════╗",
    "║       Skills Housekeeping Notice        ║",
    "╚══════════════════════════════════════════╝",
  ];

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
  console.error(lines.join("\n"));
}

// ─── Plugin export ───────────────────────────────────────────────────────────

export const HousekeepingPlugin = async () => {
  return {
    // Update last-used when the skill tool is invoked
    "tool.execute.after": async (input) => {
      if (input.tool !== "skill") return;

      const skillName = input.args?.name;
      if (!skillName) return;

      const skillFile = getSkillFile(skillName);
      if (!existsSync(skillFile)) return;

      try {
        updateLastUsed(skillFile, todayISO());
      } catch {
        // Non-critical — silently skip
      }
    },

    // Check for stale skills when the session goes idle
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        try {
          checkStaleSkills();
        } catch {
          // Non-critical — silently skip
        }
      }
    },
  };
};
