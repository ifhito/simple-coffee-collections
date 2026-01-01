# Requirements Document

## Introduction

このspecは、コーヒー評価の公開制御と共有機能を実装します。現在、すべての評価が公開（is_public=true）されており、自分の評価と他人の評価が混在して表示されています。この機能により、ユーザーは評価の公開/非公開を選択でき、他のユーザーの公開評価を閲覧し、コミュニティとして交流できるようになります。

**提供価値**：
- **プライバシー制御**: ユーザーが自分の評価の公開範囲を管理できる
- **コミュニティ発見**: 他のコーヒー愛好家の評価を閲覧し、新しいカフェや豆を発見できる
- **ユーザー間交流**: 特定ユーザーの評価傾向を知り、好みの近い人を見つけられる
- **マイページの明確化**: 自分の評価と他人の評価を区別して管理できる

## Alignment with Product Vision

この機能は、product.mdの以下の要素と整合します：

1. **Target Users**: 「コミュニティでの共有も可能」というニーズに対応
2. **Planned Features**:
   - ✅ 「プライベート/公開の切り替え」（計画中 → 実装）
   - ✅ 「ソーシャル機能」の基盤（いいね・コメント機能の前提）
3. **Business Objectives**: 「コミュニティの形成: コーヒー愛好家同士が評価を共有し、新しい発見を促進する」
4. **Product Principles**: 「シンプルさ優先」を維持しながら、段階的にソーシャル機能を導入

この機能は、個人記録ツールからコミュニティプラットフォームへの第一歩となります。

## Requirements

### Requirement 1: 評価の公開/非公開設定

**User Story:** As a コーヒー愛好家, I want 自分の評価ごとに公開/非公開を設定できる, so that プライバシーを保ちつつ、共有したい評価だけを公開できる

#### Acceptance Criteria

1. WHEN ユーザーが新しい評価を作成する THEN システムは公開/非公開トグルを表示し、デフォルトは「公開」とする SHALL
2. WHEN ユーザーが既存の評価を編集する THEN システムは現在の公開設定を表示し、変更可能にする SHALL
3. WHEN ユーザーが「非公開」を選択して保存する THEN システムはis_public=falseでデータベースに保存する SHALL
4. IF 評価が非公開に設定されている THEN その評価は他のユーザーから閲覧不可能である SHALL
5. WHEN ユーザーが自分の評価一覧（マイページ）を見る THEN 公開/非公開の状態がバッジまたはアイコンで視覚的に分かる SHALL

### Requirement 2: マイページ（自分の評価一覧）の改善

**User Story:** As a コーヒー愛好家, I want 自分の評価だけを見るページ, so that 自分の記録を管理しやすくなる

#### Acceptance Criteria

1. WHEN ユーザーが /coffee/my にアクセスする THEN システムは現在ログイン中のユーザーの評価のみを表示する SHALL
2. WHEN マイページで評価一覧を表示する THEN 各評価カードに公開/非公開の状態（🌐 公開 or 🔒 非公開）を表示する SHALL
3. WHEN マイページで評価を表示する THEN 公開・非公開両方の評価が含まれる SHALL
4. WHEN マイページで検索・ソート機能を使う THEN 現在の /coffee ページと同じ機能が利用可能である SHALL
5. WHEN ユーザーがナビゲーションメニューを開く THEN「マイページ」リンクが表示される SHALL

### Requirement 3: コミュニティフィード（全ユーザーの公開評価一覧）

**User Story:** As a コーヒー愛好家, I want すべてのユーザーの公開評価を閲覧できる, so that 新しいカフェや豆を発見できる

#### Acceptance Criteria

1. WHEN ユーザーが /coffee/community にアクセスする THEN システムは全ユーザーの公開評価（is_public=true）を新しい順に表示する SHALL
2. WHEN コミュニティフィードで評価を表示する THEN 各評価カードに投稿者のdisplay_nameを表示する SHALL
3. IF 投稿者のdisplay_nameが未設定 THEN「匿名ユーザー」と表示する SHALL
4. WHEN 評価カードの投稿者名をクリックする THEN そのユーザーのプロフィールページ（/users/[userId]）に遷移する SHALL
5. WHEN コミュニティフィードで検索機能を使う THEN 全ユーザーの公開評価を対象に店名・豆の種類で検索できる SHALL
6. WHEN コミュニティフィードでソート機能を使う THEN「新しい順」「評価が高い順」「店名順」でソートできる SHALL
7. WHEN ナビゲーションメニューを開く THEN「コミュニティ」リンクが表示される SHALL
8. IF ログインしていないユーザーがコミュニティフィードにアクセス THEN 公開評価を閲覧可能である SHALL（認証不要）

### Requirement 4: ユーザープロフィールページ & 評価一覧

**User Story:** As a コーヒー愛好家, I want 特定ユーザーのプロフィールと公開評価を見られる, so that 好みが近いユーザーを発見し、その人の評価を参考にできる

#### Acceptance Criteria

