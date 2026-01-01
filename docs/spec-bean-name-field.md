# 仕様: 豆の名前フィールド追加

## 背景

現在の`coffee_evaluations`テーブルには`bean_type`（豆の種類）しかなく、具体的な商品名やブレンド名を記録できない仕様漏れがあります。

### 問題点

CSVインポートデータの例:
- 商品名: "HONDURAS", "FRENCH ROAST", "ONIBUS BLEND", "モカ イルガチェフェ"
- これらを`bean_type`に入れているが、本来は商品名/ブレンド名として別フィールドで管理すべき

## 要件

### 1. データモデルの区別

| フィールド | 説明 | 例 |
|----------|------|-----|
| `bean_name` | **商品名/ブレンド名** (必須) | "ONIBUS BLEND", "モカ イルガチェフェ", "FRENCH ROAST" |
| `bean_type` | **豆の種類** (任意) | "Arabica", "Robusta", "Blend", "Single Origin" など |

### 2. フィールド仕様

#### bean_name (TEXT NOT NULL)
- **説明**: コーヒー豆の商品名、ブレンド名、または一般的な呼称
- **必須**: はい
- **例**:
  - "ONIBUS BLEND"
  - "ケニア(GAKUNDO AA)"
  - "モカ イルガチェフェ"
  - "FRENCH ROAST"

#### bean_type (TEXT NULLABLE)
- **説明**: コーヒー豆の分類・種類
- **必須**: いいえ（任意）
- **例**:
  - "Arabica"
  - "Robusta"
  - "Blend"
  - "Single Origin"
  - NULL（未指定）

## 実装

### スキーマ変更

```sql
-- coffee_evaluationsテーブルにbean_nameカラムを追加
ALTER TABLE coffee_evaluations
ADD COLUMN bean_name TEXT;

-- 既存データのマイグレーション: bean_type → bean_name
UPDATE coffee_evaluations
SET bean_name = bean_type
WHERE bean_name IS NULL;

-- bean_nameを必須に変更
ALTER TABLE coffee_evaluations
ALTER COLUMN bean_name SET NOT NULL;

-- bean_typeはNULLABLEのまま（任意フィールド）

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_bean_name
ON coffee_evaluations(bean_name);

CREATE INDEX IF NOT EXISTS idx_coffee_evaluations_bean_name_gin
ON coffee_evaluations USING gin(bean_name gin_trgm_ops);
```

### データマッピング（CSVインポート時）

| CSVフィールド | データベースフィールド |
|-------------|-------------------|
| `name` | `bean_name` |
| （未使用） | `bean_type` (NULL) |

## 影響範囲

### データベース
- `coffee_evaluations`テーブルのスキーマ変更
- 既存データの移行（`bean_type` → `bean_name`）

### アプリケーション
- フォーム入力: `bean_name`を必須フィールドとして表示
- 検索機能: `bean_name`での検索をサポート
- 表示: 豆の名前を主要情報として表示

## ロールバック

万が一問題があった場合:

```sql
-- bean_nameカラムを削除
ALTER TABLE coffee_evaluations
DROP COLUMN IF EXISTS bean_name;
```

## 備考

- 将来的に`bean_type`のマスターデータを作成する可能性があるが、現時点では自由入力
- `bean_name`は検索対象として重要なため、全文検索インデックス（GIN）を設定
