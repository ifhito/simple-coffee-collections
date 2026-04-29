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

`pnpm eval` で OCR の品質を計測する LLM-as-judge ベースの評価ハーネス（`evals/`）。**CI では走らない**（コスト回避のためローカル Ollama 前提）。詳細は `evals/META.md`。

### モード

- **text-mode**: dataset の `input_text` を LLM に渡し、OCR 後の **マッピングロジック** を評価（`EVAL_TARGET_MODEL` / default: `llama3.1`）
- **image-mode**: dataset の `image_path` で指定した画像を渡し、**実 OCR (Vision)** からマッピングまで評価（`EVAL_VISION_MODEL` / default: `qwen2.5vl:latest`）

### 前提

- `ollama serve` が `http://localhost:11434` で起動している
- text モデル（例 `llama3.1`）と vision モデル（例 `qwen2.5vl`）を `ollama pull <model>` 済み
- 環境変数で上書き可: `EVAL_TARGET_MODEL` / `EVAL_VISION_MODEL` / `EVAL_JUDGE_MODEL` / `EVAL_OLLAMA_BASE_URL`

### eval の追加方法（10 行以内）

1. text-mode: `{"id":"ocr-NNN","scenario":"...","input_text":"...","tags":["criterion-id"]}`
2. image-mode: `{"id":"img-NNN","scenario":"...","image_path":"fixtures/<id>.png","tags":[...]}`
3. 既存 criterion で足りなければ `evals/criteria.md` に追記。
4. `pnpm eval --only=<id>` で単体実行し judge の理由を確認。
5. ローカル smoke は `pnpm eval --smoke`（先頭 3 件、text モードが多い想定）。
6. 確認後 `git add evals/ && git commit` して PR を出す。
7. 画像 fixture を増やすなら `evals/fixtures/README.md` も参照。

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

