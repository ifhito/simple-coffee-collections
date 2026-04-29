# Progress Log

実装のたびに追記する短いログです。長い議事録にはしません。

### 2026-04-30 - Proactive Surfacing メタ disposition を Claude に embed (気付き → 確認 → ルール昇格)
- What: `~/.claude/projects/-Users-hotake-Documents-coffee-app-simple-coffee-collections/memory/feedback_proactive_surfacing.md` を新規作成し「節目で『他にやった方が良い follow-up は?』を自問 → 未ルール化案件は一行確認 → OK ならその場で `feedback_<topic>.md` 作成 + `MEMORY.md` 索引追記でルール昇格」というメタ disposition を embed。`MEMORY.md` の `## Workflow` セクションを 2 行構成 (メタ + Auto-PR 実例) に書き換え。`CLAUDE.md` の Feature Development Workflow に step 4 (Proactive Surfacing) と step 5 (Auto-PR 昇格済みルール) を追加。Last Updated/Version を 2026-04-30 / 1.4.0 に更新
- Why: 旧 Auto-PR ルール (2026-04-29 確立、常に PR 自動作成) は具体例として正しかったが、ユーザー本意は PR 限定の自動化ではなく「follow-up 全般を能動提案 → OK ならルール化する disposition」だった。能動性 (Notice/Ask) と学習ループ (Promote) の組み合わせで「同じ確認を 2 度させない」を実現する
- Rejected: Stop hook での機械的 nudge (judgement 必要なものは LLM 側で動かす方針)、旧 `feedback_auto_pr.md` の削除 (昇格済みルール実例として温存し、新 disposition から参照する構造)、Proactive Surfacing と Auto-PR の合流 (step 4 はメタ disposition、step 5 は具体ルールで層を分けた方が読みやすい)
- Next: 効果が観察できなければ Stop hook で Edit/Write 直後限定の self-prompt nudge を追加検討。次タスク以降で Claude が他ジャンル (docs / E2E / 隣接 cleanup) の follow-up を能動提案するか、OK されたら新ルールが追加されるかを観察

### 2026-04-29 - データフェッチ系全ルートに loading.tsx を追加 (profile / ai / users/[userId] / coffee/[id]/evaluate)
- What: `(app)` 配下を全数調査し、データフェッチありで loading.tsx 欠落の 4 ルートに skeleton を追加。`app/(app)/profile/loading.tsx` (max-w-3xl の表示名 input + bio textarea + 送信ボタン)、`app/(app)/ai/loading.tsx` (max-w-4xl の AI 設定セクション + OCR セクション)、`app/(app)/users/[userId]/loading.tsx` (max-w-6xl のプロフィールヘッダー + SearchAndSort + 縦フィード `FeedListSkeleton showUserHeader=false`)、`app/(app)/coffee/[id]/evaluate/loading.tsx` (max-w-5xl の豆情報カード + RatingSliders 4 個 + 感想 textarea + ボタン)。それぞれ page.tsx の外側コンテナ class を 1:1 で複製
- Why: 「ショップも同様にロードを入れて」のユーザー指示を起点に Proactive Surfacing 原則で `(app)` 全体を点検したところ、data fetching 有りで loading.tsx 欠落のルートが 4 つあった。ショップだけ揃えて他を放置するのは中途半端なので一気に揃える
- Rejected: フォーム系ルート (`/contact`, `/login`, `/signup`, `/company`) には loading.tsx を追加しない判断 (これらは server-side data fetching が無い静的ページ or client form なので loading.tsx は発火しない)
- Next: 認証必須ルートが大半のため Playwright で実画面確認できなかった。ローカルログイン状態での目視確認をフォローアップに残す

