# Progress Log

実装のたびに追記する短いログです。長い議事録にはしません。

## Entry Template

### YYYY-MM-DD - 変更の要点（一行）
- What: 何を変えたか
- Why: なぜ変えたか
- Rejected: 却下した案（なければ省略）
- Next: 次に確認・改善すべき点
- Decision: `docs/decisions/...` があれば記載。なければ省略

## Entries

### 2026-03-11 - 評価スコアの永続化型を明示して null 表現を共通化
- What: `EvaluationRatings` の永続化用型を `RatingsPersistence` / `NullRatingsPersistence` として切り出し、未評価豆の null 値を `NULL_PERSISTENCE` に集約。`CoffeeEvaluation.toPersistence()` もその型を返すように整理
- Why: 評価あり/なしの永続化形を型で明示し、null オブジェクトの重複定義を避けるため
- Rejected: `CoffeeEvaluation` 側で匿名オブジェクトのまま null 値を都度組み立てる案。型の意図が見えにくく重複も残るため不採用

### 2026-03-11 - 初期テンプレート追加
- What: `AGENTS.md` の運用に合わせて progress ログの雛形を追加
- Why: 小さな修正も同じ粒度で残せるようにするため
- Rejected: issue や PR 本文だけを記録源にする案。検索しづらく、日常運用で抜けやすいため不採用

### 2026-03-11 - CLAUDE.md に継続記録ルールを追加、progress.md テンプレートに Next フィールドを追加
- What: CLAUDE.md v1.2.0 に「Continuous Recording」セクション追加。progress.md の Entry Template に `Next:` フィールドを追加
- Why: 小さな修正を意味単位で記録し、Claude が毎回同じルールで作業できるようにするため
- Rejected: AGENTS.md を別途作成する案 — CLAUDE.md に統合した方が Claude が確実に読む
- Next: 実際の開発作業でエントリーが適切な粒度で記録されているか運用確認
