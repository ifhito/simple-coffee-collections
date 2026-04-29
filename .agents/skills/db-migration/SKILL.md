---
name: db-migration
description: スキーマ変更が必要なとき呼ぶ。Supabase migration 生成・適用・型再生成を一貫で実行
allowed-tools: Read, Write, Edit, Bash
---

# DB Migration (Supabase)

## When to use

新しいテーブル / カラム / インデックス / 制約 / RLS ポリシーの追加変更時。型生成のずれ修正時。

## Procedure

1. `npx supabase migration new <snake_case_name>` で空ファイル生成（タイムスタンプは自動付与）。
2. `supabase/migrations/<timestamp>_<name>.sql` に DDL を書く（既存ファイルは編集禁止）。
3. `npx supabase migration up` でローカル DB に適用する。
4. `npx supabase gen types typescript --local > lib/types/database.types.ts` で型を再生成する。
5. 影響テストを回す: `pnpm test --testPathPattern=infrastructure` および関連ユニット。
6. RLS / 制約変更を含む場合は SQL を `references/db-migration.md` の「典型ケース」と照合する。

詳細手順は `references/db-migration.md` を参照。

## Output

- 生成したファイル名（タイムスタンプ込み）
- 適用ログの最終行
- `database.types.ts` の差分行数
- 走らせたテストの pass/fail サマリ

## Forbidden

- `supabase db reset` — データ全消去禁止（`memory-bank` に過去事故記録あり）。
- 既存マイグレーションファイル `supabase/migrations/*.sql` の編集 — 不変、追加で対応する。
- 本番への直接 `supabase db push` — CI (`.github/workflows/ci.yml`) が main マージ時に自動適用するため手動実行しない。
