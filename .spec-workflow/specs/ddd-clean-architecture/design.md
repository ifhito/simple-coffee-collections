# DDD + クリーンアーキテクチャ設計書

## アーキテクチャ概要

### 依存関係の方向

```
┌─────────────────────────────────────────────────────────┐
│                    UI層（app/, components/）             │
│              Page → Container → View                    │
└─────────────────────────┬───────────────────────────────┘
                          ↓ 依存
┌─────────────────────────────────────────────────────────┐
│           アプリケーション層（lib/application/）          │
│              UseCase（ビジネスフロー）                    │
│              ← リポジトリIF に依存（実装には依存しない）    │
└─────────────────────────┬───────────────────────────────┘
                          ↓ 依存
┌─────────────────────────────────────────────────────────┐
│              ドメイン層（lib/domain/）                    │
│     Entity, Value Object, Repository Interface          │
│              ※ 外部依存なし（純粋TypeScript）             │
└─────────────────────────────────────────────────────────┘
                          ↑ 実装（依存性逆転）
┌─────────────────────────────────────────────────────────┐
│           インフラ層（lib/infrastructure/）               │
│     SupabaseCoffeeEvaluationRepository（実装）           │
│              → ドメインのIFを実装                        │
└─────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
lib/
├── domain/                          # ドメイン層（純粋TypeScript）
│   ├── shared/
│   │   └── result.ts               # Result<T, E>型
│   └── coffee-evaluation/
│       ├── value-objects/
│       │   ├── rating.ts           # Rating値オブジェクト
│       │   ├── bean-info.ts        # BeanInfo値オブジェクト
│       │   ├── shop-info.ts        # ShopInfo値オブジェクト
│       │   └── visibility.ts       # Visibility値オブジェクト
│       ├── entity.ts               # CoffeeEvaluation集約ルート
│       └── repository.ts           # リポジトリインターフェース
│
├── application/                     # アプリケーション層
│   └── coffee-evaluation/
│       ├── dto.ts                  # DTO定義
│       ├── create-evaluation.ts    # 作成ユースケース
│       ├── update-evaluation.ts    # 更新ユースケース
│       ├── delete-evaluation.ts    # 削除ユースケース
│       └── get-evaluations.ts      # 取得ユースケース
│
├── infrastructure/                  # インフラ層
│   ├── supabase/                   # Supabaseクライアント
│   └── repositories/
│       └── supabase-coffee-evaluation-repository.ts
│
└── di/                              # 依存性注入
    └── container.ts                # ファクトリ関数
```

## 設計パターン

### 1. 値オブジェクト (Value Object)
- 不変オブジェクト（イミュータブル）
- ファクトリメソッドによる検証済み生成
- equals()による等価性比較

### 2. エンティティ (Entity)
- 識別子による同一性
- 集約ルートとしてのCoffeeEvaluation
- ドメイン固有メソッド（isOwnedBy, isViewableBy, update）

### 3. リポジトリパターン
- ドメイン層にインターフェース定義
- インフラ層に実装（SupabaseCoffeeEvaluationRepository）
- DIコンテナで注入

### 4. ユースケース
- 1クラス1責務
- リポジトリインターフェースに依存
- DTOによる入出力

## 実装状況
- [x] 完了（2026-01-25実装済み）