### 2026-04-29 - /shops のロード状態を整え、Suspense fallback と loading.tsx を skeleton 化
- What: `app/(app)/shops/_components/shop-skeleton.tsx` を新規作成し `ShopSearchSkeleton` / `ShopListSkeleton` を export。`app/(app)/shops/loading.tsx` を新規追加し、page.tsx と同じ `max-w-4xl` ヘッダー + ShopSearch box + 3 列 grid (sm:grid-cols-2 lg:grid-cols-3) を 1:1 で skeleton 化。`app/(app)/shops/page.tsx` の Suspense fallback を `null` / `<p>読み込み中...</p>` から `<ShopSearchSkeleton />` / `<ShopListSkeleton />` に置換
- Why: `/shops` には loading.tsx が無く、page.tsx の Suspense fallback も雑（ShopSearch は null、ShopList はプレーンテキスト 1 行）でロード後の grid と全く違う形だったため、My Collection / Community と同じく CLS が起きていた。同 PR で扱った coffee 系ロード一貫性の路線にショップも揃える
- Rejected: skeleton をインラインで page.tsx と loading.tsx に二重実装 → `_components/shop-skeleton.tsx` に共通化（feed-skeleton.tsx と同じパターン）
- Next: 認証必須ルートのため Playwright で実画面確認できなかった点を、ローカルログイン状態での目視確認に回す

### 2026-04-29 - ロード中／ロード後のレイアウト不一致を解消 (My Collection / Community / /coffee)
- What: `app/(app)/coffee/_components/list/feed-skeleton.tsx` を新規作成し `FeedListSkeleton` / `SearchAndSortSkeleton` を export。`app/(app)/coffee/my/loading.tsx` と `app/(app)/coffee/community/loading.tsx` を新規追加し、page.tsx と同じ外側コンテナ (`max-w-6xl` → ヘッダー → SearchAndSort → `max-w-2xl` 縦フィード) を skeleton 化。`app/(app)/coffee/loading.tsx` を旧 3 列グリッドからリダイレクト先と一致する縦フィード skeleton に書き換え。Playwright で desktop/mobile の skeleton レンダリングを確認
- Why: PR #46 で My Collection が 3 列グリッド → `max-w-2xl` 縦フィードに変わったが loading 表現が追従しておらず、`/coffee/my` と `/coffee/community` には loading.tsx 自体が無かった。`/coffee/loading.tsx` もリダイレクト先と全く異なるグリッドだったため、ロード中とロード後で UI がチラつく状態を解消
- Rejected: skeleton を 3 つの loading.tsx でインライン重複 → 共通の `feed-skeleton.tsx` 1 ファイルに集約（FeedCard 構造変更時の追従コスト削減）
- Next: `/coffee/new/loading.tsx` と `/coffee/[id]/edit/loading.tsx` に残る Tailwind ハードコード色 (`bg-amber-200`, `bg-neutral-200`) を OKLCH デザイントークン (`var(--ink)`, `var(--rule)` 等) に置き換える別タスク

### 2026-04-29 - エージェントハーネス最小セット導入 (Claude Code / Codex 共通)
- What: AGENTS.md を運用メモに整理(80行以内)、`.claude/settings.json` に Stop hook (`tsc --noEmit` + `lint --quiet`) と `.env`/`secrets`/`supabase db reset` 等の deny を追加、`package.json` に `typecheck` スクリプト追加、共通 SKILL 3 個 (`coffee-ubiquitous-language` / `progress-logger` / `clean-arch-boundary`) を `.agents/skills/` に作成し `.claude/skills/` から symlink、サブエージェント 3 個 (`researcher` / `reviewer` / `tester`) を `.claude/agents/` に追加、`lib/__tests__/architecture/layer-dependency.test.ts` で Clean Arch 層境界を Jest テスト化(41 ファイル pass)、`@types/jest` を devDependencies に追加
- Why: ETHチューリッヒ研究を踏まえ、冗長な指示を避けつつ Claude/Codex 双方で動く最小ハーネスを敷くため。型検査を Stop hook に組み込むことで CI の盲点(typecheck 未実行)を補完
- Rejected: `next-lint` を ESLint CLI へ移行(Next.js 16 の警告が出ているが範囲外)、Stop hook で `pnpm test` 実行(重い)、アーキテクチャ境界を eslint-plugin-import で表現(プラグイン追加コスト > Jest 1 ファイル)
- Next: **Stop hook で typecheck が 11 件の既存型エラーを発見**(`coffee-evaluation.test.ts` の Rating null 化未追従 6 件、`actions/coffee.test.ts` の `redirect as jest.Mock` キャスト 2 件、`api/coffee.test.ts` の notes 不足 + sort option 不一致 2 件、`Input.test.tsx` の `toHaveAttribute` 型未解決 1 件)。これらは別タスクとして type-debt 修正 PR で対応する
- Decision: `harness-audit.md` (audit 結果と提案) をリポジトリ直下に保存
- What: `e2e/fixtures/coffee-list.ts` の `openEvaluationDetail` セレクターを `[data-testid="coffee-card"], [data-testid="feed-card"]` に変更。`community.spec.ts` と `search-and-sort.spec.ts` のインラインセレクターも `feed-card` に更新
- Why: My Collection が FeedCard（`data-testid="feed-card"`）に切り替わったため、旧 `coffee-card` セレクターが 13 テストで Not Found エラーになっていた
- Next: E2E テストが全パスすることを確認

