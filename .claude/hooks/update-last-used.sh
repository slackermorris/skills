#!/usr/bin/env bash
# update-last-used.sh — updates metadata.last-used in a skill's SKILL.md (PostToolUse hook)
# Triggered after the Skill tool fires, to keep last-used timestamps current.
# Install: copy to ~/.claude/hooks/ and register in ~/.claude/settings.json (see README).

set -euo pipefail

SKILLS_DIR="${SKILLS_DIR:-$HOME/Code/skills}"

# Claude Code passes event data as JSON on stdin
input=$(cat)

# Extract the skill name from the tool input
skill_name=$(echo "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null || true)

if [ -z "$skill_name" ]; then
  exit 0
fi

skill_file="$SKILLS_DIR/$skill_name/SKILL.md"

if [ ! -f "$skill_file" ]; then
  exit 0
fi

today=$(date +%Y-%m-%d)

# Update last-used in the metadata block using awk.
# Handles:
#   metadata:
#     last-used: "YYYY-MM-DD"   (with or without quotes)
tmp_file=$(mktemp)

awk -v today="$today" '
  /^metadata:/ { in_meta=1; print; next }
  in_meta && /^[^ \t]/ { in_meta=0 }
  in_meta && /last-used:/ {
    # Replace the value, preserving indentation
    match($0, /^([[:space:]]*)last-used:/, arr)
    print arr[1] "last-used: \"" today "\""
    next
  }
  { print }
' "$skill_file" > "$tmp_file"

mv "$tmp_file" "$skill_file"

exit 0
