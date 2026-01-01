# Design Document

## Overview

評価の公開制御と共有機能を実装します。この機能により、ユーザーは自分の評価の公開/非公開を設定でき、他のユーザーの公開評価を閲覧し、コミュニティとして交流できるようになります。

**主要な設計目標**:
1. 既存のContainer/Presentationalパターンを踏襲し、一貫性のある実装
2. Server Components Firstの原則に従い、パフォーマンスを最適化
3. 既存のコンポーネント・ユーティリティを最大限再利用
4. データベース変更なし（既存のis_publicフィールドとRLSポリシーを活用）

## Steering Document Alignment

### Technical Standards (tech.md)

**Next.js 15 App Router with Server Components**:
- デフォルトでServer Components、インタラクティブな部分のみClient Components
- Server Actionsで状態更新（is_publicフィールドの変更）
- Request Memoization（`cache()`）でデータフェッチングを最適化

**Container/Presentational Pattern**:
- `_containers/`: データ取得（Server Components）
- `_components/`: プレゼンテーション（Server or Client Components）
- `components/ui/`: 共有UIコンポーネント

**Supabase with RLS**:
- 既存のRow Level Security（RLS）ポリシーを活用
- `is_public=true`の評価は誰でも閲覧可能
- `is_public=false`の評価は所有者のみ閲覧可能

**Testing with TDD**:
- 新規コンポーネント・アクションに対してユニットテスト
- ページ遷移・公開切り替えフローの統合テスト
- テストファイルはソースと同じディレクトリに配置

### Project Structure (structure.md)

**Route Organization**:
```
app/(app)/
  coffee/
    page.tsx              # リダイレクト（/coffee/my or /coffee/community）
    my/                   # 新規: マイページ
      page.tsx
      _containers/
      _components/
    community/            # 新規: コミュニティフィード
      page.tsx
      _containers/
      _components/
    [id]/                 # 既存: 評価詳細（公開制御追加）
  users/                  # 新規: ユーザープロフィール
    [userId]/
      page.tsx
      _containers/
      _components/
```

**File Naming Conventions**:
- Pages: `page.tsx`, `layout.tsx`
- Components: `PascalCase.tsx`
- Tests: `[filename].test.tsx`
- Server Actions: `camelCase.ts`

## Code Reuse Analysis

### Existing Components to Leverage

**1. UI Components** (`components/ui/`)
- **Button**: 既存のボタンコンポーネント（公開トグル、ナビゲーションボタンに使用）
- **Input**: 検索フォーム（既存パターン踏襲）
- **Slider**: 評価スライダー（既存のまま使用）

**2. Coffee Components** (`app/(app)/coffee/_components/`)
- **CoffeeCard**: 評価カード表示（拡張してdisplay_nameと公開状態バッジを追加）
- **RatingStars**: 評価星表示（そのまま再利用）
- **CoffeeSlider**: 評価スライダー（そのまま再利用）
- **SearchAndSort**: 検索・ソート機能（拡張してコミュニティフィード用にも対応）

**3. API Layer** (`lib/api/`)
- **getCoffeeEvaluations()**: 拡張してuser_idとis_publicフィルタリングをサポート
- **getCoffeeEvaluation()**: 既存のまま（RLSで自動制御）

**4. Server Actions** (`lib/actions/`)
- **createCoffeeEvaluation()**: is_publicフィールドの処理追加
- **updateCoffeeEvaluation()**: is_publicフィールドの更新処理追加
- **deleteCoffeeEvaluation()**: 既存のまま

**5. Types** (`lib/types/`)
- **CoffeeEvaluation**: 既存型を拡張（display_nameをJOINで取得する型を追加）

### Integration Points

**Database Integration**:
- **coffee_evaluations**: 既存テーブルのis_publicフィールド活用
- **user_profiles**: display_name取得のためJOIN
- **Existing Indexes**:
  - `idx_coffee_evaluations_public` (is_public, created_at DESC)
  - `idx_coffee_evaluations_user_id` (user_id)

**Authentication Integration**:
- Supabase Auth（既存）: セッション管理
- Middleware（既存）: セッション更新

**Navigation Integration**:
- NavBar（`app/(app)/_components/nav-bar.tsx`）: 拡張してマイページ・コミュニティリンク追加

## Architecture