### 2026-04-19 - エディトリアル風デザインリニューアル (pr-package 2 適用)
- What: globals.css に OKLCH デザイントークン追加、layout.tsx に Instrument Serif/Geist フォント追加、新規共有コンポーネント (radar-chart/bean-mark/roast-dots/score-bar) 作成、LP/NavBar/card/feed-card/coffee-slider を全面刷新
- Why: pr-package 2 のエディトリアル風テイスティングジャーナルデザインを適用
- Next: ブラウザで LP/NavBar/カード/フィード/スライダーの表示確認

### 2026-03-30 - お問い合わせページにメール送信フォームを追加
- What: Resend + Server Action + useActionState でメール送信フォームを実装（PR #43 に追加）
- Why: GitHub Issues リンクだけでなくフォームからメール送信できるようにするため
- Rejected: mailto: リンク（UX不良）、Nodemailer（設定複雑）
- Next: RESEND_API_KEY を Vercel 環境変数に設定すること

## Entry Template

### YYYY-MM-DD - 変更の要点（一行）
- What: 何を変えたか
- Why: なぜ変えたか
- Rejected: 却下した案（なければ省略）
- Next: 次に確認・改善すべき点
- Decision: `docs/decisions/...` があれば記載。なければ省略

## Entries

### 2026-03-30 - 企業情報・お問い合わせページ追加（Google ADS 対応）
- What: `/company`（企業情報）と `/contact`（お問い合わせ）ページを新設、フッターコンポーネントを追加し全 `(app)` ページに表示。middleware の公開パスに両ルートを追加
- Why: Google ADS 審査に必要な透明性確保のため（issue #42）
- Next: プライバシーポリシーページの追加も検討する

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

### 2026-04-19 - エディトリアルデザイン全体の CSS 変数統一
- What: `amber-*` / `neutral-*` / `gray-*` Tailwind カラーをアプリ全体で CSS 変数（`--ink`, `--espresso`, `--rule`, `--paper`, `--background-2`等）に置換。評価詳細ビューで `RatingStars` を数値表示（`font-mono-num`＋軸カラー）に変更。ボタンを全て `rounded-full` pill スタイルに統一。
- Why: pr-package 2 で導入した OKLCH デザイントークンが一部ページでのみ適用され、デザインの不一致感が生じていたため
- Rejected: ページごとに部分適用を維持する案 — 視覚的な統一感が損われる
- Next: ブランチ `redesign/editorial-tasting-journal` を PR としてマージ

### 2026-04-19 - My Collection を Community と同じフィードレイアウトに統一
- What: `MyPageView` の CoffeeCard グリッドを `FeedCard` フィードに置換。`FeedCard` に `showUserHeader` / `badge` props 追加（非表示時はシンプルな日付+店名ヘッダー）。`MyPageContainer` を `getCoffeeEvaluationsWithUser` に切替。`PublicBadge` をカードヘッダーに配置。
- Why: ユーザー要望「mycollectionもcommunityと同じような形で」—グリッドとフィードの視覚差分が気になるとのフィードバック
- Rejected: 新コンポーネントを作る案 — `FeedCard` に props 追加するだけで再利用できるため不採用
- Next: なし
