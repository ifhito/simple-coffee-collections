# OCR精度改善計画

## Context

現在のOCR実装（`meta-llama/Llama-Vision-Free` on Together.ai）は実行できているが精度が低い。
主な課題：
1. **プロンプトが単純すぎる** - チェーン・オブ・ソート（CoT）なし、日本語OCR特化の指示なし
2. **使用モデルが弱い** - LLaMA 3.2 Vision は日本語テキスト認識が苦手
3. **無料で使える高精度モデルが未サポート** - Gemini 2.0 Flash（無料枠あり）や Qwen2.5-VL が使えない

---

## アプローチ

### Priority 1: プロンプト改善（即効性あり・依存関係変更なし）

**変更ファイル**: `lib/mastra/agents/coffee-ocr-agent.ts`

現在のプロンプトの問題点と改善策：

| 問題 | 改善策 |
|------|--------|
| 画像全体を見ずに抽出しようとする | CoT: まず画像内のテキストをすべて列挙させる |
| bean_name / bean_type の境界が曖昧 | より具体的な例と判定基準を追加 |
| 焙煎度の視覚的手がかりの説明なし | パッケージの色やグラフィックから判断する指示を追加 |
| 1行の user メッセージのみ | より詳細な指示を追加 |

**改善後プロンプト構成**:
```
## ステップ1: 画像のテキストを全て読み取る
パッケージに書かれているテキストをすべてリストアップしてください。
表・裏・側面を含め、見えるすべての文字を読んでください。

## ステップ2: フィールドへの当てはめ
[既存のフィールド定義 + より具体的な例]

## bean_name vs bean_type の判定基準
- 商品名・ブランド名 → bean_name（例: 「エチオピア イルガチェフェ」「ブルーマウンテン」）
- 産地・品種・グレード情報 → bean_type（例: 「ウォッシュド」「ゲイシャ品種」「G1」）
- 両方書いてある場合: 最も目立つ/大きい表記 → bean_name、補足情報 → bean_type

## 焙煎度の判定
テキストが見つからない場合: パッケージの色・グラフィックのメーターなどを参考にする
```

### Priority 2: Google Gemini プロバイダー追加（無料・高精度）

**Gemini 2.0 Flash の無料枠**: 15 RPM / 1,500 RPD（個人用アプリには十分）
**日本語OCR能力**: 優秀（Googleの多言語対応）

**変更ファイル**:
1. `lib/domain/llm-settings/value-objects/llm-provider.ts`
   - `LlmProviderType` に `'google'` を追加
   - `LlmProvider.create()` のバリデーション更新

2. `lib/infrastructure/llm/llm-provider-factory.ts`
   - `@ai-sdk/google` の `createGoogleGenerativeAI` を使用
   - `case 'google'` を追加

3. パッケージ追加: `pnpm add @ai-sdk/google`

4. 設定UI（存在すれば更新）:
   - プロバイダー選択肢に「Google」を追加
   - モデル名のヒント: `gemini-2.0-flash`

### Priority 3: Qwen2.5-VL via Ollama（コード変更不要）

既存の `ollama` プロバイダーを使えばそのまま利用可能:
```bash
ollama pull qwen2.5vl:7b
```
設定: プロバイダー=Ollama, モデル名=`qwen2.5vl:7b`

---

## 実装詳細

### 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `lib/mastra/agents/coffee-ocr-agent.ts` | SYSTEM_PROMPT 全面改善（CoT + 具体例追加） |
| `lib/domain/llm-settings/value-objects/llm-provider.ts` | `google` タイプ追加 |
| `lib/infrastructure/llm/llm-provider-factory.ts` | Google Gemini ケース追加 |
| `package.json` / `pnpm-lock.yaml` | `@ai-sdk/google` 追加 |
| 設定UI（要調査） | プロバイダー選択肢追加 |

### テスト更新

- `lib/application/ocr/__tests__/ocr-coffee-bean-use-case.test.ts` - Google プロバイダーのテストケース追加
- プロンプト変更は既存テストに影響しない（モックで固定）

---

## 検証方法

1. **プロンプト改善の確認**:
   - 実際のコーヒーパッケージ画像でOCRを実行
   - 以前より多くのフィールドが正確に埋まることを確認

2. **Gemini プロバイダーの確認**:
   - Google AI Studio でAPIキーを取得（無料）
   - 設定画面でプロバイダー=Google、モデル=`gemini-2.0-flash` に設定
   - OCRが正常に動作することを確認

3. **ユニットテスト**:
   ```bash
   pnpm test lib/application/ocr/
   pnpm test lib/domain/llm-settings/
   ```

---

## 推奨モデル比較

| モデル | プロバイダー | 費用 | 日本語OCR | 設定難易度 |
|--------|------------|------|-----------|----------|
| `gemini-2.0-flash` | Google | **無料**（15RPM） | ◎ | 低（APIキーのみ） |
| `qwen2.5vl:7b` | Ollama | **無料**（ローカル） | ◎ | 中（Ollama要インストール） |
| `meta-llama/Llama-Vision-Free` | Together.ai | 無料 | △ | 低（現状） |
| `claude-3-haiku` | Anthropic | 有料 | ○ | 低 |
