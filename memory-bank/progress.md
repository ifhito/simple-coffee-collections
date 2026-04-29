# Progress Log

実装のたびに追記する短いログです。長い議事録にはしません。

### 2026-04-29 - AGENTS.md を spec 駆動で再構成し CLAUDE.md を 2 行ラッパー化
- What: AGENTS.md を 6 セクション固定テンプレート(Stack / Build & Test / Conventions / Programmatic checks / Out of scope / More context)に書き換え 51 行に圧縮、CLAUDE.md を `@AGENTS.md` 参照 + Claude 固有スキル利用方針のみの 10 行に縮約
- Why: ETHチューリッヒ「Lost in Instructions」研究準拠で冗長指示を排除。AGENTS.md を single source of truth にし、Claude/Codex/Cursor 間のドリフトを防ぐ。Conventions の各項に「なぜ」を 1 行添えることで grey-area 判断を効かせやすくする
- Rejected: AGENTS.md と CLAUDE.md に責務分散(指示の重複が出る)、CLAUDE.md を完全な 2 行ラッパーに(`.claude/skills/` の能動利用方針はユーザ判断で残す)、`Last Updated`/`Version` メタ情報の保持(git log で十分)
- Next: ハーネス系 PR スタック (#47 → #48 → #49 → このPR) を順次マージ
- Decision: spec-workflow MCP は AGENTS.md に書かない(任意ツール扱い)、`.claude/skills/` の能動利用は CLAUDE.md に明記

### 2026-04-29 - 型定義を `type` に統一し ESLint で強制 (issue #20)
- What: `.eslintrc.json` に `@typescript-eslint/consistent-type-definitions: ['error', 'type']` を追加、`@typescript-eslint/eslint-plugin` と `parser` を直接 devDep に追加(pnpm hoist 経由では eslint が解決できなかったため)、`pnpm lint --fix` で 42 件の `interface` を自動的に `type` に変換、AGENTS.md の Boundaries に 1 行追加、`docs/decisions/2026-04-29-type-vs-interface.md` を新設
- Why: type と interface が混在(123 vs 42 で 75% が type)してルール不在だったため。type は interface の機能を包含し、union/intersection も書ける。コードベース大多数が既に type 寄りなので統一コストが最小
- Rejected: interface 統一(union が書けず変換規模も大きい)、両方許容(ESLint で表現できずレビュー依存になる)、オブジェクト形=interface・union=type(機械的に enforce できない)
- Next: ハーネス PR (#47) → type-debt PR (#48) → この PR の順でマージ
- Decision: docs/decisions/2026-04-29-type-vs-interface.md

### 2026-04-29 - typecheck で発見した既存型エラー 316 → 0 件に解消
- What: `jest.setup.js` を `jest.setup.ts` に改名(jest-dom 型拡張が tsconfig include に反映)で 290 件解消、`lib/types/__tests__/coffee.test.ts` の mock 6 箇所に `notes: null` 追加、`lib/infrastructure/repositories/__tests__/supabase-coffee-evaluation-repository.test.ts` の `makeRow` に `notes: null` 追加、`lib/domain/__tests__/coffee-evaluation.test.ts` の `evaluation.acidity.value` 等を `?.value` に変更(エンティティ refactor で `Rating | null` 化)、`lib/__tests__/actions/coffee.test.ts` の `redirect as jest.Mock` を `as unknown as jest.Mock` に修正、`lib/__tests__/api/coffee.test.ts` の `'newest'` を `'created_at_desc'` に修正、`page.test.tsx` 系の `jest.fn(() => ...)` を `jest.fn((..._args: unknown[]) => ...)` に変更し spread args TS2556 を解消、`evaluation-form.test.tsx` の `new Promise()` を `new Promise<void>()` に変更、`share-link.test.tsx` の不要な `@ts-expect-error` を削除、`coffee/page.test.tsx` の `CoffeeListPage({})` を `CoffeeListPage()` に修正
- Why: ハーネス PR (#47) で導入した Stop hook の `tsc --noEmit` が CI の盲点だった既存型負債を一気に表面化させたため。最初は 11 件と見積もったが、jest-dom 型拡張未反映が他の型解決をブロックしており、実数は 316 件だった
- Rejected: `tsconfig.json` の `exclude` に `__tests__` を追加(テストの型安全性を捨てるため非推奨)、Stop hook の typecheck を `|| true` で無視(センサーの意義が薄れる)
- Next: ハーネス PR (#47) → この PR の順でマージ。Jest 全 503 テスト pass を確認済み
- Decision: harness PR (chore/agent-harness-setup) と type-debt PR (fix/type-debt-from-typecheck) を分けてレビューしやすくした

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
