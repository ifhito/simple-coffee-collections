# AGENTS.md

エージェント (Claude Code / Codex) と人間の共通運用メモ。
背景・設計方針は `@CLAUDE.md`、用語は `@docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` を正本とする。

## Stack

Next.js 15 App Router / TypeScript (strict) / pnpm / Jest / Playwright / Supabase / AI SDK 6.

## Commands

```
install      pnpm install --frozen-lockfile
typecheck    pnpm typecheck         # tsc --noEmit
lint         pnpm lint              # next lint
test         pnpm test              # jest (unit/integration)
e2e          pnpm test:e2e          # playwright
build        pnpm build
dev          pnpm dev
db:migrate   npx supabase migration up
```

## Boundaries

- 用語は `@docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` の正本に従う（例: `CoffeeEvaluation` ✓ / `CoffeeReview` ✗）。
- Clean Architecture 層依存: `domain ← application ← infrastructure / presentation`。`lib/domain/**` は外側を import しない。
- UI 文言は日本語、コードは英語。

## Workflow

1. ブランチ: `feature/<name>` / `fix/<name>` / `chore/<name>`
2. 変更は意味単位で行う（小さな修正でも別意図なら分ける）
3. 影響に応じて `pnpm typecheck` / `pnpm lint` / `pnpm test` を回す
4. 実装完了後、`memory-bank/progress.md` に 1 エントリ追記（形式は `@CLAUDE.md` 参照）
5. 将来また迷う設計判断のみ `docs/decisions/` に短く残す

## Forbidden

- `supabase db reset`（データ全消去）
- `git commit --no-verify` / `git push --force` / `git rebase -i`
- `.env` / `.env.local` / `secrets/**` の読書
- 用語集違反の命名（リファクタは Ubiquitous Language を最初に確認）

## Skills (shared with Codex)

`.agents/skills/` を一次格納とし、Claude Code は `.claude/skills/` の symlink から参照する。

- `coffee-ubiquitous-language` — 用語の正誤チェック
- `progress-logger` — `memory-bank/progress.md` 追記の正規化
- `clean-arch-boundary` — 層境界違反の確認

## References

- `@CLAUDE.md` — 設計方針 / WHY・HOW
- `@docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` — 用語の正本
- `@e2e/README.md` — E2E 実行手順
- `@memory-bank/progress.md` — 実装ログ
- `@docs/decisions/` — 設計判断の記録
