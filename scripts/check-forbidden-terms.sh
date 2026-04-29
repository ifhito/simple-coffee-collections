#!/usr/bin/env bash
#
# Stop hook helper: check for Ubiquitous Language violations in changed files.
# - 変更された .ts / .tsx / .md / .sql に対し、禁止語が含まれていないか grep
# - 違反があれば exit 1（Stop hook の他のチェックと同じ扱い）
# - 違反が無ければ silent exit 0

set -euo pipefail

changed=$(git status --porcelain 2>/dev/null \
  | awk '{print $NF}' \
  | grep -E '\.(ts|tsx|md|sql)$' \
  | grep -vE '^(\.agents/skills/coffee-ubiquitous-language/|docs/UBIQUITOUS_LANGUAGE|harness-(debt|evidence|backlog|audit)\.md|docs/agent-onboarding\.md|scripts/check-forbidden-terms\.sh)' \
  || true)

if [ -z "$changed" ]; then
  exit 0
fi

# 識別子レベルの禁止語のみ。自然文の "review" は false positive を生むので拾わない。
# 追加するときは docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md と整合を取ること。
PATTERN='\bCoffeeReview\b|\bcoffee_review\b'

violations=""
while IFS= read -r file; do
  [ -f "$file" ] || continue
  if matches=$(grep -nE "$PATTERN" "$file" 2>/dev/null); then
    violations+="$file:\n$matches\n"
  fi
done <<< "$changed"

if [ -n "$violations" ]; then
  echo "[ubiquitous-language] forbidden terms detected (see docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md):"
  echo -e "$violations"
  echo "Use 'CoffeeEvaluation' / 'coffee_evaluations' instead."
  exit 1
fi

exit 0
