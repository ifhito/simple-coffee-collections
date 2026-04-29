# Harness Audit — simple-coffee-collections

実施日: 2026-04-29
対象: `simple-coffee-collections` (Next.js / Coffee journal app)
モード: Read-only

---

## 1. 環境スナップショット

| 項目 | 値 |
|---|---|
| 言語 | TypeScript 5.x (`strict: true`, `target: ES2017`) |
| フレームワーク | Next.js 15 (App Router) + React 19 |
| パッケージマネージャ | **pnpm** (10系, `pnpm-lock.yaml` あり) |
| テストランナー | Jest 29 (`jest-environment-jsdom`) + Playwright 1.58 (E2E) |
| リンタ | ESLint 9 + `next/core-web-vitals` |
| 型チェッカ | TypeScript (但し `package.json` に `typecheck` スクリプトなし) |
| フォーマッタ | 設定なし (Prettier / Biome 等は未導入) |
| DB | Supabase (ローカル: `127.0.0.1:54321`) |
| LLM/AI | Mastra 1.x + Vercel AI SDK 6 (`@ai-sdk/{anthropic,google,openai-compatible}`) |
| デプロイ | Vercel (本番: `coffee-collections.uk`) |
| 構成 | **単一リポジトリ**（`pnpm-workspace.yaml` は存在するが `allowBuildScripts` 用、ワークスペース機能は未使用） |

---

## 2. 既存のエージェント関連ファイル

| ファイル | 行数 | 状態 |
|---|---|---|
| `AGENTS.md` | 64行 | 良好。日々の運用 (Working Rules / Progress / Decision Records) を担当 |
| `CLAUDE.md` | 78行 | 良好。WHY/WHAT/HOW + 用語集ルール + 継続記録ルール |
| `.cursorrules` | なし | — |
| `.github/copilot-instructions.md` | なし | — |
| `.claude/settings.json` | 6行 | プラグイン有効化と `plansDirectory` のみ。**permissions / hooks 未設定** |
| `.claude/settings.local.json` | 23行 | `Bash(...)` allow リストが個人別に肥大化。**deny / ask 未設定** |
| `.claude/skills/` | 4個 | `claude-md-creator` / `nextjs-best-practices` / `e2e-testing` / `sudo-modeling` |
| `.claude/agents/` | 2個 | `nextjs-tdd-implementer` / `supabase-db-designer` |
| `.claude/commands/tdd.md` | 1個 | スラッシュコマンド (TDDサイクルガイド) |
| `.claude/rules/testing.md` | 1個 | 80% カバレッジ要件 |
| `.agents/skills/` | 1個 | `cmux-handoff-orchestrator`（Codex/cmux 連携用） |
| `.mcp.json` | 4行 | `spec-workflow` MCP のみ |

---

## 3. CI 設定 (`.github/workflows/ci.yml`)

PR 起動: `pnpm install` → Supabase 起動 → `pnpm test:coverage` → `pnpm test:e2e`
main push: Supabase migrations 適用 + email template 配信

**ギャップ:**
- `pnpm lint` を CI で**実行していない**
- `tsc --noEmit` 相当の型検査を**実行していない**
- アーキテクチャ境界 (Clean Arch/DDD layer dependency) のテスト**なし**

---

## 4. プロジェクト固有の慣習（業界標準と異なる点）

| 慣習 | 業界標準 | このリポジトリ |
|---|---|---|
| 進捗ログ | コミットメッセージ + PR description で完結 | **`memory-bank/progress.md` に追記必須** (CLAUDE.md L57-65) |
| 設計判断 | ADR (Architecture Decision Records) | **`docs/decisions/`** (ADR とほぼ同型だが、起票基準が「将来も迷い直すか」) |
| 用語 | コードと UI を統一 (英語のみ等) | **コードは英語 / UI は日本語の二層構造**。`docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` が正本 |
| 命名 | 一般用語 (`Review`, `Rating`) | **`CoffeeEvaluation` (✓) / `CoffeeReview` (✗)** — Ubiquitous Language で統制 |
| エラー処理 | `try/catch` + ロギング | （観察された限り）特殊な慣習なし。Server Actions で Result-like を返すパターンは部分的 |
| commit message | Conventional Commits | 概ね `chore:` / `fix:` プレフィクス使用、ただし型は緩め |
| ブランチ | `feature/...` | `feature/<name>` (`CLAUDE.md` L31) |
| TDD | 任意 | **80% カバレッジ必須** (`.claude/rules/testing.md`) |

