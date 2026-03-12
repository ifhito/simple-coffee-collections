# 店舗テーブル分離と検索基盤の実装計画

## Context

`coffee_evaluations.shop_name` に店名がテキストで入っているが、店舗を独立エンティティとして扱えない。
`shops` テーブルに分離し、検索・オートコンプリートを実現する。移行中は `shop_name` を残し安全に切替える。

> **注意**: main ブランチの「豆登録と評価の分離」リファクタ（PR #23）反映済み。
> Server Actions は `ParsedBeanInfo` + `ParsedRatings` に分離、ratings は nullable、
> フォームは `BeanInfoFields` / `RatingSliders` 共有コンポーネントに切り出し済み。

---

## Step 1: DB マイグレーション

### 1-1. `supabase/migrations/20260311000000_create_shops_table.sql`
- `shops` テーブル作成: `id UUID PK`, `name TEXT NOT NULL`, `normalized_name TEXT GENERATED ALWAYS AS (lower(regexp_replace(trim(name), '\s+', ' ', 'g'))) STORED NOT NULL`
- `UNIQUE(normalized_name)`
- GIN trigram index on `name`
- `updated_at` trigger（既存の `update_updated_at_column` 関数を再利用）
- RLS: authenticated ユーザーは SELECT/INSERT 可能

### 1-2. `supabase/migrations/20260311010000_migrate_shop_data.sql`
- `INSERT INTO shops (name) SELECT DISTINCT trim(shop_name) FROM coffee_evaluations WHERE shop_name IS NOT NULL AND trim(shop_name) <> '' ON CONFLICT (normalized_name) DO NOTHING`
- `ALTER TABLE coffee_evaluations ADD COLUMN shop_id UUID REFERENCES shops(id)`
- backfill: `UPDATE coffee_evaluations SET shop_id = s.id FROM shops s WHERE ...`
- `CREATE INDEX idx_coffee_evaluations_shop_id ON coffee_evaluations(shop_id)`

### 1-3. 型再生成
- `npx supabase gen types typescript --local > lib/types/database.types.ts`

---

## Step 2: ドメイン層 — Shop エンティティ

### 新規作成
- `lib/domain/shop/entity.ts` — `Shop` クラス（id, name, normalizedName, createdAt, updatedAt）
- `lib/domain/shop/repository.ts` — `ShopRepository` インターフェース（findById, search, findOrCreate）
- `lib/domain/shop/index.ts` — barrel export

### ShopInfo VO 拡張: `lib/domain/coffee-evaluation/value-objects/shop-info.ts`
- `_shopId?: string` を追加
- `create(shopName?, shopId?)`, `fromPrimitive(shopName, shopId?)`, `shopId` getter
- `toPrimitive()` → `{ shopName, shopId }` に変更（破壊的。呼び出し元を更新）

### CoffeeEvaluation エンティティ更新: `lib/domain/coffee-evaluation/entity.ts`
- `CreateCoffeeEvaluationInput` / `CreateBeanOnlyInput` / `UpdateCoffeeEvaluationInput` に `shopId?: string` 追加
- `toPersistence()` に `shop_id` 追加（返り値型の拡張）

---

## Step 3: アプリケーション層

### 新規: `lib/application/ports/shop-search-provider.ts`
```typescript
export interface ShopSearchResult { id: string; name: string }
export interface ShopSearchProvider {
  search(query: string, limit?: number): Promise<ShopSearchResult[]>
}
```

### DTO 更新: `lib/application/coffee-evaluation/dto.ts`
- `CreateEvaluationInput` / `UpdateEvaluationInput` / `EvaluationOutput` に `shopId?: string`

---

## Step 4: インフラ層

### 新規: `lib/infrastructure/repositories/supabase-shop-repository.ts`
- `ShopRepository` と `ShopSearchProvider` を実装
- `search()`: `ilike('%query%')` on `name`、limit 付き
- `findOrCreate()`: normalized_name で検索、なければ INSERT（ON CONFLICT DO NOTHING + 再 SELECT）

### 更新: `lib/infrastructure/repositories/supabase-coffee-evaluation-repository.ts`
- `mapRowToEntity()`: `row.shop_id` → `ShopInfo.fromPrimitive(row.shop_name, row.shop_id)`
- `mapEntityToWritableFields()` に `shop_id` 追加

