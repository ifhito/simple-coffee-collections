# Evals Fixtures (画像入力モード)

`evals/runners/run-evals.ts` は **text-mode** と **image-mode** の 2 通りで動く:

- **text-mode**: dataset の `input_text` を直接 LLM に渡す。OCR の **マッピングロジック** だけを評価。`EVAL_TARGET_MODEL` (default: `llama3.1`) を使用。
- **image-mode**: dataset の `image_path` で指定した画像を渡し、**実 OCR (Vision capability)** から構造化抽出までを評価。`EVAL_VISION_MODEL` (default: `qwen2.5vl:latest`) を使用。

## 同梱の合成サンプル

`_generate-sample.ts` で SVG を `sharp` 経由で PNG 化した架空ラベルを置いている（実コーヒーパッケージの著作権を避けるため）:

- `sample-001-ethiopia.png` — Ethiopia / Yirgacheffe / Washed / 中煎り
- `sample-002-french-roast.png` — Colombia / Huila / Natural / French Roast

再生成: `pnpm tsx evals/fixtures/_generate-sample.ts`

## 自前の画像を追加するには

1. `evals/fixtures/<id>.png` (または .jpg / .webp / .heic) に画像を置く
2. `evals/dataset.jsonl` に対応エントリを追加:

```json
{"id":"img-NNN","scenario":"...","image_path":"fixtures/<id>.png","tags":["criterion-id", ...]}
```

3. `pnpm eval --only=img-NNN` で単体実行
4. 確認後コミット

## 注意

- 実コーヒーパッケージの写真は **撮影者の著作権** に注意。社内利用に留め、リポジトリに上げる場合は権利関係を確認する
- HEIC は `image/heic` mime で送られるが、Ollama / vision model がサポートするか事前確認推奨（PNG / JPEG が最も互換性高い）
- Vision モデルは text モデルより遅い（`qwen2.5vl:7b` で 1 件 5〜15 秒）
