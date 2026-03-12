# PR #26 レビュー対応計画

## Summary

- PR #26 のレビューで見つかった 3 点を別計画として切り出す。
- 対象は `shops` 正本化の読み取り統一、店舗自動登録失敗時の明示エラー化、オートコンプリートの stale response 防止。
- 完了条件は `/coffee` 系画面と `/shops` で同じ店舗名が表示され、店舗解決失敗を握りつぶさず、入力打ち替え時に古い候補が再表示されないこと。

## Key Changes

### 読み取り系の `shops` 正本化

- `coffee_evaluations.shop_name` は移行互換の fallback 列として残し、表示用の店名は原則 `shops.name` を使う。
- 評価取得 repository は `coffee_evaluations` 単体の `select('*')` をやめ、`shop_id` 経由で `shops(name)` を join した結果から `ShopInfo` を復元する。
- `shop_id` がある row は `shops.name` を `shopName` に採用し、`shop_id` が null の旧データだけ `coffee_evaluations.shop_name` を fallback に使う。
- `lib/api/coffee.ts` と repository 実装で `shopName` 解決規則をそろえ、一覧、詳細、コミュニティ一覧、編集初期値のすべてで同じ店名を返す。
- 店名検索と `shop_name_asc` / `shop_name_desc` も表示名と同じ値を基準にし、旧 `shop_name` の表記ゆれ順に並ぶ状態をなくす。

### 保存フローの失敗を握りつぶさない

- `resolveShopId()` は `string | null` ではなく失敗を返せる形に変え、`findOrCreate()` に失敗したら action 全体をエラー終了させる。
- `shop_name` が空のときだけ `shop_id = null` を許容し、`shop_name` があるのに店舗解決できない状態は保存しない。
- 既存 `shop_id` が送られた場合はその値を優先するが、存在しない ID や整合しない入力を silently null に落とさない。
- create/update の利用者向けエラー文言は店舗保存失敗だと分かる内容にそろえる。

### Autocomplete の stale response 防止

- `use-shop-autocomplete-controller` に request の世代管理を入れる。実装は `AbortController` または request sequence のどちらかで統一する。
- 最新入力と一致しない response は `setSuggestions()` しない。
- 入力を空に戻した後や別 query に打ち替えた後に、遅れて返った古い response で候補が再表示されないようにする。
- fetch 失敗時は候補を閉じるだけでなく、進行中 request の状態も破棄する。

## Test Plan

- Repository / API
  - `shop_id` あり + `shops.name` ありの row で、返却 `shopName` が join 先になる。
  - `shop_id` null の旧 row では `coffee_evaluations.shop_name` が fallback される。
  - 店名検索と `shop_name_asc` / `shop_name_desc` が join 先の表示名基準で動く。
- Server Actions
  - 新規店名入力で `findOrCreate()` 成功時は `shop_id` が保存される。
  - `findOrCreate()` 失敗時は insert/update せずエラーを返す。
  - 空店名では `shop_id = null` のまま保存される。
- UI
  - 候補取得中に入力を空へ戻した場合、遅れて返った古い response が候補を開かない。
  - `Blu` 入力後に `Blue Bottle` へ打ち替えた場合、古い query の候補で上書きされない。
  - 候補選択時は `shopName` と `shopId` が揃って更新される。
- Regression
  - `/coffee/my`、`/coffee/community`、詳細ページ、編集初期値、`/shops` で同じ店舗名が表示される。

## Assumptions

- `coffee_evaluations.shop_name` 列は今回削除しない。読み取り fallback 用に残す。
- `shops` が店舗名の正本であり、今後の UI 表示は原則そこへ寄せる。
- `plans/parallel-moseying-creek.md` は作業メモ扱いで、このレビュー対応計画の正本は `docs/plans/pr-26-review-fixes.md` とする。
