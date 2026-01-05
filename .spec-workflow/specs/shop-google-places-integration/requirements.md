# Requirements Document

## Introduction

Google Places API統合機能は、コーヒー評価記録時の店舗情報入力を大幅に改善します。現在は手動でテキスト入力している店名を、Google Places Autocompleteを使って候補から選択できるようにします。これにより、正確な店舗情報（名前、住所、地図URL）を簡単に記録でき、後で詳細画面から店舗の場所を地図で確認できるようになります。

**主な価値**：
- **入力の簡便性**: 数文字入力するだけで店舗候補が表示され、選択するだけで正確な情報が入力される
- **データの正確性**: Google Placesから取得した公式情報で、店名の表記ゆれや誤字を防ぐ
- **場所の記録**: 地図URLを保存することで、後で店舗の場所を簡単に確認できる
- **コスト効率**: 個人利用なら月額無料枠（$200クレジット）内で十分利用可能

## Alignment with Product Vision

この機能は、product.mdで定義された以下の目標と整合しています：

1. **シンプルさ優先**:
   - オートコンプリートにより、店舗情報の入力がより簡単かつ迅速になる
   - 既存の手動入力フローも維持し、ユーザーの選択肢を保つ

2. **データ品質の向上**:
   - 正確な店舗情報（公式名称、住所）を記録できる
   - 将来的な統計機能（店舗別の評価分析など）の基盤となる

3. **ユーザーエンゲージメント向上**:
   - 入力の手間を減らすことで、評価記録のモチベーションを維持
   - 地図URLにより、過去の訪問場所を振り返る楽しさを提供

4. **コミュニティの形成**:
   - 共通の店舗名表記により、他のユーザーの評価を発見しやすくなる
   - 将来的な「この店の評価一覧」機能の基盤

## Requirements

### Requirement 1: Google Places Autocomplete機能

**User Story:** コーヒー愛好家として、評価記録時に店名を入力する際、Google Places Autocompleteの候補から選択できるようにしたい。そうすることで、正確な店舗情報を素早く入力できる。

#### Acceptance Criteria

1. WHEN ユーザーが評価フォームの店名フィールドに2文字以上入力する THEN システムは Google Places Autocomplete APIを呼び出し、カフェ・コーヒーショップの候補リストを表示する SHALL
2. WHEN Autocomplete候補リストが表示される THEN 各候補には店舗名と住所が表示される SHALL
3. WHEN ユーザーが候補から1つを選択する THEN システムは Place Details APIを呼び出し、詳細情報（Place ID、正式名称、住所、緯度経度）を取得する SHALL
4. WHEN Place Details APIのレスポンスを受け取る THEN システムは店名フィールドに正式名称を自動入力し、地図URL（Google Maps URL）を生成して保存する SHALL
5. IF ユーザーが候補を選ばずに手動で店名を入力する THEN システムは手動入力を受け入れ、地図URLは空のままとする SHALL
6. WHEN Autocomplete APIがエラーを返す THEN システムはエラーをログに記録し、手動入力にフォールバックする SHALL

### Requirement 2: 地図URL保存機能

**User Story:** コーヒー愛好家として、評価記録に店舗の地図URLを保存したい。そうすることで、後で詳細画面から簡単に店舗の場所を確認できる。

#### Acceptance Criteria

1. WHEN ユーザーがGoogle Places候補から店舗を選択する THEN システムは Google Maps URLを自動生成し、データベースに保存する SHALL
2. WHEN Google Maps URLが生成される THEN URLは `https://www.google.com/maps/place/?q=place_id:{PLACE_ID}` の形式である SHALL
3. IF ユーザーが手動で店名を入力し、候補を選択しない THEN 地図URLフィールドは NULL として保存される SHALL
4. WHEN 評価データを更新する THEN 地図URLも更新可能である SHALL

### Requirement 3: 詳細画面での地図リンク表示

**User Story:** コーヒー愛好家として、評価詳細画面で店舗の地図リンクをクリックしたい。そうすることで、店舗の場所を地図で確認し、再訪問や新しい発見につなげることができる。

#### Acceptance Criteria

1. WHEN ユーザーが評価詳細画面を表示する AND 評価に地図URLが保存されている THEN システムは店名の横に地図アイコンボタンを表示する SHALL
2. WHEN ユーザーが地図アイコンボタンをクリックする THEN システムは新しいタブでGoogle Mapsを開き、該当店舗の場所を表示する SHALL
3. IF 評価に地図URLが保存されていない THEN 地図アイコンボタンは表示されない SHALL
4. WHEN 地図リンクが表示される THEN アクセシビリティのため、適切なaria-labelが設定される SHALL

### Requirement 4: データベーススキーマ拡張

**User Story:** 開発者として、Google Places情報を効率的に保存するため、データベーススキーマを拡張したい。そうすることで、将来的な機能拡張（店舗別統計など）の基盤を作ることができる。

#### Acceptance Criteria

1. WHEN データベースマイグレーションを実行する THEN `coffee_evaluations`テーブルに以下の列が追加される SHALL:
   - `google_place_id TEXT` (Google Place ID、NULL許可)
   - `shop_address TEXT` (店舗住所、NULL許可)
   - `shop_map_url TEXT` (Google Maps URL、NULL許可)
   - `shop_location POINT` (緯度経度、NULL許可、将来的な距離検索用)
