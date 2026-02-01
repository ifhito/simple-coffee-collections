# Simple Coffee Collections

コーヒー体験を記録・共有するためのアプリです。Supabase を使った認証とデータ管理、Next.js App Router を採用しています。

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Jest + React Testing Library
- Playwright (E2E)
- Storybook

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