### High-Level Architecture

**アーキテクチャフロー**:

```
User
  │
  ├─ Navigation
       │
       ├─ /coffee/my (マイページ)
       │    └─ MyPageContainer (Server Component)
       │         ├─ getCoffeeEvaluations (lib/api/coffee.ts)
       │         │    └─ Supabase PostgreSQL
       │         └─ CoffeeListView
       │              └─ CoffeeCard (+ 公開バッジ)
       │
       ├─ /coffee/community (コミュニティフィード)
       │    └─ CommunityContainer (Server Component)
       │         ├─ getCoffeeEvaluationsWithUser (lib/api/coffee.ts)
       │         │    └─ Supabase PostgreSQL
       │         └─ CommunityView
       │              └─ CoffeeCard (+ display_name)
       │
       └─ /users/:userId (ユーザープロフィール)
            └─ ProfileContainer (Server Component)
                 ├─ getUserProfile (lib/api/user.ts)
                 │    └─ Supabase PostgreSQL
                 ├─ getCoffeeEvaluationsWithUser (lib/api/coffee.ts)
                 │    └─ Supabase PostgreSQL
                 └─ UserProfileView
                      └─ CoffeeCard
```

**レイヤー構成**:
- **Presentation Layer**: `_components/` (CoffeeListView, CommunityView, UserProfileView)
- **Container Layer**: `_containers/` (MyPageContainer, CommunityContainer, ProfileContainer)
- **API Layer**: `lib/api/` (getCoffeeEvaluations, getCoffeeEvaluationsWithUser, getUserProfile)
- **Data Access Layer**: Supabase Client (RLS適用)

### Modular Design Principles

**1. Single File Responsibility**:
- 各ページは1つの責務（マイページ、コミュニティ、プロフィール）
- 各コンテナは1つのデータ取得責務
- 各コンポーネントは1つのUI責務

**2. Component Isolation**:
- `PublicToggle`: 公開/非公開トグル（Client Component）
- `PublicBadge`: 公開状態バッジ（Server Component）
- `UserAvatar`: ユーザー名表示（Server Component）

**3. Service Layer Separation**:
```
Presentation Layer (_components/)
    ↓
Container Layer (_containers/)
    ↓
API Layer (lib/api/)
    ↓
Data Access Layer (Supabase Client)
```

**4. Utility Modularity**:
- 既存ユーティリティをそのまま使用（日付フォーマット等）
- 新規ユーティリティは不要（シンプルな実装）

## Components and Interfaces

### 1. Navigation Component (既存拡張)

**File**: `app/(app)/_components/nav-bar.tsx`

**Purpose**: ナビゲーションメニューの拡張（マイページ・コミュニティリンク追加）

**Changes**:
```typescript
// 既存のリンクに追加
const navLinks = [
  { href: '/coffee/my', label: 'マイページ', icon: '📝' },
  { href: '/coffee/community', label: 'コミュニティ', icon: '🌐' },
  { href: '/profile', label: 'プロフィール', icon: '👤' },
  // ... 既存リンク
]
```

**Dependencies**: Next.js Link, usePathname (client component)

**Reuses**: 既存のNavBarコンポーネント構造

---

### 2. My Page (新規)

**File**: `app/(app)/coffee/my/page.tsx`

**Purpose**: 自分の評価一覧ページ（公開/非公開両方表示）

**Interfaces**:
```typescript
export default function MyPage() {
  return (
    <section>
      <h1>マイページ</h1>
      <SearchAndSort />
      <MyPageContainer />
    </section>
  )
}
```

**Dependencies**: MyPageContainer, SearchAndSort

**Reuses**: 既存のページ構造パターン

---

### 3. My Page Container (新規)

**File**: `app/(app)/coffee/my/_containers/container.tsx`

**Purpose**: 現在ログイン中のユーザーの評価取得（公開/非公開両方）

**Interfaces**:
```typescript
export async function MyPageContainer({ searchParams }: Props) {
  const user = await getCurrentUser() // 認証チェック
  const evaluations = await getCoffeeEvaluations({
    user_id: user.id,
    // is_public は指定しない（両方取得）
    search: searchParams?.search,
    sort: searchParams?.sort,
  })

  return <MyPageView evaluations={evaluations} />
}
```

