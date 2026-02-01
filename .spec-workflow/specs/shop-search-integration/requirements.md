# Requirements Document: Shop Search Integration

## Introduction

コーヒー評価フォームに店舗検索機能を追加し、ユーザーが既存の店舗を簡単に選択したり、新しい店舗情報（名前、住所、位置情報）を取得・保存できるようにします。この機能により、ユーザーはカフェ訪問の記録をより正確かつ効率的に行えるようになり、位置情報を活用した将来的な機能拡張（地図表示、近隣カフェ検索など）の基盤となります。

**技術的アプローチ**: OpenStreetMap Nominatim APIを使用しますが、Nominatimの利用規約により**クライアントサイドでのオートコンプリートは禁止されています**。そのため、サーバーサイドでの検索実装とデバウンス機能による慎重なレート制限管理（1リクエスト/秒以下）を行います。

## Alignment with Product Vision

この機能は以下のproduct.mdの目標と整合しています：

1. **シンプルさ優先**: 店舗情報の入力を自動化し、ユーザーがコーヒー評価に集中できるようにする
2. **データ品質の向上**: 住所や位置情報の正確な記録により、Success Metricsの「詳細な評価の割合」を向上
3. **将来の機能拡張の基盤**:
   - 計画中の「統計とインサイト」機能で店舗別の評価分析が可能に
   - 将来的な地図表示、近隣カフェ検索機能への布石
4. **レスポンシブデザイン**: モバイルでも快適に店舗検索できるUX

## Requirements

### Requirement 1: Server-Side Shop Search with Debouncing

**User Story:** コーヒー愛好家として、評価フォームで店舗名を入力する際に、既存の店舗候補やNominatim APIからの検索結果を確認できるようにしたい。これにより、手入力のタイプミスを防ぎ、正確な店舗情報を記録できる。

#### Acceptance Criteria

1. WHEN ユーザーが評価フォームの店舗名入力欄に3文字以上入力する THEN システムは300ms後にサーバーサイド検索をトリガーする SHALL
2. WHEN サーバーが検索リクエストを受け取る THEN システムは以下の順序で検索する SHALL:
   - まず既存のcoffee_evaluationsテーブルから一致する店舗名を検索
   - 既存データが3件未満の場合、Nominatim API（countrycodes=jp, amenity=cafe,restaurant）を呼び出して補完
3. WHEN Nominatim APIを呼び出す THEN システムは1リクエスト/秒のレート制限を遵守する SHALL
4. WHEN 検索結果が取得できる THEN システムは最大5件の候補をドロップダウンで表示する SHALL
5. WHEN ユーザーが候補を選択する THEN システムは店舗名、住所、緯度経度を自動入力する SHALL
6. IF APIエラーが発生する THEN システムはユーザーに手入力を促し、エラーログを記録する SHALL

### Requirement 2: Shop Information Storage Schema

**User Story:** コーヒー愛好家として、選択した店舗の住所や位置情報が自動的に保存されるようにしたい。これにより、後から訪問した店舗の正確な場所を振り返ることができる。

#### Acceptance Criteria

1. WHEN ユーザーがNominatimから店舗を選択する THEN システムは以下のデータをcoffee_evaluationsテーブルに保存する SHALL:
   - shop_name (既存フィールド)
   - shop_address (新規フィールド: TEXT型, nullable)
   - shop_latitude (新規フィールド: NUMERIC型, nullable)
   - shop_longitude (新規フィールド: NUMERIC型, nullable)
2. WHEN ユーザーが手入力で店舗名のみ入力する THEN システムは住所・位置情報をNULLで保存する SHALL（後方互換性維持）
3. WHEN データベースマイグレーションを実行する THEN システムは既存データに影響を与えず新規カラムを追加する SHALL

### Requirement 3: Form UX Enhancement

**User Story:** コーヒー愛好家として、モバイルデバイスでも快適に店舗検索できるようにしたい。検索中の状態が明確で、結果が見やすいUIを期待する。

#### Acceptance Criteria

