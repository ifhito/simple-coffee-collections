# Plan: Mastra OCR Agent for Coffee Bean Registration

## Context

コーヒー豆のパッケージ写真をアップロードすると、ユーザー自身のLLM API（BYOK）でOCR解析し、
豆情報をEvaluationフォームに自動入力できる機能を追加する。

参考実装: https://github.com/ifhito/coffee-agents（Mastraフレームワーク使用）

**ブランチ**: `feature/mastra-ocr-agent`

---

## User Decisions

| 項目 | 決定内容 |
|------|---------|
| Mastraホスティング | Next.js API Routes 統合 |
| APIキー管理 | Supabase に AES-256-GCM 暗号化保存 |
| 対応プロバイダー | OpenAI互換API（Groq/OpenRouter/Together AI/Fireworks/Gemini等）+ Anthropic + Ollama |
| モデル選択 | 既知プロバイダーテンプレート + サーバー経由モデル検索機能 |
| レーティングスケール | **1-10**（既存Ratingドメインに合わせてLLMに最初から1-10で出力させる） |

---

## OCRスキーマとDBフィールドの対応

既存 `coffee_evaluations` テーブルの全フィールドとOCR対応可否:

| フィールド | OCR対象 | 備考 |
|-----------|--------|------|
| `bean_name` | ✓ | 必須。パッケージから抽出 |
| `bean_type` | ✓ | 産地・品種 |
| `roast_level` | ✓ | 文字列で抽出。DBのenum値に正規化はLLMのプロンプトで誘導 |
| `shop_name` | ✓ | ロースタリー名等 |
| `shop_address` | ✓ | nullable |
| `acidity` | ✓ | 1-10整数 |
| `aroma` | ✓ | 1-10整数 |
| `bitterness` | ✓ | 1-10整数 |
| `overall_rating` | ✓ | 1-10整数 |
| `shop_latitude` | ✗ | ジオコーディングで取得（既存機能） |
| `shop_longitude` | ✗ | ジオコーディングで取得（既存機能） |
| `is_public` | ✗ | ユーザー設定 |
| `user_id`, timestamps | ✗ | システム管理 |

`roast_level` の既存DB enum値: `light, cinnamon, medium, high, city, full_city, french`
→ LLMのプロンプトでこの値に正規化するよう指示。マッチしない場合はユーザーがUIで選択。

---

## 対応プロバイダー一覧

すべて OpenAI-compatible → `@ai-sdk/openai-compatible` 1つで対応可能

| プロバイダー | Base URL | 無料/安価Vision | GET /models |
|------------|---------|---------------|------------|
| **Together AI** | `https://api.together.xyz/v1` | **完全無料** (Llama-Vision-Free) | ✓ |
| **Groq** | `https://api.groq.com/openai/v1` | 無料枠あり | ✓ |
| **OpenRouter** | `https://openrouter.ai/api/v1` | 無料モデルあり (Qwen3 VL等) | ✓ (vision filter可) |
| **Fireworks AI** | `https://api.fireworks.ai/inference/v1` | 安価 ($0.20/M) | ✓ |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai/` | 無料枠あり | - |
| **Ollama** | `http://localhost:11434/api` | 完全無料 (ローカル) | ✓ |
| **Anthropic** | (SDK直接) | - | - |
| **カスタム** | ユーザー入力 | - | ✓ (試行) |

---

## Architecture Overview

```
UI (Client Component)
  └─ LlmSettingsForm
       ├─ ProviderTemplateSelector (既知プロバイダー → baseURL自動入力)
       ├─ ModelSearchButton → GET /api/agent/models
       └─ Server Action: saveLlmSettings
  └─ OcrUploadPanel → POST /api/agent/ocr
  └─ OcrResultConfirmForm → EvaluationForm (ocrPreFill prop)
       └─ 既存の createCoffeeEvaluation Server Action で登録 ★変更なし

API Routes:
  GET /api/agent/models       # モデル一覧プロキシ (APIキーはDBから復号して使用)
  POST /api/agent/ocr         # OCR実行 (Node.js runtime, maxDuration: 60s)

OcrCoffeeBeanUseCase
  └─ UserLlmSettingsRepository → Supabase user_llm_settings
  └─ Aes256GcmEncryptor (Node.js crypto)
  └─ MastraOcrAgentFactory
       └─ LlmProviderFactory → @ai-sdk/* model
       └─ createCoffeeOcrAgent (lib/mastra/agents/)
```

