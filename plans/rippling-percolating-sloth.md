# ロード中／ロード後のレイアウト一致化

## Context

`#46` (`feat: エディトリアルデザインシステム全体統一 & My Collection フィードレイアウト化`) で My Collection / Community が **3 列グリッド → 中央寄せの縦フィード (`max-w-2xl` の `FeedCard` リスト)** に変更されたが、loading 表現がそれに追従していないため、以下の不一致が発生している。

| ルート | 現在の loading | 実際の page | 問題 |
|------|---------------|------------|------|
| `/coffee/my` | **無し** | `max-w-6xl` 外側 → ヘッダー + `SearchAndSort` + `max-w-2xl` 縦フィード | ロード中は空白、ロード後にコンテンツが急にポップインする |
| `/coffee/community` | **無し** | 同上 | 同上 |
| `/coffee` | あり (3 列グリッド `max-w-6xl`) | `redirect()` のみ実体無し | リダイレクト先 (`/my` or `/community`) と全く違うグリッドが一瞬チラつく |

ユーザー視点では「ロード中とロード後で UI が別物になる」体験になっており、これを揃える。

スコープ外: `/coffee/new` と `/coffee/[id]/edit` の loading.tsx に残るハードコード Tailwind 色 (`bg-amber-200`, `bg-neutral-200` 等) は **レイアウトはズレていない** ため今回は触らない（色トークン化は別タスクとして `memory-bank/progress.md` に Next として残す）。

## 実装方針

ロード後ビューの外側コンテナとカード構造を **そのまま 1:1 で複製** し、内部要素を `animate-pulse` のブロックに置換する。これによりレイアウトシフトをゼロにする。

### 1. `app/(app)/coffee/my/loading.tsx` を新規作成

`app/(app)/coffee/my/page.tsx:20-34` と `app/(app)/coffee/my/_components/view.tsx:30-58` を踏襲し、以下の構造で skeleton を作る:

```
section (mx-auto w-full max-w-6xl px-4 py-6 sm:py-10)
├─ header div (mb-6 flex items-center justify-between)
│   └─ タイトル skeleton (h-7 w-40) + 説明 skeleton (h-4 w-56)
├─ SearchAndSort 風 box (mb-6)
│   └─ rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4
│       sm:flex-row レイアウトの中に検索入力風 (h-9 w-full sm:max-w-md) と並び順風 (h-9 w-32) の skeleton
└─ Feed list (mx-auto flex max-w-2xl flex-col gap-6)
    └─ FeedCard skeleton ×3
        article: rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-6
        ├─ header: 日付/店名行 skeleton (h-3 w-32)
        ├─ body grid (mt-4 gap-5 md:grid-cols-[1fr_200px] md:gap-6)
        │   ├─ 左: 豆名 (h-7 w-3/4) + 焙煎度 (h-3 w-24) + ノート 4 行 (h-4 w-full ×4) + 軸チップ 4 個
        │   └─ 右: RadarChart 円形 placeholder (h-[190px] w-[190px] rounded-full)
        └─ footer: border-t border-[var(--rule-2)] pt-4 で TASTING SHEET ID と「シートを見る」風 skeleton
```

カラー:
- `bg-[var(--rule)]` (テキスト行用)
- `bg-[var(--background-2)]` (大きいブロック用)
- すべて `animate-pulse`

### 2. `app/(app)/coffee/community/loading.tsx` を新規作成

`app/(app)/coffee/community/page.tsx:19-34` と `feed-card.tsx:96-189` を踏襲。**My Collection との違いは FeedCard ヘッダーにユーザーアバター + display_name 行が出ること** のみ:

- header の `showUserHeader=true` 想定で、`h-9 w-9 rounded-full bg-[var(--espresso)]/30` のアバター skeleton + 名前行 (h-3 w-24) + 日付行 (h-3 w-32)
- それ以外は `/coffee/my/loading.tsx` と同じ構造（タイトルだけ「コミュニティ」想定で同じ `h-7 w-40`）

### 3. `app/(app)/coffee/loading.tsx` を更新

