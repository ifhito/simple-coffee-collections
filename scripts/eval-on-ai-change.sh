#!/usr/bin/env bash
#
# Stop hook helper:
# - 直近の差分が OCR 関連コードに触れているかを判定
# - 触れていれば `pnpm eval --smoke` を実行（先頭 3 件だけ走らせて速度を確保）
# - 触れていなければ何もしない
# - Ollama が起動していない場合はメッセージを出して exit 0（ローカル開発をブロックしない）

set -euo pipefail

# tracked + staged + untracked を全て拾う
changed=$(git status --porcelain 2>/dev/null | awk '{print $NF}')

if ! echo "$changed" | grep -qE '^(lib/mastra/|lib/application/ocr/|lib/infrastructure/ocr/|evals/)'; then
  exit 0
fi

OLLAMA_BASE_URL="${EVAL_OLLAMA_BASE_URL:-http://localhost:11434/v1}"
OLLAMA_HEALTH="${OLLAMA_BASE_URL%/v1}"

if ! curl -sf "${OLLAMA_HEALTH}/api/tags" >/dev/null 2>&1; then
  echo "[evals] AI 関連コード変更を検知したが Ollama (${OLLAMA_HEALTH}) に接続不可。"
  echo "[evals] 'ollama serve' を起動してから 'pnpm eval' を手動実行してください。"
  exit 0
fi

echo "[evals] AI 関連コード変更を検知。Ollama で smoke eval (3 件) を実行します..."
exec pnpm eval --smoke
