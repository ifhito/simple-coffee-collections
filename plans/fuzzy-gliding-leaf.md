# コミュニティページ フィード形式への改修

## Context
現在のコミュニティページは 3カラムグリッドのコンパクトカード表示（店名・豆名・総合評価・日付のみ）。
`notes`（感想テキスト）がDBに存在するが一切表示されていない。
サウナイキタイ（https://sauna-ikitai.com/posts）のように感想テキストを中心に据えたシングルカラムフィード形式へ変更する。

---

## 新規作成: `feed-card.tsx`

**ファイル:** `app/(app)/coffee/community/_components/feed-card.tsx`

```
<article data-testid="feed-card">
  [ヘッダー] ユーザーリンク（👤 display_name || '匿名ユーザー'） + 投稿日（右寄せ）
  [豆情報]   bean_name（または bean_type）＋ roast_level バッジ（amber）
  [店名]     shop_name（text-sm text-neutral-600）
  [評価バッジ] 酸味/苦味/香り（small badge）+ 総合（強調 badge）— null は非表示
  [感想]     notes テキスト（4行クランプ、null のとき非表示）
  [フッター]  <Link href="/coffee/{id}">詳細を見る →</Link>
```

### 評価バッジの色
| ラベル | 色 |
|-------|----|
| 酸味   | blue-50 / blue-700 |
| 苦味   | orange-50 / orange-700 |
| 香り   | green-50 / green-700 |
| 総合   | amber-100 / amber-800 font-semibold |

### 再利用するパターン
- `clampTwoLines` の4行版（`card.tsx:15-20` 参照）
- `iso.slice(0, 10)` の日付フォーマット（`card.tsx:14`）
- `memo()` ラップ（`card.tsx:65`）

### Props
```typescript
type FeedCardProps = { evaluation: CoffeeEvaluationWithUser }
// import from '@/lib/types/coffee'
```

---

## 修正: `view.tsx`

**ファイル:** `app/(app)/coffee/community/_components/view.tsx`

1. `import { CoffeeCard }` → `import { FeedCard }` に差し替え
2. `import Link` を削除（ユーザーリンクは FeedCard 内部へ移動）
3. コンテナ div を変更:
   ```
   // Before
   data-testid="coffee-grid"
   className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"

   // After
   data-testid="community-feed"
   className="mx-auto flex max-w-2xl flex-col gap-6"
   ```
4. カード要素を `<FeedCard evaluation={evaluation} />` に差し替え

---

## 新規作成: `feed-card.test.tsx`

**ファイル:** `app/(app)/coffee/community/__tests__/feed-card.test.tsx`

テスト観点:
1. `notes` あり → 感想テキスト表示
2. `notes` null → 感想エリア非表示
3. `roast_level` あり → バッジ表示
4. `roast_level` null → バッジ非表示
5. 各評価（acidity/bitterness/aroma/overall_rating）null → バッジ非表示
6. ユーザーリンクが `/users/{user_id}` に向く
7. 詳細リンクが `/coffee/{id}` に向く
8. `display_name` null → 「匿名ユーザー」表示

---

## 既存テストへの影響

`page.test.tsx` — **変更不要**
- `data-testid="coffee-grid"` を参照しているテストなし
- 検証対象（shop_name, display_name, ユーザーリンク）は FeedCard でも引き続き表示

`empty-state.test.tsx` — **変更不要**
- `EmptyState` コンポーネントは変更しないため影響なし

`card.tsx` 関連テスト — **変更不要**
- `CoffeeCard` 自体は変更しないため影響なし

---

## 実装順序

1. 新規ブランチ作成: `git checkout -b feature/community-feed-redesign`
2. `feed-card.tsx` を新規作成
3. `view.tsx` を修正
4. `feed-card.test.tsx` を新規作成・実行
5. 既存テスト実行（`pnpm test`）で regression がないことを確認

---

## 変更ファイル一覧

| 操作 | ファイル |
|------|---------|
| 新規 | `app/(app)/coffee/community/_components/feed-card.tsx` |
| 修正 | `app/(app)/coffee/community/_components/view.tsx` |
| 新規 | `app/(app)/coffee/community/__tests__/feed-card.test.tsx` |

**変更しない:**
- `app/(app)/coffee/_components/list/card.tsx`（マイページで使用中）
- `app/(app)/coffee/community/_containers/container.tsx`
- `app/(app)/coffee/community/page.tsx`
- `app/(app)/coffee/_components/list/search-and-sort.tsx`
