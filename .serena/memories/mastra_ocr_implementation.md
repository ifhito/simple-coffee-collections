# Mastra OCR Agent Feature (feature/mastra-ocr-agent branch)

## Key implementation decisions
- `AgentConfig['model']` from `@mastra/core/agent` is the correct type for LLM models passed to Mastra Agent
- `createOllama({ baseURL })` from `ollama-ai-provider` (not `ollama.withBaseURL`)
- Mastra Agent uses `getInstructions()` (async) not `.instructions` property
- `agent.model` needs cast `as Parameters<typeof generateObject>[0]['model']` to pass to Vercel AI SDK
- `ai` package (Vercel AI SDK) must be installed separately even though it's used by `@mastra/core`
- Zod v3 (not v4) is required for compatibility with `@ai-sdk/*` peer dependencies

## File structure added
- `lib/domain/llm-settings/` - Domain layer (entity, VO, repository interface)
- `lib/infrastructure/crypto/` - AES-256-GCM encryption
- `lib/infrastructure/llm/` - LLM provider factory + model list fetcher
- `lib/infrastructure/repositories/supabase-user-llm-settings-repository.ts`
- `lib/mastra/` - Agent and OCR output schema
- `lib/application/llm-settings/` - Get/Save use cases
- `lib/application/ocr/` - OcrCoffeeBeanUseCase
- `lib/actions/llm-settings.ts` - Server Actions
- `app/api/agent/{ocr,models}/route.ts` - API Routes
- `app/(app)/profile/llm-settings/` - Settings UI
- `app/(app)/coffee/_components/ocr/ocr-upload-modal.tsx`
- `app/(app)/coffee/new/_components/new-evaluation-container.tsx`
- `supabase/migrations/20260306000000_create_user_llm_settings.sql`