---

## 5. リスクとギャップ

1. **secret 漏洩リスク**: `.env.local` がリポジトリ直下に存在。`.claude/settings.json` の `permissions.deny` に `.env*` / `secrets/**` を未指定。
2. **destructive 操作リスク**: `supabase db reset` 全消去事故が運用メモにあり (MEMORY.md)。Bash deny に未組込。
3. **Stop hook 不在**: 型検査・lint・テストが PR まで走らない → エージェント完了時のセンサーが無い。
4. **指示の重複**: `CLAUDE.md` L37-41 と `AGENTS.md` L20-26 で「Ubiquitous Language を守る」「変更は意味単位」が重複。**ETHチューリッヒ研究的には、重複指示は性能を下げるノイズ**。
5. **Codex 互換性**: `AGENTS.md` は Codex も読むが、`.claude/skills/` を Codex は知らない。`.agents/skills/` 経由のシンボリックリンク方式で共通化可能。
6. **`.claude/settings.local.json` の allow リスト**が個人ローカルで肥大化中（gitignore 済み）。プロジェクトレベルの最低限の allow を `settings.json` に上げるべき。

---

## 6. 構成案（実装前提案 — まだ作成しない）

### 6a. `AGENTS.md` 改訂ドラフト（目標 80行以内）

責務再定義:
- **AGENTS.md**: エージェントが毎回読む共通ハーネス（コマンド、禁則、参照ポインタ）
- **CLAUDE.md**: 設計方針の WHY/HOW（不変）
- **`@docs/...`**: 各論詳細を分離

構成:
```
# AGENTS.md (target: ~80 lines)
## Stack
- Next.js 15 / TS / pnpm / Jest / Playwright / Supabase
## Commands
- install: pnpm install --frozen-lockfile
- typecheck: pnpm typecheck   # 新設予定
- lint: pnpm lint
- test: pnpm test
- e2e: pnpm test:e2e
- build: pnpm build
## Boundaries
- 用語は @docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md の正本に従う
- Clean Arch 層依存: domain ← application ← infrastructure / presentation
- secrets/.env は読書禁止
## Workflow
- 実装後に memory-bank/progress.md に1エントリ追記（形式は CLAUDE.md 参照）
- 将来再迷走しそうな判断のみ docs/decisions/ に
## Forbidden
- supabase db reset
- --no-verify / --no-gpg-sign
- .env / secrets/** の読書
## References
- @CLAUDE.md / @docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md / @e2e/README.md
```