### データ登録フロー（既存処理を再利用）

```
OCR抽出 → OcrExtractedData
    ↓ (ocrPreFill prop で渡す)
EvaluationForm（既存コンポーネント）
    ↓ FormData (snake_case keys: bean_name, bean_type, roast_level,
    ↓           shop_name, shop_address, acidity, bitterness, aroma,
    ↓           overall_rating, is_public, shop_latitude, shop_longitude)
createCoffeeEvaluation() ★既存Server Action・変更なし
    ↓
Supabase INSERT to coffee_evaluations
```

**重要**: OCRはフォームの**初期値を設定するだけ**。送信処理は既存の
`lib/actions/coffee.ts:createCoffeeEvaluation()` をそのまま使用。
DBインサートロジックへの変更は**一切不要**。

OcrExtractedData のフィールド名（snake_case）は FormData キーと一致するため、
`initialData` または `ocrPreFill` プロパティとして `EvaluationForm` に渡せる。

---

## Implementation Sequence

### Step 1: ブランチ作成・DB Migration

```bash
git checkout -b feature/mastra-ocr-agent
```

**新規ファイル**: `supabase/migrations/20260306000000_create_user_llm_settings.sql`

```sql
CREATE TABLE user_llm_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('openai_compatible', 'anthropic', 'ollama')),
  provider_template TEXT,
  api_url           TEXT,
  encrypted_api_key TEXT,  -- format: iv_hex:tag_hex:ciphertext_hex
  model_name        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_llm_settings UNIQUE (user_id)
);

CREATE TRIGGER trigger_user_llm_settings_updated_at
  BEFORE UPDATE ON user_llm_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_llm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_llm_settings_select_own" ON user_llm_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_llm_settings_insert_own" ON user_llm_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_llm_settings_update_own" ON user_llm_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_llm_settings_delete_own" ON user_llm_settings FOR DELETE USING (auth.uid() = user_id);
```

更新: `lib/types/database.types.ts` に `user_llm_settings` 型追加

---

### Step 2: npm パッケージ追加

```bash
npm install @mastra/core @ai-sdk/openai-compatible @ai-sdk/anthropic ollama-ai-provider zod
```

---

### Step 3: 既知プロバイダー定数（共有）

**新規ファイル**: `lib/constants/llm-providers.ts`

```typescript
export const KNOWN_PROVIDERS = [
  {
    template: 'together',
    label: 'Together AI（無料Vision）',
    description: 'Llama-Vision-Free が完全無料。初めての方におすすめ',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-Vision-Free',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'groq',
    label: 'Groq（高速・安価）',
    description: '無料枠あり。超高速推論',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'openrouter',
    label: 'OpenRouter（多モデル対応）',
    description: '400+モデル。無料モデルあり',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'qwen/qwen2.5-vl-72b-instruct:free',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'fireworks',
    label: 'Fireworks AI（低コスト）',
    description: '$0.20/Mトークン〜',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p2-11b-vision-instruct',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'gemini',
    label: 'Google Gemini（無料枠あり）',
    description: 'Gemini 2.0 Flash 等',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.0-flash',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'anthropic',
    label: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet 等',
    baseUrl: null,
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresApiKey: true,
    providerType: 'anthropic' as const,
  },
  {
    template: 'ollama',
    label: 'Ollama（ローカル無料）',
    description: 'ローカルLLMサーバー。完全無料',
    baseUrl: 'http://localhost:11434/api',
    defaultModel: 'llava',
    requiresApiKey: false,
    providerType: 'ollama' as const,
  },
  {
    template: 'custom',
    label: 'カスタム',
    description: 'OpenAI互換APIのURLを直接入力',
    baseUrl: '',
    defaultModel: '',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
] as const
```

