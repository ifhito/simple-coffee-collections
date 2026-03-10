# cmux Resume Plan (2026-03-10)

Source: `workspace:5/surface:11` (Claude Code)

## Extracted Plan Items

- P1: APIルートからHEIC変換を分離
- P2: HEIC MIMEパターンの共有定数化
- P3: ドメイン側 `LlmSettingsInput` を `LlmSettingsConfig` へリネーム
- P4: `llm-provider-factory` の重複switch共通化
- P5: `api-key-encryptor.interface.ts` 削除確認
- C1: `ai-features-client.tsx` のサブコンポーネント分割
- C2: クライアントサイドHEIC変換の削減検討
- C3: APIルート複雑度の追加低減
- T1: `app/api/agent/ocr/route.ts` テスト追加
- T2: `lib/actions/llm-settings.ts` テスト追加
- T3: `mastra-ocr-executor.ts` / `default-llm-model-factory.ts` テスト追加
- T4: Get/Delete LLM settings use case テスト追加
- T5: Supabase repository integration test
- U1: UBIQUITOUS_LANGUAGE_DICTIONARY 更新
- U2: `OcrModel = unknown` の型改善

## Post-Plan Execution Classification

### Already Executed

- P1: `lib/infrastructure/ocr/heic-converter.ts` が追加済み
- P2: `lib/constants/image-formats.ts` が追加済み
- P3: `LlmSettingsConfig` リネーム済み
- P4: `createModelForProvider` で重複共通化済み
- P5: `lib/infrastructure/crypto/api-key-encryptor.interface.ts` は削除済み
- T4: Get/Delete use case tests は追加済み
- U1: 辞書更新は追加済み
- C1: `ai-features-client.tsx` をセクション/ダイアログ/オーバーレイへ分割済み
- C3: route のフォーム解析・HEIC判定を `ocr-upload-parser.ts` に抽出済み
- U2: `OcrModel` を `unknown` から `AgentConfig['model']` へ改善済み
- T1: `app/api/agent/ocr/__tests__/route.test.ts` を追加済み
- T2: `lib/actions/__tests__/llm-settings.test.ts` を追加済み
- T3: `mastra-ocr-executor` / `default-llm-model-factory` テストを追加済み

### Partially Executed

- T5: repository integration test は未実施（ローカルSupabase依存）

### Not Started / Pending

- C2: クライアント側HEICアップロード変換は残存
- T5: repository integration tests なし

## Resume Rule

- C2 はプロダクト要件（HEIC失敗時のクライアント側補完）を優先し、別PRで判断
- T5 はローカルSupabase統合環境が整っているタイミングで追加
