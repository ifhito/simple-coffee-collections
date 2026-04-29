#!/usr/bin/env bash
#
# UserPromptSubmit hook:
# ユーザのプロンプトに `{{...}}` プレースホルダが含まれていれば、
# Claude に「テンプレと実態を突き合わせてから実装する」リマインダを注入する。
#
# 入力: stdin に user prompt（または JSON）
# 出力: stdout に追加コンテキスト（Claude が読む）
# 終了コード: 0 (常に通す。検出時のみリマインダを出すだけ)

set -euo pipefail

input=$(cat)

if echo "$input" | grep -qE '\{\{'; then
  cat <<'EOF'
<harness-reminder source="detect-template-placeholder">
ユーザのプロンプトに {{...}} 形式のプレースホルダを検出しました。これらは「テンプレ例」であり、リテラルな実装ターゲットではない可能性が高いです。

実装に取り掛かる前に:
1. リポジトリを観察し、プレースホルダ種別に該当する実態（実エンドポイント、実 AI 機能、実ワークフロー等）を特定する
2. 例とリポジトリ実態が乖離していたら、スコープをユーザに 1 度確認する
3. 「観察根拠」を提案に 1 行添える（例: "git log で N 件観測されたため"）

過去の事故記録: docs/agent-onboarding.md / harness-debt.md (D-01) を参照。
</harness-reminder>
EOF
fi

exit 0
