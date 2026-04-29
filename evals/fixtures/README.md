# Evals Fixtures (real images)

将来、実画像を用いた eval を追加する場所。

現状の `evals/runners/run-evals.ts` は **テキスト → JSON マッピング** を評価しており、画像入力はテストしていない。

## 追加の流れ

1. 本番で OCR 失敗が起きた画像（または再現用に撮影した画像）を `evals/fixtures/<id>.png` に置く。
2. dataset.jsonl に対応エントリを追加し、`input_image: "fixtures/<id>.png"` フィールドを足す（runner 側拡張が要る）。
3. runner を image-mode に拡張する（`generateObject` の `messages.content` を `{type: 'image', image: ...}` に切り替え）。

なぜ最初から画像にしないか:
- 失敗の大半は「OCR 後のテキスト → フィールドマッピング」段階で起きる（コード読解と prompt 分析より）。
- 画像 fixtures は法的・著作権上の扱いが煩雑（パッケージ写真）。ログ整備と並行で運用する。
