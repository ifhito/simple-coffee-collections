# Requirements Document - Coffee Evaluation

## Introduction

コーヒー評価機能は、ユーザーがカフェで体験したコーヒーを詳細に記録・評価し、他の愛好家と共有できる機能です。酸味、苦味、香り、総合評価などの評価項目をスライダーで直感的に入力でき、店名、豆の種類、焙煎度などのメタデータも記録できます。

**Purpose**:
- コーヒー体験を構造化された形で記録する
- 過去の評価を検索・振り返りができる
- 公開設定でコミュニティと共有できる
- 自分の好みのパターンを発見する

**Value**:
- 記録の一貫性：統一されたフォーマットで評価を蓄積
- 発見可能性：検索・ソート機能で過去の記録を簡単に見つけられる
- コミュニティ：他のユーザーの評価を参考にできる

**Note on UI Design**:
このRequirements文書では機能要件とAcceptance Criteriaを定義します。具体的なUI/UXデザイン（レイアウト、カラースキーム、コンポーネント設計など）は、Design段階で**frontend-design plugin**を使用して作成します。

## Alignment with Product Vision

product.mdで定義されたビジョンとの整合性：

- **Core Purpose**: "コーヒー愛好家がカフェ訪問とコーヒー体験を記録・追跡する" - 評価機能はこのビジョンの中核実装
- **Target Users**: 日本語UIのコーヒー愛好家 - 全UI要素を日本語で提供
- **Key Features**: "Coffee record CRUD operations" - この機能で実現
- **Product Principles**: "シンプルさ優先" - 直感的なスライダーUIと最小限の必須項目

## Requirements

### Requirement 1: Coffee Evaluation Creation

**User Story:** As a コーヒー愛好家, I want カフェで飲んだコーヒーの評価を記録できる, so that 後で自分の体験を振り返ることができる

#### Acceptance Criteria

1. **WHEN** 認証済みユーザーが評価作成ページにアクセスした **THEN** システムは評価フォームを表示する **AND** 全ての入力フィールドが空の状態である

2. **WHEN** ユーザーが必須項目（店名、豆の種類、評価）を入力して送信した **THEN** システムは新しい評価をデータベースに保存する **AND** 評価一覧ページにリダイレクトする

3. **IF** ユーザーが必須項目を入力せずに送信した **THEN** システムはエラーメッセージを表示する **AND** フォームの状態を保持する

4. **WHEN** ユーザーがスライダーで評価値を設定した **THEN** システムは1-10の範囲内の整数値として保存する

5. **WHEN** ユーザーが店名を入力した **THEN** システムは既存の店名候補を表示する **AND** ユーザーは新しい店名を追加できる

### Requirement 2: Coffee Evaluation Display (List View)

**User Story:** As a コーヒー愛好家, I want 自分が記録した評価をカード形式で一覧表示できる, so that 過去の評価を素早く確認できる

#### Acceptance Criteria

1. **WHEN** 認証済みユーザーが評価一覧ページにアクセスした **THEN** システムは自分の評価をカード形式で表示する **AND** 最新のものから順に並べる

2. **WHEN** 評価が0件の場合 **THEN** システムは「まだ評価がありません」メッセージを表示する **AND** 新規作成へのリンクを提供する

3. **WHEN** ユーザーが評価カードをクリックした **THEN** システムは評価詳細ページに遷移する

4. **IF** デバイスの画面幅が異なる **THEN** システムはレスポンシブに表示を調整する:
   - モバイル: 1カラム
   - タブレット: 2カラム
   - デスクトップ: 3カラム

5. **WHEN** 評価カードを表示する **THEN** 各カードには以下が含まれる:
   - コーヒー名（`bean_name`）- 必須（レガシーデータのために`bean_type`をフォールバック）
   - 店名
   - 総合評価（視覚的表示）
   - 記録日時

### Requirement 3: Coffee Evaluation Display (Detail View)

