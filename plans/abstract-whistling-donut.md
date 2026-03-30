# Context

Issue #42: Google ADS 審査のため「企業情報」と「お問い合わせ」ページを追加する。
透明性を確保しユーザーの信頼を得るため、サービス運営者情報と連絡先を公開する必要がある。

---

## 実装方針

### 新規ファイル（作成）

| ファイル | 内容 |
|---|---|
| `app/(app)/company/page.tsx` | 企業情報（静的 Server Component） |
| `app/(app)/contact/page.tsx` | お問い合わせ（静的 Server Component） |
| `app/(app)/_components/footer.tsx` | フッターコンポーネント（両ページへのリンク含む） |
| `app/(app)/company/__tests__/page.test.tsx` | 企業情報ページのユニットテスト |
| `app/(app)/contact/__tests__/page.test.tsx` | お問い合わせページのユニットテスト |
| `app/(app)/_components/__tests__/footer.test.tsx` | フッターのユニットテスト |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `app/(app)/layout.tsx` | `<Footer />` を `<main>` の後に追加 |
| `lib/supabase/middleware.ts` | `/company` と `/contact` を公開パスに追加 |

---

## 各ページの内容

### 企業情報 (`/company`)
- サービス名: Simple Coffee Collections
- 運営者: ifhito（個人運営）
- 目的: コーヒー豆の記録・評価・共有サービス
- 所在地: 日本
- 連絡先: お問い合わせページへのリンク

### お問い合わせ (`/contact`)
- GitHub Issues へのリンク（個人プロジェクトのため）
- 連絡先メール（またはフォームなし・GitHub のみで OK）

### フッター (`_components/footer.tsx`)
- 企業情報・お問い合わせへのリンク
- プライバシーポリシーリンク（将来のための placeholder でも可）
- コピーライト表記

---

## テスト方針（TDD）

- 各ページが主要コンテンツを render することを確認するユニットテスト
- フッターコンポーネントのリンク存在確認テスト
- テストはシンプルな `render + screen.getByText / getByRole` で十分

---

## 確認方法

1. `npm run test` でユニットテストが通ること
2. ローカルで `/company`・`/contact` に未ログイン状態でアクセスできること（リダイレクトされないこと）
3. フッターがすべての `(app)` レイアウトページに表示されること
