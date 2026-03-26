# Progress Log

実装のたびに追記する短いログです。長い議事録にはしません。

## Entry Template

### YYYY-MM-DD - 変更の要点（一行）
- What: 何を変えたか
- Why: なぜ変えたか
- Rejected: 却下した案（なければ省略）
- Next: 次に確認・改善すべき点
- Decision: `docs/decisions/...` があれば記載。なければ省略

## Entries

### 2026-03-12 - cmux handoff skill に対象 task / agent の確認手順を追加
- What: `.agents/skills/cmux-handoff-orchestrator/SKILL.md` に、続ける作業内容や対象エージェントが未指定なら探索前に確認する手順を追加し、引き継ぎで使った `plan/2026-03-12-cmux-resume-plan.md` も保存
- Why: cmux ログ探索で対象 task や agent を早い段階で絞り、`codex` と `Claude Code` などの取り違えを減らすため
- Rejected: タイトルやセッション名だけで対象を推定する案。作業内容と agent が食い違うケースで誤認しやすいため不採用

### 2026-03-12 - notes migration の version 衝突を解消
- What: `supabase/migrations/20260312000000_add_notes_to_coffee_evaluations.sql` を `20260312010000_add_notes_to_coffee_evaluations.sql` へリネームし、同日の `drop_shop_name_column` migration と version が重ならないよう修正
- Why: CI の Supabase migration 適用時に `schema_migrations.version` の主キー衝突で停止していたため
- Rejected: `drop_shop_name_column` 側の version を変更する案。main 由来の migration を動かすより、このブランチ追加分をずらす方が安全なため不採用

### 2026-03-12 - 感想欄の上限入力を 500 文字で打ち止めに修正
- What: `EvaluationForm` の感想 textarea の `maxLength` を 500 に修正し、UI テストを「500 文字は保存できる」「501 文字目は入力されない」境界値確認へ更新
- Why: 実ブラウザ上で 501 文字まで入力できており、仕様の 500 文字以内を UI でも厳密に守る必要があったため
- Rejected: 501 文字目まで入力させて送信時だけエラーにする案。入力段階で制限した方が挙動が明快なため不採用

### 2026-03-12 - 「評価は後で追加する」で感想欄も隠すよう調整
- What: `EvaluationForm` の表示条件を調整し、`skip_evaluation` 有効時は感想欄も評価スライダーと同様に非表示化。送信時も `notes` を空扱いにし、UI テストを追加
- Why: 「後で評価する」状態では評価補足の感想欄も一緒に隠れる方が操作意図と一致するため
- Rejected: 感想欄だけ常時表示のままにする案。トグル対象の粒度が揃わず挙動が分かりにくいため不採用

### 2026-03-12 - コーヒー評価に感想 `notes` を追加
- What: `coffee_evaluations.notes` migration と型を追加し、作成/編集フォームに 500 文字制限付きの「感想」欄、詳細表示、server action の trim/null/上限制御、関連テストを更新
- Why: コーヒー豆についての感想を評価レコードに保持できるようにし、UI 文言も「メモ」ではなく「感想」に統一するため
- Rejected: `bean_impression` の新設。既存の `notes` 受け皿を正式採用する方が差分が小さく意味も十分伝わるため不採用

### 2026-03-12 - main へのマージ時は CI テストを走らせないよう調整
- What: `.github/workflows/ci.yml` の `test` job を `pull_request` 時のみ実行に変更し、`main` への push では migration job だけが動くよう `needs: test` を外した
- Why: PR を `main` にマージした後の push ではテストを再実行せず、本番向け migration のみを流したいため
- Rejected: workflow 全体から `push` trigger を外す案。production migration も止まってしまうため不採用

