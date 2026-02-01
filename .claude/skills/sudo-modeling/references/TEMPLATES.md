# sudo-modeling テンプレート集

## 1. Object Diagram テンプレート

具体的なインスタンスを表現するためのテンプレート。

```mermaid
classDiagram
    %% インスタンス名は小文字で始め、IDを含める
    class instanceName_001 {
        id = "具体的なID"
        属性1 = "具体的な値"
        属性2 = 123
        属性3 = true
        createdAt = "2024-01-15T10:30:00Z"
    }

    class relatedInstance_002 {
        id = "関連ID"
        name = "関連オブジェクト名"
    }

    instanceName_001 --> relatedInstance_002 : 関連名
```

### コーヒー評価の例

```mermaid
classDiagram
    class eval_ethiopian_morning {
        id = "eval-abc123"
        userId = "user-tanaka"
        beanName = "エチオピア イルガチェフェ G1"
        beanType = "エチオピア"
        roastLevel = "ミディアムロースト"
        shopName = "BLUE BOTTLE COFFEE 清澄白河"
        acidity = 8
        bitterness = 3
        aroma = 9
        overallRating = 9
        isPublic = true
        createdAt = "2024-01-15T09:30:00Z"
        notes = "朝の一杯、フルーティーな酸味が最高"
    }

    class user_tanaka {
        id = "user-tanaka"
        displayName = "田中太郎"
        email = "tanaka@example.com"
    }

    eval_ethiopian_morning --> user_tanaka : 評価者
```

---

## 2. Domain Model Diagram テンプレート

クラス、値オブジェクト、集約を表現するためのテンプレート。

```mermaid
classDiagram
    %% ステレオタイプを使用して種類を明示
    class AggregateRootName {
        <<Aggregate Root>>
        +id: EntityId
        +属性: 型
        +メソッド(): 戻り値型
    }

    class ValueObjectName {
        <<Value Object>>
        +属性: 型 [制約]
        +equals(other): boolean
    }

    class EntityName {
        <<Entity>>
        +id: EntityId
        +属性: 型
    }

    %% 集約内の関連は実線（所有）
    AggregateRootName *-- ValueObjectName

    %% 集約外への参照は点線（参照のみ）
    AggregateRootName ..> ExternalEntityId : references
```

### コーヒー評価ドメインモデルの例

```mermaid
classDiagram
    class CoffeeEvaluation {
        <<Aggregate Root>>
        +id: CoffeeEvaluationId
        +userId: string
        +beanInfo: BeanInfo
        +shopInfo: ShopInfo
        +ratings: EvaluationRatings
        +visibility: Visibility
        +createdAt: Date
        +updatedAt: Date
        --
        +create(input): Result~CoffeeEvaluation, string~
        +update(input): Result~CoffeeEvaluation, string~
        +isOwnedBy(userId): boolean
        +isViewableBy(userId): boolean
        +toggleVisibility(): CoffeeEvaluation
    }

    class BeanInfo {
        <<Value Object>>
        +beanName: string [required, max255]
        +beanType: string [max255]
        +roastLevel: string|null [max100]
        --
        +create(input): Result~BeanInfo, string~
        +toDisplayString(): string
    }

    class ShopInfo {
        <<Value Object>>
        +shopName: string [max255]
        --
        +create(name): Result~ShopInfo, string~
        +hasShopName(): boolean
    }

    class Rating {
        <<Value Object>>
        +value: RatingValue [1-10]
        --
        +create(value): Result~Rating, string~
        +isHigh(): boolean
        +isLow(): boolean
    }

    class EvaluationRatings {
        <<Value Object>>
        +acidity: Rating
        +bitterness: Rating
        +aroma: Rating
        +overallRating: Rating
    }

    class Visibility {
        <<Value Object>>
        +isPublic: boolean
        --
        +public(): Visibility
        +private(): Visibility
        +toggle(): Visibility
    }

    CoffeeEvaluation *-- BeanInfo
    CoffeeEvaluation *-- ShopInfo
    CoffeeEvaluation *-- EvaluationRatings
    CoffeeEvaluation *-- Visibility
    EvaluationRatings *-- "4" Rating
```

---

## 3. Use Case Diagram テンプレート

アクターとユースケースの関係を表現するためのテンプレート。

```mermaid
flowchart LR
    subgraph Actors
        Actor1((アクター1))
        Actor2((アクター2))
    end

    subgraph "Bounded Context Name"
        UC1[ユースケース1]
        UC2[ユースケース2]
        UC3[ユースケース3]
    end

    Actor1 --> UC1
    Actor1 --> UC2
    Actor2 --> UC2
    Actor2 --> UC3
```

### コーヒー評価ユースケースの例

