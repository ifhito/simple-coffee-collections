# コードレビュー: feature/mastra-ocr-agent-main

## Context

OCR/LLM設定機能の新規実装ブランチのレビュー。ユーザーが自身のLLMプロバイダー（OpenAI互換、Anthropic、Ollama、Google）を設定し、コーヒー豆パッケージ画像からOCRで情報を自動抽出する機能。

---

## 1. クリーンアーキテクチャ分離

### 良い点
- **依存方向は正しい**: Domain ← Application ← Infrastructure/Presentation
- **ポートパターン**: `lib/application/ports/` に `ApiKeyEncryptor`, `LlmModelFactory`, `OcrExecutor` の3インターフェースを配置 — 正しい依存逆転
- **DIコンテナ**: `lib/di/container.ts` でシングルトン+setter注入パターン — テスタブル
- **未コミット変更で改善済み**: `save-llm-settings.ts` と `aes-256-gcm-encryptor.ts` が `api-key-encryptor.interface.ts`（infrastructure層）ではなく `@/lib/application/ports` を参照するように修正中 — これは正しい方向

### 問題点

#### P1: APIルートの責務過多（高）
**ファイル**: `app/api/agent/ocr/route.ts`（179行）

1つのPOSTハンドラに以下が混在:
- HEIC/HEIF変換（3つのフォールバック戦略: sharp → heic-convert → sips）
- マルチパートフォームパース + MIMEタイプ正規化
- ビジネスロジック分岐（inline vs saved settings）
- ユースケースのインスタンス生成

**推奨**: HEIC変換を `lib/infrastructure/ocr/heic-converter.ts` 等に抽出

#### P2: HEIC MIMEパターンの重複（中）
- `app/api/agent/ocr/route.ts:34` — サーバー側
- `app/(app)/ai/_components/use-ai-ocr-controller.ts` — クライアント側

同じ正規表現が2箇所に定義。`lib/constants/` に共有すべき。

#### P3: `LlmSettingsInput` インターフェースの重複（中）
- **ドメイン層**: `lib/domain/llm-settings/value-objects/llm-settings.ts` — バリデーション用
- **アプリケーション層**: `lib/application/llm-settings/dto.ts` — フォーム入力用（`apiKey` フィールド追加）

同名で異なる目的。ドメイン側を `LlmSettingsConfig` 等にリネームして区別すべき。

#### P4: `lib/infrastructure/llm/llm-provider-factory.ts` のコード重複（中）
`createLlmModel` と `createLlmModelFromPrimitives` の2関数がほぼ同一のswitch文。内部で共通化可能。

#### P5: 削除予定ファイルの残存（低）
`lib/infrastructure/crypto/api-key-encryptor.interface.ts` — 未コミット変更で削除済みだが、`lib/application/ports/api-key-encryptor.ts` に移動したため不要

---

## 2. コード複雑性

### 問題点

#### C1: `ai-features-client.tsx`（310行）— 大きすぎるクライアントコンポーネント
設定管理 + OCR画像分析 + モーダルダイアログが1コンポーネントに混在。セクション単位でサブコンポーネントに分割すべき。

#### C2: `use-ai-ocr-controller.ts` — クライアントサイドHEIC変換
サーバー側と同じ変換ロジックを持つ。変換はサーバーに任せ、クライアントは送信のみにすることを検討。

#### C3: APIルートのサイクロマティック複雑度 ~12
- 複数のif/else分岐（フォーマット検証、プロバイダー分岐）
- 複数のcatchブロック

---

## 3. DDDユビキタス言語

### 良い点
- LLM設定は既存のCoffeeEvaluationとは別の境界づけられたコンテキスト — 独自の用語で問題なし
- `UserLlmSettings`, `LlmProvider`, `LlmSettings` — 明確で一貫した命名
- `OcrCoffeeBeanUseCase` — ドメインアクション + 名詞のパターンに従っている

### 問題点

