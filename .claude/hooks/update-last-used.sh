#!/usr/bin/env bash
# update-last-used.sh — PostToolUse hook
# Reads the tool event from stdin. If the tool was "Skill", updates
# metadata.last-used in the skill's SKILL.md.

set -euo pipefail

input=$(cat)

tool_name=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null || true)

if [ "$tool_name" != "Skill" ]; then
  exit 0
fi

skill_name=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('skill',''))" 2>/dev/null || true)

if [ -z "$skill_name" ]; then
  exit 0
fi

skills_dir="${SKILLS_DIR:-$HOME/.claude/skills}"
skill_file="$skills_dir/$skill_name/SKILL.md"

if [ ! -f "$skill_file" ]; then
  exit 0
fi

today=$(date +%Y-%m-%d)
tmp_file=$(mktemp)

awk -v today="$today" '
  /^metadata:/ { in_meta=1; print; next }
  in_meta && /^[^ \t]/ { in_meta=0 }
  in_meta && /last-used:/ {
    line = $0
    sub(/last-used:.*/, "last-used: \"" today "\"", line)
    print line
    next
  }
  { print }
' "$skill_file" > "$tmp_file"

mv "$tmp_file" "$skill_file"

exit 0
