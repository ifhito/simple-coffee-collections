---
skillName: sudo-modeling
description: DDDドメイン分析のためのsudoモデリング手法（Object図から始めて具体→抽象の順でS-U-D-O 4つの図を作成）。ユーザが「sudoモデリングを使用して」、「sudoモデリングで」、「DDD設計をして」と言ったら使用してください。
version: 1.0.0
author: hotake
tags: [ddd, domain-modeling, sudo-modeling, analysis, design]
---

# sudo-modeling

DDDドメイン分析のための「sudoモデリング」手法スキル。

## トリガー条件

以下のいずれかに該当する場合にこのスキルを使用:

- ユーザーが「ドメインモデリング」「DDD分析」「sudoモデリング」を要求した
- 新しい境界づけられたコンテキストを設計する必要がある
- エンティティ・値オブジェクト・集約の設計が必要
- ビジネスルールや制約の明確化が必要

## 関連ドキュメント

- **./references/PRINCIPLES.md**: コア原則（5つ）
- **./references/PWORKFLOW.md**: 4フェーズのワークフロー
- **./references/PTEMPLATES.md**: Mermaidダイアグラムテンプレート

## 使用方法

1. `./references/PWORKFLOW.md`のフェーズに従って進める
2. `./references/PTEMPLATES.md`のテンプレートを使用してダイアグラムを作成
3. `./references/PPRINCIPLES.md`の原則に基づいて設計を検証

## 出力形式

- Mermaidダイアグラム（クラス図、シーケンス図、フローチャート）
- マークダウンドキュメント
- TypeScript型定義（必要に応じて）
