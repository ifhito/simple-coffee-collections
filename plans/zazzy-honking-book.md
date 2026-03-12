# Plan: `coffee_evaluations.shop_name` 列の削除

## Context

`coffee_evaluations.shop_name` は、`shops` テーブル導入前の旧ストレージ。
PR #26 対応で読み取りは既に `shops.name` を正本として JOIN 取得している。
列を残したままだと書き込み時に両列が不整合になるリスクが続くため、完全に削除する。

---

## 方針

1. DB マイグレーションでインデックス・列を DROP
2. `lib/types/coffee.ts` に `CoffeeEvaluationDisplay` 型を追加して shop_name を JOIN 値で補完
3. `lib/api/coffee.ts` (独自クエリ) と repository の両方を shops JOIN に切り替え
4. 書き込み系 (actions / entity) から `shop_name` の送出を除去
5. 表示コンポーネントは `CoffeeEvaluationDisplay` 型に差し替えるだけでレンダリング変更なし
6. シードファイルの INSERT 列リストを修正

---

## 変更ファイル一覧

### STEP 1 — DB マイグレーション（最初に適用）

**New: `supabase/migrations/20260312000000_drop_shop_name_column.sql`**

```sql
-- Step 1: shop_name があるが shop_id がまだ null の行を shops テーブルへ移行
--   (20260311010000 で一度実行済みだが、その後に追加された行への安全策として再実行)

INSERT INTO shops (name)
SELECT DISTINCT trim(shop_name)
FROM coffee_evaluations
WHERE shop_id IS NULL
  AND shop_name IS NOT NULL
  AND trim(shop_name) <> ''
ON CONFLICT (normalized_name) DO NOTHING;

-- Step 2: shop_id を正規化名称で照合して埋める
UPDATE coffee_evaluations ce
SET shop_id = s.id
FROM shops s
WHERE ce.shop_id IS NULL
  AND ce.shop_name IS NOT NULL
  AND trim(ce.shop_name) <> ''
  AND s.normalized_name = lower(regexp_replace(trim(ce.shop_name), '\s+', ' ', 'g'));

-- Step 3: インデックスを削除してから列を DROP
DROP INDEX IF EXISTS idx_coffee_evaluations_shop_name;
DROP INDEX IF EXISTS idx_coffee_evaluations_shop_name_gin;

ALTER TABLE coffee_evaluations
  DROP COLUMN IF EXISTS shop_name;
```

適用: `npx supabase migration up`

---

### STEP 2 — 型定義

**`lib/types/database.types.ts`**
- `coffee_evaluations.Row` / `Insert` / `Update` から `shop_name` フィールドを削除

**`lib/types/coffee.ts`**
- `CoffeeEvaluationFormInput.shop_name?: string` は **残す**（UI フォームフィールド）
- `CoffeeEvaluationValidation.shop_name` は **残す**（フォームバリデーション）
- `FormValidationErrors.shop_name` は **残す**（エラー表示）
- **追加**: Extended Types セクションに:

```ts
/** shops JOIN で shop_name を補完した表示用型 */
export type CoffeeEvaluationDisplay = CoffeeEvaluation & {
  shop_name: string | null
}

export type CoffeeEvaluationDisplayWithUser = CoffeeEvaluationDisplay & {
  display_name: string | null
}
```

---

### STEP 3 — ドメイン層

**`lib/domain/coffee-evaluation/entity.ts`**
- `toPersistence()` の返り値から `shop_name: this._shopInfo.shopName` を削除
- 戻り値の型アノテーションからも `shop_name` を除去

---

### STEP 4 — Infrastructure / Repository

**`lib/infrastructure/repositories/supabase-coffee-evaluation-repository.ts`**

| 箇所 | 変更 |
|------|------|
| `mapRowToEntity` | `const shopName = row.shops?.name ?? ''`（fallback 分岐を削除） |
| `mapEntityToWritableFields` の Pick 型 | `'shop_name'` を削除 |
| `mapEntityToWritableFields` の返り値 | `shop_name` プロパティを削除 |
| `SORT_CONFIG` の型 | `referencedTable?: string` を追加 |
| `SORT_CONFIG` の `shop_name_asc/desc` | `{ column: 'name', ascending: ..., referencedTable: 'shops' }` に変更 |
| `.order()` 呼び出し | `referencedTable` が定義されていれば渡す |
| `findMany` の search OR | `shop_name.ilike.${pattern}` → `shops.name.ilike.${pattern}` |
| `findManyWithDisplayName` の search OR | 同上 |
| `count()` の select | `'*, shops!left(name)'` に変更し search OR も同様に修正 |

---

### STEP 5 — API 層（独自クエリを持つため個別に修正）

**`lib/api/coffee.ts`**

すべての関数でパターンは同一:

```ts
// Before
let query = supabase.from('coffee_evaluations').select('*')
// ...
`shop_name.ilike.${pattern},...`

// After
let query = supabase.from('coffee_evaluations').select('*, shops!left(name)')
// ...
`shops.name.ilike.${pattern},...`
// レスポンスをマップして shop_name を補完:
return (data || []).map((row: any) => ({ ...row, shop_name: row.shops?.name ?? null }))
```

