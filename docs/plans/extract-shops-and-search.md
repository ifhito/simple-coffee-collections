# 既存 DB の店舗名を使った店舗テーブル分離と検索基盤

## Summary

- `coffee_evaluations.shop_name` に入っている既存店舗名を元データとして使い、SQL migration で `shops` テーブルへ一括移行する。
- 移行時は `INSERT ... SELECT DISTINCT ...` と正規化キーを使って重複をまとめ、続けて `coffee_evaluations.shop_id` を backfill する。
- その上で `/shops` の店舗検索を追加し、検索実装は provider 抽象化で将来の API 検索を差し込める構成にする。
- 評価作成/更新は DB 店舗候補のオートコンプリートを出し、未登録店舗は自由入力で新規登録できるようにする。

## Key Changes

### DB / migration

- `shops` テーブルを追加する。
- 想定カラム:
  - `id`
  - `name`
  - `normalized_name`
  - `created_at`
  - `updated_at`
- `normalized_name` に一意制約を置く。
- `coffee_evaluations` に nullable な `shop_id` を追加する。
- migration 内で既存データを使って店舗を作成する。
- 使用する方針は `coffee_evaluations` から空文字・null を除外して `SELECT DISTINCT` し、`shops` に投入する。

```sql
insert into shops (name, normalized_name)
select distinct
  trim(shop_name) as name,
  lower(regexp_replace(trim(shop_name), '\s+', ' ', 'g')) as normalized_name
from coffee_evaluations
where shop_name is not null
  and trim(shop_name) <> ''
on conflict (normalized_name) do nothing;
```

- 続けて既存評価へ `shop_id` を backfill する。

```sql
update coffee_evaluations ce
set shop_id = s.id
from shops s
where ce.shop_name is not null
  and trim(ce.shop_name) <> ''
  and s.normalized_name = lower(regexp_replace(trim(ce.shop_name), '\s+', ' ', 'g'));
```

- backfill 完了後に `coffee_evaluations.shop_id` へ FK を付与する。
- 当面は安全移行のため `shop_name` を即削除せず、アプリ切替後の後続 migration で削除する 2 段階にする。
- `shops.name` に検索用 index、`shops.name` または `normalized_name` に trigram index を付ける。

### アプリケーション / 検索設計

- 取得系は `coffee_evaluations` 単体ではなく `shops` join 前提へ寄せる。
- 表示用の `shop_name` は join した `shops.name` を返し、未移行/未設定だけ旧列をフォールバックに使う。
- 店舗検索用の `ShopSearchProvider` と `ShopSearchResult` を追加する。
- 初期実装は `DatabaseShopSearchProvider` のみで、将来は外部 API provider を追加するだけで拡張できる形にする。
- 検索集約層は provider 配列を順に実行し、戻り値を正規化して返す。

### 保存フロー

- 評価フォームの店名欄は DB 候補のオートコンプリート対応にする。
- 候補選択時は既存 `shop_id` を保持する。
- 自由入力時は保存処理で `shops` を upsert して `shop_id` を取得し、評価へ保存する。
- v1 では `shop_name` 文字列も互換のため送れるようにしておき、内部保存の正本は `shop_id` にする。

### UI

- `/shops` ページを追加し、DB 登録済み店舗を検索できるようにする。
- ナビゲーションに店舗検索導線を追加する。
- 店舗検索結果はまず `name` 中心で表示し、将来 API 由来の住所やメタデータを足せる結果型にしておく。

## Test Plan

- migration
  - `coffee_evaluations` 内の既存店舗名から `shops` が重複なく生成される。
  - 空文字・null の店名は `shops` に登録されない。
  - `shop_id` backfill が既存評価へ正しく入る。
- API / Repository
  - 評価一覧・詳細で `shops.name` が `shop_name` として表示される。
  - 店舗検索が DB のみで成立する。
  - provider 集約層が統一結果型を返す。
- 保存フロー
  - 候補選択で既存 `shop_id` が保存される。
  - 新規入力で `shops` に追加後、評価へ紐付く。
  - 店名未入力は `shop_id = null` のまま保存される。
- 実行確認
  - 関連 Jest テスト
  - `npm run build`

## Assumptions

- 既存 DB の店舗名移行はアプリコードではなく Supabase migration の SQL で行う。
- 正規化は `trim + 連続空白圧縮 + lower-case` を初期ルールとする。
- `shop_name` 列の完全削除は、アプリの join 切替と本番データ確認後の後続タスクに回す。
- 外部 API 連携は今回は未実装で、抽象化のみ用意する。