**User Story:** As a コーヒー愛好家, I want 評価の詳細情報を確認できる, so that 記録した全ての情報を見ることができる

#### Acceptance Criteria

1. **WHEN** ユーザーが評価詳細ページにアクセスした **THEN** システムは以下の全情報を表示する:
   - コーヒー名（`bean_name`）- 必須
   - 店名
   - 産地（`bean_type`）
   - 焙煎度
   - 酸味（1-10スライダー値の視覚化）
   - 苦味（1-10スライダー値の視覚化）
   - 香り（1-10スライダー値の視覚化）
   - 総合評価（1-10スライダー値の視覚化）
   - 記録日時
   - 更新日時（該当する場合）

2. **IF** ユーザーが評価の所有者である **THEN** システムは編集・削除ボタンを表示する

3. **IF** 評価が公開設定である **THEN** 他のユーザーもこの詳細ページを閲覧できる

### Requirement 4: Coffee Evaluation Edit

**User Story:** As a コーヒー愛好家, I want 過去に記録した評価を編集できる, so that 情報を更新・修正できる

#### Acceptance Criteria

1. **WHEN** ユーザーが自分の評価の編集ボタンをクリックした **THEN** システムは編集フォームを表示する **AND** 既存の値が入力済みの状態である

2. **WHEN** ユーザーが編集内容を保存した **THEN** システムはデータベースを更新する **AND** 詳細ページにリダイレクトする **AND** updated_atタイムスタンプを更新する

3. **IF** ユーザーが他人の評価を編集しようとした **THEN** システムは403エラーを返す

4. **WHEN** ユーザーが編集をキャンセルした **THEN** システムは変更を破棄して詳細ページに戻る

### Requirement 5: Coffee Evaluation Delete

**User Story:** As a コーヒー愛好家, I want 不要になった評価を削除できる, so that 記録を整理できる

#### Acceptance Criteria

1. **WHEN** ユーザーが自分の評価の削除ボタンをクリックした **THEN** システムは確認ダイアログを表示する

2. **WHEN** ユーザーが削除を確認した **THEN** システムはデータベースから評価を削除する **AND** 評価一覧ページにリダイレクトする

3. **IF** ユーザーが他人の評価を削除しようとした **THEN** システムは403エラーを返す

4. **WHEN** ユーザーが削除をキャンセルした **THEN** システムは何も変更せず詳細ページに戻る

### Requirement 6: Search Functionality

**User Story:** As a コーヒー愛好家, I want 店名、コーヒー名、焙煎度で評価を検索できる, so that 特定の情報を素早く見つけられる

#### Acceptance Criteria

1. **WHEN** ユーザーが検索フォームにキーワードを入力した **THEN** システムは店名、コーヒー名（`bean_name`）、産地（`bean_type`）、焙煎度フィールドを部分一致で検索する

2. **WHEN** 検索結果が見つかった **THEN** システムはマッチした評価のみを表示する

3. **WHEN** 検索結果が0件の場合 **THEN** システムは「検索結果が見つかりませんでした」メッセージを表示する

4. **WHEN** ユーザーが検索をクリアした **THEN** システムは全ての評価を再表示する

5. **WHEN** ユーザーが検索中に入力を変更した **THEN** システムはリアルタイムまたはボタンクリックで結果を更新する

### Requirement 7: Sort Functionality

**User Story:** As a コーヒー愛好家, I want 評価を並び替えられる, so that 特定の順序で情報を見られる

#### Acceptance Criteria

1. **WHEN** ユーザーがソート条件を選択した **THEN** システムは評価リストを指定された順序で並び替える

2. **WHEN** 利用可能なソート条件は:
   - 記録日時（新しい順）- デフォルト
   - 記録日時（古い順）
   - 総合評価（高い順）
   - 総合評価（低い順）
   - 店名（五十音順）

3. **IF** 検索結果が表示中である **THEN** ソート機能は検索結果にのみ適用される

### Requirement 8: Public Sharing (Initial: Public Only)

