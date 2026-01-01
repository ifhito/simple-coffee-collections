# Requirements Document

## Introduction
マイページから自分のプロフィールURL（`/users/[userId]`）をワンクリックでコピーできる「共有用リンクコピー」機能を追加する。ユーザーは他の人に自分のプロフィールを共有しやすくなり、コミュニティでのプロフィール閲覧導線が向上する。

## Alignment with Product Vision
- **共有のしやすさ**: product.md の「お気に入りのカフェや豆を共有したい」「コミュニティ形成」に合致し、プロフィールページへの誘導を簡素化する。
- **レスポンシブ対応**: ナビゲーション改善や既存のモバイル対応に沿って、PC/モバイル双方でストレスなくコピーできる。
- **セキュリティ遵守**: 公開プロフィールへのリンクのみをコピーし、認証やRLSのポリシーを崩さない範囲で共有手段を提供する。

## Requirements

### Requirement 1: プロフィールURLコピー操作
**User Story:** As a logged-in user on My Page, I want to copy my profile URL quickly, so that I can share it with others.

#### Acceptance Criteria
1. WHEN the user is on `/coffee/my` AND clicks the “プロフィールリンクをコピー”ボタン THEN the clipboard SHALL contain the absolute URL to `/users/{currentUserId}`.
2. IF the clipboard API is available THEN the app SHALL use `navigator.clipboard.writeText`; ELSE it SHALL fall back to a selectable input or prompt so the user can manually copy.
3. WHEN the copy action succeeds THEN a success feedback (toast/snackbar or inline message) SHALL appear within 1 second and auto-dismiss within 4 seconds.
4. WHEN the copy action fails (e.g., permissions) THEN an error feedback SHALL be shown with guidance to copy manually.
5. The button SHALL be keyboard-focusable and operable via Enter/Space; focus state must be visible.

### Requirement 2: 正しいURLおよびアクセス制御
**User Story:** As a user sharing my profile, I want the copied URL to resolve correctly for anyone, so that recipients can view my public profile without extra steps.

#### Acceptance Criteria
1. The copied URL SHALL include the full origin (e.g., `https://example.com/users/{id}`) derived from the current request headers/base URL.
2. IF a user is not authenticated and accesses the shared URL THEN they SHALL see the public profile page (existing behavior) without being forced to log in.
3. The copy button SHALL NOT be rendered for unauthenticated users (because `/coffee/my` already redirects to login).
4. The button text/label SHALL be localized in Japanese and include an accessible name (e.g., `aria-label="プロフィールリンクをコピー"`).

## Non-Functional Requirements

### Code Architecture and Modularity
- Keep the copy logic in a small client utility/component to allow reuse (e.g., future “copy evaluation link”).
- Avoid coupling to page layout; accept props for URL string and callbacks for feedback.

### Performance
- Copy interaction SHALL complete within 150ms in modern browsers (excluding system permission prompts).
- No additional network calls for the copy action.

### Security
- Never expose private tokens or non-public URLs; only copy `/users/{id}` with the current site origin.
- Respect browser clipboard permissions; do not retry aggressively on denial.

### Reliability
- Provide a graceful fallback when clipboard API is unavailable or blocked.
- Ensure SSR-safe handling of origin (use request headers or Next.js utilities on the server side; avoid `window` on server).

### Usability
- Visible focus ring and touch-friendly target (min 44px height).
- Clear success/error feedback; avoid persistent banners after success.
- Japanese copy for labels and messages.
