# E2E Tests with Playwright

## セットアップ

### 1. Supabaseローカル環境の起動

```bash
supabase start
```

### 2. テストユーザーの作成

```bash
# SQLスクリプトを実行
supabase db execute --file e2e/setup-test-user.sql
```

または、Supabase Studio (http://localhost:54323) のSQL Editorで `e2e/setup-test-user.sql` の内容を実行してください。

**テストユーザー情報:**
- Email: `e2e-test@example.com`
- Password: `TestPassword123!`

### 3. Chromiumブラウザのインストール（初回のみ）

```bash
pnpm exec playwright install chromium
```

## テスト実行

### 全テスト実行

```bash
pnpm test:e2e
```

### UIモードで実行（推奨）

```bash
pnpm test:e2e:ui
```

UIモードでは、テストをステップ実行したり、各ステップのスクリーンショットを確認できます。

### ヘッドフルモード（ブラウザ表示あり）

```bash
pnpm test:e2e:headed
```

### デバッグモード

```bash
pnpm test:e2e:debug
```

### 特定のテストのみ実行

```bash
# ログインテストのみ
pnpm test:e2e specs/auth/login.spec.ts

# コーヒー作成テストのみ
pnpm test:e2e specs/coffee/create.spec.ts
```

## ディレクトリ構造

```
e2e/
├── fixtures/
│   ├── index.ts          # Playwrightテスト拡張
│   └── test-data.ts      # テストデータ定数
├── pages/
│   ├── login.page.ts     # ログインページ Page Object
│   └── coffee-form.page.ts # コーヒーフォームページ Page Object
├── specs/
│   ├── auth/
│   │   ├── login.spec.ts    # ログインテスト
│   │   └── logout.spec.ts   # ログアウトテスト
│   └── coffee/
│       └── create.spec.ts   # コーヒー評価作成テスト
├── auth.setup.ts         # 認証セットアップ（セッション保存）
├── setup-test-user.sql   # テストユーザー作成SQL
└── README.md
```

## Page Object Pattern

テストではPage Object Modelパターンを使用しています：

- **Page Object**: ページの操作を抽象化したクラス
- **利点**: UIの変更に強く、テストコードの保守性が向上

例:
```typescript
// Page Objectを使わない場合
await page.locator('#email').fill('test@example.com')
await page.locator('#password').fill('password')
await page.getByRole('button', { name: 'ログイン' }).click()

// Page Objectを使う場合
await loginPage.login('test@example.com', 'password')
```

## 認証セットアップ

`auth.setup.ts` で一度ログインし、セッション状態を `playwright/.auth/user.json` に保存します。その後のテストでは、この保存された状態を再利用することで、毎回ログインする必要がなくなります。

ログイン・ログアウトのテストでは `storageState: { cookies: [], origins: [] }` を指定して、この機能を無効化しています。

## テストレポート

テスト実行後、HTMLレポートが自動的に開きます：

```bash
# レポートを再度開く
pnpm exec playwright show-report
```

## トラブルシューティング

### テストが失敗する場合

1. **Supabaseが起動しているか確認**
   ```bash
   supabase status
   ```

2. **開発サーバーが起動しているか確認**
   ```bash
   # 別ターミナルで
   pnpm dev
   ```

   ※ playwright.configの`webServer`設定により、自動起動されるはずです

3. **テストユーザーが存在するか確認**
   ```bash
   supabase db execute --file e2e/setup-test-user.sql
   ```

4. **認証状態をリセット**
   ```bash
   rm -rf playwright/.auth/
   ```

### Chromiumが見つからない場合

```bash
pnpm exec playwright install chromium
```

## CI/CD

GitHub Actionsなどで実行する場合は、環境変数 `CI=true` を設定してください。リトライ回数やワーカー数が自動調整されます。

## E2Eテスト開発ガイド

新しいE2Eテストを作成する際は、`.claude/skills/e2e-testing/` のスキルドキュメントを参照してください：

- **WORKFLOW.md**: Use Cases → Scenarios → Test Cases → Implementation の4ステップワークフロー
- **PATTERNS.md**: Page Object Model、Fixtures、AAA パターンなど
- **BEST_PRACTICES.md**: テスト独立性、アンチパターン、デバッグ方法
- **TEMPLATES.md**: すぐに使えるテストテンプレート集

テスト項目の全体像は `e2e/TEST_MATRIX.md` を参照してください。