---

### Step 4: Domain Layer（TDD - テストを先に書く）

**新規ファイル群**:

```
lib/domain/llm-settings/
  value-objects/
    llm-provider.ts     # LlmProviderType = 'openai_compatible'|'anthropic'|'ollama'
    llm-settings.ts     # apiUrl + modelName + provider + providerTemplate のVO
    index.ts
  entity.ts             # UserLlmSettings: id, userId, settings, hasApiKey
  repository.ts         # interface UserLlmSettingsRepository
  index.ts
```

**パターン**: `BeanInfo.create()` と同じ `Result<T, string>` factory パターンを踏襲
（参照: `lib/domain/coffee-evaluation/value-objects/bean-info.ts`）

**テスト**: `lib/domain/__tests__/llm-settings.test.ts`

---

### Step 5: Infrastructure - Crypto

**新規ファイル**: `lib/infrastructure/crypto/`

```
api-key-encryptor.interface.ts  # interface ApiKeyEncryptor { encrypt, decrypt }
aes-256-gcm-encryptor.ts        # Node.js crypto AES-256-GCM実装
```

```typescript
encrypt(plaintext: string): string {
  const iv = randomBytes(12)  // 96-bit IV
  const cipher = createCipheriv('aes-256-gcm', this.key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}
```

環境変数: `LLM_ENCRYPTION_KEY`（64文字のhex、`NEXT_PUBLIC_` 接頭辞なし）

**テスト**: `lib/infrastructure/crypto/__tests__/aes-256-gcm-encryptor.test.ts`

---

### Step 6: Infrastructure - Repository & LLM Factory

**新規ファイル**: `lib/infrastructure/repositories/supabase-user-llm-settings-repository.ts`

パターン: `SupabaseCoffeeEvaluationRepository` と同じ構造
- `findByUserId`, `save` (UPSERT), `delete`

**新規ファイル群**:

```
lib/infrastructure/llm/
  llm-provider-factory.ts   # UserLlmSettings + decryptedKey → AI SDK LanguageModelV1
  ocr-agent-factory.ts      # MastraOcrAgentFactory implements OcrAgentFactory
  model-list-fetcher.ts     # GET {baseUrl}/models → string[]
```

```typescript
// llm-provider-factory.ts - @ai-sdk/openai-compatible で主要プロバイダーを統一
export function createLlmModel(settings: UserLlmSettings, decryptedApiKey: string) {
  switch (settings.settings.provider.type) {
    case 'openai_compatible':
      return createOpenAICompatible({
        baseURL: settings.settings.apiUrl!,
        apiKey: decryptedApiKey,
        name: settings.settings.providerTemplate ?? 'custom',
      })(settings.settings.modelName)
    case 'anthropic':
      return createAnthropic({ apiKey: decryptedApiKey })(settings.settings.modelName)
    case 'ollama':
      return ollama.withBaseURL(
        settings.settings.apiUrl ?? 'http://localhost:11434/api'
      )(settings.settings.modelName)
  }
}
```

---

### Step 7: Mastra Agent & Tool

**新規ファイル群**:

```
lib/mastra/
  agents/coffee-ocr-agent.ts   # createCoffeeOcrAgent(model): Agent
  tools/coffee-ocr-tool.ts     # Zod schema でのstructured output定義
  index.ts
```

```typescript
// 既存DB enum値: light, cinnamon, medium, high, city, full_city, french
const ROAST_LEVEL_VALUES = ['light', 'cinnamon', 'medium', 'high', 'city', 'full_city', 'french'] as const

// OCRツールのZodスキーマ（既存DBスキーマに完全対応）
export const CoffeeOcrOutputSchema = z.object({
  bean_name:      z.string().nullable(),
  bean_type:      z.string().nullable(),
  roast_level:    z.enum(ROAST_LEVEL_VALUES).nullable(),  // DB enum値に正規化
  shop_name:      z.string().nullable(),
  shop_address:   z.string().nullable(),
  acidity:        z.number().int().min(1).max(10).nullable(),
  aroma:          z.number().int().min(1).max(10).nullable(),
  bitterness:     z.number().int().min(1).max(10).nullable(),
  overall_rating: z.number().int().min(1).max(10).nullable(),
  // shop_latitude/longitude はジオコーディングで取得（OCR対象外）
  // is_public はユーザー設定（OCR対象外）
})
```