1. WHEN ユーザーが検索中（デバウンス待機中） THEN システムは視覚的なローディングインジケーターを表示する SHALL
2. WHEN 検索候補が表示される THEN システムは店舗名、住所、距離（将来対応）を含むカード形式で表示する SHALL
3. WHEN モバイルデバイスで表示する THEN システムはタッチ操作に最適化されたドロップダウンサイズ（最小44px高）を確保する SHALL
4. WHEN キーボード操作で候補を選択する THEN システムは矢印キー（↑↓）とEnterキーでの操作をサポートする SHALL（アクセシビリティ）
5. IF 検索結果が0件の場合 THEN システムは「手入力で追加できます」というガイダンスメッセージを表示する SHALL

### Requirement 4: API Integration with Error Handling

**User Story:** 開発者として、Nominatim APIの利用規約を遵守し、適切なエラーハンドリングとログ記録を実装したい。これにより、サービスの安定性とOSMコミュニティへの配慮を両立できる。

#### Acceptance Criteria

1. WHEN Nominatim APIにリクエストする THEN システムは以下のヘッダーを含める SHALL:
   - User-Agent: "SimpleCoffeeCollections/1.0 (contact@example.com)" (アプリ識別)
   - Referer: アプリケーションのURL
2. WHEN APIレスポンスを受け取る THEN システムはOSMアトリビューション要件に従い、将来の地図表示時にクレジット表記を準備する SHALL
3. IF APIがレート制限エラー（429）を返す THEN システムは即座に既存DB結果のみ返却し、リトライは行わない SHALL（レスポンス遅延最小化のため）
4. IF APIが503エラーを返す THEN システムは既存データのみで検索を継続し、ユーザーに通知せず手入力をサポートする SHALL
5. WHEN APIエラーが発生する THEN システムはエラー内容、タイムスタンプ、ユーザーIDをログに記録する SHALL

### Requirement 5: Ubiquitous Language Compliance

**User Story:** 開発チームとして、プロジェクトのユビキタス言語に従い、一貫した用語を使用したい。これにより、コードの可読性と保守性を向上できる。

#### Acceptance Criteria

1. WHEN コード内で店舗検索機能を実装する THEN システムは以下の用語を使用する SHALL:
   - UI表示: "店舗" (shop)、"検索" (search)、"候補" (suggestions)
   - ドメインモデル（値オブジェクト）: ShopSearchResult, ShopLocation
   - データベース: shop_name, shop_address, shop_latitude, shop_longitude
2. WHEN ドメインモデルを定義する THEN システムはlib/domain/entities/またはlib/domain/value-objects/に配置する SHALL（Clean Architecture準拠）

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**:
  - Shop search logic (lib/domain/services/shop-search-service.ts)
  - Nominatim API client (lib/infrastructure/nominatim-client.ts)
  - Rate limiter (lib/infrastructure/rate-limiter.ts)
  - Server Action for search (lib/actions/shop-search.ts)

- **Modular Design**:
  - Nominatim clientは他のジオコーディングAPIに差し替え可能なインターフェース設計
  - Rate limiterは汎用的な実装（Redis対応も視野）

- **Dependency Management**:
  - Clean Architecture層を遵守: Domain → Application → Infrastructure → Presentation
  - Nominatim依存はInfrastructure層に隔離
  - **Design Phase要件**: sudoモデリング手法を使用し、以下を作成する:
    - Object図（具体的なユースケースの可視化）
    - Usecase図（ユースケースの抽出と整理）
    - Domain図（ドメインモデルの設計）
    - Overview図（システム全体像の把握）

- **Clear Interfaces**:
  - IShopSearchService (domain interface)
  - INominatimClient (infrastructure interface)
  - ShopSearchResult (value object)

### Performance

- **Search Response Time**: サーバーサイド検索は500ms以内に結果を返す（Nominatim API除く）
- **Debounce Timing**: 300msのデバウンス（モバイルタイピング速度に最適化）
- **Rate Limiting**: Nominatim APIへのリクエストは厳密に1リクエスト/秒以下
- **Database Query**: 既存店舗検索はインデックス活用で100ms以内
- **Request Memoization**: React cache()でリクエスト単位の重複排除（同一レンダリングサイクル内）

### Security

- **API Key Protection**: Nominatim APIはキー不要だが、将来の有料API対応のため環境変数管理の準備
- **Input Validation**:
  - 検索クエリの最大長: 100文字
  - SQLインジェクション対策: Supabaseパラメータクエリ使用
  - XSS対策: Next.jsの自動エスケープに依存