### 2026-03-12 - 店名検索を shops.name OR から shop_id 事前解決方式へ変更
- What: `lib/api/coffee.ts` と `supabase-coffee-evaluation-repository.ts` の検索処理で、`shops.name.ilike` を `or()` に直接入れる形を廃止。先に `shops` から一致 `id` を取り、`shop_id.in(...)` と豆情報の `ilike` を組み合わせる方式へ変更し、API テストも更新
- Why: ローカル PostgREST が `or()` 内の `table.column.ilike` を解釈できず、`/coffee/my` の検索 E2E が 0 件になっていたため
- Rejected: `shops.name.ilike` を残したままクエリ文字列だけ調整する案。PostgREST 側の制約を回避できず再発するため不採用
- Next: 検索まわり以外の Playwright 全体は未再実行なので、必要なら回帰確認を広げる

### 2026-03-12 - coffee_evaluations.shop_name 列を完全削除
- What: DBマイグレーション（shop_name残存データをshopsへ移行→列DROP）、型定義に`CoffeeEvaluationDisplay`/`CoffeeEvaluationDisplayWithUser`を追加、entity/repository/api/actions/componentsのすべての書き込みパスから`shop_name`を除去し、読み取りはすべて`shops JOIN`経由に統一
- Why: 旧`shop_name`列と`shops.name`の二重管理による不整合リスクを排除。`shops`テーブル導入後の正本化完結
- Rejected: 列をNULL化のみで残す案。不整合の根本原因が残るため却下
- Next: マイグレーション適用（`npx supabase migration up`）後、ローカルアプリで店名表示・検索・A-Zソートを動作確認

### 2026-03-12 - PR #26 レビュー3点を実装 (shops正本化 / 保存失敗明示 / stale response防止)
- What: (1) `supabase-coffee-evaluation-repository.ts` の全 select を `*, shops(name)` JOIN に変更し `shop_id` あり行は `shops.name` を shopName に採用 (2) `resolveShopId` を `ShopIdResult` 型に変え `findOrCreate` 失敗時に action 全体をエラー終了させる (3) `use-shop-autocomplete-controller.ts` に `requestSeqRef` を追加し古い世代のレスポンスが state を上書きしないよう制御
- Why: `docs/plans/pr-26-review-fixes.md` の 3 指摘 — 店名の表記ゆれ・保存失敗の握りつぶし・オートコンプリートの stale 候補 — への対応
- Rejected: AbortController による fetch キャンセル。シーケンス番号のほうが軽量で同等の効果があるため不採用
- Next: shop_name_asc/desc のソートが旧 shop_name 列基準のまま。joined shops.name 基準にするには DB 側の computed column か VIEW が必要

### 2026-03-12 - PR #26 レビュー修正を別 plan に分離
- What: `docs/plans/pr-26-review-fixes.md` を新規追加し、`shops` 正本化・保存失敗の明示エラー化・autocomplete の stale response 防止・追加テスト観点を整理。元の `extract-shops-and-search.md` は主計画のまま維持
- Why: レビュー対応は元機能の実装計画とは別に追える方が、修正意図と差分の責務が明確になるため
- Rejected: 既存 plan へ追記する案。元の計画とレビュー是正が混ざって読みづらくなるため不採用

### 2026-03-12 - 店舗オートコンプリートの責務を controller/helper に分離
- What: `shop-autocomplete.tsx` の検索・キーボード操作・外側クリック制御を `use-shop-autocomplete-controller.ts` と `shop-autocomplete-helpers.ts` に切り出し、helper テストを追加
- Why: PR #26 の指摘どおり、表示コンポーネントに状態遷移と検索ロジックが集まりすぎていて責務が曖昧だったため
- Rejected: fetch URL 組み立てだけ helper 化してイベント分岐を component に残す案。レビュー意図の「ロジック分離」を満たしきれないため不採用

### 2026-03-11 - E2E の詳細遷移 helper を安定化
- What: `e2e/fixtures/coffee-list.ts` に詳細遷移 helper を追加し、`community/detail/edit/delete/ratings` の spec を `heading.click()` 依存から切り替え。helper はカードリンクの `href` を使って `page.goto(href)` で詳細へ移動する形に整理
- Why: 見出し click と緩い URL 判定の組み合わせだと `/coffee/my` を誤認したり、一覧側の再ナビゲーションに吸われたりして E2E が不安定だったため
- Rejected: click のまま `waitForURL` / retry / force を足す案。遷移前提の不安定さが残り続けるため不採用