システムプロンプト: 日本語。コーヒーパッケージ画像から情報を抽出する専門家。
- **レーティングは1〜10の整数**
- **roast_level は必ず** `light/cinnamon/medium/high/city/full_city/french` **のいずれかに正規化**（浅煎り→light、中煎り→medium等）

---

### Step 8: Application Layer

**新規ファイル群**:

```
lib/application/
  llm-settings/
    dto.ts               # LlmSettingsInput (apiKey含む), LlmSettingsOutput (hasApiKeyのみ)
    get-llm-settings.ts  # GetLlmSettingsUseCase
    save-llm-settings.ts # SaveLlmSettingsUseCase
    index.ts
  ocr/
    dto.ts               # OcrExtractedData（1-10スケール、roastLevel は enum値）
    ocr-coffee-bean-use-case.ts
    index.ts
```

`OcrExtractedData` は既存ドメインと直接対応:
- レーティングは1-10整数（変換不要）
- `roastLevel` は既存 `roast_levels` テーブルの値

---

### Step 9: DI Container 更新

**変更ファイル**: `lib/di/container.ts`

```typescript
export function getUserLlmSettingsRepository(): UserLlmSettingsRepository { ... }
export function getApiKeyEncryptor(): ApiKeyEncryptor { return new Aes256GcmEncryptor() }
export function getOcrAgentFactory(): OcrAgentFactory { return new MastraOcrAgentFactory() }
export function setUserLlmSettingsRepository(repo: UserLlmSettingsRepository): void { ... }
```

---

### Step 10: Server Actions & API Routes

**新規ファイル**: `lib/actions/llm-settings.ts`

```typescript
'use server'
export async function saveLlmSettings(formData: FormData): Promise<ActionResult>
export async function getLlmSettings(): Promise<LlmSettingsOutput | null>
```

**新規ファイル群**:

```
app/api/agent/
  ocr/route.ts          # POST (multipart, maxDuration: 60, runtime: 'nodejs')
  llm-settings/route.ts # GET / PUT (JSON)
  models/route.ts       # GET → DBのAPIキー復号→モデル一覧取得→返却
```

**`/api/agent/models`**:
- 認証後、DBからAPIキー復号 → `{baseUrl}/models` に代理リクエスト
- OpenRouter の場合 `?supported_parameters=vision` フィルタを追加
- レスポンス: `{ models: string[] }`

---

### Step 11: UI Components

#### LLM Settings Page

```
app/(app)/profile/llm-settings/
  page.tsx                  # Server Component
  _components/
    llm-settings-form.tsx   # Client Component
```

**`LlmSettingsForm` フロー**:
1. プロバイダーカード選択（`KNOWN_PROVIDERS` をグリッド表示）→ baseUrl/defaultModel 自動入力
2. API URL（openai_compatible/ollama 時のみ表示）
3. APIキー（Ollama は非表示、設定済みなら `placeholder="設定済み"`）
4. モデル名入力 + 「モデルを検索」ボタン → ドロップダウン表示
5. 保存ボタン

ナビゲーション: プロフィールナビに「AI設定」リンク追加

#### OCR Components（評価作成フォームに統合）

**UIレイアウト（チャットUIではない）**:

