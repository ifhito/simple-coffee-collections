# ユビキタス言語（Ubiquitous Language）

**Coffee Collections アプリケーションのドメイン用語集**

> このドキュメントは、開発者とドメインエキスパート（コーヒー愛好家）が共有する共通言語を定義します。
> すべてのコード、会話、ドキュメント、テストでこれらの用語を一貫して使用します。

---

## 📚 目次

1. [コアドメイン概念](#コアドメイン概念)
2. [値オブジェクト](#値オブジェクト)
3. [ユースケース](#ユースケース)
4. [リポジトリ操作](#リポジトリ操作)
5. [権限・所有権](#権限所有権)
6. [ビジネスルール](#ビジネスルール)
7. [ドメインモデル図](#ドメインモデル図)

---

## コアドメイン概念

### Coffee Evaluation（コーヒー評価）

**定義**: ユーザーがコーヒー体験を記録した評価記録

**日本語**: コーヒー評価

**コード**: `CoffeeEvaluation` エンティティ
**場所**: `lib/domain/coffee-evaluation/entity.ts`
**役割**: Aggregate Root（集約ルート）

**構成要素**:
- **Shop Info**: 店舗情報（カフェ・店名）
- **Bean Info**: 豆情報（豆の名前、産地、焙煎度）
- **Ratings**: 4つの評価値（酸味、苦味、香り、総合評価）
- **Visibility**: 公開設定（公開/非公開）
- **Metadata**: タイムスタンプ（作成日時、更新日時）
- **User ID**: 所有者のユーザーID

**ライフサイクル**:
```
作成 → 更新 → 公開設定変更 → 削除
```

**識別子**: `CoffeeEvaluationId` (UUID文字列)

---

## 値オブジェクト

### 1. Shop Info（店舗情報）

**定義**: コーヒーを購入・飲食した店舗の情報

**日本語**: 店舗情報

**コード**: `ShopInfo` Value Object
**場所**: `lib/domain/coffee-evaluation/value-objects/shop-info.ts`

**属性**:
| 属性名 | 型 | 制約 | 説明 |
|--------|-------|------|------|
| `shopName` | `string` | 255文字以内 | 店舗名（カフェ名） |

**特性**:
- **オプショナル**: 空文字列可（店舗未設定）
- **不変**: 一度作成したら変更不可
- **自己検証**: 作成時に文字数制限を検証

**ファクトリメソッド**:
```typescript
ShopInfo.create("スターバックス 渋谷店")  // 成功: Result<ShopInfo>
ShopInfo.create("あ".repeat(300))        // 失敗: エラー
ShopInfo.empty()                         // 空の店舗情報
```

**表示**:
```typescript
shopInfo.toDisplayString("店舗未設定")  // 店名 or プレースホルダー
```

---

### 2. Bean Info（豆情報）

**定義**: コーヒー豆に関する情報（名前、産地、焙煎度）

**日本語**: 豆情報

**コード**: `BeanInfo` Value Object
**場所**: `lib/domain/coffee-evaluation/value-objects/bean-info.ts`

**属性**:
| 属性名 | 型 | 制約 | 必須 |
|--------|-------|------|------|
| `beanName` | `string` | 255文字以内 | ✅ |
| `beanType` | `string` | 255文字以内 | ❌ |
| `roastLevel` | `string \| null` | 100文字以内 | ❌ |

**Bean Name（豆の名前）**:
- 必須フィールド
- 空文字列不可
- 例: "エチオピア イルガチェフェ G1", "ブラジル サントス No.2"

**Bean Type（産地）**:
- 豆の産地・品種
- 例: "エチオピア", "コロンビア", "ブレンド"

**Roast Level（焙煎度）**:
焙煎の深さを表す。選択肢は以下の通り：

| 値 | 日本語表示 | 英語 | 特徴 |
|----|-----------|------|------|
| `light` | ライト（浅煎り） | Light Roast | 酸味が強い、フルーティー |
| `cinnamon` | シナモン（浅中煎り） | Cinnamon Roast | 酸味と甘みのバランス |
| `medium` | ミディアム（中煎り） | Medium Roast | バランスが良い |
| `high` | ハイ（中深煎り） | High Roast | 苦味とコクが出始める |
| `city` | シティ（やや深煎り） | City Roast | 苦味が強くなる |
| `full_city` | フルシティ（深煎り） | Full City Roast | しっかりとした苦味 |
| `french` | フレンチ（極深煎り） | French Roast | 強い苦味、スモーキー |

**使用例**:
```typescript
BeanInfo.create({
  beanName: "エチオピア イルガチェフェ G1",
  beanType: "エチオピア",
  roastLevel: "medium"
})

// 表示
beanInfo.toDisplayString()
// → "エチオピア イルガチェフェ G1 (エチオピア) - medium"
```

---

### 3. Rating（評価値）

**定義**: 1〜10のスケールでコーヒーの特性を評価する値

**日本語**: 評価値

**コード**: `Rating` Value Object
**場所**: `lib/domain/coffee-evaluation/value-objects/rating.ts`

**型**: `RatingValue` = `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10`

**制約**:
- 最小値: 1
- 最大値: 10
- 整数のみ

**評価項目**:

#### Acidity（酸味）
- **日本語**: 酸味
- **説明**: コーヒーの酸味の強さ・質
- **低い**: まろやか、酸味が少ない
- **高い**: フルーティー、明るい酸味

#### Bitterness（苦味）
- **日本語**: 苦味
- **説明**: コーヒーの苦味の強さ
- **低い**: 甘み重視、ライト
- **高い**: ビターチョコレートのような苦味

#### Aroma（香り）
- **日本語**: 香り
- **説明**: コーヒーの香りの良さ・複雑さ
- **低い**: 香りが弱い
- **高い**: 豊かで複雑な香り

#### Overall Rating（総合評価）
- **日本語**: 総合評価
- **説明**: 全体的な満足度・好み
- **低い**: あまり好みではない
- **高い**: とても好み、また飲みたい

**評価基準**:
```typescript
rating.isHigh()  // 7以上 = 高評価
rating.isLow()   // 3以下 = 低評価
```

**表示形式**:
```typescript
rating.toDisplayString()  // "8/10"
```

---

### 4. Visibility（公開設定）

**定義**: コーヒー評価の公開/非公開状態

**日本語**: 公開設定

**コード**: `Visibility` Value Object
**場所**: `lib/domain/coffee-evaluation/value-objects/visibility.ts`

**状態**:

#### Public（公開）
- **絵文字**: 🌐
- **日本語**: 公開
- **説明**: すべてのユーザーが閲覧可能
- **用途**: コミュニティで評価を共有したい場合

#### Private（非公開）
- **絵文字**: 🔒
- **日本語**: 非公開
- **説明**: 所有者のみが閲覧可能
- **用途**: 個人的なメモとして保存したい場合

**操作**:
```typescript
// 公開/非公開の切り替え
const toggled = visibility.toggle()

// 状態確認
visibility.isPublic   // true/false
visibility.isPrivate  // true/false

// 表示
visibility.toDisplayString()  // "🌐 公開" or "🔒 非公開"
visibility.getEmoji()         // "🌐" or "🔒"
visibility.getLabel()         // "公開" or "非公開"
```

**UIスタイル**:
```typescript
visibility.getBadgeStyles()
// Public  → "bg-green-100 text-green-800"
// Private → "bg-gray-100 text-gray-800"
```

---

## ユースケース

### コマンド（Command）- データ変更操作

#### Create Evaluation（評価作成）
**クラス**: `CreateEvaluationUseCase`
**場所**: `lib/application/coffee-evaluation/create-evaluation.ts`

**説明**: 新しいコーヒー評価を作成する

**入力**:
```typescript
interface CreateEvaluationInput {
  shopName?: string
  beanName: string        // 必須
  beanType?: string
  roastLevel?: string | null
  acidity: number         // 1-10
  bitterness: number      // 1-10
  aroma: number           // 1-10
  overallRating: number   // 1-10
  isPublic: boolean
}
```

**処理フロー**:
1. 入力データのバリデーション
2. ドメインエンティティの作成
3. リポジトリ経由でデータベースに保存
4. 作成された評価を返す

**成功時**: `/coffee/my` にリダイレクト

---

#### Update Evaluation（評価更新）
**クラス**: `UpdateEvaluationUseCase`
**場所**: `lib/application/coffee-evaluation/update-evaluation.ts`

**説明**: 既存のコーヒー評価を更新する

**前提条件**:
- 評価が存在する
- リクエストユーザーが所有者である

**入力**: 更新したいフィールドのみ（部分更新）

**処理フロー**:
1. 既存評価の取得
2. 所有権の確認
3. エンティティの更新（ドメインロジック）
4. リポジトリ経由で保存

---

#### Delete Evaluation（評価削除）
**クラス**: `DeleteEvaluationUseCase`
**場所**: `lib/application/coffee-evaluation/delete-evaluation.ts`

**説明**: コーヒー評価を削除する

**前提条件**:
- 評価が存在する
- リクエストユーザーが所有者である

**処理**: 論理削除ではなく物理削除

---

### クエリ（Query）- データ取得操作

#### Get Evaluation（評価取得）
**クラス**: `GetEvaluationUseCase`

**説明**: IDで単一の評価を取得する

**アクセス制御**:
- 公開評価: 全ユーザーが閲覧可能
- 非公開評価: 所有者のみ閲覧可能

---

#### List Evaluations（評価一覧取得）
**クラス**: `ListEvaluationsUseCase`

**説明**: フィルタリング・ソート付きで評価一覧を取得

**クエリパラメータ**:
```typescript
interface ListEvaluationsQuery {
  userId?: string           // ユーザーでフィルタ
  isPublic?: boolean        // 公開/非公開でフィルタ
  search?: string           // キーワード検索
  sort?: EvaluationSortOption
  limit?: number            // ページサイズ
  offset?: number           // ページオフセット
  includeUserInfo?: boolean // ユーザー情報を含める
}
```

---

#### Get User Evaluations（ユーザー評価取得）
**クラス**: `GetUserEvaluationsUseCase`

**説明**: 特定ユーザーの評価を取得

**用途**:
- マイページ表示
- ユーザープロフィールページ

---

## リポジトリ操作

### Sort Options（ソート順）

| 値 | 日本語 | 説明 |
|----|--------|------|
| `created_at_desc` | 作成日時降順 | 新しい順（デフォルト） |
| `created_at_asc` | 作成日時昇順 | 古い順 |
| `rating_desc` | 評価降順 | 高評価順 |
| `rating_asc` | 評価昇順 | 低評価順 |
| `shop_name_asc` | 店名昇順 | 店名 A→Z |
| `shop_name_desc` | 店名降順 | 店名 Z→A |

### Search（検索）

**検索対象フィールド**:
- 店名（`shop_name`）
- 豆の名前（`bean_name`）
- 産地（`bean_type`）
- 焙煎度（`roast_level`）

**検索方法**: 部分一致（大文字小文字区別なし）

**例**:
```typescript
// "エチオピア"で検索
repository.findMany({ search: "エチオピア" })
// → bean_typeが"エチオピア"を含む評価
// → bean_nameが"エチオピア イルガチェフェ"を含む評価
```

---

## 権限・所有権

### Ownership（所有権）

**定義**: 評価の所有者（作成者）のみが編集・削除できる

**確認方法**:
```typescript
evaluation.isOwnedBy(userId: string): boolean
```

**使用場面**:
- 編集ボタンの表示制御
- 削除ボタンの表示制御
- サーバーサイドの権限チェック

---

### Viewability（閲覧可能性）

**定義**: 評価を閲覧できるかどうかの判定

**ルール**:
```typescript
evaluation.isViewableBy(userId: string | null): boolean

// ケース1: 公開評価 → 全員が閲覧可能
if (evaluation.isPublic) return true

// ケース2: 非公開評価 + 未ログイン → 閲覧不可
if (!userId) return false

// ケース3: 非公開評価 + 所有者 → 閲覧可能
return evaluation.userId === userId
```

---

## ビジネスルール

### 評価作成のルール

1. **豆の名前は必須**: 空文字列は許可されない
2. **評価値は1-10**: 範囲外の値は拒否される
3. **文字数制限**: 各フィールドに最大文字数あり
4. **整数のみ**: 評価値は小数点不可

### 評価更新のルール

1. **所有者のみ更新可能**: 他人の評価は変更できない
2. **部分更新**: 変更したいフィールドのみ指定
3. **バリデーション**: 更新時も作成時と同じ検証
4. **タイムスタンプ更新**: `updatedAt` は自動更新

### 公開設定のルール

1. **デフォルトは非公開**: 新規作成時は `isPublic: false` を推奨
2. **いつでも切り替え可能**: 作成後も自由に変更できる
3. **即座に反映**: コミュニティフィードへの表示が即座に変わる

---

## ドメインモデル図

```
┌─────────────────────────────────────────────────┐
│         CoffeeEvaluation (Aggregate Root)       │
│  ─────────────────────────────────────────────  │
│  - id: CoffeeEvaluationId                       │
│  - userId: string                               │
│  - shopInfo: ShopInfo                           │◆───┐
│  - beanInfo: BeanInfo                           │◆───┤
│  - ratings: EvaluationRatings                   │◆───┤
│  - visibility: Visibility                       │◆───┤
│  - createdAt: Date                              │    │
│  - updatedAt: Date                              │    │
│  ───────────────────────────────────────────── │    │
│  Factory Methods:                               │    │
│  + create(input): Result<CoffeeEvaluation>      │    │
│  + reconstruct(props): CoffeeEvaluation         │    │
│  ───────────────────────────────────────────── │    │
│  Domain Methods:                                │    │
│  + update(input): Result<CoffeeEvaluation>      │    │
│  + toggleVisibility(): CoffeeEvaluation         │    │
│  + isOwnedBy(userId): boolean                   │    │
│  + isViewableBy(userId): boolean                │    │
│  ───────────────────────────────────────────── │    │
│  Getters:                                       │    │
│  + shopName: string                             │    │
│  + beanName: string                             │    │
│  + beanType: string                             │    │
│  + roastLevel: string | null                    │    │
│  + acidity: Rating                              │    │
│  + bitterness: Rating                           │    │
│  + aroma: Rating                                │    │
│  + overallRating: Rating                        │    │
│  + isPublic: boolean                            │    │
└─────────────────────────────────────────────────┘    │
                                                       │
    ┌──────────────────────────────────────────────────┘
    │
    ├──▶ ShopInfo (店舗情報)
    │    ┌──────────────────────────────┐
    │    │ - shopName: string           │
    │    ├──────────────────────────────┤
    │    │ + hasShopName(): boolean     │
    │    │ + toDisplayString(): string  │
    │    └──────────────────────────────┘
    │
    ├──▶ BeanInfo (豆情報)
    │    ┌─────────────────────────────────┐
    │    │ - beanName: string (必須)       │
    │    │ - beanType: string              │
    │    │ - roastLevel: string | null     │
    │    ├─────────────────────────────────┤
    │    │ + hasBeanType(): boolean        │
    │    │ + hasRoastLevel(): boolean      │
    │    │ + toDisplayString(): string     │
    │    └─────────────────────────────────┘
    │
    ├──▶ EvaluationRatings (評価)
    │    ┌─────────────────────────────────┐
    │    │ - acidity: Rating (酸味)        │
    │    │ - bitterness: Rating (苦味)     │
    │    │ - aroma: Rating (香り)          │
    │    │ - overallRating: Rating (総合)  │
    │    └─────────────────────────────────┘
    │         │
    │         └──▶ Rating (1-10)
    │              ┌──────────────────────────┐
    │              │ - value: RatingValue     │
    │              ├──────────────────────────┤
    │              │ + isHigh(): boolean      │
    │              │ + isLow(): boolean       │
    │              │ + toDisplayString(): str │
    │              └──────────────────────────┘
    │
    └──▶ Visibility (公開設定)
         ┌──────────────────────────────────┐
         │ - isPublic: boolean              │
         ├──────────────────────────────────┤
         │ + toggle(): Visibility           │
         │ + getEmoji(): string             │
         │ + getLabel(): string             │
         │ + toDisplayString(): string      │
         │ + getBadgeStyles(): string       │
         └──────────────────────────────────┘
```

---

## 実装における使用例

### 評価の作成
```typescript
// ユビキタス言語を使用した実装
const result = await createEvaluationUseCase.execute(user.id, {
  beanName: "エチオピア イルガチェフェ G1",  // 豆の名前（必須）
  beanType: "エチオピア",                    // 産地
  shopName: "スターバックス 渋谷店",         // 店名
  roastLevel: "medium",                     // 焙煎度: ミディアム
  acidity: 8,        // 酸味: 8/10
  bitterness: 5,     // 苦味: 5/10
  aroma: 9,          // 香り: 9/10
  overallRating: 8,  // 総合評価: 8/10
  isPublic: true     // 公開設定: 公開
})
```

### 権限チェック
```typescript
// 閲覧権限の確認
if (!evaluation.isViewableBy(currentUserId)) {
  throw new Error("この評価を閲覧する権限がありません")
}

// 編集権限の確認
if (!evaluation.isOwnedBy(currentUserId)) {
  throw new Error("この評価を編集する権限がありません")
}
```

### 検索とフィルタリング
```typescript
// 自分の公開中の評価を高評価順で取得
const evaluations = await repository.findMany({
  userId: currentUser.id,          // 自分の評価のみ
  isPublic: true,                  // 公開中のもの
  sort: "rating_desc",             // 高評価順
  limit: 20                        // 20件まで
})

// キーワード検索: "エチオピア"
const results = await repository.findMany({
  search: "エチオピア",            // 産地・豆名で検索
  isPublic: true,                  // 公開評価のみ
  sort: "created_at_desc"          // 新しい順
})
```

### 公開設定の切り替え
```typescript
// 評価を公開から非公開に変更
const updated = evaluation.toggleVisibility()
await repository.update(updated)

// 表示
console.log(updated.visibility.toDisplayString())  // "🔒 非公開"
```

---

## テストでの使用例

```typescript
// e2e/specs/coffee/create.spec.ts
test('create coffee evaluation', async ({ coffeeFormPage }) => {
  const beanName = "エチオピア イルガチェフェ G1"  // 豆の名前

  // フォームに入力
  await coffeeFormPage.fillBeanName(beanName)
  await coffeeFormPage.fillBeanType("エチオピア")  // 産地
  await coffeeFormPage.selectRoastLevel("medium")  // 焙煎度: ミディアム

  // 評価を入力
  await coffeeFormPage.setAcidity(8)          // 酸味: 8/10
  await coffeeFormPage.setBitterness(5)       // 苦味: 5/10
  await coffeeFormPage.setAroma(9)            // 香り: 9/10
  await coffeeFormPage.setOverallRating(8)    // 総合評価: 8/10

  // 送信
  await coffeeFormPage.submit()

  // 作成後はマイページにリダイレクト
  await expect(page).toHaveURL('/coffee/my')
})
```

---

## 関連ドキュメント

- **技術アーキテクチャ**: `docs/ARCHITECTURE.md` (作成予定)
- **API仕様**: `docs/API.md` (作成予定)
- **開発原則**: `docs/PRINCIPLES.md` (作成予定)
- **プロジェクト概要**: `CLAUDE.md`

---

**最終更新**: 2026-01-30
**バージョン**: 1.0.0