2. WHEN 既存の評価データが存在する THEN マイグレーションは既存データを保持し、新しい列は NULL として追加される SHALL
3. WHEN 新しい列にインデックスを作成する THEN `google_place_id` にインデックスが作成され、同じ店舗の評価を効率的に検索できる SHALL

### Requirement 5: API統合のセキュリティとコスト最適化

**User Story:** 開発者として、Google Places APIを安全かつコスト効率よく使用したい。そうすることで、個人利用範囲で無料枠内に収め、APIキーの不正使用を防ぐことができる。

#### Acceptance Criteria

1. WHEN Google Places APIを呼び出す THEN 呼び出しはNext.js API Route（サーバー側）で実行され、APIキーがクライアントに露出しない SHALL
2. WHEN APIキーを設定する THEN 環境変数（`.env.local`）に保存され、Gitにコミットされない SHALL
3. WHEN Autocomplete APIを複数回呼び出す THEN セッショントークンを使用し、1セッションとしてカウントすることでコストを削減する SHALL
4. WHEN API呼び出しが失敗する THEN エラーをログに記録し、ユーザーに適切なエラーメッセージを表示する SHALL
5. WHEN Field Maskを指定する THEN 必要最小限のフィールドのみをリクエストし、コストを最適化する SHALL

### Requirement 6: 既存フォームとの統合

**User Story:** コーヒー愛好家として、既存の評価フォームにシームレスに統合されたオートコンプリート機能を使いたい。そうすることで、使い慣れたUIで新機能を利用できる。

#### Acceptance Criteria

1. WHEN 評価フォーム（新規作成・編集）を開く THEN 店名入力フィールドがオートコンプリート対応になる SHALL
2. WHEN 既存の評価を編集する AND 地図URLが保存されている THEN フォームに地図URLプレビューが表示される SHALL
3. WHEN ユーザーがオートコンプリートを使わずに手動入力する THEN 既存の手動入力フローが正常に動作する SHALL
4. WHEN フォームバリデーションを実行する THEN 店名は引き続き必須ではない（任意フィールド）SHALL

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**:
  - Google Places API呼び出しは専用のAPI Route（`/api/places/autocomplete`, `/api/places/details`）に分離
  - オートコンプリートUIコンポーネントは再利用可能な`ShopAutocomplete`として実装

- **Modular Design**:
  - Google Places関連のロジックは`lib/services/google-places.ts`に集約
  - コンポーネントは`components/features/shop-autocomplete/`に配置

- **Dependency Management**:
  - 既存の評価フォームコンポーネントへの変更を最小限に抑える
  - Google Places機能は独立したモジュールとして実装し、将来的な削除・置き換えを容易にする

- **Clear Interfaces**:
  - API Routeは明確なリクエスト/レスポンス型を定義
  - コンポーネントはpropsとして`onSelect(shopData: ShopData) => void`を受け取る

### Performance

- **Autocomplete応答時間**: ユーザーが入力してから候補表示まで300ms以内（Google Places API自体の応答時間 + ネットワーク）
- **Debounce**: ユーザー入力に対して300msのdebounceを適用し、不要なAPI呼び出しを削減
- **キャッシュ**: 同じ検索クエリに対する結果をクライアント側で5分間キャッシュ（オプション）
- **初回ロード時の影響**: オートコンプリートコンポーネントは遅延読み込み（lazy load）せず、フォームと同時に読み込む（UX優先）

### Security

- **APIキー保護**:
  - Google Places APIキーは環境変数（`GOOGLE_PLACES_API_KEY`）に保存
  - Next.js API Routeでのみ使用し、クライアントには露出しない
  - `.env.local`は`.gitignore`に含める

- **API制限設定**（Google Cloud Console）:
  - HTTPリファラー制限: 本番ドメインのみ許可
  - API制限: Places API（New）のみ許可
  - クォータ制限: 1日あたり500リクエスト（無料枠内）

- **入力検証**:
  - ユーザー入力（検索クエリ）はサーバー側でサニタイズ
  - Place IDの形式を検証（Google Places ID形式: `ChIJ...`）

### Reliability

- **エラーハンドリング**:
  - Google Places APIがダウンした場合、手動入力にフォールバック
  - API呼び出し失敗時、ユーザーに「候補を取得できませんでした。手動で入力してください。」と表示

- **フォールバック機能**:
  - オートコンプリートが動作しない場合でも、既存の手動入力は常に利用可能

- **データ整合性**:
  - 地図URLがNULLでも評価データは正常に保存・表示される
  - 既存の評価データ（地図URLなし）も正常に動作

### Usability

- **レスポンシブデザイン**:
  - オートコンプリート候補リストはモバイル（320px〜）でも操作しやすいサイズ
  - 候補リストはキーボード操作（矢印キー、Enter）に対応

- **アクセシビリティ**:
  - オートコンプリート候補リストは適切なARIA属性（`role="listbox"`, `aria-selected`）を持つ
  - スクリーンリーダーで候補数が読み上げられる

- **ユーザーフィードバック**:
  - 検索中は「検索中...」のローディング表示
  - 候補が0件の場合は「候補が見つかりませんでした」と表示

- **日本語対応**:
  - Google Places APIリクエストに`language=ja`を指定し、日本語の店舗情報を取得
  - 候補リストも日本語で表示
