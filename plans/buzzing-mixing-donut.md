# Plan: AI機能ページ統合 + 一時利用設定対応

## Context

- **現状**: OCRモーダルは `/coffee/new` 上のモーダル、AI設定は `/profile/llm-settings` と分離している
- **目的**: 両者を `/ai` ページに統合し「AI機能」としてナビゲーションに追加
- **設計方針**:
  - DB保存とOCR実行は**独立したアクション**として分離する
  - DBにデータがある場合は、そのデータをOCRに使用するのがデフォルト（インライン入力不可）
  - DBにデータがない場合のみ、インライン入力（一時利用 or 保存）が可能
  - AI設定の削除機能を追加
- **フロー変更**: OCR完了後は `/coffee/new?bean_name=...` にリダイレクトしてフォームを自動埋め込み

---

## AI設定セクションのUX設計

### Case A: DBに設定あり（デフォルト表示）

```
[AI設定]
保存済み: Google Gemini / gemini-flash-latest / APIキー設定済み
[変更する]  [削除する]
```

- OCRセクションはそのまま使用可能（DB設定を使用）
- インライン入力フィールドは表示されない

### Case B: DBに設定なし

```
[AI設定]
[プロバイダー選択UI]
[API URL] [APIキー] [モデル名]
☐ この設定を保存する
[設定を保存]（保存ONの場合のみ表示）
※ 一時利用の場合は「設定を保存」ボタンなし、OCR実行時にインライン送信
```

### Case C: 変更モード（変更するボタン押下後）

```
[AI設定]（編集フォーム表示）
[プロバイダー選択UI]（現在の値で初期化）
[API URL] [APIキー] [モデル名]
[保存する]  [キャンセル]
```

- 保存後 → Case A に戻る
- キャンセル → Case A に戻る

---

## 変更ファイル一覧

| ファイル | 種別 | 変更内容 |
|---------|------|---------|
| `app/(app)/ai/page.tsx` | 新規 | Server Component。保存済み設定を取得し Client に渡す |
| `app/(app)/ai/_components/ai-features-client.tsx` | 新規 | メイン Client Component（設定セクション + OCRセクション） |
| `app/(app)/ai/_components/llm-settings-panel.tsx` | 新規 | 制御コンポーネント版の設定フォームUI（submit不要） |
| `lib/application/ocr/run-ocr.ts` | 新規 | OCR実行ロジックを純粋関数として分離 |
| `lib/infrastructure/llm/llm-provider-factory.ts` | 変更 | `createLlmModelFromPrimitives` 関数を追加 |
| `app/api/agent/ocr/route.ts` | 変更 | `inline_*` FormDataフィールドでDB設定をバイパス（DBなし時のみ使用） |
| `lib/actions/llm-settings.ts` | 変更 | `deleteLlmSettings` Server Actionを追加 |
| `lib/application/llm-settings/` | 変更 | `DeleteLlmSettingsUseCase` を追加 |
| `lib/infrastructure/repositories/supabase-user-llm-settings-repository.ts` | 変更 | `deleteByUserId` メソッド追加 |
| `app/(app)/_components/nav-bar.tsx` | 変更 | "AI設定" → "AI機能"、href `/profile/llm-settings` → `/ai` |
| `app/(app)/coffee/new/page.tsx` | 変更 | `searchParams` からOCRデータを読み込み |
| `app/(app)/coffee/new/_components/new-evaluation-container.tsx` | 変更 | モーダル削除、OCRボタンを `/ai` へのLinkに変更、`ocrPreFill` prop追加 |

**変更しないファイル**:
- ドメイン層（`lib/domain/llm-settings/` エンティティ・VO）
- `OcrCoffeeBeanUseCase`（既存DBパスはそのまま）
- `OcrUploadModal`（残置、参照されなくなる）
- `app/(app)/profile/llm-settings/`（後方互換維持）

---

## Part 1: OCR実行ロジック分離

### `lib/application/ocr/run-ocr.ts` (新規)

`OcrCoffeeBeanUseCase.execute` のステップ3〜4（agent作成 + generateObject）をエクスポート関数として抽出：

```typescript
export async function runCoffeeOcr(
  model: MastraModel,
  imageBuffer: Buffer,
  mimeType: string
): Promise<OcrCoffeeBeanResult>
```

