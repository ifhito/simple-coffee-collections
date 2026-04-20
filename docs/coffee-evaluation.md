# Coffee Evaluation Feature Documentation

## Overview
フルスタックなコーヒー評価管理機能。評価の作成・編集・削除、一覧・詳細閲覧、検索・並び替え、プロフィール編集を提供します。Next.js 15 App Router + Supabase + Tailwind + Jest/RTLで実装。

## User Guide
- 一覧: `/coffee` で評価をカード表示。検索ボックスで店名/豆/焙煎度を部分一致検索、並び替えで作成日/評価/店名を切り替え。カードをクリックすると詳細へ。
- 作成: `/coffee/new` で評価を新規作成。スライダー(1-10)で酸味/苦味/香り/総合を入力、公開設定も可能。店名はオートコンプリートで既存店舗を選択可能（自由入力も可）。
- 詳細: `/coffee/[id]` で全フィールドを表示。所有者のみ「編集」「削除」ボタンが表示。
- 編集: `/coffee/[id]/edit` で既存評価を編集。権限チェック済み。
- 削除: 詳細ページで削除ボタン→確認ダイアログ→削除。
- プロフィール: `/profile` で表示名(100文字)と自己紹介(500文字)を編集。

## Key Pages & Components
- List: `app/(app)/coffee/page.tsx`, container `.../_containers/list/container.tsx`, view `.../_components/list/view.tsx`, card `.../_components/list/card.tsx`, search/sort `.../_components/list/search-and-sort.tsx`
- Detail: `app/(app)/coffee/[id]/page.tsx`, container `.../_containers/evaluation/container.tsx`, view `.../[id]/_components/evaluation/view.tsx`
- Forms: `app/(app)/coffee/_components/evaluation-form.tsx`, sliders `.../_components/shared/coffee-slider.tsx`, stars `.../_components/shared/rating-stars.tsx`
- Profile: `app/(app)/profile/page.tsx`, form `app/(app)/profile/profile-form.tsx`
- Loading/Error: `app/(app)/coffee/loading.tsx`, `app/(app)/coffee/[id]/loading.tsx`, `app/(app)/coffee/new/loading.tsx`, `app/(app)/coffee/[id]/edit/loading.tsx`, error boundaries for list/detail

## Data & Actions
- Types: `lib/types/coffee.ts` (CoffeeEvaluation, UserProfile, search params)
- Data fetching: `lib/api/coffee.ts` (`getCoffeeEvaluations` supports search/sort, `getCoffeeEvaluation`, `searchCoffeeEvaluations`)
- Server Actions: `lib/actions/coffee.ts` (create/update/delete evaluation), `lib/actions/profile.ts` (update profile)
- Shop search API: `app/api/shops/search/route.ts` (オートコンプリート用エンドポイント)
- Supabase: auth + tables `coffee_evaluations`, `user_profiles`, `shops`

## Architecture
- Server Components First (containers fetch data), Presentational components for UI
- Search/sort is client (URL sync) feeding searchParams to server container
- TDD: phases per tasks.md (Red→Green→Refactor), tests co-located with source

## Running Locally
```bash
pnpm install
supabase start   # if using local supabase
pnpm dev         # http://localhost:3000
```

## Testing
```bash
pnpm test                              # all
pnpm test -- --runTestsByPath <path>   # targeted
```
Key suites: data layer `lib/__tests__/api/coffee.test.ts`, components (slider, stars, card, list/detail views), forms, profile page, integration flows under `app/(app)/coffee/__tests__/integration/`.

## Notable UX
- Loading skeletons for list/detail/new/edit pages
- Error boundaries with retry/back
- Animations: fade/slide for list/detail, staggered cards
- Accessibility: aria-label on cards, form validations with focus/error messaging