**Dependencies**: getCoffeeEvaluations, getCurrentUser

**Reuses**: 既存のContainerパターン

---

### 4. My Page View (新規)

**File**: `app/(app)/coffee/my/_components/view.tsx`

**Purpose**: マイページの評価一覧表示（公開状態バッジ付き）

**Interfaces**:
```typescript
export function MyPageView({ evaluations }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evaluations.map((evaluation) => (
        <CoffeeCardWithBadge
          key={evaluation.id}
          evaluation={evaluation}
          showPublicBadge={true} // 公開バッジ表示
        />
      ))}
    </div>
  )
}
```

**Dependencies**: CoffeeCardWithBadge

**Reuses**: 既存のグリッドレイアウトパターン

---

### 5. Community Feed Page (新規)

**File**: `app/(app)/coffee/community/page.tsx`

**Purpose**: 全ユーザーの公開評価一覧ページ

**Interfaces**:
```typescript
export const metadata = {
  title: 'コミュニティ',
  description: 'コーヒー愛好家の公開評価',
}

export default function CommunityPage({ searchParams }: Props) {
  return (
    <section>
      <h1>コミュニティ</h1>
      <p>コーヒー愛好家の評価を見てみましょう</p>
      <SearchAndSort />
      <CommunityContainer searchParams={searchParams} />
    </section>
  )
}
```

**Dependencies**: CommunityContainer, SearchAndSort

**Reuses**: 既存のページ構造パターン

---

### 6. Community Container (新規)

**File**: `app/(app)/coffee/community/_containers/container.tsx`

**Purpose**: 全ユーザーの公開評価取得（is_public=true のみ）

**Interfaces**:
```typescript
export async function CommunityContainer({ searchParams }: Props) {
  const evaluations = await getCoffeeEvaluationsWithUser({
    is_public: true,
    search: searchParams?.search,
    sort: searchParams?.sort,
  })

  return <CommunityView evaluations={evaluations} />
}
```

**Dependencies**: getCoffeeEvaluationsWithUser (新規API関数)

**Reuses**: 既存のContainerパターン

---

### 7. Community View (新規)

**File**: `app/(app)/coffee/community/_components/view.tsx`

**Purpose**: コミュニティフィードの評価一覧表示（投稿者名付き）

**Interfaces**:
```typescript
export function CommunityView({ evaluations }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evaluations.map((evaluation) => (
        <CoffeeCardWithUser
          key={evaluation.id}
          evaluation={evaluation}
          showUserName={true} // 投稿者名表示
        />
      ))}
    </div>
  )
}
```

**Dependencies**: CoffeeCardWithUser (拡張版CoffeeCard)

**Reuses**: 既存のグリッドレイアウトパターン

---

### 8. User Profile Page (新規)

**File**: `app/(app)/users/[userId]/page.tsx`

**Purpose**: 特定ユーザーのプロフィールと公開評価一覧

**Interfaces**:
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getUserProfile(params.userId)
  return {
    title: profile.display_name || '匿名ユーザー',
    description: profile.bio || '',
  }
}

