# Design Document

## Overview
マイページ（/coffee/my）で、自分のプロフィールURL（/users/{userId}）をワンクリックでコピーできる「共有用リンクコピー」機能を追加する。コピー対象はフルオリジン付きURL（例: https://example.com/users/abcd）。ブラウザのクリップボードAPIが使えない場合はフォールバックで手動コピーを案内する。

## Steering Document Alignment

### Technical Standards (tech.md)
- Next.js App Router + RSC/Client分離を継続。MyPageはサーバーでデータ取得、コピー操作はClient Componentで実装。
- TypeScript/Tailwindを踏襲し、SRPと小さなクライアントコンポーネントを追加。
- SSR安全にオリジンを組み立てる（headersベース）ことで環境依存を抑制。

### Project Structure (structure.md)
- ページ配下のコンポーネントは `/app/(app)/coffee/my/_components` に配置。汎用化するユーティリティは `lib/utils/url.ts` を新設予定。
- Container/Presentationalパターンを踏襲: ContainerでURL生成とデータ取得、Presentationalで表示、Clientコンポーネントでコピー操作。

## Code Reuse Analysis
- **MyPageContainer (app/(app)/coffee/my/_containers/container.tsx)**: 既存の認証・データ取得ロジックを流用し、`profileShareUrl` を計算してViewへ渡す。
- **MyPageView (app/(app)/coffee/my/_components/view.tsx)**: 新しい「プロフィール共有」UIをセクションとして追加。
- **PublicBadge / EmptyState**: 既存のスタイル言語を参照し、デザイン一貫性を保つ。

### Existing Components to Leverage
- **SearchAndSort**: 既存のMyPageレイアウトに併置し、UIの整合性を保つ。
- **getCurrentUser (lib/api/auth.ts)**: プロフィールURL生成用の userId ソース。

### Integration Points
- **Headers (next/headers)**: オリジン組み立て用に利用（X-Forwarded-Proto/Host を優先）。
- **/users/[userId] ページ**: 既存の公開プロフィール表示に遷移。未ログインでも閲覧可能であるため追加のAPI変更は不要。

## Architecture
- **Server側 (Container)**: `MyPageContainer` で `getCurrentUser()` を呼び、`buildProfileShareUrl(user.id)` を計算して View へ渡す。`buildProfileShareUrl` は headers からオリジンを取得し、`/users/{id}` を連結。
- **View (Server Component)**: MyPageViewに「プロフィール共有」セクションを追加し、コピー用の Client Component を配置。
- **Client Component**: `CopyProfileLinkButton` を新設し、クリックで `navigator.clipboard.writeText(url)` を試み、失敗時はフォールバック入力で選択可能にする。成功/失敗をローカルステートで表示。

### Modular Design Principles
- URL生成ロジックは `lib/utils/url.ts` に分離（`buildAbsoluteUrl(path, headers)` のような形）し、再利用可能にする。
- コピーUIは単一責務の Client Component とし、Viewから受け取るプロップは `url: string`, `label?: string`。
- ViewはUI配置のみを担い、ビジネスロジックはContainerとClient Componentに分離。

## Components and Interfaces

### Component: CopyProfileLinkButton (Client)
- **Purpose:** プロフィールURLをクリップボードへコピーし、結果をユーザーに通知。
- **Interfaces:** `props: { url: string; className?: string; }`
- **Dependencies:** `navigator.clipboard`, `useState`, `setTimeout` (トーストの自動クローズ用)。
- **Reuses:** Tailwindスタイル; 既存のボタンスタイルに合わせたクラス。

### Component: ProfileSharePanel (Server/Presentational)
- **Purpose:** MyPageView内にコピーボタンと説明文を表示。
- **Interfaces:** `props: { profileShareUrl: string }`
- **Dependencies:** `CopyProfileLinkButton`
- **Reuses:** MyPageのレイアウト/カードスタイル。

### Utility: buildProfileShareUrl / buildAbsoluteUrl
- **Purpose:** headersからオリジンを安全に組み立て、`/users/{id}` の絶対URLを返す。
- **Interfaces:** `buildProfileShareUrl(userId: string, headers: Headers): string`
- **Dependencies:** `next/headers`
- **Reuses:** なし（新規ユーティリティ、将来他のシェア機能でも再利用可能）。

## Data Models
- 既存データモデルのみ使用。新規テーブル/フィールドなし。
- URL生成: `string` (absolute)

## Error Handling
1. **Clipboard API unavailable/denied**
   - **Handling:** フォールバック入力欄を表示し、自動選択して手動コピーを促す。
   - **User Impact:** エラーメッセージとフォールバックUIを表示。
2. **Origin 不明（ヘッダー不足）**
   - **Handling:** デフォルトで空文字を避け、`/users/{id}` を相対URLとして返却し、Viewで「コピー不可」状態を表示しないよう原則オリジンを必須化（ローカル開発でも `localhost` を推定）。
3. **User 未取得**
   - **Handling:** MyPageContainer は認証前提なのでリダイレクト済み。万一 null の場合はボタンを非表示にする。

## Testing Strategy

### Unit Testing
- `buildProfileShareUrl`: headersが無い/ある場合のオリジン組み立て、userId連結をテスト。
- `CopyProfileLinkButton`: 成功時に `navigator.clipboard.writeText` が呼ばれ、成功メッセージが表示されること。失敗時にフォールバックが表示されること。

### Integration Testing
- MyPage View: `profileShareUrl` がボタンに渡され、クリックでコピー成功トーストが出る（clipboardをモック）。
- 環境ごとのオリジン: ヘッダーをモックしたContainerテストで絶対URLが生成されること。

### End-to-End Testing
- （任意・後続）未ログインユーザーが共有URLを開いたときにプロフィールを閲覧できることを確認する軽量E2Eを追加検討。
