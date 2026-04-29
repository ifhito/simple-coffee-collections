---
name: progress-logger
description: 実装後に `memory-bank/progress.md` に追記する 1 エントリのフォーマットを正規化する。CLAUDE.md の「継続記録ルール」に準拠。
---

# Progress Logger

## When to use

実装・修正・リファクタを完了した直後（コミット直前でもよい）。1 タスク = 1 エントリ。

## Format

```
### YYYY-MM-DD - 変更の要点（一行）
- What: 何を変えたか
- Why: なぜ変えたか
- Rejected: 却下した案（なければ省略）
- Next: 次に確認・改善すべき点
- Decision: docs/decisions/... があれば記載
```

## Rules

- エントリは短く（2〜6 行を目安）。
- 同じ意図の複数ファイル変更は 1 エントリにまとめてよい。
- 長い理由が必要なら本文ではなく `docs/decisions/<topic>.md` に切り出し、`Decision:` 行から参照する。
- 日付はローカル時間の YYYY-MM-DD。

## Output

`memory-bank/progress.md` の末尾に追記した内容を 1 ブロック分そのまま提示する。