### DI 登録: `lib/di/container.ts`
- `shopRepositoryInstance` / `getShopRepository()` / `setShopRepository()`
- `resetRepositories()` に追加

---

## Step 5: API ルート（オートコンプリート用）

### 新規: `app/api/shops/search/route.ts`
- `GET ?q=...&limit=10`
- 認証チェック → `getShopSearchProvider().search(q, limit)` → JSON 返却

---

## Step 6: 保存フロー更新

### `lib/actions/coffee.ts`
- `ParsedBeanInfo` に `shop_id: string | null` 追加
- `parseBeanInfoFormData()`: `shop_id` を FormData から取得
- `createCoffeeEvaluation()` / `updateCoffeeEvaluation()`:
  - `shop_id` がなく `shop_name` がある場合 → `findOrCreate` で shop を取得/作成
  - insert/update に `shop_id` を含める
- `addEvaluation()`: ratings のみ更新のため shop_id 変更なし（対応不要）

---

## Step 7: UI — オートコンプリート

### 新規: `app/(app)/coffee/_components/shared/shop-autocomplete.tsx`
- Client component
- テキスト入力 + ドロップダウン候補リスト
- `/api/shops/search?q=...` を 300ms debounce で fetch
- 候補選択時: shopName + shopId をセット
- 自由入力時: shopId を null に（新規店舗として保存フローで処理）
- キーボード操作対応（ArrowDown/Up, Enter, Escape）

### 更新: `app/(app)/coffee/_components/shared/bean-info-fields.tsx`
- `BeanInfoState` に `shopId: string | null` 追加
- `<Input label="店名">` → `<ShopAutocomplete>` に置換
- `ShopAutocomplete` の選択結果で `shopName` と `shopId` を同時に更新

### 更新: `app/(app)/coffee/_components/evaluation-form.tsx`
- `EvaluationFormDefaultValues` に `shop_id?: string | null` 追加
- `beanInfo` 初期 state に `shopId` 追加
- `buildFormData()` に `shop_id` 追加

---

## Step 8: `/shops` ページ

### 新規ファイル
- `app/(app)/shops/page.tsx` — Server Component、searchParams で検索
- `app/(app)/shops/_components/shop-search.tsx` — Client: debounced URL push（既存 search-and-sort.tsx と同パターン）
- `app/(app)/shops/_components/shop-list.tsx` — Server: 検索結果のリスト表示
- `app/(app)/shops/_components/shop-card.tsx` — Presentational: 店舗カード

### ナビゲーション更新: `app/(app)/_components/nav-bar.tsx`
- `navItems` に `{ href: '/shops', label: '🏪 店舗', match: '/shops' }` 追加

---

## Step 9: テスト

### Unit テスト（TDD: テスト先行）
- `lib/domain/shop/__tests__/entity.test.ts` — Shop 作成・バリデーション
- `lib/domain/__tests__/shop-info.test.ts` — ShopInfo の shopId 対応
- `lib/infrastructure/repositories/__tests__/supabase-shop-repository.test.ts`
- `app/api/shops/__tests__/search.test.ts`
- `app/(app)/coffee/_components/__tests__/shop-autocomplete.test.tsx`
- 既存 `evaluation-form.test.tsx` の更新（BeanInfoFields の shopId 対応）

### E2E テスト
- `e2e/specs/shops/search.spec.ts` — 店舗検索ページ
- 既存 `e2e/specs/coffee/create.spec.ts` のオートコンプリート確認

---

## 実装順序（依存関係順）

1. Step 1: DB マイグレーション + 型再生成
2. Step 2: ドメイン層（Shop エンティティ + ShopInfo 拡張）
3. Step 3: アプリケーション層（ポート + DTO）
4. Step 4: インフラ層（リポジトリ + DI）
5. Step 5: API ルート
6. Step 6: 保存フロー更新
7. Step 7: オートコンプリート UI
8. Step 8: /shops ページ + ナビ
9. Step 9: テスト（各ステップで TDD 実施）

---

## 検証方法

1. `npx supabase migration up` — マイグレーション適用
2. `npx supabase gen types typescript --local` — 型が shops テーブルを含むことを確認
3. `npm test` — 全テスト通過
4. `npm run build` — ビルド成功
5. ローカルで評価作成 → オートコンプリート動作確認
6. `/shops` ページで検索動作確認
