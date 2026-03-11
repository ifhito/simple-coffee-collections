# AGENTS.md

このファイルは、このリポジトリで作業する AI / 人間向けの共通運用メモです。
README はセットアップ、CLAUDE.md は背景と設計方針、AGENTS.md は日々の実装運用を担当します。

## Project Snapshot

- プロダクト: コーヒー体験を記録・共有する Next.js アプリ
- UI 言語: 日本語
- 主な技術: Next.js App Router, TypeScript, Tailwind CSS, Supabase, Jest, Playwright
- アーキテクチャ: Clean Architecture + DDD
- 主要ディレクトリ:
  - `app/`: 画面と API ルート
  - `components/`: 汎用 UI
  - `lib/domain/`: ドメインモデル
  - `lib/application/`: ユースケースと DTO
  - `lib/infrastructure/`: Supabase / 外部連携 / Repository
  - `lib/actions/`: Server Actions
  - `supabase/`: migration, seed
  - `docs/`: 用語集・設計補助ドキュメント

## Working Rules

- 実装前に `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` を確認し、用語を既存実装と揃える。
- 変更は大きさではなく意味単位で扱う。小さな修正でも、別の意図があるなら分けて実装・記録する。
- 変更ログは長文化しない。後で見返して判断理由が分かる最小限だけ残す。
- 迷いが再発しそうな判断だけ `docs/decisions/` に記録する。自明な修正は `progress.md` のみでよい。
- テストは変更範囲に応じて最小十分で実行する。挙動変更がある場合は、少なくとも関連テストかビルドのどちらかで確認する。

## Progress Logging

- 実装を行ったら、`memory-bank/progress.md` に小修正を含めて追記する。
- 1 エントリで最低限わかるように書く:
  - `何を変えたか`
  - `なぜ変えたか`
  - `却下した案`
- 1 変更 1 エントリを原則にする。ただし同じ意図の修正はまとめてよい。
- 空欄を増やさず、2-6 行程度で済む粒度を優先する。

## Decision Records

- 保存先は `docs/decisions/`
- 残す対象:
  - 今後も複数回迷いそうな命名や責務分割
  - 一見不自然だが意図がある制約
  - 採用案と却下案の比較が将来必要になりそうな判断
- 残さない対象:
  - 単純な typo 修正
  - テストの期待値更新だけの変更
  - コードを見れば十分に分かる微修正

## Recommended Workflow

1. 影響範囲を確認する
2. 用語と既存責務を確認する
3. 意味単位で実装する
4. 必要なテストまたはビルドで確認する
5. `memory-bank/progress.md` を追記する
6. 将来また迷う判断なら `docs/decisions/` に短く残す

## References

- `README.md`: セットアップと基本コマンド
- `CLAUDE.md`: プロジェクト目的、設計方針、開発の前提
- `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md`: 用語の正本
- `memory-bank/progress.md`: 実装の短い進捗ログ
- `docs/decisions/`: 継続的に参照したい判断記録
