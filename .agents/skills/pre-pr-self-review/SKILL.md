---
name: pre-pr-self-review
description: PR 作成直前に呼ぶ。差分・規約・センサーをセルフチェックして指摘を返す
allowed-tools: Read, Grep, Glob, Bash
---

# Pre-PR Self Review

## When to use

`gh pr create` 直前、または `git push` 後にレビュー前提の品質を担保したいとき。

## Procedure

1. `git diff --stat main...HEAD` で差分の規模・範囲を把握する。
2. AGENTS.md の Conventions に違反していないか読み合わせる（用語・型・層境界）。
3. プログラム的チェック (`pnpm typecheck` / `pnpm lint --quiet` / `pnpm test --testPathPattern=__tests__/architecture`) を回す。
4. 残骸 (`console.log`, `.only`, `xit`, `debugger`) を grep で検出する。
5. `memory-bank/progress.md` に当日エントリがあるか確認する。
6. E2E (`*.spec.ts`) を変更した場合、固定 UI 文言依存 (`getByText`) の使用量を grep で確認し、`getByRole` / `getByTestId` への置換を検討する（過去に文言変更で複数回壊れたため）。
7. 結果を「✅ 通過 / ⚠️ 要修正」のセクションでまとめて返す。

詳細手順は `references/pre-pr-self-review.md` を参照。

## Output

- ✅ 通過項目を 1 行ずつ
- ⚠️ 要修正項目を「ファイル:行 + 理由 + 重大度 (high/medium/low)」付きで列挙
- 最後に PR 出してよいかの判定 1 行（GO / NO-GO）

## Forbidden

- セルフレビュー中にコード本体を変更しない（reviewer subagent と同じ読み取り専用スタンス）。
- `gh pr create` を勝手に実行しない（ユーザの明示指示を待つ）。