### 2026-03-11 - 評価 row helper の型境界を修正
- What: `extractRatingsFromRow()` で DB row の評価値を `number | null` として扱う型に分離し、全項目が揃った後だけ `RatingValue` へ変換するよう修正
- Why: `Database` の生値を最初から `RatingValue` 扱いすると build 時の型検査に失敗するため
- Rejected: row 定義側を `RatingValue | null` に寄せる案。Supabase 生成型との整合が崩れるため不採用

### 2026-03-11 - 評価 row 復元時の null 判定を helper に集約
- What: `supabase-coffee-evaluation-repository.ts` で `hasRatings` を廃止し、評価4項目を `extractRatingsFromRow()` でまとめて復元。4項目が一部だけ null の row は不整合エラーに変更し、repository テストも追加
- Why: 評価値は all-or-nothing というドメイン制約を読み取り側でも明示し、部分 null を静かに未評価扱いしないため
- Rejected: `row.acidity !== null && ...` の真偽値だけ別 helper に逃がす案。見た目は少し良くなっても mixed state の扱いが曖昧なまま残るため不採用

### 2026-03-11 - Repository の評価永続化マッピングを共通化
- What: `supabase-coffee-evaluation-repository.ts` に書き込み用フィールド抽出の helper を追加し、`entity.acidity?.value ?? null` などの繰り返しを `entity.toPersistence()` ベースへ置き換え
- Why: 評価値の null 変換ロジックをリポジトリ内で重複させず、ドメイン側の永続化表現に寄せて責務を明確にするため
- Rejected: Insert/Update それぞれで `?.value ?? null` を残したまま微修正する案。重複が消えず、将来の項目追加時に差分が出やすいため不採用

### 2026-03-11 - 評価スコアの永続化型を明示して null 表現を共通化
- What: `EvaluationRatings` の永続化用型を `RatingsPersistence` / `NullRatingsPersistence` として切り出し、未評価豆の null 値を `NULL_PERSISTENCE` に集約。`CoffeeEvaluation.toPersistence()` もその型を返すように整理
- Why: 評価あり/なしの永続化形を型で明示し、null オブジェクトの重複定義を避けるため
- Rejected: `CoffeeEvaluation` 側で匿名オブジェクトのまま null 値を都度組み立てる案。型の意図が見えにくく重複も残るため不採用

### 2026-03-11 - 初期テンプレート追加
- What: `AGENTS.md` の運用に合わせて progress ログの雛形を追加
- Why: 小さな修正も同じ粒度で残せるようにするため
- Rejected: issue や PR 本文だけを記録源にする案。検索しづらく、日常運用で抜けやすいため不採用

### 2026-03-26 - E2E テスト: 'ログイン中:' テキスト削除に追従
- What: PR #36 でホームページが LP 風に改修されて `'ログイン中:'` が削除されたため、3つの E2E テストを修正
- Why: auth.setup.ts / login.spec.ts / logout.spec.ts が存在しないテキストを参照して CI が失敗
- Rejected: ページに 'ログイン中:' テキストを復活させる案 — UI 改善を元に戻すのは不適切
- Next: なし

### 2026-03-11 - CLAUDE.md に継続記録ルールを追加、progress.md テンプレートに Next フィールドを追加
- What: CLAUDE.md v1.2.0 に「Continuous Recording」セクション追加。progress.md の Entry Template に `Next:` フィールドを追加
- Why: 小さな修正を意味単位で記録し、Claude が毎回同じルールで作業できるようにするため
- Rejected: AGENTS.md を別途作成する案 — CLAUDE.md に統合した方が Claude が確実に読む
- Next: 実際の開発作業でエントリーが適切な粒度で記録されているか運用確認
