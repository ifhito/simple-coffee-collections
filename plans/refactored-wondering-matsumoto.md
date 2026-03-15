# Plan: Fix Issues #32, #33, #35

## Context

3つの独立したUI改善issueをひとつのブランチ(`claude/fix-issues-32-33-35-8SIhB`)で対応する。

- **#32** 「後で評価するページに感想入力欄の追加」: `/coffee/[id]/evaluate` の評価フォームに `notes` テキストエリアがない。既に create/update フォームには500文字制限付きで実装済みなので、同等の機能を追加する。
- **#33** 「公開、非公開ボタンの改善」: 現状は状態に応じてラベルが "🌐 公開" / "🔒 非公開" と変わるチェックボックス。ユーザーの要望は「公開する」という固定ラベルのチェックボックスに簡素化し、非公開状態が分かりにくい問題を解消する。
- **#35** 「メインページをコミュニティに。現在のメインページはLPとして切り離す」: 現在の `/` はウェルカムページ。ログイン後のデフォルト画面をコミュニティに変え、既存のウェルカム内容は `/lp` として切り離す。

---

## Issue #32: 後で評価するページに感想入力欄の追加

### 修正対象ファイル

1. **`app/(app)/coffee/_components/evaluate-form.tsx`**
   - `EvaluateFormProps.defaultValues` に `notes?: string | null` を追加
   - `notes` の `useState` を追加（初期値: `defaultValues?.notes ?? ''`）
   - フォームに `<textarea name="notes">` を追加（maxLength=500, placeholder="感想を入力してください（任意）"）
   - `handleSubmit` で `formData.set('notes', notes)` を追加

2. **`lib/actions/coffee.ts`** — `addEvaluation` 関数（line 360–401）
   - `notes` を `getStringField(formData, 'notes').trim()` でパース
   - 500文字超はエラー返却（既存の `CoffeeEvaluationValidation.notes.maxLength` 定数を使う）
   - DB update に `notes: notes || null` を追加

3. **`app/(app)/coffee/[id]/evaluate/page.tsx`**
   - `EvaluateForm` の `defaultValues` に `notes: evaluation.notes` を追加
   - （`evaluation` は `getCoffeeEvaluation()` の返却値で `notes` を含む）

4. **`lib/actions/__tests__/coffee.test.ts`** — `addEvaluation` テスト群（line 286–）
   - 「notes あり → DB update に notes が含まれること」を追加
   - 「notes 501文字 → エラー返却」を追加

### 再利用するパターン
- `getStringField()` / `CoffeeEvaluationValidation.notes.maxLength` （`lib/actions/coffee.ts` 内）
- `evaluation-form.tsx` の既存 notes textarea 実装（同じスタイルで追加）

---

## Issue #33: 公開、非公開ボタンの改善

### 修正対象ファイル

1. **`app/(app)/coffee/_components/shared/public-toggle.tsx`**
   - `getVisibilityText` のインポートを削除
   - ラベルを固定の「公開する」に変更（絵文字・動的テキスト不要）
   - `aria-label` も「公開する」固定に変更
   - hidden input (`value={isPublic.toString()}`) はそのまま維持（フォーム送信値は変わらない）

   Before: `{getVisibilityText(isPublic)}` (状態に応じて "🌐 公開" / "🔒 非公開")
   After: `公開する` (固定)

2. **`app/(app)/coffee/_components/shared/__tests__/public-toggle.test.tsx`**
   - 「🌐 公開 / 🔒 非公開ラベルの表示」に関するテストを削除
   - 「"公開する" ラベルが常に表示される」テストに置き換え
   - チェック/アンチェックの動作テスト・hidden input テストは維持

---

## Issue #35: メインページの内容充実（LP風ページ化）

### 方針
- `/` はリダイレクトしない。現在のウェルカスページをLP風に改善する
- 「やれること」をカード形式で説明し、各ページへのリンクを提供する
- 新規ファイル作成なし

### 修正対象ファイル

1. **`app/(app)/page.tsx`** のみ
   - ヒーローセクション: アプリキャッチコピー + 説明文
   - 機能カード3枚（`<Link>` でクリッカブル）:
     - **📝 マイページ** (`/coffee/my`): 自分のコーヒー記録を管理・確認
     - **🌐 コミュニティ** (`/coffee/community`): みんなの評価をチェック
     - **➕ 新規評価を記録** (`/coffee/new`): カフェ訪問・コーヒーを記録
   - 現在の箇条書き機能リストと「ログイン中」バッジは削除
   - `<Link>` コンポーネント (next/link) を使用
   - Tailwind でカード型レイアウト（既存の `bg-white rounded-lg shadow` パターン踏襲）

---

## Verification

1. **Issue #32**:
   - `pnpm test lib/actions/__tests__/coffee.test.ts` が pass
   - `/coffee/[id]/evaluate` ページを開き、感想テキストエリアが表示されることを確認
   - テキスト入力して保存後、`/coffee/[id]` の詳細ページで感想が反映されることを確認

2. **Issue #33**:
   - `pnpm test app/(app)/coffee/_components/shared/__tests__/public-toggle.test.tsx` が pass
   - 評価作成フォームで「公開する」チェックボックスが固定ラベルで表示されることを確認

3. **Issue #35**:
   - `/` にアクセスすると `/coffee/community` にリダイレクトされることを確認
   - `/lp` でウェルカムコンテンツが表示されることを確認

4. **Issue #35**:
   - `/` にアクセスして3つの機能カード（マイページ・コミュニティ・新規評価）がリンク付きで表示されること
   - 各リンクが正しいページに遷移すること

5. **全体**: `pnpm test` が pass、`pnpm build` でエラーがないことを確認