1. WHEN ユーザーが /users/[userId] にアクセスする THEN システムはそのユーザーのプロフィール（display_name, bio）を表示する SHALL
2. WHEN ユーザープロフィールページを表示する THEN そのユーザーの公開評価一覧を新しい順に表示する SHALL
3. IF プロフィールページのユーザーが自分自身 THEN「プロフィールを編集」ボタンを表示する SHALL
4. IF プロフィールページのユーザーが他人 THEN 公開評価のみを表示し、非公開評価は含めない SHALL
5. WHEN ユーザープロフィールページで評価を表示する THEN 各評価カードから詳細ページ（/coffee/[id]）に遷移できる SHALL
6. WHEN ユーザープロフィールページで検索・ソート機能を使う THEN そのユーザーの公開評価のみを対象に動作する SHALL
7. IF 存在しないuserIdにアクセス THEN 404エラーページを表示する SHALL
8. IF ユーザーが公開評価を1件も持っていない THEN「まだ公開評価がありません」メッセージを表示する SHALL

### Requirement 5: ナビゲーションの改善

**User Story:** As a コーヒー愛好家, I want 直感的にページ間を移動できる, so that 目的のページに迷わずアクセスできる

#### Acceptance Criteria

1. WHEN ナビゲーションメニューを表示する THEN「マイページ」「コミュニティ」「プロフィール」の3つのリンクが表示される SHALL
2. WHEN 現在のページに対応するナビゲーションリンク THEN アクティブ状態（ハイライト）で表示される SHALL
3. WHEN モバイル表示でハンバーガーメニューを開く THEN すべてのナビゲーションリンクが表示される SHALL
4. WHEN デスクトップ表示 THEN ナビゲーションリンクが横並びで常時表示される SHALL

### Requirement 6: 既存の /coffee ページの扱い

**User Story:** As a コーヒー愛好家, I want /coffee ページが分かりやすい役割を持つ, so that 混乱せずに使える

#### Acceptance Criteria

1. WHEN ユーザーが /coffee にアクセスする THEN /coffee/my（マイページ）にリダイレクトする SHALL
2. IF ログインしていないユーザーが /coffee にアクセス THEN /coffee/community（コミュニティフィード）にリダイレクトする SHALL
3. WHEN リダイレクトが発生する THEN ユーザーに通知せず、シームレスに遷移する SHALL

## Non-Functional Requirements

### Code Architecture and Modularity
- **Container/Presentational Pattern**: 既存パターンに従い、`_containers/`でデータ取得、`_components/`でUI表示を分離
- **Server Components First**: データフェッチングは Server Components で実施（React cache() 使用）
- **Route Organization**:
  - `/coffee/my` - マイページ
  - `/coffee/community` - コミュニティフィード
  - `/users/[userId]` - ユーザープロフィールページ
- **Shared Components**: 既存の`components/ui/`を活用（Button, Card, Input, etc.）
- **Type Safety**: TypeScript strictモードで型安全性を確保
- **API Layer**: `lib/api/coffee.ts`を拡張し、フィルタリングパラメータ（user_id, is_public）を活用
- **Server Actions**: `lib/actions/coffee.ts`を拡張し、is_public フィールドの更新に対応

### Performance
- **Initial Load**: < 3秒（3G接続）
- **Time to Interactive**: < 5秒
- **Database Queries**:
  - 既存インデックス活用（idx_coffee_evaluations_public, idx_coffee_evaluations_user_id）
  - N+1問題回避（user_profiles とのJOINは最適化）
- **Pagination**: 初期実装では不要（将来的に100件超える場合に検討）

### Security
- **Row Level Security (RLS)**: 既存のRLSポリシーを活用
  - 自分の評価は公開/非公開問わず閲覧可能
  - 他人の評価は公開（is_public=true）のみ閲覧可能
- **Authorization**:
  - 非公開評価の直接URL（/coffee/[id]）アクセス時、所有者以外は403エラー
  - プロフィール編集は本人のみ可能（既存のRLSポリシー）
- **Input Validation**: is_publicフィールドはboolean型のみ受け付ける

### Reliability
- **Error Handling**:
  - 存在しないuserIdアクセス時は404ページ
  - データベースエラー時はエラーページ（既存のerror.tsx活用）
- **Fallback UI**:
  - ユーザー名未設定時は「匿名ユーザー」表示
  - 評価0件時は適切なメッセージ表示

### Usability
- **Responsive Design**: 320px〜2560pxのビューポートに対応（既存パターン踏襲）
- **Visual Feedback**:
  - 公開/非公開の状態を視覚的に明示（🌐 公開 or 🔒 非公開バッジ）
  - アクティブなナビゲーションリンクをハイライト
- **Accessibility**:
  - トグルスイッチはキーボード操作可能
  - スクリーンリーダー対応（aria-label追加）
- **Loading States**: 既存のloading.tsxパターンを踏襲
- **Empty States**: データ0件時の適切なメッセージとCTA

### Testing
- **Test Coverage**: 既存のTDDアプローチを踏襲
  - Unit Tests: 新規コンポーネント（PublicToggle, CommunityFeed, UserProfile）
  - Integration Tests: ページ遷移フロー、公開/非公開切り替えフロー
  - API Tests: 新規フィルタリングパラメータのテスト
- **Test Co-location**: テストは実装ファイルと同じディレクトリに配置

### Database Considerations
- **既存テーブル活用**:
  - `coffee_evaluations.is_public` フィールド（既存）
  - `user_profiles` テーブル（既存）
- **既存インデックス活用**:
  - `idx_coffee_evaluations_public` (is_public, created_at DESC)
  - `idx_coffee_evaluations_user_id` (user_id)
  - `idx_coffee_evaluations_user_created` (user_id, created_at DESC)
- **Migration不要**: スキーマ変更なし（既存構造を活用）
