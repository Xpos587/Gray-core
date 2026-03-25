#!/usr/bin/env bash
# Conventional Commits linter

commit_message_file="$1"
commit_message=$(cat "$commit_message_file")

# Check if commit message matches Conventional Commits format
# Format: <type>(<scope>): <description>
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
if ! echo "$commit_message" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{10,}'; then
  echo "❌ Invalid commit message format."
  echo "   Use: <type>(<scope>): <description>"
  echo "   Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
  echo "   Example: feat(proxy): add VLESS support for REALITY"
  echo ""
  echo "   Your message: $commit_message"
  exit 1
fi

exit 0
