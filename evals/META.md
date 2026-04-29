# Eval Harness — Meta Evaluation

ETH Zurich 「Lost in Instructions」研究と Hamel Husain の "Money Table" 哲学を踏まえた、評価ハーネス自体の検証記録。

## 設計方針

### 実行環境: ローカル Ollama 専用

- target / judge いずれも `@ai-sdk/openai-compatible` 経由で Ollama を呼ぶ。
- CI では実行しない（API コスト回避 / 開発者の意思で走らせる）。
- 環境変数で柔軟に上書き可: `EVAL_TARGET_MODEL` / `EVAL_JUDGE_MODEL` / `EVAL_OLLAMA_BASE_URL`。
- 既定モデルは `llama3.1`（Pull 済みであることが多い）。多言語強度を上げたい場合は `qwen2.5:7b` を推奨。

### Hamel "Money Table" 観点

| 項目 | 値 | 含意 |
|---|---|---|
| 失敗 1 件のユーザコスト | 〜30 秒（手動修正） | 重大事故ではないが回数が増えると痛い |
| 失敗の本番頻度 | 不明（ログ未取得） | データを取って閾値再設定が必要 |
| eval 1 回の API コスト | **$0**（ローカル Ollama 利用） | コストガードを思考から外せる |
| eval 1 回の時間コスト | 〜10 cases × 2 推論 = 1〜3 分（M2 + 7B class） | smoke (3 件) なら 30 秒程度 |
| eval 構築の固定コスト | dataset / criteria / judge / runner = 約 500 行 | minimum viable harness |

API コストがゼロなので「**回す/回さない**」をコストではなく純粋な「**信頼度**」で判断できる。Ollama モデルはクラウドモデルより judging 精度が低いため、threshold (90%) の意味も「絶対基準」ではなく「**回帰検出の相対基準**」として運用する。

### ETH 研究の含意

- 評価対象モデル（target）と evaluator モデル（judge）の **プロンプトを分離**。target には `lib/mastra/prompts/coffee-ocr.md` を、judge には `evals/criteria.md` を、それぞれ独立したコンテキストで渡す。
- judge プロンプトに **正解ラベルを渡さない**（`leak prevention`）。dataset の `expected` フィールドは作らず、観点（criteria）のみで pass/fail を判断させる。
- 各 case の `tags` で **対象 criteria を限定**することで、judge が無関係な観点を勝手に判定し score を膨らませる現象（"diff agreement bias"）を抑える。

## 評価が機能していることの検証

### 1. False positive チェック（過剰 pass のリスク）

意図的に **明らかに間違った出力** を target に作らせ、judge が fail を返すか確認する。
具体的には dataset の input_text に `"中煎り"` と書かれているのに、target が `roast_level: "french"` を返すケースを simulate（`evals/_smoke/false-positive.test.ts` などで model 出力を mock 注入する手段を用意）。期待: judge が `roast_normalization` を fail として捕捉する。

**現状**: TODO（最初の数回の実走後に検証スクリプトを追加）。

### 2. False negative チェック（過剰 fail のリスク）

明らかに正しい出力（input_text と完全に整合した bean_name / roast_level）を作り、judge が pass を返すか確認する。
**現状**: TODO（同上）。

### 3. Inter-rater agreement（judge の安定性）

同じ (target output, criteria) 組に対して judge を 3 回呼び、判定が安定しているかを確認する。**安定性が低い criterion** は曖昧で、文言を改訂する必要がある。

**現状**: TODO（最初の dataset run 後にバッチ計測する）。

### 4. Coverage（criteria の網羅性）

dataset 全 case が触る criteria をユニーク化し、`criteria.md` に書いた observation 由来の観点が全て少なくとも 1 case でテストされているかを集計する。

**現状（v0）**: 10 cases / 13 criteria を観察。`brand_blend` `grade_vs_origin` 等の一部 criterion は 1 case のみで触れる。dataset を増やす際は観察された失敗モードに紐付けて追加する。

## 既知の限界

1. **画像入力をテストしていない**: 実 OCR は画像 → JSON だが、本ハーネスはテキスト → JSON のマッピング部分のみを評価する。Vision capability の劣化は捕捉できない。`evals/fixtures/` に実画像と期待出力を置く拡張を後続課題とする。
2. **本番ログ無し**: 観察由来でなくコード読解由来の dataset。最初の実運用ログが取れた時点で 5〜10 件入れ替える。
3. **judge と target が同 vendor / 同モデル**: ローカル Ollama では default で同じモデルが両者を担う。バイアス相関が大きい。`EVAL_JUDGE_MODEL` を別モデル（例: target=`llama3.1`, judge=`qwen2.5`）にして相互検証する運用が望ましい。
4. **threshold 90% は仮置き**: dataset のサンプル数 10 では P95 信頼区間が広い。さらに Ollama モデルは Claude 等より精度が低いため、最初の数回の実走で観測される baseline pass 率に基づいて閾値を再設定する。
5. **CI では検証されない**: ローカルで開発者の意志により走らせる前提。リリース前に手動でフルラン（`pnpm eval`）する運用が必要。

## 改訂ログ

| 日付 | 変更 | 根拠 |
|---|---|---|
| 2026-04-29 | 初版（dataset 10 件 / criteria 13 個 / target=judge=Ollama llama3.1 default） | コード読解と prompt 分析、ローカル開発に絞った設計 |
