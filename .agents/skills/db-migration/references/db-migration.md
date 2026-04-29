# DB Migration — 詳細手順

## 命名規則

- ファイル名: `<timestamp>_<verb>_<noun>.sql`
- 例: `20260429120000_add_notes_to_coffee_evaluations.sql`
- 動詞: `add`, `drop`, `rename`, `alter`, `enable_rls`, `policy`

## 典型ケース別テンプレート

### A. カラム追加（NULL 許容）

```sql
ALTER TABLE coffee_evaluations
  ADD COLUMN notes TEXT NULL;
```

### B. カラム追加（NOT NULL + デフォルト）

大規模テーブルでは backfill を別マイグレーションで:

```sql
-- 20260429_add_visibility.sql
ALTER TABLE coffee_evaluations
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
```

### C. RLS ポリシー追加

```sql
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shops_read_public" ON shops
  FOR SELECT
  USING (true);

CREATE POLICY "shops_write_owner" ON shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

### D. インデックス

```sql
CREATE INDEX coffee_evaluations_user_id_created_at_idx
  ON coffee_evaluations (user_id, created_at DESC);
```

## 検証チェックリスト

- [ ] ローカル `supabase status` が green
- [ ] `npx supabase migration up` が exit 0
- [ ] `database.types.ts` に新カラムが反映されている
- [ ] 既存テストが pass（型変化が広範ならテスト側にも mock 修正が要る）
- [ ] RLS の場合: `select`/`insert`/`update`/`delete` 各方向で意図通り動くか SQL で確認

## ロールバック

`supabase db reset` は禁止。代わりに「逆操作のマイグレーション」を新規追加する:

```sql
-- 20260430_drop_notes_from_coffee_evaluations.sql
ALTER TABLE coffee_evaluations DROP COLUMN notes;
```

## 本番適用

`.github/workflows/ci.yml` の `migrate` job が `main` push 時に `supabase db push` を実行する。手動実行はしない。

## トラブルシュート

- `relation does not exist`: 適用順序ずれ。タイムスタンプ昇順で再実行。
- 型生成失敗: `supabase status` でローカル DB 起動確認 → `supabase start`。
- RLS が効かない: ポリシー名重複 / `ENABLE ROW LEVEL SECURITY` 忘れを確認。