現在 (`max-w-6xl` の 3 列グリッド) はリダイレクト先のフィードと不一致。`/coffee/page.tsx:10-17` は `getCurrentUser()` の成否で `/coffee/my` または `/coffee/community` にリダイレクトするだけだが、サーバーリダイレクト前にこの loading が一瞬出る可能性がある。リダイレクト先と同じ縦フィード skeleton に書き換えて視覚的連続性を確保する。

実装は `/coffee/community/loading.tsx` の中身をそのまま reuse できるよう、共通の `FeedListSkeleton` コンポーネントに切り出すことを検討。

### 4. 共通化（推奨）

`app/(app)/coffee/_components/list/` 配下に `feed-skeleton.tsx` を新規作成し、`<FeedListSkeleton showUserHeader={boolean} count={number} />` として 3 ヶ所の loading から呼ぶ。重複を防ぎ、将来 FeedCard が変わった時に追従しやすくなる。

ファイル構成:
- `app/(app)/coffee/_components/list/feed-skeleton.tsx` (新規)
  - `FeedListSkeleton` (props: `showUserHeader`, `count`)
  - 内部で `FeedCardSkeleton` を `count` 回レンダ
- `app/(app)/coffee/_components/list/search-sort-skeleton.tsx` (新規) ※ヘッダー込みで切るかは実装時判断
- 3 つの loading.tsx は外側 section + ヘッダー skeleton + `SearchAndSort` skeleton + `<FeedListSkeleton ... />` を組み合わせるだけにする

## 変更ファイル

| パス | 変更内容 |
|------|---------|
| `app/(app)/coffee/_components/list/feed-skeleton.tsx` | **新規** — `FeedListSkeleton`, `FeedCardSkeleton` を export |
| `app/(app)/coffee/my/loading.tsx` | **新規** — page.tsx と同じ外側 + `FeedListSkeleton showUserHeader={false}` |
| `app/(app)/coffee/community/loading.tsx` | **新規** — page.tsx と同じ外側 + `FeedListSkeleton showUserHeader={true}` |
| `app/(app)/coffee/loading.tsx` | **書き換え** — リダイレクト先と一致する縦フィード skeleton に変更 |

## 既存の reuse 対象

- `app/(app)/coffee/community/_components/feed-card.tsx:96-189` … FeedCard の DOM 構造（外側 article クラスや内側 grid 列幅 `md:grid-cols-[1fr_200px]`、RadarChart サイズ `190` 等）を skeleton にそのまま写経する真実のソース
- `app/(app)/coffee/my/_components/view.tsx:46` および `app/(app)/coffee/community/_components/view.tsx:17` … 外側コンテナ `mx-auto flex max-w-2xl flex-col gap-6` のクラス
- `app/(app)/coffee/_components/list/search-and-sort.tsx:67-97` … `SearchAndSort` の外側 box (`rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between`) を skeleton で再現
- `app/(app)/coffee/[id]/loading.tsx` … 同じプロジェクトでデザイントークンを使っている既存 loading のパターン（`bg-[var(--rule)]`, `bg-[var(--background-2)]`, `border-[var(--rule)]` の使い分け）

## 検証

1. **型/Lint**: `npm run typecheck` / `npm run lint` が通る
2. **ユニットテスト**: 既存の `community/__tests__/feed-card.test.tsx` 等は影響を受けないが、念のため `npm test -- --runInBand` を流す
3. **目視確認 (最重要)**:
   - dev server (`npm run dev`) を起動
   - Chrome DevTools の Network タブで Slow 3G に絞り、`/coffee/my` と `/coffee/community` を開く
   - **チェック**: ロード中の skeleton と、ロード後の実コンテンツの 1) 外側余白 2) コンテナ幅 (`max-w-6xl` / `max-w-2xl`) 3) `SearchAndSort` ボックスの位置 4) FeedCard のサイズ感 が一致しており、画面のガタつき (CLS) が起きないこと
   - `/coffee` (リダイレクト元) を未ログイン状態と既ログイン状態で開き、リダイレクト前の一瞬に出る skeleton も縦フィードであること
4. **モバイル**: 375px 幅でも `max-w-2xl` フィードの skeleton が画面幅にフィットしているか確認
5. **記録**: 完了後 `memory-bank/progress.md` に CLAUDE.md の継続記録ルールに従い 1 エントリ追記。`Next:` に「`/coffee/new` と `/coffee/[id]/edit` の loading.tsx をデザイントークン化」を残す
