# Add LLM Provider — 詳細手順

## 1. Domain: Union 型拡張

`lib/domain/llm-settings/value-objects/llm-provider.ts`:

```ts
export type LlmProviderType =
  | 'openai_compatible'
  | 'anthropic'
  | 'ollama'
  | 'google'
  | 'mistral'   // ← 追加例
```

`LlmProvider.create` の許可リストに `'mistral'` を追加。

## 2. Domain: 設定バリデーション

`lib/domain/llm-settings/value-objects/llm-settings.ts` の `LlmSettings.create`:
- API URL 必須なら、`openai_compatible` と同様の分岐を追加。
- API URL 不要なら、`anthropic` / `google` 系の分岐に乗せる。

## 3. Infrastructure: Factory 拡張

`lib/infrastructure/llm/llm-provider-factory.ts`:

```ts
import { createMistral } from '@ai-sdk/mistral'

// switch に追加
case 'mistral': {
  const mistral = createMistral({ apiKey })
  return mistral(modelName) as MastraModel
}
```

未導入なら:
```bash
pnpm add @ai-sdk/mistral
```

## 4. DB CHECK 制約

`db-migration` SKILL を呼んで新ファイル生成:

```bash
npx supabase migration new allow_mistral_provider
```

SQL:

```sql
ALTER TABLE user_llm_settings
  DROP CONSTRAINT IF EXISTS user_llm_settings_provider_check;

ALTER TABLE user_llm_settings
  ADD CONSTRAINT user_llm_settings_provider_check
  CHECK (provider IN ('openai_compatible', 'anthropic', 'ollama', 'google', 'mistral'));
```

適用 + 型再生成（`db-migration` SKILL の手順 3〜4）。

## 5. テスト

```bash
pnpm test --testPathPattern=llm
```

更新が要りやすい箇所:
- `lib/infrastructure/llm/__tests__/llm-provider-factory.test.ts` — 新 case 追加
- `lib/domain/llm-settings/__tests__/llm-settings.test.ts` — バリデーション分岐

## 6. MEMORY.md 追記

`/Users/hotake/.claude/projects/-Users-hotake-Documents-coffee-app-simple-coffee-collections/memory/MEMORY.md` の `## LLM Provider Architecture` 節:

```
- `LlmProviderType`: ... | 'mistral'
- DB constraint: migration <timestamp> で `mistral` を追加
- Mistral uses `@ai-sdk/mistral` (`createMistral`)
```

## 検証チェックリスト

- [ ] `pnpm typecheck` 0 errors（switch の exhaustive チェックが効く）
- [ ] `pnpm lint --quiet` 0 violations
- [ ] `pnpm test --testPathPattern=llm` pass
- [ ] `npx supabase migration up` exit 0
- [ ] 設定画面 (`app/(app)/ai/_components/llm-settings-form.tsx`) のプルダウンに新プロバイダが出るか動作確認