export default function UserProfilePage({ params, searchParams }: Props) {
  return (
    <section>
      <UserProfileContainer userId={params.userId} />
      <UserEvaluationsContainer
        userId={params.userId}
        searchParams={searchParams}
      />
    </section>
  )
}
```

**Dependencies**: UserProfileContainer, UserEvaluationsContainer

**Reuses**: 既存のページ構造パターン

---

### 9. User Profile Container (新規)

**File**: `app/(app)/users/[userId]/_containers/profile-container.tsx`

**Purpose**: ユーザープロフィール情報取得

**Interfaces**:
```typescript
export async function UserProfileContainer({ userId }: Props) {
  const profile = await getUserProfile(userId)
  const currentUser = await getCurrentUser() // 自分かどうか判定
  const isOwnProfile = currentUser?.id === userId

  return (
    <UserProfileView
      profile={profile}
      isOwnProfile={isOwnProfile}
    />
  )
}
```

**Dependencies**: getUserProfile (新規API), getCurrentUser

**Reuses**: 既存のContainerパターン

---

### 10. User Profile View (新規)

**File**: `app/(app)/users/[userId]/_components/profile-view.tsx`

**Purpose**: ユーザープロフィール表示

**Interfaces**:
```typescript
export function UserProfileView({ profile, isOwnProfile }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h1 className="text-2xl font-bold">
        {profile.display_name || '匿名ユーザー'}
      </h1>
      {profile.bio && <p className="text-neutral-600 mt-2">{profile.bio}</p>}
      {isOwnProfile && (
        <Link href="/profile">
          <Button>プロフィールを編集</Button>
        </Link>
      )}
    </div>
  )
}
```

**Dependencies**: Button (components/ui/)

**Reuses**: 既存のカード・ボタンスタイル

---

### 11. Coffee Card with Badge (新規)

**File**: `app/(app)/coffee/_components/list/card-with-badge.tsx`

**Purpose**: 公開状態バッジ付きCoffeeCard

**Interfaces**:
```typescript
export function CoffeeCardWithBadge({ evaluation, showPublicBadge }: Props) {
  return (
    <div className="relative">
      <CoffeeCard evaluation={evaluation} />
      {showPublicBadge && (
        <PublicBadge isPublic={evaluation.is_public} />
      )}
    </div>
  )
}
```

**Dependencies**: CoffeeCard (既存), PublicBadge (新規)

**Reuses**: 既存のCoffeeCardコンポーネント

---

### 12. Public Badge (新規)

**File**: `app/(app)/coffee/_components/shared/public-badge.tsx`

**Purpose**: 公開/非公開状態バッジ

**Interfaces**:
```typescript
export function PublicBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <span className={`
      absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium
      ${isPublic
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'}
    `}>
      {isPublic ? '🌐 公開' : '🔒 非公開'}
    </span>
  )
}
```

**Dependencies**: なし（Server Component）

**Reuses**: Tailwind CSSユーティリティクラス

---

### 13. Public Toggle (新規)

**File**: `app/(app)/coffee/_components/shared/public-toggle.tsx`

**Purpose**: 公開/非公開トグルスイッチ（Client Component）

**Interfaces**:
```typescript
'use client'
export function PublicToggle({ defaultChecked, name }: Props) {
  const [isPublic, setIsPublic] = useState(defaultChecked)

  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        checked={isPublic}
        onChange={(e) => setIsPublic(e.target.checked)}
        className="toggle"
      />
      <span>{isPublic ? '🌐 公開' : '🔒 非公開'}</span>
      <input type="hidden" name={name} value={isPublic.toString()} />
    </label>
  )
}
```

**Dependencies**: React useState

**Reuses**: 既存のフォーム入力パターン

---

### 14. Coffee Card with User (新規)

**File**: `app/(app)/coffee/_components/list/card-with-user.tsx`

**Purpose**: 投稿者名表示付きCoffeeCard

**Interfaces**:
```typescript
export function CoffeeCardWithUser({ evaluation, showUserName }: Props) {
  return (
    <div>
      <CoffeeCard evaluation={evaluation} />
      {showUserName && (
        <Link
          href={`/users/${evaluation.user_id}`}
          className="text-sm text-neutral-600 hover:text-blue-600"
        >
          👤 {evaluation.display_name || '匿名ユーザー'}
        </Link>
      )}
    </div>
  )
}
```

**Dependencies**: CoffeeCard (既存), Next.js Link

**Reuses**: 既存のCoffeeCardコンポーネント

## Data Models

### CoffeeEvaluation (既存型)

```typescript
// lib/types/coffee.ts (既存)
export interface CoffeeEvaluation {
  id: string
  user_id: string
  shop_name: string
  bean_type: string
  roast_level: string | null
  acidity: number
  bitterness: number
  aroma: number
  overall_rating: number
  is_public: boolean  // 既存フィールド
  created_at: string
  updated_at: string
}
```

### CoffeeEvaluationWithUser (新規型)

```typescript
// lib/types/coffee.ts (拡張)
export interface CoffeeEvaluationWithUser extends CoffeeEvaluation {
  display_name: string | null  // user_profilesからJOIN
}
```

### UserProfile (既存型)

```typescript
// lib/types/database.types.ts (既存)
export interface UserProfile {
  id: string
  display_name: string | null
  bio: string | null
  created_at: string
  updated_at: string
}
```

### API Parameter Types (拡張)

```typescript
// lib/types/coffee.ts (拡張)
export interface CoffeeEvaluationSearchParams {
  user_id?: string       // 既存
  is_public?: boolean    // 既存（現在未使用 → 活用）
  search?: string        // 既存
  sort?: string          // 既存
}
```

## API Layer Design

### 1. getCoffeeEvaluations (既存拡張)

**File**: `lib/api/coffee.ts`

**Current Implementation**: すでにuser_idとis_publicフィルタリングをサポート

**No Changes Needed**: 既存実装がそのまま使える

```typescript
// 既存コード（変更なし）
export const getCoffeeEvaluations = cache(async (params?: CoffeeEvaluationSearchParams) => {
  const supabase = await createClient()
  let query = supabase.from('coffee_evaluations').select('*')

  if (params?.user_id) {
    query = query.eq('user_id', params.user_id)
  }

  if (params?.is_public !== undefined) {
    query = query.eq('is_public', params.is_public)
  }

  // ... 検索・ソート処理

  return data || []
})
```

---

### 2. getCoffeeEvaluationsWithUser (新規)

**File**: `lib/api/coffee.ts`

**Purpose**: user_profilesをJOINしてdisplay_nameを取得

**Implementation**:
```typescript
export const getCoffeeEvaluationsWithUser = cache(async (
  params?: CoffeeEvaluationSearchParams
): Promise<CoffeeEvaluationWithUser[]> => {
  const supabase = await createClient()

  let query = supabase
    .from('coffee_evaluations')
    .select(`
      *,
      user_profiles!inner(display_name)
    `)

  if (params?.is_public !== undefined) {
    query = query.eq('is_public', params.is_public)
  }

  if (params?.user_id) {
    query = query.eq('user_id', params.user_id)
  }

  if (params?.search) {
    const pattern = `%${params.search}%`
    query = query.or(
      `shop_name.ilike.${pattern},bean_type.ilike.${pattern}`
    )
  }

  query = applySortOrder(query, params?.sort)

  const { data, error } = await query

  if (error) throw new Error(error.message)

  // Flatten user_profiles join
  return (data || []).map(item => ({
    ...item,
    display_name: item.user_profiles?.display_name || null,
  }))
})
```

**Dependencies**: Supabase client, cache()

**Reuses**: applySortOrder (既存ヘルパー関数)

---

### 3. getUserProfile (新規)

**File**: `lib/api/user.ts` (新規ファイル)

**Purpose**: ユーザープロフィール取得

**Implementation**:
```typescript
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/types/database.types'
import { notFound } from 'next/navigation'