**User Story:** As a コーヒー愛好家, I want 評価を他のユーザーと共有できる, so that コミュニティでコーヒー情報を交換できる

#### Acceptance Criteria

1. **WHEN** ユーザーが新しい評価を作成した **THEN** システムはデフォルトで公開設定にする

2. **WHEN** 公開された評価は **THEN** 他の認証済みユーザーも閲覧できる

3. **IF** 将来的にプライベート機能を追加する際 **THEN** 既存の評価は公開のままとする（後方互換性）

### Requirement 9: User Profile Management

**User Story:** As a コーヒー愛好家, I want 自分のプロフィール（名前、自己紹介）を設定できる, so that 他のユーザーに自己紹介できる

#### Acceptance Criteria

1. **WHEN** ユーザーがプロフィールページにアクセスした **THEN** システムは編集可能なフォームを表示する

2. **WHEN** ユーザーがプロフィールを更新した **THEN** システムはデータベースに保存する **AND** 成功メッセージを表示する

3. **IF** プロフィール情報が未設定である **THEN** システムはメールアドレスの一部をデフォルト表示名として使用する

4. **WHEN** ユーザーのプロフィールは以下を含む:
   - 名前（表示名）
   - 自己紹介（テキストエリア、任意）

## Non-Functional Requirements

### Code Architecture and Modularity

**Following Next.js Best Practices (structure.md)**:
- **Server Components First**: データフェッチングはServer Componentsで実行
- **Container/Presentational Pattern**: `_containers/`でデータ取得、`_components/`で表示
- **Request Memoization**: `lib/api/`層で`cache()`使用
- **Single Responsibility**: 各ファイルは単一の明確な目的を持つ
- **Modular Design**: コンポーネント、ユーティリティ、サービスを分離
- **Clear Interfaces**: TypeScript型定義で契約を明示

### Performance

- **初期ロード**: 3G接続で3秒以内
- **Time to Interactive**: 5秒以内
- **Server Response**: APIコールは500ms以内
- **検索・ソート**: レスポンスは200ms以内（クライアント側処理の場合）
- **データベースクエリ**: 単純な読み取りは100ms以内
- **Request Memoization**: 同一レンダリングサイクル内で重複リクエストを排除

### Security

- **認証**: Supabase Authによるセキュアな認証
- **認可**: Row Level Security (RLS)でユーザー別データ分離
- **CRUD権限**: ユーザーは自分の評価のみ編集・削除可能
- **入力検証**: クライアント側とサーバー側の両方でバリデーション
- **XSS防止**: Reactの自動エスケープを活用
- **CSRF保護**: Server Actionsの自動保護を活用

### Reliability

- **エラーハンドリング**: 全てのServer ActionsとAPI呼び出しでエラー処理
- **Error Boundaries**: ページレベルでエラー境界を設定
- **Loading States**: Suspenseとloading.tsxでローディング状態を表示
- **データ整合性**: PostgreSQL制約でデータ品質を保証

### Usability

- **レスポンシブデザイン**: 320px〜2560pxの全ビューポートに対応
- **直感的UI**: スライダーで視覚的に評価を入力
- **日本語UI**: 全てのラベル、メッセージ、エラーを日本語で表示
  - 産地（`bean_type`）が`'Unknown'`の場合は「産地不明」と表示
- **アクセシビリティ**: セマンティックHTML、適切なaria属性、キーボード操作対応
- **Progressive Enhancement**: JavaScriptなしでもフォーム送信可能（Server Actions）
- **UI/UXデザイン**: Design段階でfrontend-design pluginを使用して、production-gradeで高品質なUIを設計

### Scalability

- **データベース**: Supabaseのconnection poolingとインデックス最適化
- **Serverless**: Vercelの自動スケーリングを活用
- **キャッシング**: Next.jsの静的生成とISRを適切に活用
- **クエリ最適化**: N+1問題の回避（DataLoaderパターン適用時）
