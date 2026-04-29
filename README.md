# Simple Coffee Collections

コーヒー体験を記録・共有するためのアプリです。Supabase を使った認証とデータ管理、Next.js App Router を採用しています。

**Production**: https://coffee-collections.uk/

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Jest + React Testing Library
- Playwright (E2E)
- Storybook

## Infrastructure

| 役割 | サービス |
|------|----------|
| Hosting / Deploy | [Vercel](https://vercel.com) |
| Database / Auth | [Supabase](https://supabase.com) |
| DNS | [Cloudflare](https://cloudflare.com) |
| Domain | [coffee-collections.uk](https://coffee-collections.uk/) |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase CLI

### Installation

```bash
pnpm install

# Supabase のローカル起動
supabase start

# 環境変数を設定
cp .env.example .env.local
# supabase status の URL / anon key を .env.local に反映

# 開発サーバー起動
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

```bash
pnpm dev            # 開発サーバー
pnpm build          # 本番ビルド
pnpm start          # 本番サーバー
pnpm lint           # ESLint

pnpm test           # Jest
pnpm test:watch     # Jest (watch)
pnpm test:coverage  # Jest (coverage)

pnpm test:e2e       # Playwright E2E
pnpm test:e2e:ui    # Playwright UI
pnpm test:e2e:headed
pnpm test:e2e:debug

pnpm storybook      # Storybook
pnpm build-storybook
```

## Testing

### Unit/Component Tests (Jest)

```bash
pnpm test
```

### E2E Tests (Playwright)

E2E テストの詳細は `e2e/README.md` を参照してください。

```bash
# Supabase ローカル起動
supabase start

# テストユーザー作成
supabase db execute --file e2e/setup-test-user.sql

# Chromium インストール（初回のみ）
pnpm exec playwright install chromium

# 実行
pnpm test:e2e
```

## OCR Evals (ローカル専用 / Ollama)

`pnpm eval` で OCR 抽出の品質を計測する LLM-as-judge ベースの評価ハーネス（`evals/`）。**CI では走らない**（コスト回避のためローカル Ollama 前提）。詳細は `evals/META.md`。

### 前提

- `ollama serve` が `http://localhost:11434` で起動している
- 任意のモデルを `ollama pull <model>` 済み（推奨: `qwen2.5:7b` / `llama3.1`）
- 環境変数で上書き可: `EVAL_TARGET_MODEL` / `EVAL_JUDGE_MODEL` / `EVAL_OLLAMA_BASE_URL`

### eval の追加方法（10 行以内）

1. `evals/dataset.jsonl` に 1 行追加: `{"id":"ocr-NNN","scenario":"...","input_text":"...","tags":["criterion-id", ...]}`
2. 既存 criterion で足りない観点があれば `evals/criteria.md` に追記。
3. `pnpm eval --only=ocr-NNN` で単体実行し、judge の理由を確認。
4. ローカル smoke は `pnpm eval --smoke`（先頭 3 件）。
5. 失敗が再現するか、true positive かを確認したうえで dataset を確定。
6. `git add evals/dataset.jsonl evals/criteria.md && git commit` して PR を出す。

## Project Structure

```
app/                 # Next.js App Router (auth/app routes)
components/          # UI コンポーネント
lib/                 # actions, api, domain, supabase, types, utils
middleware.ts        # 認証セッション管理

e2e/                 # Playwright E2E (fixtures/pages/specs)
playwright/          # Playwright 設定/認証キャッシュ
supabase/            # migrations / seed

docs/                # ドキュメント
public/              # 静的アセット
```

## Features

- ✅ サインアップ / ログイン / ログアウト
- ✅ コーヒー評価の作成・編集・削除（CRUD）
  - 評価スライダー: 総合/酸味/苦味/香り（1-10）
  - 基本情報: 豆の名前/産地、店名、焙煎度
- ✅ マイページ一覧（検索/ソート）
- ✅ 公開/非公開の切り替え
- ✅ コミュニティフィード（公開評価のみ）
- ✅ プロフィール閲覧・共有リンク
- ✅ レスポンシブ UI

## Documentation

- `docs/coffee-evaluation.md`
- `docs/UBIQUITOUS_LANGUAGE.md`
- `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md`