```
┌──────────────────────────────────────┐
│ /coffee/new（評価を記録する）            │
│                                      │
│  [📷 画像から入力する]  ← ★上部ボタン   │
│                                      │
│  ──────── 評価フォーム ─────────       │
│  コーヒー名:  [OCR抽出済み or 空欄]    │  ← 確認画面 = フォーム自体
│  産地:       [OCR抽出済み or 空欄]    │
│  焙煎度:     [OCR抽出済み or 空欄]    │
│  評価:       ★★★★☆（OCR推定値）       │
│  ...                                 │
│  [保存する]                           │
└──────────────────────────────────────┘

フロー:
「📷 画像から入力する」ボタン押下
  ↓
[モーダル: アップロード＆解析のみ]
  ファイル選択 or ドラッグ&ドロップ → プレビュー
  → 「解析する」ボタン
  ↓ POST /api/agent/ocr
  → ローディング（「AIが解析中...」）
  ↓ 解析完了
  → モーダルを閉じる
  ↓
[/coffee/new フォームに結果を反映]
  各フィールドにOCR抽出値を自動入力（ユーザーが確認・修正して保存）
  ★確認画面 = 評価フォーム自体（別途確認画面は不要）
  → 送信 → 既存 createCoffeeEvaluation() ★変更なし
```

```
app/(app)/coffee/_components/ocr/
  ocr-upload-modal.tsx   # 画像選択・解析ボタン・ローディングのみのモーダル
                         # 確認画面は不要（/coffee/new フォーム自体が確認画面）
```

**新規ファイル**: `app/(app)/coffee/new/_components/new-evaluation-container.tsx`

```typescript
// 状態機（チャットなし・線形フロー）
type OcrStep =
  | { status: 'idle' }              // 初期表示: アップロードパネル表示
  | { status: 'analyzing' }         // 解析中: ローディング
  | { status: 'confirming', data: OcrExtractedData }  // 確認画面
  | { status: 'filling', data: OcrExtractedData }     // フォーム入力: OCR値で初期化済み

// confirming → filling のトランジションで EvaluationForm に ocrPreFill を渡す
```

**変更ファイル**: `app/(app)/coffee/_components/evaluation-form.tsx`
- `ocrPreFill?: OcrExtractedData` prop を追加
- `useState` の初期値を `ocrPreFill` から取得
- **フォーム送信は既存の `createCoffeeEvaluation` Server Action を変更なしで使用**

```typescript
// OCR pre-fill: useState初期値にのみ影響
const [beanName, setBeanName] = useState(ocrPreFill?.bean_name ?? initialData?.bean_name ?? '')
const [beanType, setBeanType] = useState(ocrPreFill?.bean_type ?? initialData?.bean_type ?? '')
const [roastLevel, setRoastLevel] = useState(ocrPreFill?.roast_level ?? initialData?.roast_level ?? '')
// ratings, shop fields も同様

// フォーム送信（既存コード、変更なし）
await createCoffeeEvaluation(formData) // ★既存Server Actionそのまま
```

**新規ファイル**: `app/(app)/coffee/new/_components/new-evaluation-container.tsx`

```typescript
// 上部ボタン → モーダル（アップロード＆解析のみ） → フォームに直接反映
type OcrModalState =
  | { status: 'closed' }
  | { status: 'uploading' }    // モーダル: 画像選択
  | { status: 'analyzing' }    // モーダル: 解析中

// 解析完了 → モーダルを閉じ → ocrData を useState で保持 → EvaluationForm に渡す
// 構造:
// <button>📷 画像から入力する</button>
// {modal.status !== 'closed' && <OcrUploadModal state={modal} onComplete={handleComplete} />}
// <EvaluationForm ocrPreFill={ocrData} />  ← フォームが確認画面を兼ねる
```

**変更ファイル**: `app/(app)/coffee/new/page.tsx`
- `NewEvaluationContainer` を使用するよう更新

---

### Step 12: Tests

#### Unit Tests（TDD: 実装前に作成）

| ファイル | テスト内容 |
|---------|-----------|
| `lib/domain/__tests__/llm-settings.test.ts` | VO validation, provider types |
| `lib/infrastructure/crypto/__tests__/aes-256-gcm-encryptor.test.ts` | encrypt/decrypt roundtrip, tamper detection |
| `lib/application/ocr/__tests__/ocr-coffee-bean-use-case.test.ts` | 1-10スケール直接処理, エラーハンドリング |
| `lib/application/llm-settings/__tests__/save-llm-settings.test.ts` | 暗号化フロー, 既存キー保持 |

