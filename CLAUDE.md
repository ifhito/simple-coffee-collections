# CLAUDE.md

エージェント (Claude Code / Codex) と人間の共通運用メモ。本ファイルが正本（SSoT）で、AGENTS.md からは `@CLAUDE.md` で参照される。
用語は `@docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` を正本とする。

## Stack

Next.js 15 (App Router) / TypeScript 5 strict on Node.js 20、Supabase (PostgreSQL + Auth)、Vercel AI SDK 6、パッケージマネージャは pnpm 10。

## Build & Test

```
install      pnpm install --frozen-lockfile
dev          pnpm dev
test         pnpm test            # Jest unit/integration; pnpm test:e2e for Playwright
typecheck    pnpm typecheck       # tsc --noEmit
lint         pnpm lint            # next lint
format       pnpm lint --fix      # 専用 formatter なし、ESLint --fix のみ
```

## Conventions

- 用語は `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` を正本にコードと UI で揃える。なぜ: 同概念に別語を当てると DB / API / UI で見え方が割れ、毎回「別物か？」の判断コストが乗るため。
- 型定義は `type` のみ（`interface` 禁止 / lint 強制）。なぜ: 既に 75% が `type` で、`type` は union/intersection を含めて `interface` を機能的に包含するため統一コスト最小（詳細 `docs/decisions/2026-04-29-type-vs-interface.md`）。
- Clean Architecture の依存は `domain ← application ← infrastructure / presentation` の単方向のみ。なぜ: 双方向化すると変更影響が指数的に増え、テスト境界も曖昧になるため。
- 実装後は `memory-bank/progress.md` に 1 エントリ追記（What / Why / Rejected / Next 形式）。なぜ: コミットメッセージには「却下案」「次の課題」が残らず、将来の自分やエージェントが読める情報が失われるため。
- 再迷走しそうな設計判断は `docs/decisions/<date>-<topic>.md` に残す。なぜ: 命名・責務分割の判断はコードを読んでも復元できず、判断の粒度を ADR より細かく取りたいため。
- UI 文言は日本語、コード・コメント・コミットメッセージは英語または日本語。なぜ: ユーザー文脈は日本語固定だが、技術用語は英語の方が型定義・ライブラリ検索で当たりやすいため。
- Use the researcher subagent when you need to locate code patterns; never grep yourself in the parent context. なぜ: 大量の grep 結果が親 context window を圧迫し、後続判断の精度が落ちるため。

## Workflow & PR rules

- **Proactive Surfacing**: タスクの節目では Claude 自身が「他にやった方が良い follow-up は?」を自問し、ルール化されていない案件は実行前に一行で確認する (`〜しますか?`)。OK なら実行 + その場でルール化 (`feedback_<topic>.md` 作成 + `MEMORY.md` 索引追加)。なぜ: 受動的な指示遂行ではなく能動的な協働、かつ「同じ確認を 2 度させない」学習ループのため。
- **Auto-PR (昇格済みルール — 2026-04-29 承認)**: タスク完了後は明示指示なしで新規ブランチ作成 → commit → push → `gh pr create` まで自動実行。PR 本文に Summary / Test plan を含める。destructive 操作のみ事前確認。
- **All PRs target main (昇格済みルール — 2026-04-30 承認)**: PR の base branch は **必ず `main`**。stacked PR (他 feature ブランチ向け PR) は禁止。なぜ: 中間ブランチ向け merge ボタンを押すと main に届かず孤児 PR が増える事故が発生したため (#48〜#54 が main に取り込めなかった事例)。依存関係がある作業も、先行 PR を main にマージしてから次 PR を main 向けに切る。
- **TDD**: 振る舞い変更は Test → Fail → Implement → Pass → Refactor の順。新規機能は 80%+ カバレッジを目標にする。

## Programmatic checks the agent MUST run before finishing

1. `pnpm typecheck` — 型エラーゼロを保証する。Stop hook でも自動実行されるが、終了前に明示確認する。
2. `pnpm lint --quiet` — `consistent-type-definitions` などプロジェクトルール違反ゼロを保証する。
3. `pnpm test --testPathPattern=__tests__/architecture` — Clean Arch 層境界違反ゼロを保証する（< 1 秒）。
4. 振る舞い変更を伴う場合は `pnpm test` 全体（66 suites / 503 tests）で回帰を確認する。
5. UI 変更を含む場合は `pnpm dev` でブラウザ動作確認、または `pnpm test:e2e` で関連シナリオを通す。

## Out of scope

- `.env` / `.env.local` / `secrets/**` — 読み・書き・コミットいずれも禁止。
- `supabase db reset` — データ全消去のため絶対に実行しない（過去事故あり）。
- `git commit --no-verify` / `git push --force` / `git rebase -i` — フックスキップ・履歴破壊系は明示許可なき限り禁止。
- `pnpm-lock.yaml` の手動編集 — 必ず `pnpm` 経由で更新する。
- `next-env.d.ts` — Next.js が自動生成するため触らない。
- 適用済みの `supabase/migrations/*.sql` のリネーム・編集 — 既存マイグレーションは不変、新ファイルを足す形で対応する。
- main 以外の base ブランチを指定した PR 作成 — `gh pr create --base <other>` は使わない。

## Claude-specific

`.claude/skills/` のスキルは description だけでなく状況に合致したら能動的に呼び出す:

- `coffee-ubiquitous-language` / `progress-logger` / `clean-arch-boundary` — リポジトリ固有の運用支援
- `nextjs-best-practices` / `e2e-testing` / `sudo-modeling` / `claude-md-creator` — 設計・テスト・モデリング

## More context (load on demand)

- `@docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` — ドメイン用語の正本
- `@docs/decisions/` — 過去の設計判断
- `@memory-bank/progress.md` — 実装ログ
- `@e2e/README.md` — Playwright E2E 実行手順
- `@.claude/agents/` — サブエージェント定義 (researcher / reviewer / tester ほか)
- `@.agents/skills/` — Claude / Codex 共通 SKILL
