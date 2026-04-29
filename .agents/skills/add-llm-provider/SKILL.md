---
name: add-llm-provider
description: 新しい LLM プロバイダ (Anthropic / Google / Ollama 等) を追加するとき呼ぶ。entity・factory・DB constraint・types を一貫更新
allowed-tools: Read, Write, Edit, Bash
---

# Add LLM Provider

## When to use

OCR / AI 機能で使える LLM プロバイダを増やすとき。AI SDK 互換のプロバイダ（`@ai-sdk/<name>`）を追加するケース全般。

過去の追加例:
- 2026-03-09: Google Generative AI (`@ai-sdk/google`) 追加 → 4 ファイル + 1 マイグレーション

## Procedure

1. ドメイン層の Union 型を拡張する: `lib/domain/llm-settings/value-objects/llm-provider.ts` の `LlmProviderType` に新しい識別子（snake_case）を追加。
2. ドメインのバリデーション（`LlmProvider.create` の許可リスト）を更新する。プロバイダ固有の必須項目（API URL 等）が `LlmSettings.create` にあれば追記。
3. インフラ層 factory を拡張する: `lib/infrastructure/llm/llm-provider-factory.ts` の `switch` に新 case を追加し、`@ai-sdk/<name>` の create 関数を呼ぶ。AI SDK パッケージが未導入なら `pnpm add` する。
4. DB CHECK 制約を更新するマイグレーションを生成する（`db-migration` SKILL を呼ぶ）: `user_llm_settings.provider` の CHECK 制約に新識別子を追加。
5. 影響範囲のテスト (`pnpm test --testPathPattern=llm`) を回し、必要なら mock 用の値オブジェクトを追記する。
6. `MEMORY.md` の "LLM Provider Architecture" 節に追加プロバイダを 1 行追記する。

詳細手順とコード例は `references/add-llm-provider.md`。

## Output

- 触ったファイル一覧（5〜7 ファイルが典型）
- 追加したマイグレーションファイル名
- テストの pass/fail サマリ
- MEMORY.md 更新箇所

## Forbidden

- factory の `switch` を `default` で握りつぶさない（exhaustive にする）。
- 既存マイグレーションの CHECK を編集しない（必ず新規ファイルで `ALTER ... CHECK` を発行）。
- API キーをハードコードしない（`UserLlmSettings` 経由で渡す既存契約に従う）。