`OcrCoffeeBeanUseCase` 内の `generateObject` ブロックをこの関数呼び出しに置き換える（既存テストは変更不要）。

---

## Part 2: LLMファクトリ拡張

### `lib/infrastructure/llm/llm-provider-factory.ts` (変更)

既存 `createLlmModel(settings: UserLlmSettings, apiKey)` はそのまま。追加：

```typescript
export function createLlmModelFromPrimitives(
  providerType: LlmProviderType,
  apiUrl: string | null,
  modelName: string,
  providerTemplate: string | null,
  apiKey: string
): MastraModel
```

---

## Part 3: OCR APIルート拡張

### `app/api/agent/ocr/route.ts` (変更)

FormDataに `inline_provider_template` が存在する場合（DBなし・一時利用パス）、DBルックアップをスキップ：

```
if (formData.get('inline_provider_template')) {
  // DBなし・一時利用パス
  // providerType は getProviderTypeByTemplate() で導出（ルート内にロジックを書かない）
  → getProviderTypeByTemplate(inline_provider_template)  → createLlmModelFromPrimitives(providerType, inline_api_url, ...)
  → runCoffeeOcr(model, imageBuffer, mimeType)
} else {
  // 既存の OcrCoffeeBeanUseCase.execute(userId, ...) パス（DB使用）
}
```

inline フィールド（`inline_provider` は不要）：
`inline_provider_template`, `inline_api_url`, `inline_api_key`, `inline_model_name`

**`lib/constants/llm-providers.ts` にユーティリティ追加:**

```typescript
// providerType の導出ロジックをここに集約。ルート側は直接 KNOWN_PROVIDERS に触らない
export function getProviderTypeByTemplate(template: string): LlmProviderType {
  return KNOWN_PROVIDERS.find((p) => p.template === template)?.providerType ?? 'openai_compatible'
}
```

---

## Part 4: AI設定削除機能

### `lib/domain/llm-settings/` の Repository interface 変更

`UserLlmSettingsRepository` インターフェースに `deleteByUserId(userId: string)` を追加。

### `lib/infrastructure/repositories/supabase-user-llm-settings-repository.ts`

`deleteByUserId` 実装を追加（`DELETE FROM user_llm_settings WHERE user_id = ...`）。

### `lib/application/llm-settings/delete-llm-settings.ts` (新規)

```typescript
export class DeleteLlmSettingsUseCase {
  async execute(userId: string): Promise<{ error?: string }>
}
```

### `lib/actions/llm-settings.ts`

```typescript
export async function deleteLlmSettings(): Promise<{ error?: string }>
```

---

## Part 5: AI機能ページ新規作成

### `app/(app)/ai/page.tsx` (新規)

```typescript
export default async function AiPage() {
  const settings = await getLlmSettings()  // 既存server actionを再利用
  return <AiFeaturesClient initialSettings={settings} />
}
```

### `app/(app)/ai/_components/llm-settings-panel.tsx` (新規)

`llm-settings-form.tsx` のUI部分を制御コンポーネントとして切り出す（`<form>` タグ・保存ボタンなし）。

props: `selectedTemplate`, `provider`, `apiUrl`, `apiKey`, `modelName`, `hasExistingKey` + 各onChange

### `app/(app)/ai/_components/ai-features-client.tsx` (新規)

**state:**
```typescript
mode: 'view' | 'edit' | 'new'  // view=DB設定あり読み取り, edit=変更中, new=DB設定なし
// 設定フォーム
selectedTemplate, provider, apiUrl, apiKey, modelName
saveSettings: boolean  // 一時利用トグル（newモード時のみ表示）
// OCR
selectedFile, previewUrl, isAnalyzing, ocrError
```

**モード判定** (`initialSettings !== null` → `'view'`, else → `'new'`)

**各モードのUI:**

`view` モード:
```
[保存済み設定の概要表示]
[変更する] [削除する]
```

`edit` モード（変更するボタン押下後）:
```
<LlmSettingsPanel 現在値で初期化 />
[保存する（DB保存）] [キャンセル]
```
- 保存後 → `mode = 'view'`

`new` モード（DB設定なし）:
```
<LlmSettingsPanel />
☐ この設定を保存する
// 保存ON: [設定を保存] ボタン（OCRとは独立）
// 保存OFF: 設定は解析時にインライン送信
```

