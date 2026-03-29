#!/usr/bin/env bash
# housekeeping.sh — checks for stale skills at end of session (Stop hook)
# Emits a warning to stderr if any skill has not been used in over 14 days.
# Install: copy to ~/.claude/hooks/ and register in ~/.claude/settings.json (see README).

set -euo pipefail

SKILLS_DIR="$HOME/.claude/skills"

if [ ! -d "$SKILLS_DIR" ]; then
  exit 0
fi

TODAY=$(date +%s)
STALE_SKILLS=()
MISSING_DATE_SKILLS=()
THRESHOLD_DAYS=14
THRESHOLD_SECONDS=$(( THRESHOLD_DAYS * 86400 ))

for skill_file in "$SKILLS_DIR"/*/SKILL.md; do
  [ -f "$skill_file" ] || continue

  skill_name=$(basename "$(dirname "$skill_file")")

  # Extract last-used from metadata block using awk:
  # Look for "metadata:" block then grab the "last-used:" value on the following lines.
  last_used=$(awk '
    /^metadata:/ { in_meta=1; next }
    in_meta && /^[^ ]/ { in_meta=0 }
    in_meta && /last-used:/ {
      gsub(/.*last-used:[[:space:]]*"?/, ""); gsub(/".*/, ""); print; exit
    }
  ' "$skill_file")

  if [ -z "$last_used" ]; then
    MISSING_DATE_SKILLS+=("$skill_name")
    continue
  fi

  # Parse date — handle both macOS (BSD) and Linux (GNU) date
  if date -j &>/dev/null 2>&1; then
    # macOS/BSD date
    skill_epoch=$(date -j -f "%Y-%m-%d" "$last_used" "+%s" 2>/dev/null || echo "")
  else
    # GNU date
    skill_epoch=$(date -d "$last_used" "+%s" 2>/dev/null || echo "")
  fi

  [ -z "$skill_epoch" ] && continue

  age_seconds=$(( TODAY - skill_epoch ))
  if [ "$age_seconds" -gt "$THRESHOLD_SECONDS" ]; then
    STALE_SKILLS+=("$skill_name (last used: $last_used)")
  fi
done

if [ ${#STALE_SKILLS[@]} -gt 0 ] || [ ${#MISSING_DATE_SKILLS[@]} -gt 0 ]; then
  echo "" >&2
  echo "╔══════════════════════════════════════════════════╗" >&2
  echo "║           Skills Housekeeping Notice             ║" >&2
  echo "╚══════════════════════════════════════════════════╝" >&2

  if [ ${#STALE_SKILLS[@]} -gt 0 ]; then
    echo "" >&2
    echo "Skills not used in the last $THRESHOLD_DAYS days:" >&2
    for s in "${STALE_SKILLS[@]}"; do
      echo "  • $s" >&2
    done
    echo "" >&2
    echo "Consider removing these skills or updating their last-used date if still in use." >&2
  fi

  if [ ${#MISSING_DATE_SKILLS[@]} -gt 0 ]; then
    echo "" >&2
    echo "Skills with no last-used date:" >&2
    for s in "${MISSING_DATE_SKILLS[@]}"; do
      echo "  • $s" >&2
    done
  fi

  echo "" >&2
fi

exit 0
