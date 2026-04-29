#!/usr/bin/env bash
#
# Stop hook helper:
# - 直近の差分が OCR 関連コードに触れているかを判定
# - 触れていれば `pnpm eval --smoke` を実行（先頭 3 件だけ走らせて速度を確保）
# - 触れていなければ何もしない
# - ANTHROPIC_API_KEY が無ければ警告して exit 0（ローカル開発時にコストを発生させない）

set -euo pipefail

# tracked + staged + untracked を全て拾う
changed=$(git status --porcelain 2>/dev/null | awk '{print $NF}')

if ! echo "$changed" | grep -qE '^(lib/mastra/|lib/application/ocr/|lib/infrastructure/ocr/|evals/)'; then
  exit 0
fi

if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo "[evals] AI 関連コードが変更されたが ANTHROPIC_API_KEY 未設定。'pnpm eval' を手動実行してください。"
  exit 0
fi

echo "[evals] AI 関連コード変更を検知。smoke eval (3 件) を実行します..."
exec pnpm eval --smoke