export const getUserProfile = cache(async (userId: string): Promise<UserProfile> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    notFound() // 404ページへ
  }

  return data
})
```

**Dependencies**: Supabase client, cache(), Next.js notFound()

**Reuses**: 既存のAPIパターン

---

### 4. getCurrentUser (新規ヘルパー)

**File**: `lib/api/auth.ts` (新規ファイル)

**Purpose**: 現在ログイン中のユーザー取得（認証チェック）

**Implementation**:
```typescript
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login') // 未認証の場合ログインページへ
  }

  return user
})
```

**Dependencies**: Supabase client, cache(), Next.js redirect()

**Reuses**: 既存の認証パターン

## Error Handling

### Error Scenarios

#### 1. 存在しないユーザーIDへのアクセス

**Scenario**: `/users/[invalid-uuid]` にアクセス

**Handling**:
```typescript
// lib/api/user.ts
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single()

if (error || !data) {
  notFound() // Next.js 404ページへ
}
```

**User Impact**: 404エラーページ表示

---

#### 2. 非公開評価への不正アクセス

**Scenario**: 他人の非公開評価（/coffee/[id]）へ直接URLアクセス

**Handling**:
- Supabase RLSポリシーで自動ブロック
- Server Componentでエラーページ表示

**User Impact**: エラーページ「この評価は閲覧できません」

---

#### 3. 未認証ユーザーのマイページアクセス

**Scenario**: ログインせずに `/coffee/my` にアクセス

**Handling**:
```typescript
// lib/api/auth.ts
export const getCurrentUser = cache(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  return user
})
```

**User Impact**: ログインページへリダイレクト

---

#### 4. データベースエラー

**Scenario**: Supabaseクエリ失敗

**Handling**: 既存のerror.tsxで処理

**User Impact**: エラーページ表示（リトライボタン付き）

---

#### 5. 空の評価一覧

**Scenario**: ユーザーが公開評価を1件も持っていない

**Handling**:
```typescript
// _components/view.tsx
if (evaluations.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-neutral-600">まだ公開評価がありません</p>
    </div>
  )
}
```

**User Impact**: 適切な空状態メッセージ

## Testing Strategy

### Unit Testing

#### 1. Component Tests

**PublicBadge.test.tsx**:
```typescript
describe('PublicBadge', () => {
  it('displays 🌐 公開 when isPublic is true', () => {
    render(<PublicBadge isPublic={true} />)
    expect(screen.getByText('🌐 公開')).toBeInTheDocument()
  })

  it('displays 🔒 非公開 when isPublic is false', () => {
    render(<PublicBadge isPublic={false} />)
    expect(screen.getByText('🔒 非公開')).toBeInTheDocument()
  })
})
```

**PublicToggle.test.tsx**:
```typescript
describe('PublicToggle', () => {
  it('toggles between public and private', async () => {
    render(<PublicToggle defaultChecked={true} name="is_public" />)
    const checkbox = screen.getByRole('checkbox')

    expect(screen.getByText('🌐 公開')).toBeInTheDocument()

    await userEvent.click(checkbox)

    expect(screen.getByText('🔒 非公開')).toBeInTheDocument()
  })
})
```

**CoffeeCardWithUser.test.tsx**:
```typescript
describe('CoffeeCardWithUser', () => {
  it('displays user display_name when provided', () => {
    const evaluation = { ...mockEvaluation, display_name: 'テストユーザー' }
    render(<CoffeeCardWithUser evaluation={evaluation} showUserName={true} />)
    expect(screen.getByText('👤 テストユーザー')).toBeInTheDocument()
  })

  it('displays 匿名ユーザー when display_name is null', () => {
    const evaluation = { ...mockEvaluation, display_name: null }
    render(<CoffeeCardWithUser evaluation={evaluation} showUserName={true} />)
    expect(screen.getByText('👤 匿名ユーザー')).toBeInTheDocument()
  })
})
```

---

#### 2. API Tests

**user.test.ts** (lib/api/user.ts):
```typescript
describe('getUserProfile', () => {
  it('fetches user profile by userId', async () => {
    const profile = await getUserProfile('test-user-id')
    expect(profile.id).toBe('test-user-id')
    expect(profile.display_name).toBeDefined()
  })

  it('calls notFound() when user does not exist', async () => {
    await expect(getUserProfile('invalid-id')).rejects.toThrow()
  })
})
```

**coffee.test.ts** (lib/api/coffee.ts - 拡張):
```typescript
describe('getCoffeeEvaluationsWithUser', () => {
  it('fetches public evaluations with display_name', async () => {
    const evaluations = await getCoffeeEvaluationsWithUser({ is_public: true })
    expect(evaluations[0]).toHaveProperty('display_name')
  })

  it('filters by user_id', async () => {
    const evaluations = await getCoffeeEvaluationsWithUser({
      user_id: 'test-user-id'
    })
    expect(evaluations.every(e => e.user_id === 'test-user-id')).toBe(true)
  })
})
```

---

### Integration Testing

#### 1. Page Navigation Flow

**my-page-flow.test.tsx**:
```typescript
describe('My Page Flow', () => {
  it('navigates to my page and displays own evaluations', async () => {
    render(<App />)

    // ログイン
    await loginAsUser('test@example.com')

    // マイページへ遷移
    await userEvent.click(screen.getByText('マイページ'))

    // URLが正しいか確認
    expect(window.location.pathname).toBe('/coffee/my')

    // 自分の評価が表示される
    expect(screen.getByText('テストカフェ')).toBeInTheDocument()

    // 公開バッジが表示される
    expect(screen.getByText('🌐 公開')).toBeInTheDocument()
  })
})
```

---

#### 2. Public/Private Toggle Flow

**public-toggle-flow.test.tsx**:
```typescript
describe('Public Toggle Flow', () => {
  it('creates a private evaluation and toggles to public', async () => {
    render(<App />)

    // 新規評価作成ページ
    await userEvent.click(screen.getByText('新規登録'))

    // フォーム入力
    await userEvent.type(screen.getByLabelText('店名'), 'テストカフェ')
    // ... その他のフィールド

    // 非公開に設定
    await userEvent.click(screen.getByLabelText('公開設定'))
    expect(screen.getByText('🔒 非公開')).toBeInTheDocument()

    // 保存
    await userEvent.click(screen.getByText('保存'))

    // マイページで非公開バッジ確認
    expect(screen.getByText('🔒 非公開')).toBeInTheDocument()

    // 編集ページで公開に切り替え
    await userEvent.click(screen.getByText('編集'))
    await userEvent.click(screen.getByLabelText('公開設定'))
    await userEvent.click(screen.getByText('保存'))

    // マイページで公開バッジ確認
    expect(screen.getByText('🌐 公開')).toBeInTheDocument()
  })
})
```

---

#### 3. Community Feed Flow

**community-feed-flow.test.tsx**:
```typescript
describe('Community Feed Flow', () => {
  it('displays public evaluations from all users', async () => {
    render(<App />)

    // コミュニティページへ
    await userEvent.click(screen.getByText('コミュニティ'))

    // 公開評価が表示される
    expect(screen.getByText('テストカフェ')).toBeInTheDocument()

    // 投稿者名が表示される
    expect(screen.getByText('👤 テストユーザー')).toBeInTheDocument()

    // 投稿者名をクリックしてプロフィールへ
    await userEvent.click(screen.getByText('👤 テストユーザー'))

    // プロフィールページに遷移
    expect(window.location.pathname).toMatch(/\/users\//)
    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
  })
})
```

---

### End-to-End Testing

#### User Scenario 1: 新規ユーザーのオンボーディング

```typescript
test('new user creates private evaluation and views community', async () => {
  // 1. サインアップ
  await signUp('newuser@example.com', 'password')

  // 2. プロフィール設定
  await fillProfile('新規ユーザー', '初心者です')

  // 3. 初めての評価作成（非公開）
  await createEvaluation({
    shop_name: 'マイカフェ',
    bean_type: 'エチオピア',
    is_public: false,
  })

  // 4. マイページで確認
  await navigateTo('/coffee/my')
  expect(screen.getByText('🔒 非公開')).toBeInTheDocument()

  // 5. コミュニティで他人の評価を見る
  await navigateTo('/coffee/community')
  expect(screen.getByText('👤 ベテランユーザー')).toBeInTheDocument()
})
```

---

#### User Scenario 2: 既存ユーザーの評価共有

```typescript
test('existing user shares evaluation and gets discovered', async () => {
  // 1. ログイン
  await login('existing@example.com')

  // 2. 既存の非公開評価を公開に変更
  await navigateTo('/coffee/my')
  await editEvaluation('existing-eval-id', { is_public: true })

  // 3. コミュニティフィードで確認
  await navigateTo('/coffee/community')
  expect(screen.getByText('自分のカフェ名')).toBeInTheDocument()

  // 4. 別のユーザーとしてログイン
  await logout()
  await login('another@example.com')

  // 5. コミュニティで最初のユーザーの評価を発見
  await navigateTo('/coffee/community')
  await userEvent.click(screen.getByText('👤 既存ユーザー'))

  // 6. プロフィールページで評価一覧を閲覧
  expect(screen.getByText('自分のカフェ名')).toBeInTheDocument()
})
```

## Implementation Plan Summary

### Phase 1: Foundation (基盤整備)
1. 新規API関数作成（getUserProfile, getCurrentUser, getCoffeeEvaluationsWithUser）
2. 型定義拡張（CoffeeEvaluationWithUser）
3. ユニットテスト作成

### Phase 2: UI Components (UIコンポーネント)
1. PublicBadge コンポーネント
2. PublicToggle コンポーネント
3. CoffeeCardWithBadge / CoffeeCardWithUser 拡張
4. ユニットテスト作成

### Phase 3: Pages (ページ実装)
1. /coffee/my（マイページ）
2. /coffee/community（コミュニティフィード）
3. /users/[userId]（ユーザープロフィール）
4. 統合テスト作成

### Phase 4: Navigation & Polish (ナビゲーション＆仕上げ)
1. NavBar拡張（マイページ・コミュニティリンク追加）
2. /coffee ページのリダイレクト処理
3. エラーハンドリング・空状態UI
4. E2Eテスト作成
