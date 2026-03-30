# Plan: メール送信お問い合わせフォーム

## Context
現在のお問い合わせページはGitHub IssuesへのリンクとメールアドレスをテキストとしてGitHub Issues表示するだけ。
ボタンを押すと実際にメール送信できるフォームを追加する。

## アプローチ: Resend + Server Action + Client Component

**Resend を選ぶ理由**: Vercel推奨、無料枠3000通/月、API 1行でメール送信可能、設定が最もシンプル。

---

## 実装ステップ

### 1. パッケージインストール
```bash
npm install resend
```

### 2. Server Action 作成
**ファイル**: `lib/actions/contact.ts`

- `'use server'` ディレクティブ
- 既存の `auth.ts` と同じパターン（`FormData` + `ActionResult` 型）
- バリデーション: メールアドレス・メッセージは必須、メール形式チェック
- Resend でメール送信（to: hito01010101@gmail.com, replyTo: 送信者メール）
- 戻り値: `{ success: true } | { error: string }`

```typescript
'use server'
import { Resend } from 'resend'

type ActionResult = { success: true } | { error: string }

export async function sendContactEmail(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> { ... }
```

### 3. Client Component 作成
**ファイル**: `app/(app)/contact/_components/contact-form.tsx`

- `'use client'`
- `useActionState` (React 19) でフォーム状態管理
- 既存の `Input` (`components/ui/Input.tsx`) + `Button` (`components/ui/Button.tsx`) を使用
- `textarea` は既存UIと同じTailwindスタイルで追加（shadcnなし）
- 送信成功時: 緑のサクセスメッセージを表示（フォームを非表示に）
- エラー時: 赤いエラーメッセージを表示

フォームフィールド:
- お名前（任意）
- メールアドレス（必須）
- お問い合わせ内容（必須、textarea）

### 4. Contact Page 更新
**ファイル**: `app/(app)/contact/page.tsx`

- 既存のGitHub Issuesボタンセクション（保持）
- 新しいセクション: `<ContactForm />` を追加
- `「メールで直接お問い合わせ」` の見出しを追加

### 5. 環境変数
`RESEND_API_KEY` はすでに `.env.local` に設定済み。
`.env.example` に追記のみ:
```
RESEND_API_KEY=your-resend-api-key
```

送信元アドレス: `noreply@mail.coffee-collections.uk`（検証済みドメイン使用）

---

## 変更ファイル一覧

| ファイル | 変更種別 |
|---------|---------|
| `lib/actions/contact.ts` | 新規作成 |
| `app/(app)/contact/_components/contact-form.tsx` | 新規作成 |
| `app/(app)/contact/page.tsx` | 更新 |
| `.env.example` | 更新 |
| `package.json` (resend追加) | 更新 |

---

## 検証方法

1. `npm run dev` 起動
2. `/contact` ページを開く
3. フォームに入力して送信ボタンをクリック
4. 成功メッセージが表示されることを確認
5. hito01010101@gmail.com にメールが届くことを確認
