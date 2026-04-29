# Evaluation Criteria

各 criterion は LLM judge に渡される観点で、**正解ラベル無しの二値判定（pass / fail）+ 理由** を返させる。
判定は出力スキーマと `criteria.md` の規約のみから決まり、dataset の expected 値には依存しない（leak 防止）。

## 出力スキーマ（参照）

```ts
{
  bean_name: string | null,
  bean_type: string | null,
  roast_level: 'light'|'cinnamon'|'medium'|'high'|'city'|'full_city'|'french' | null,
  shop_name: string | null,
  shop_address: string | null
}
```

## Criteria

### `roast_normalization`
- `roast_level` が `null` または上記 enum のいずれかの値である。
- 入力に「中煎り」「medium roast」等の明示記述があれば、対応する enum 値（`medium` 等）に正規化されている。
- フリーテキスト（"medium roast"）や日本語表記（"中煎り"）が enum 値ではなく原文のまま出力されていない。

### `roast_normalization_edge`
- 「極深煎り」「ダーク」「イタリアン」→ `french` にマップされる。
- 「シナモン」→ `cinnamon`、「シティ」→ `city` にマップされる。

### `roast_normalization_ambiguous`
- 入力が複数の焙煎度候補を含む場合、最も主要な焙煎度を 1 つだけ採用する。
- 採用根拠が弱い場合は `null` を許容する（推測しすぎない）。

### `bean_separation`
- 商品名・産地名 → `bean_name`、品種・精製・グレード → `bean_type` に分離されている。
- `bean_name` と `bean_type` に同じ語が重複していない。

### `null_when_unknown`
- 入力テキストに該当情報が無いフィールドは `null` である（推測値を入れない）。

### `no_hallucination_roast`
- 入力に焙煎度の文字列が無い場合、`roast_level` は `null` か慎重な推定。
- 入力に存在しない焙煎度を出力しない。

### `all_null`
- 入力が空または無関係な場合、全フィールドが `null`。

### `shop_vs_bean`
- 店名・ロースタリー名は `shop_name`、商品名は `bean_name`。
- 同一文字列が両方に入っていない。
- 「BLUE BOTTLE COFFEE」のようなブランド名が `bean_name` に入っていない。

### `shop_address_extract`
- パッケージに住所が明記されている場合、`shop_address` に抽出される。
- 住所が無い場合は `null`。

### `mixed_language` / `ja_only` / `en_only`
- 入力言語に依らず、`roast_level` は enum、その他は原文の自然な表記で抽出される。
- 出力に不要な翻訳が入らない（原文 ja → ja のまま）。

### `minimal_input`
- 産地名のみなど断片的な入力でも、利用可能な情報のみ抽出し、不足は `null`。

### `empty_input`
- 入力が空文字列の場合、全フィールドが `null` で、エラーを投げない。

### `brand_blend`
- 「ORIGINAL BLEND」のような単一豆ではない商品では、`bean_type` に「ブレンド」相当が入っているか `null`。
- `bean_name` には商品名（"ORIGINAL BLEND"）。

### `grade_vs_origin`
- 「SUPREMO」「G1」「AA」等のグレード表記は `bean_type` に入る（`bean_name` ではない）。

## 判定方針

- LLM judge は **各 criterion を独立に** 評価し、pass/fail と 1〜2 文の理由を返す。
- ケースに付いた `tags` の criteria のみ評価対象（無関係な criteria は評価しない）。
- 全ての対象 criteria が pass のとき、ケースは pass。