| 関数 | 変更 |
|------|------|
| `getCoffeeEvaluations` | select + search OR + map + 戻り型 `CoffeeEvaluationDisplay[]` |
| `getCoffeeEvaluation` | select + map + 戻り型 `CoffeeEvaluationDisplay \| null` |
| `searchCoffeeEvaluations` | select + OR + map + 戻り型 `CoffeeEvaluationDisplay[]` |
| `getCoffeeEvaluationsWithUser` | `buildBaseQuery` + `fetchWithJoin` 両方に同変更、戻り型 `CoffeeEvaluationDisplayWithUser[]` |
| `applySortOrder` の `sortMap` | `shop_name_asc/desc` を `{ column: 'name', referencedTable: 'shops', ascending: ... }` に変更、`.order()` に `referencedTable` を渡す |

import に `CoffeeEvaluationDisplay`, `CoffeeEvaluationDisplayWithUser` を追加。

---

### STEP 6 — Actions

**`lib/actions/coffee.ts`**

- `ParsedBeanInfo.shop_name: string` は **残す**（FormData 読み取りと `resolveShopId` で使用）
- `createCoffeeEvaluation`: `...beanInfo` スプレッドを明示的フィールドに変更（`shop_name` を除外）

```ts
// Before
.insert({ user_id: user.id, ...beanInfo, shop_id: shopId, ...(ratings ?? {}) })

// After
.insert({
  user_id: user.id,
  shop_id: shopId,
  bean_type: beanInfo.bean_type,
  bean_name: beanInfo.bean_name,
  roast_level: beanInfo.roast_level,
  is_public: beanInfo.is_public,
  ...(ratings ?? {}),
})
```

- `updateCoffeeEvaluation`: `updatePayload` から `shop_name: beanInfo.shop_name` を削除

---

### STEP 7 — 表示コンポーネント（型差し替えのみ・レンダリング変更なし）

**`app/(app)/coffee/_components/list/card.tsx`**
- Props 型の Pick を `CoffeeEvaluationDisplay` からに変更（`shop_name` は引き続き含まれる）

**`app/(app)/coffee/_components/list/view.tsx`**
- 同様に `CoffeeEvaluationDisplay` から Pick

**`app/(app)/coffee/[id]/_components/evaluation/view.tsx`**
- `evaluation` 型を `CoffeeEvaluationDisplay` に変更、`evaluation.shop_name` アクセスはそのまま

**`app/(app)/coffee/[id]/evaluate/page.tsx`**
- `evaluation` 変数の型を `CoffeeEvaluationDisplay | null` に変更

---

### STEP 8 — シードファイル

**`supabase/seeds/manual/20260102000000_seed_bean_batches.sql`**
- INSERT の列リストから `shop_name` を削除
- 各 VALUES 行から対応する値（2番目のカラム位置の文字列）を削除
- ※シード行の `shop_id` は NULL のまま（ローカル開発用途であり許容範囲）

---

### STEP 9 — テスト更新

**`lib/infrastructure/repositories/__tests__/supabase-coffee-evaluation-repository.test.ts`**
- `makeRow()` デフォルトから `shop_name: 'Coffee Stand'` を削除
- 「falls back to coffee_evaluations.shop_name」テストを削除（fallback ロジック自体を削除するため）
- 代わりに「shop_id も shops も null のとき shopName が空文字になる」テストに置き換え

**その他テストファイル（fixture の型変更）**
- `shop_name` を含む fixture を `CoffeeEvaluationDisplay` 型に変更するか、`as any` キャストを追加
- 主な対象: `card.test.tsx`, `view.test.tsx`, `evaluation/view.test.tsx`, `coffee-flows.test.tsx`, 等

---

## 変更しないファイル

| ファイル | 理由 |
|----------|------|
| `lib/application/ocr/dto.ts` | OCR 出力の `shop_name` は認識テキストであり DB 列と無関係 |
| `lib/mastra/tools/coffee-ocr-tool.ts` | 同上 |
| `lib/domain/coffee-evaluation/value-objects/shop-info.ts` | 純粋ドメイン、`shopName` ゲッターは残す |
| `app/(app)/coffee/_components/evaluation-form.tsx` | FormData `shop_name` フィールドはそのまま |
| `app/(app)/coffee/new/page.tsx` | `shop_name` URL パラメータはフォーム初期値用（DB 列と無関係） |
| `supabase/migrations/` の既存ファイル | マイグレーションは不変 |

---

## 検証手順

```bash
# 1. TypeScript コンパイル
npx tsc --noEmit

# 2. ユニット・インテグレーションテスト
npx jest --no-coverage

# 3. マイグレーション適用
npx supabase migration up

# 4. 動作確認（ローカルアプリ起動後）
# - 新規評価を作成 → shop_name なしで保存されること
# - 既存評価の詳細・一覧で店名が表示されること
# - 検索で店名ヒットすること
# - 店名 A-Z / Z-A ソートが機能すること

# 5. E2E
npx playwright test
```