#### U1: ユビキタス言語辞書の未更新
LLM設定・OCR関連の用語が `docs/UBIQUITOUS_LANGUAGE_DICTIONARY.md` に追加されていない。新しい境界づけられたコンテキストとして以下を追加すべき:
- `UserLlmSettings`（ユーザーLLM設定）
- `LlmProvider`（LLMプロバイダー）
- `OcrCoffeeBeanUseCase`（OCRコーヒー豆分析）

#### U2: `OcrModel = unknown` 型
`lib/application/ports/llm-model-factory.ts:4` で `OcrModel = unknown` と定義。型安全性が低い。AI SDKの共通型があれば使うべき。

---

## 4. テストの過不足

### テストがある層（概ね良好）
| テストファイル | カバレッジ | 評価 |
|---|---|---|
| `lib/domain/__tests__/llm-settings.test.ts` | ~85% | 良好 |
| `lib/application/llm-settings/__tests__/save-llm-settings.test.ts` | ~75% | 良好 |
| `lib/application/ocr/__tests__/ocr-coffee-bean-use-case.test.ts` | ~80% | 良好 |
| `lib/infrastructure/crypto/__tests__/aes-256-gcm-encryptor.test.ts` | ~85% | 優秀 |
| `app/(app)/ai/_components/__tests__/ai-features-client.test.tsx` | ~70% | 可 |
| `app/(app)/coffee/_components/__tests__/evaluation-form.test.tsx` | ~85% | 優秀 |

### テストが不足している層（要対応）

#### T1: APIルートハンドラ（CRITICAL — テストなし）
`app/api/agent/ocr/route.ts` — 179行の最も複雑なファイルにテストゼロ
- 認証チェック
- HEIC変換の3つのフォールバック
- inline vs saved settings の分岐
- エラーレスポンス

#### T2: サーバーアクション（HIGH — テストなし）
`lib/actions/llm-settings.ts` — 認証境界でバリデーションを行うエントリポイント

#### T3: インフラ層（HIGH — テストなし）
- `lib/infrastructure/ocr/mastra-ocr-executor.ts` — AIとの統合点
- `lib/infrastructure/llm/llm-provider-factory.ts` — プロバイダー固有のモデル生成
- `lib/infrastructure/llm/default-llm-model-factory.ts`

#### T4: アプリケーション層の不足
- `GetLlmSettingsUseCase` — テストなし
- `DeleteLlmSettingsUseCase` — テストなし
- `OcrInlineCoffeeBeanUseCase` — untracked（コミットされていない）

#### T5: リポジトリ（MEDIUM）
- `lib/infrastructure/repositories/supabase-user-llm-settings-repository.ts` — インテグレーションテストなし

### 全体カバレッジ推定: ~45%（目標80%に未到達）

---

## 5. セキュリティ

### 良い点
- APIキーはAES-256-GCMで暗号化して保存
- レスポンスでは `hasApiKey: boolean` のみ公開、平文キーは一切返さない
- GCM認証タグによる改竄検知

### 注意点
- `LLM_ENCRYPTION_KEY` のローテーション手順が未ドキュメント
- 画像アップロードのファイルサイズ制限なし
- APIエンドポイントのレート制限なし

---

## 6. 修正アクション（優先度順）

### すぐに行うべき修正
1. **未コミット変更をコミット** — ポート移行（`ApiKeyEncryptor` のインポート先変更）と `run-ocr.ts` 削除は正しい改善
2. **`api-key-encryptor.interface.ts` の削除確認** — ポートに移行済みなら不要

### 短期改善
3. **APIルートのHEIC変換を分離** → テスタビリティ向上
4. **不足テストの追加** — 特にT1（APIルート）、T4（GetUseCase、DeleteUseCase）
5. **HEIC MIMEパターンの共有定数化**

### 中期改善
6. **`LlmSettingsInput` のリネーム（ドメイン側）**
7. **LLMプロバイダーファクトリの内部共通化**
8. **`ai-features-client.tsx` の分割**
9. **ユビキタス言語辞書の更新**

---

## 7. 検証方法

- `pnpm test` で既存テスト通過確認
- `pnpm lint` でリント通過
- `pnpm tsc --noEmit` で型チェック
- 手動テスト: AI設定画面で各プロバイダーの設定保存→OCR実行
