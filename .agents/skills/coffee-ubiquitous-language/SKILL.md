---
name: coffee-ubiquitous-language
description: コーヒー記録アプリの Ubiquitous Language (用語統制) を確認する。`docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` の正本と整合しているか、命名前にチェックする。
---

# Ubiquitous Language Check

## When to use

- 新しいクラス / 関数 / コンポーネント / DB カラムを命名するとき
- UI 文言（日本語）を追加・変更するとき
- レビュー / リファクタで既存名を疑うとき

## Procedure

1. `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` を読む。
2. 候補語が dictionary にある場合、表記をそのまま揃える。
3. 無い場合、近い既存語との関係（同義 / 別概念）を判断する。
4. dictionary に追記すべきと感じたら、PR の中で 1 行追加する。

## Quick rules

- コードは英語、UI 文言は日本語の二層。
- `CoffeeEvaluation` ✓ / `CoffeeReview` ✗
- 「評価」 ✓ / 「レビュー」 ✗
- 用語が DB / API / UI で揺れていたら、PR 中で揃える（責務外でも 1 箇所だけは直す）。

## Output

判断結果を 1〜3 行で示す。違反があれば「現状の名称 → 推奨」を明記する。