```mermaid
flowchart LR
    subgraph Actors
        User((認証済みユーザー))
        Guest((ゲスト))
    end

    subgraph "Coffee Evaluation Context"
        direction TB

        subgraph Commands[コマンド系]
            UC1[コーヒー評価を記録する]
            UC2[評価を編集する]
            UC3[評価を削除する]
            UC4[公開設定を変更する]
        end

        subgraph Queries[クエリ系]
            UC5[自分の評価一覧を見る]
            UC6[評価詳細を見る]
            UC7[公開評価を検索する]
        end
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Guest --> UC6
    Guest --> UC7
```

---

## 4. System Context Diagram テンプレート

システム境界と外部システムとの関係を表現するためのテンプレート。

```mermaid
flowchart TB
    subgraph External[外部システム]
        Ext1[外部サービス1]
        Ext2[(外部DB)]
    end

    subgraph System[対象システム]
        direction TB
        Layer1[レイヤー1]
        Layer2[レイヤー2]
        Layer3[レイヤー3]
    end

    Actor((ユーザー)) --> Layer1
    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Ext1
    Layer3 --> Ext2
```

### コーヒー日記システムコンテキストの例

```mermaid
flowchart TB
    subgraph External[外部サービス]
        Auth[Supabase Auth<br>認証・認可]
        DB[(Supabase PostgreSQL<br>データ永続化)]
        Storage[Supabase Storage<br>画像保存]
    end

    subgraph System[Coffee Journal System]
        direction TB

        subgraph Presentation[UI層]
            Pages[Next.js Pages<br>App Router]
            Components[React Components<br>Container/Presentational]
        end

        subgraph Application[アプリケーション層]
            Actions[Server Actions]
            UseCases[Use Cases]
        end

        subgraph Domain[ドメイン層]
            Entities[Entities]
            ValueObjects[Value Objects]
            RepoIF[Repository IF]
        end

        subgraph Infrastructure[インフラ層]
            RepoImpl[Repository Impl]
            SupaClient[Supabase Client]
        end
    end

    User((ユーザー)) --> Pages
    Pages --> Components
    Components --> Actions
    Actions --> UseCases
    UseCases --> RepoIF
    RepoIF -.-> RepoImpl
    RepoImpl --> SupaClient
    SupaClient --> Auth
    SupaClient --> DB
    SupaClient --> Storage

    style Domain fill:#e1f5fe
    style RepoIF stroke-dasharray: 5 5
```

---

## 5. 集約境界図テンプレート

集約の内部構造と外部参照を明示するためのテンプレート。

```mermaid
flowchart TB
    subgraph Aggregate1[集約1: AggregateRootName]
        direction TB
        Root1[AggregateRoot]
        VO1[ValueObject1]
        VO2[ValueObject2]
        Entity1[Entity1]

        Root1 --> VO1
        Root1 --> VO2
        Root1 --> Entity1
    end

    subgraph Aggregate2[集約2: OtherAggregate]
        Root2[OtherRoot]
    end

    %% 集約間は ID 参照のみ
    Root1 -.->|ID参照| Root2
```

### コーヒー評価集約の例

```mermaid
flowchart TB
    subgraph CoffeeEvaluationAggregate[CoffeeEvaluation集約]
        direction TB
        CE[CoffeeEvaluation<br><<Aggregate Root>>]
        BI[BeanInfo<br><<Value Object>>]
        SI[ShopInfo<br><<Value Object>>]
        ER[EvaluationRatings<br><<Value Object>>]
        VIS[Visibility<br><<Value Object>>]
        R1[Rating: acidity]
        R2[Rating: bitterness]
        R3[Rating: aroma]
        R4[Rating: overallRating]

        CE --> BI
        CE --> SI
        CE --> ER
        CE --> VIS
        ER --> R1
        ER --> R2
        ER --> R3
        ER --> R4
    end

    subgraph UserAggregate[User集約 - 別コンテキスト]
        User[User]
    end

    CE -.->|userId: string| User

    style CE fill:#fff3e0
    style BI fill:#e3f2fd
    style SI fill:#e3f2fd
    style ER fill:#e3f2fd
    style VIS fill:#e3f2fd
```

---

## 使用上の注意

1. **ステレオタイプの使用**: `<<Aggregate Root>>`, `<<Entity>>`, `<<Value Object>>` を明示する
2. **制約の記載**: `[required]`, `[max255]`, `[1-10]` など制約を属性に追記
3. **関連の種類**:
   - `*--`: コンポジション（所有関係、ライフサイクル共有）
   - `o--`: 集約（所有関係、ライフサイクル独立）
   - `-->`: 依存（一時的な使用）
   - `..>`: 参照（ID参照、弱い関連）