**OCRセクション（全モード共通）:**
```
[機能セレクター: AI画像分析]
[画像ドロップゾーン]
[解析する] ← disabled条件:
  - viewモード: ファイル未選択時のみ
  - new/editモード: ファイル未選択 or (saveSettingsONかつ未保存)
```

**解析ボタン押下フロー:**
```typescript
// viewモード or DBに設定あり → インライン送信なし
POST /api/agent/ocr { image }  // → DBパス

// newモード + saveSettings=false → インライン送信
POST /api/agent/ocr { image, inline_provider, ... }

// newモード + saveSettings=true + 設定保存済み → DBパス
POST /api/agent/ocr { image }
```

**OCR成功時:**
```typescript
const params = new URLSearchParams()
if (data.bean_name) params.set('bean_name', data.bean_name)
// ...
router.push(`/coffee/new?${params.toString()}`)
```

---

## Part 6: `/coffee/new` URL params対応

### `app/(app)/coffee/new/page.tsx` (変更)

```typescript
export default async function NewCoffeeEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{ bean_name?: string; bean_type?: string; roast_level?: string; shop_name?: string; shop_address?: string }>
}) {
  const params = await searchParams
  const ocrPreFill = params.bean_name || params.roast_level
    ? { bean_name: params.bean_name ?? null, ... }
    : undefined
  return <NewEvaluationContainer ocrPreFill={ocrPreFill} />
}
```

### `app/(app)/coffee/new/_components/new-evaluation-container.tsx` (変更)

- Props: `ocrPreFill?: OcrExtractedData` を追加
- OCRボタン: `<button onClick={openModal}>` → `<Link href="/ai">` に変更
- `OcrUploadModal` import・state・handler を全削除
- Server Component に昇格（`'use client'` 削除）
- インジケーター: `ocrData` state → `ocrPreFill` prop 参照

---

## Part 7: ナビゲーション更新

### `app/(app)/_components/nav-bar.tsx` (変更)

デスクトップ・モバイル両方:
- `href="/profile/llm-settings"` → `href="/ai"`
- `"AI設定"` → `"AI機能"`
- `pathname.startsWith('/profile/llm-settings')` → `pathname.startsWith('/ai')`

---

## データフロー図

```
[/ai ページ - viewモード（DB設定あり）]
  ├─ DB設定を表示（読み取り専用）
  ├─ 「変更する」→ editモード（フォーム表示、保存は独立ボタン）
  ├─ 「削除する」→ deleteLlmSettings() → newモードに遷移
  └─ 「解析する」→ POST /api/agent/ocr {image} → DB設定使用

[/ai ページ - newモード（DB設定なし）]
  ├─ 設定入力
  ├─ 「保存する（独立）」→ saveLlmSettings() → viewモードに遷移
  ├─ 「解析する（一時利用）」→ POST /api/agent/ocr {image + inline_*}
  └─ OCR成功 → router.push('/coffee/new?bean_name=XX&...')

[/coffee/new ページ]
  ├─ searchParams からOCRデータ読み取り (Server Component)
  └─ EvaluationForm に ocrPreFill として渡す（既存 useEffect で自動埋め込み）
```

---

## 実装順序

1. `run-ocr.ts` 抽出（既存テスト通過確認）
2. `createLlmModelFromPrimitives` 追加
3. 削除機能: Repository + UseCase + Server Action
4. OCR APIルートにinlineパス追加
5. `llm-settings-panel.tsx` 作成
6. `ai-features-client.tsx` 作成
7. `app/(app)/ai/page.tsx` 作成
8. `/coffee/new` 変更（page.tsx + new-evaluation-container.tsx）
9. nav-bar 変更

---

## Verification

1. `pnpm test` — 全テスト通過
2. DBに設定ある状態で `/ai` → 設定が読み取り専用で表示され「変更する」「削除する」ボタンがある
3. 「削除する」→ 設定が削除され入力フォームが表示される
4. DBなし状態で一時利用OCR実行 → DBに保存されず、`/coffee/new` にリダイレクトしてフォームが埋まる
5. DBなし状態で「設定を保存」→ 保存後に読み取り専用表示に切り替わる
6. 保存後にOCR実行 → DBの設定が使われる
7. `/coffee/new` の「画像から入力する」が `/ai` へのリンクになっている
8. ナビゲーションに「AI機能」が表示され `/ai` に飛ぶ
9. `/profile/llm-settings` は引き続きアクセス可能（後方互換）