- **Rate Limiting**: IP単位でのレート制限（将来の不正利用防止）
- **Data Privacy**: 位置情報はRow Level Security（RLS）で保護

### Reliability

- **API Fallback**: Nominatim障害時も既存データ検索は継続
- **Graceful Degradation**: 検索機能が使えない場合でも手入力は常に可能
- **Error Recovery**: APIエラー時はリトライなし、即座に既存DB結果のみ返却（UX優先）
- **Rate Limiter Resilience**: RateLimiterの事前チェックにより429エラーは稀
- **Database Migration Safety**: ALTER TABLE ADDでのゼロダウンタイム移行

### Usability

- **Response Time Feedback**:
  - 検索トリガーまで300ms（デバウンス）
  - ローディング表示で待機時間を明示
- **Mobile Optimization**:
  - タッチターゲットサイズ: 最小44x44px
  - ドロップダウンの最大高さ: ビューポートの50%
- **Accessibility**:
  - ARIA labels for screen readers
  - キーボードナビゲーション（↑↓Enter）
  - フォーカス管理（検索候補選択後は次のフィールドへ）
- **Error Messages**:
  - 日本語のユーザーフレンドリーなメッセージ
  - 「検索できませんでした。手入力で店舗名を入力してください」

### Testing Requirements (TDD Mandatory)

- **Test Coverage**: 80%以上のカバレッジを維持
- **Unit Tests**:
  - Nominatim client（モックAPI）
  - Rate limiter（時間制御モック）
  - Shop search service（境界値テスト）
  - Server Actions（成功/失敗パターン）
- **Integration Tests**:
  - Database migration（既存データ保持確認）
  - E2E search flow（入力→検索→選択→保存）
- **E2E Tests (Playwright)**:
  - 店舗検索から評価作成までのクリティカルパス
  - モバイルビューポートでのタッチ操作

## Technical Constraints

### Nominatim API Constraints

- **Prohibited**: クライアントサイドでのオートコンプリート実装（利用規約違反）
- **Rate Limit**: 絶対最大1リクエスト/秒（寄付サーバーへの配慮）
- **Required Headers**: User-Agent, Refererの設定必須
- **Attribution**: 将来の地図表示時にOpenStreetMapクレジット表記が必要
- **Result Limit**: 最大40件（実際は5件に制限）

### Technology Stack Compliance

- **Next.js 15**: Server Actionsでのサーバーサイド検索実装
- **TypeScript**: 厳密な型定義（Nominatim APIレスポンス型）
- **Supabase**: PostgreSQL NUMERIC型での緯度経度保存
- **TDD**: テストファースト開発（Red-Green-Refactor）

## Success Criteria

この機能は以下の基準を満たした場合に成功とみなされます：

1. ✅ ユーザーが店舗名を3文字入力すると、300ms後に検索候補が表示される
2. ✅ 検索候補には既存データとNominatim APIの結果が統合されて表示される（最大5件）
3. ✅ 候補選択後、住所と位置情報が自動的にフォームに入力され、評価保存時にDBに記録される
4. ✅ Nominatim APIのレート制限（1リクエスト/秒）を一度も違反しない
5. ✅ 既存の手入力フローは完全に維持される（後方互換性）
6. ✅ テストカバレッジが80%以上を維持
7. ✅ E2Eテストでモバイル・デスクトップ両方のクリティカルパスが通る

## Out of Scope (今回対象外)

以下の機能は今回のスコープに**含まれません**（将来の拡張として検討）：

- 地図上での店舗表示機能
- 現在地からの距離計算・ソート
- 店舗の詳細情報（営業時間、電話番号など）
- 店舗のお気に入り登録機能
- 他のユーザーが登録した店舗の統計表示
- Google Places APIなど他のジオコーディングサービスの統合

## References

- [Nominatim Search API Documentation](https://nominatim.org/release-docs/latest/api/Search/)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [React Autocomplete Debounce Best Practices](https://www.freecodecamp.org/news/deboucing-in-react-autocomplete-example/)
- [Implementing Debounced Search in Next.js](https://medium.com/@madhurajayashanka/implementing-debounced-search-in-next-js-a-step-by-step-guide-550d004b497d)