### 6b. `.claude/settings.json` permissions & hooks（追加分）

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.local)",
      "Read(.env.*)",
      "Read(secrets/**)",
      "Bash(supabase db reset*)",
      "Bash(rm -rf*)",
      "Bash(git push*--force*)",
      "Bash(git commit*--no-verify*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(supabase migration up*)",
      "Bash(supabase db push*)",
      "Bash(gh pr merge*)"
    ],
    "allow": [
      "Bash(pnpm:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Read(**)",
      "Edit(**)",
      "Write(**)"
    ]
  },
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "pnpm exec tsc --noEmit", "timeout": 120000 },
          { "type": "command", "command": "pnpm lint --quiet", "timeout": 60000 }
        ]
      }
    ]
  }
}
```

### 6c. SKILL（Claude/Codex 共通、3個）

`.agents/skills/` を一次格納場所とし、`.claude/skills/<name>` から symlink。
既存 `.claude/skills/{nextjs-best-practices,e2e-testing,sudo-modeling}` は十分大きいので、**新規追加は最小 3 個に絞る**:

1. **`coffee-ubiquitous-language`** — 用語チェッカー（`CoffeeEvaluation` / `CoffeeReview` 等の正誤判定とリンクポインタ）
2. **`progress-logger`** — `memory-bank/progress.md` の追記フォーマットを正規化
3. **`clean-arch-boundary`** — 層境界違反検出（domain が infrastructure を import していないか等）

既存の `claude-md-creator` / `nextjs-best-practices` / `e2e-testing` / `sudo-modeling` は **そのまま**（重複作成しない）。

### 6d. サブエージェント

既存の `.claude/agents/` を再利用しつつ最小限を追加:

| エージェント | 役割 | 既存/新規 |
|---|---|---|
| `nextjs-tdd-implementer` | TDD 実装 | 既存 |
| `supabase-db-designer` | DB 設計 | 既存 |
| `researcher` | コード/ドキュメント調査専用（書き込み不可） | **新規** |
| `reviewer` | PR/差分レビュー（読み取り＋コメントのみ） | **新規** |
| `tester` | 失敗テスト書き起こし → 実装 → カバレッジ確認 | **新規** |

### 6e. プログラム的チェック（実行コマンド）

| カテゴリ | コマンド | Stop hook | CI |
|---|---|---|---|
| 型検査 | `pnpm typecheck` (= `tsc --noEmit`) | ✅ 追加 | ✅ 追加 |
| lint | `pnpm lint --quiet` | ✅ 追加 | ✅ 追加 |
| ユニット | `pnpm test --silent` | ⛔ 重い | ✅ 既存 |
| E2E | `pnpm test:e2e` | ⛔ 重い | ✅ 既存 |
| アーキテクチャ境界 | `pnpm test --testPathPattern=__tests__/architecture` | ⛔ Stop で実行しない | ✅ 追加 |

`package.json` に `typecheck` スクリプトを追加（差分 1 行）:
```json
"typecheck": "tsc --noEmit"
```

アーキテクチャテスト（最小例 1 ファイル）: `lib/__tests__/architecture/layer-dependency.test.ts`
— `lib/domain/**` が `lib/infrastructure/**` や `next/**` を import していないことを正規表現で検証。

---

## 7. 実装で触る予定のファイル（最小）

| ファイル | 操作 | 規模 |
|---|---|---|
| `AGENTS.md` | 書換 | -64行 / +80行 |
| `.claude/settings.json` | 追記 | +35行 |
| `package.json` | 追記 | +1行（`typecheck`） |
| `.agents/skills/coffee-ubiquitous-language/SKILL.md` | 新規 | ~30行 |
| `.agents/skills/progress-logger/SKILL.md` | 新規 | ~25行 |
| `.agents/skills/clean-arch-boundary/SKILL.md` | 新規 | ~25行 |
| `.claude/skills/coffee-ubiquitous-language` | symlink | — |
| `.claude/skills/progress-logger` | symlink | — |
| `.claude/skills/clean-arch-boundary` | symlink | — |
| `.claude/agents/researcher.md` | 新規 | ~20行 |
| `.claude/agents/reviewer.md` | 新規 | ~20行 |
| `.claude/agents/tester.md` | 新規 | ~25行 |
| `lib/__tests__/architecture/layer-dependency.test.ts` | 新規 | ~40行 |

合計: 既存ファイル 3 / 新規ファイル 7 + symlink 3。

---

## 8. 適用後に走る検証

Stop hook で `pnpm typecheck` と `pnpm lint --quiet` が共に exit 0 を返せば成功。
失敗時はユーザに修正案を提示してから停止（CLAUDE.md "Executing actions with care" に準拠）。

---

**次のアクション**: この提案で問題なければ `approve` と返してください。差し戻し点があれば指摘ください（例: 「アーキテクチャテストは要らない」「subagent は researcher だけでよい」など）。
