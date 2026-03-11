# PR #23 レビューコメント対応計画

## Context

PR #23「豆の登録と評価の分離」に対して3つのレビューコメントが付いた。
根本的な設計改善として、**nullable な評価部分を豆情報から明確に分離する** アプローチを、サーバーアクション層とUI層の両方で適用する。

---

## コメント1: evaluate/page.tsx は不要？

**レビュアー**: 「このコンポーネントはなぜ必要？使われていないようなので、不要なら削除して」

**対応: PRコメントで説明（コード変更不要）**

`view.tsx` L71 で未評価の豆に「評価する」ボタン → `/coffee/${evaluation.id}/evaluate` へリンク。
このルートが `evaluate/page.tsx`。使用されている。

---

## コメント2+3: nullable 評価部分の分離（サーバーアクション + UI）

### 設計思想

現状の問題: `ParsedEvaluationData` が bean info と ratings を1つのフラットな型に混在させ、`skipEvaluation` 三項演算子で nullable 制御しているため複雑。UI も同様に1つのコンポーネントで両方を扱っている。

**解決**: 「豆情報」と「評価」を独立した関心事として、パース・バリデーション・UIそれぞれで分離する。

---

### A. サーバーアクション層の分離

**対象**: `lib/actions/coffee.ts`

#### 型の分離

```ts
interface ParsedBeanInfo {
  shop_name: string
  bean_type: string
  bean_name: string
  roast_level: string | null
  is_public: boolean
}

interface ParsedRatings {
  acidity: number
  bitterness: number
  aroma: number
  overall_rating: number
}
```

`ParsedEvaluationData` は削除。

#### パース関数の分離

- `parseBeanInfoFormData(formData)` → `ParsedBeanInfo`
- `parseRatingsFormData(formData)` → `ParsedRatings | null`
  - skip_evaluation=true → null
  - 4値全部ある → `ParsedRatings`
  - 一部のみ → エラー（all-or-nothing）

三項演算子4連続が消え、代わりに null/non-null の分岐が明確になる。

#### バリデーション関数の分離

- `validateBeanInfo(data)` → bean_name 必須チェック
- `validateRatings(data)` → 1-10 範囲チェック（ratings が non-null のときのみ呼ぶ）

#### 各アクションの変更

**`createCoffeeEvaluation`**:
```ts
const beanInfo = parseBeanInfoFormData(formData)
const ratings = parseRatingsFormData(formData)
// validate each
const insertPayload = {
  user_id: user.id,
  ...beanInfo,
  ...(ratings ?? {}),  // ratings なしなら rating カラムは含めない
}
```

**`updateCoffeeEvaluation`**:
- `parseRatingsFormData` に `{ allowSkipEvaluation: false }` オプション → skip_evaluation を無視
- update payload も同様に `...(ratings ?? {})` で組み立て
- 評価ダウングレードガード: `wasEvaluated && !ratings` → エラー

**`addEvaluation`**:
- 既存の rating パースロジックを `parseRatingsFormData` に置き換え可能（ただし addEvaluation は ratings 必須なので null 時はエラー）

#### テストへの影響

`lib/actions/__tests__/coffee.test.ts` — 既存テストの assertion は振る舞いベースなので、内部リファクタリングでも全テスト pass するはず。念のため確認。

---

### B. UI コンポーネントの分離

#### 新規: `RatingSliders` 共通コンポーネント

**パス**: `app/(app)/coffee/_components/shared/rating-sliders.tsx`

```ts
type RatingsState = {
  overall_rating: number
  acidity: number
  bitterness: number
  aroma: number
}

type RatingSlidersProps = {
  values: RatingsState
  onChange: (values: RatingsState) => void
}
```

- 4つの `CoffeeSlider` をレンダリング
- 現在 `evaluation-form.tsx` L131-147 と `evaluate-form.tsx` L56-72 で重複しているコードを共通化

#### 新規: `BeanInfoFields` コンポーネント

**パス**: `app/(app)/coffee/_components/shared/bean-info-fields.tsx`

```ts
type BeanInfoState = {
  beanName: string
  beanType: string
  shopName: string
  roastLevel: string
}

type BeanInfoFieldsProps = {
  values: BeanInfoState
  onChange: (values: BeanInfoState) => void
  errors?: { bean_name?: string }
}
```

- 豆の名前、産地、店名、焙煎度セレクトの4フィールド
- 現在 `evaluation-form.tsx` L157-193 の部分を抽出

#### 修正: `EvaluationForm` (create/edit 用)

**パス**: `app/(app)/coffee/_components/evaluation-form.tsx`

```
EvaluationForm (オーケストレーター)
├── BeanInfoFields
├── skipEvaluation checkbox （新規 or 未評価編集時のみ表示）
├── {!skipEvaluation && <RatingSliders />}  ← 表示制御が明示的
├── PublicToggle
└── Submit
```

- 状態管理 + フォーム送信ロジックは `EvaluationForm` が保持
- 子コンポーネントは制御コンポーネント（値と onChange を受け取る）

#### 修正: `EvaluateForm` (evaluate page 用)

**パス**: `app/(app)/coffee/_components/evaluate-form.tsx`

- インラインの slider コードを `<RatingSliders values={ratings} onChange={setRatings} />` に置き換え
- フォーム送信ロジック（addEvaluation 呼び出し）はそのまま

---

## 実装順序

1. **RatingSliders** 共通コンポーネント作成
2. **BeanInfoFields** 共通コンポーネント作成
3. **EvaluationForm** を BeanInfoFields + RatingSliders で再構成
4. **EvaluateForm** を RatingSliders で再構成
5. **coffee.ts**: ParsedBeanInfo / ParsedRatings に分離、パース・バリデーション関数分離
6. テスト実行（全テスト pass 確認）
7. PR コメント1への返信

## 対象ファイル一覧

| ファイル | 変更 |
|---------|------|
| `app/(app)/coffee/_components/shared/rating-sliders.tsx` | **新規** |
| `app/(app)/coffee/_components/shared/bean-info-fields.tsx` | **新規** |
| `app/(app)/coffee/_components/evaluation-form.tsx` | **修正** (分離後オーケストレーター) |
| `app/(app)/coffee/_components/evaluate-form.tsx` | **修正** (RatingSliders 使用) |
| `lib/actions/coffee.ts` | **修正** (型・パース・バリデーション分離) |

## 検証

- `npm test` — 全テスト pass
- `npm run build` — ビルド成功
- 手動確認:
  - `/coffee/new` 豆情報のみ保存
  - `/coffee/new` 豆情報 + 評価同時保存
  - `/coffee/[id]/edit` 編集（未評価 / 評価済み両方）
  - `/coffee/[id]/evaluate` 評価追加