#### Integration Tests

| ファイル | テスト内容 |
|---------|-----------|
| `lib/__tests__/api/llm-settings.test.ts` | 401 without auth, upsert動作 |
| `lib/__tests__/api/ocr.test.ts` | 401 without auth, 設定未設定エラー, モックagent |
| `lib/__tests__/api/models.test.ts` | モデル一覧プロキシ |

#### E2E Tests

```
e2e/specs/coffee/ocr-upload.spec.ts        # OCRアップロードフロー
e2e/specs/profile/llm-settings.spec.ts     # LLM設定フロー
e2e/pages/llm-settings.page.ts             # Page Object
e2e/fixtures/test-coffee-package.jpg       # テスト用画像
```

---

## Critical Files to Modify

| ファイル | 変更内容 |
|---------|---------|
| `lib/di/container.ts` | 3つの新ファクトリ関数追加 |
| `lib/types/database.types.ts` | `user_llm_settings` 型追加 |
| `app/(app)/coffee/_components/evaluation-form.tsx` | `ocrPreFill` prop追加 |
| `app/(app)/coffee/new/page.tsx` | `NewEvaluationContainer` を使用 |

## New Files Summary (33 files)

```
supabase/migrations/20260306000000_create_user_llm_settings.sql
lib/constants/llm-providers.ts
lib/domain/llm-settings/{value-objects/llm-provider.ts, value-objects/llm-settings.ts, entity.ts, repository.ts, index.ts}
lib/infrastructure/crypto/{api-key-encryptor.interface.ts, aes-256-gcm-encryptor.ts}
lib/infrastructure/llm/{llm-provider-factory.ts, ocr-agent-factory.ts, model-list-fetcher.ts}
lib/infrastructure/repositories/supabase-user-llm-settings-repository.ts
lib/mastra/{agents/coffee-ocr-agent.ts, tools/coffee-ocr-tool.ts, index.ts}
lib/application/llm-settings/{dto.ts, get-llm-settings.ts, save-llm-settings.ts, index.ts}
lib/application/ocr/{dto.ts, ocr-coffee-bean-use-case.ts, index.ts}
lib/actions/llm-settings.ts
app/api/agent/{ocr/route.ts, llm-settings/route.ts, models/route.ts}
app/(app)/profile/llm-settings/{page.tsx, _components/llm-settings-form.tsx}
app/(app)/coffee/_components/ocr/ocr-upload-modal.tsx  # アップロード＆解析のみ（確認画面不要）
app/(app)/coffee/new/_components/new-evaluation-container.tsx
e2e/{specs/coffee/ocr-upload.spec.ts, specs/profile/llm-settings.spec.ts, pages/llm-settings.page.ts}
```

---

## Environment Variables to Add

```bash
# .env.local に追加（NEXT_PUBLIC_ 接頭辞なし - サーバー専用）
LLM_ENCRYPTION_KEY=<openssl rand -hex 32 で生成>
```

---

## Verification

```bash
# 1. ブランチ作成
git checkout -b feature/mastra-ocr-agent

# 2. パッケージインストール
npm install @mastra/core @ai-sdk/openai-compatible @ai-sdk/anthropic ollama-ai-provider zod

# 3. DB migration
npx supabase db reset

# 4. Unit tests (TDD)
npm test -- --testPathPattern="llm-settings|aes-256|ocr-coffee"

# 5. Dev server
npm run dev
# → /profile/llm-settings: プロバイダー選択 → モデル検索 → 保存
# → /coffee/new: OCRアップロード → 確認 → フォーム自動入力

# 6. E2E
npm run test:e2e -- e2e/specs/coffee/ocr-upload.spec.ts
npm run test:e2e -- e2e/specs/profile/llm-settings.spec.ts
```
