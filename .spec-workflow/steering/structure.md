# Project Structure

## Directory Organization

**Following Next.js Best Practices: Server Components First + Container/Presentational Pattern**

**Implementation Status**: ✅ **Fully Implemented**

```
simple-coffee-collections/
├── app/                        # Next.js App Router - Routes and pages
│   ├── (app)/                 # Authenticated app routes (route group)
│   │   ├── layout.tsx        # App layout with navigation
│   │   ├── page.tsx          # Home page (Server Component - data fetching)
│   │   ├── _containers/      # Server Components for data fetching
│   │   │   └── [feature]/    # Feature-specific container
│   │   │       └── container.tsx
│   │   └── _components/      # Presentational components
│   │       └── [feature]/    # Feature-specific view components
│   │           └── view.tsx
│   ├── (auth)/                # Authentication routes (route group)
│   │   ├── layout.tsx        # Auth layout (centered, minimal)
│   │   ├── login/            # Login page
│   │   │   ├── page.tsx      # Login page component
│   │   │   └── LoginForm.tsx # Client Component (interactive)
│   │   └── signup/           # Signup page
│   │       ├── page.tsx      # Signup page component
│   │       └── SignupForm.tsx # Client Component (interactive)
│   ├── globals.css           # Global styles and Tailwind directives
│   └── layout.tsx            # Root layout (HTML wrapper)
│
├── components/                # Shared/Reusable components
│   ├── ui/                   # Base UI components (design system)
│   │   ├── Button.tsx        # Button component with variants
│   │   ├── Button.test.tsx   # Unit tests for Button
│   │   ├── Input.tsx         # Input component with label
│   │   └── Input.test.tsx    # Unit tests for Input
│   └── [shared-feature]/     # Shared feature components
│       └── ComponentName.tsx # Reusable across multiple routes
│
├── lib/                       # Business logic and utilities
│   ├── actions/              # Server Actions (mutations)
│   │   ├── auth.ts          # Authentication actions (signIn, signUp, signOut)
│   │   └── auth.test.ts     # Server action tests
│   ├── api/                  # Data fetching functions (Server Components)
│   │   └── [resource].ts    # Resource fetchers (wrapped with cache())
│   ├── supabase/             # Supabase client configuration
│   │   ├── server.ts        # Server-side Supabase client
│   │   ├── client.ts        # Client-side Supabase client (rare usage)
│   │   └── middleware.ts    # Session update middleware
│   ├── types/                # TypeScript type definitions
│   │   └── database.types.ts # Supabase database types
│   └── utils/                # Utility functions
│       └── [category].ts    # Categorized utilities
│
├── supabase/                  # Supabase local development
│   ├── config.toml           # Supabase configuration
│   ├── migrations/           # Database migration files
│   │   └── [timestamp]_[name].sql
│   └── seed.sql              # Seed data for local development
│
├── __tests__/                 # Test utilities and fixtures
│   ├── fixtures/             # Test data and mocks
│   └── utils/                # Test helper functions
│
├── .claude/                   # Claude Code configuration
│   ├── agents/               # Custom agent definitions
│   ├── skills/               # Project-specific skills
│   └── settings.json         # Claude settings
│
├── .spec-workflow/            # Specification workflow (MCP)
│   ├── steering/             # Project steering documents
│   ├── specs/                # Feature specifications
│   └── templates/            # Document templates
│
├── middleware.ts              # Next.js middleware (auth session)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest testing configuration
└── package.json               # Project dependencies and scripts
```

### Implemented Directory Structure (実装済み)

**Current Implementation**:
```
app/
├── (app)/                         # ✅ Authenticated routes
│   ├── layout.tsx                # App layout with NavBar
│   ├── page.tsx                  # Home page
│   ├── _components/              # ✅ Shared presentational
│   │   └── nav-bar.tsx          # Navigation with mobile menu
│   ├── coffee/                   # ✅ Coffee evaluation feature
│   │   ├── page.tsx             # List page (composition root)
│   │   ├── _containers/         # Server Components (data)
│   │   │   └── list/container.tsx
│   │   ├── _components/         # Presentational
│   │   │   ├── list/view.tsx
│   │   │   ├── list/card.tsx
│   │   │   ├── list/search-and-sort.tsx
│   │   │   ├── shared/coffee-slider.tsx
│   │   │   ├── shared/rating-stars.tsx
│   │   │   └── evaluation-form.tsx
│   │   ├── new/page.tsx         # Create page
│   │   └── [id]/                # Detail routes
│   │       ├── page.tsx         # Detail page
│   │       ├── edit/page.tsx    # Edit page
│   │       ├── _containers/evaluation/container.tsx
│   │       └── _components/evaluation/view.tsx
│   └── profile/                  # ✅ Profile management
│       ├── page.tsx
│       └── profile-form.tsx
│
├── (auth)/                        # ✅ Public auth routes
│   ├── layout.tsx                # Minimal auth layout
│   ├── login/
│   │   ├── page.tsx
│   │   └── LoginForm.tsx        # Client Component
│   └── signup/
│       ├── page.tsx
│       └── SignupForm.tsx       # Client Component
│
└── layout.tsx                     # Root layout

lib/
├── actions/                       # ✅ Server Actions
│   ├── auth.ts                   # Authentication actions
│   ├── coffee.ts                 # Coffee CRUD actions
│   └── profile.ts                # Profile update actions
├── api/                          # ✅ Data fetching (with cache())
│   └── coffee.ts                 # Coffee data fetchers
├── supabase/                     # ✅ Supabase clients
│   ├── server.ts                 # Server-side client
│   ├── client.ts                 # Client-side client
│   └── middleware.ts             # Session update
├── types/                        # ✅ TypeScript types
│   ├── database.types.ts         # Supabase generated
│   └── coffee.ts                 # Coffee-specific types
└── utils/                        # Future utilities

components/
└── ui/                           # ✅ Shared UI components
    ├── Button.tsx
    ├── Input.tsx
    ├── Slider.tsx
    ├── Card.tsx
    └── Select.tsx

supabase/
└── migrations/                   # ✅ Database migrations
    ├── 20251231000000_initial_schema.sql
    ├── 20251231010000_coffee_evaluations_schema.sql
    └── 20251231010001_seed_sample_data.sql
```

### Directory Structure Principles (Next.js Best Practices)

#### 1. **Colocation with `_containers/` and `_components/`**
- **`_containers/`**: Server Components that fetch data (Container pattern)
- **`_components/`**: Presentational components (can be Server or Client Components)
- **`_` prefix**: Prevents these directories from becoming routes

#### 2. **Route Structure Example** (Future coffee evaluation feature):
```
app/(app)/coffee/
  ├── page.tsx                    # Route page (composition root)
  ├── [id]/
  │   ├── page.tsx               # Detail page (composition root)
  │   ├── _containers/           # Data fetching containers
  │   │   ├── evaluation/
  │   │   │   └── container.tsx  # Server Component: fetches evaluation
  │   │   └── comments/
  │   │       └── container.tsx  # Server Component: fetches comments
  │   └── _components/           # Presentational views
  │       ├── evaluation/
  │       │   └── view.tsx       # Displays evaluation data
  │       └── comment-item.tsx   # Comment display component
  └── _containers/
      └── list/
          └── container.tsx      # Server Component: fetches evaluation list
```

## Naming Conventions

### Files
- **Pages/Routes**: `page.tsx`, `layout.tsx` (Next.js convention)
- **Components**: `PascalCase.tsx` (e.g., `LoginForm.tsx`, `Button.tsx`)
- **Server Actions**: `camelCase.ts` (e.g., `auth.ts`, `coffeeEvaluations.ts`)
- **Utilities**: `camelCase.ts` (e.g., `dateUtils.ts`, `validation.ts`)
- **Tests**: `[filename].test.tsx` or `[filename].test.ts` (co-located with source)
- **Types**: `[name].types.ts` (e.g., `database.types.ts`)

### Code
- **Components**: `PascalCase` (e.g., `LoginForm`, `CoffeeCard`)
- **Functions/Hooks**: `camelCase` (e.g., `signIn`, `useAuth`, `formatDate`)
- **Server Actions**: `camelCase` (e.g., `signUp`, `createCoffeeEvaluation`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `EMAIL_REGEX`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: `PascalCase` (e.g., `ButtonProps`, `User`, `CoffeeEvaluation`)
- **Variables**: `camelCase` (e.g., `user`, `coffeeList`, `isLoading`)

## Import Patterns

### Import Order
1. **React/Next.js imports** (framework)
2. **External dependencies** (third-party libraries)
3. **Internal modules** (absolute imports with `@/`)
4. **Relative imports** (same directory, parent directory)
5. **Type imports** (when separate from value imports)
6. **Style imports** (CSS modules, if used)

### Example:
```typescript
// 1. Framework
'use client'
import { useState } from 'react'
import Link from 'next/link'

// 2. External dependencies
import { formatDistance } from 'date-fns'

// 3. Internal modules (absolute imports)
import { Button } from '@/components/ui/Button'
import { createCoffeeEvaluation } from '@/lib/actions/coffeeEvaluations'
import { createClient } from '@/lib/supabase/client'

// 4. Relative imports
import { validateRating } from '../utils/validation'

// 5. Type imports
import type { CoffeeEvaluation } from '@/lib/types/database.types'
```

### Module/Package Organization
- **Absolute imports**: Use `@/` alias for all imports from project root
- **Path alias**: `@/` maps to project root (configured in `tsconfig.json`)
- **Barrel exports**: Avoid - prefer explicit imports for better tree-shaking

## Code Structure Patterns

**Following Next.js Best Practices: Container/Presentational + Server Components First**

### 1. Page Organization (Composition Root)
```typescript
// app/(app)/coffee/page.tsx
// Pages compose containers and components (Server Component by default)

export const metadata = {
  title: 'コーヒー評価一覧',
  description: 'あなたのコーヒー評価記録',
}

export default async function CoffeePage() {
  // Composition only - no data fetching here
  return (
    <div>
      <h1>コーヒー評価一覧</h1>
      <CoffeeListContainer />
    </div>
  )
}
```

### 2. Container Pattern (Data Fetching - Server Component)
```typescript
// app/(app)/coffee/_containers/list/container.tsx
// Container: fetches data and passes to presentational component

import { getCoffeeEvaluations } from '@/lib/api/coffee'
import { CoffeeListView } from '../../_components/list/view'

export async function CoffeeListContainer() {
  // Data fetching happens here
  const evaluations = await getCoffeeEvaluations()

  // Pass data to presentational component
  return <CoffeeListView evaluations={evaluations} />
}
```

### 3. Presentational Component Pattern (View - Server or Client Component)
```typescript
// app/(app)/coffee/_components/list/view.tsx
// Presentational: receives data and renders UI

import type { CoffeeEvaluation } from '@/lib/types/database.types'
import { CoffeeCard } from './card'

interface CoffeeListViewProps {
  evaluations: CoffeeEvaluation[]
}

export function CoffeeListView({ evaluations }: CoffeeListViewProps) {
  if (evaluations.length === 0) {
    return <p>まだ評価がありません</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evaluations.map((evaluation) => (
        <CoffeeCard key={evaluation.id} evaluation={evaluation} />
      ))}
    </div>
  )
}
```

### 4. API Layer with Request Memoization
```typescript
// lib/api/coffee.ts
// Data fetching functions wrapped with cache() for Request Memoization

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// cache() prevents duplicate requests in the same render cycle
export const getCoffeeEvaluations = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coffee_evaluations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
})

export const getCoffeeEvaluation = cache(async (id: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coffee_evaluations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
})
```

### 5. Client Component Pattern (Interactive UI)
```typescript
// app/(app)/coffee/_components/list/filter-form.tsx
// Client Component: handles user interaction

'use client'

import { useState, useTransition } from 'react'
import { searchCoffeeAction } from '@/lib/actions/coffee'

interface FilterFormProps {
  onResultsChange: (results: CoffeeEvaluation[]) => void
}

export function FilterForm({ onResultsChange }: FilterFormProps) {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSearch = () => {
    startTransition(async () => {
      // Call Server Action for secure server-side search
      const results = await searchCoffeeAction(query)
      onResultsChange(results)
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="店名、豆の種類で検索"
      />
      <button onClick={handleSearch} disabled={isPending}>
        {isPending ? '検索中...' : '検索'}
      </button>
    </div>
  )
}
```

### 6. Server Action Pattern (Mutations)
```typescript
// lib/actions/coffee.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCoffeeEvaluation(formData: FormData) {
  // 1. Extract and validate input
  const shopName = formData.get('shopName') as string
  const beanType = formData.get('beanType') as string
  const acidity = parseInt(formData.get('acidity') as string)

  if (!shopName || !beanType) {
    return { error: '必須項目を入力してください' }
  }

  if (acidity < 1 || acidity > 10) {
    return { error: '評価は1-10の範囲で入力してください' }
  }

  // 2. Business logic (server-side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です' }
  }

  const { error } = await supabase.from('coffee_evaluations').insert({
    user_id: user.id,
    shop_name: shopName,
    bean_type: beanType,
    acidity,
    // ... other fields
  })

  if (error) {
    return { error: error.message }
  }

  // 3. Revalidate and redirect
  revalidatePath('/coffee')
  redirect('/coffee')
}

// Interactive search (returns data, not redirect)
export async function searchCoffeeAction(query: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('coffee_evaluations')
    .select('*')
    .or(`shop_name.ilike.%${query}%,bean_type.ilike.%${query}%`)

  return data || []
}
```

### 7. Composition Pattern (Avoiding Props Drilling)
```typescript
// ❌ Anti-pattern: Props drilling creates unnecessary Client Components
'use client'
export function Parent() {
  const handleLike = () => console.log('liked')
  return (
    <Card onClick={handleLike}> {/* Card must be Client Component */}
      <Content /> {/* Can't use onClick */}
    </Card>
  )
}

// ✅ Best practice: Composition keeps more Server Components
export function Parent() {
  return (
    <Card> {/* Can stay Server Component */}
      <Content>
        <LikeButton /> {/* Only this is Client Component */}
      </Content>
    </Card>
  )
}

'use client'
function LikeButton() {
  const handleLike = () => console.log('liked')
  return <button onClick={handleLike}>♥ いいね</button>
}
```

### 8. Shared UI Component Pattern
```typescript
// components/ui/Button.tsx
// Shared UI components (design system)

import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors'
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  }
  const widthStyles = fullWidth ? 'w-full' : ''
  const disabledStyles = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '処理中...' : children}
    </button>
  )
}
```

## Code Organization Principles

**Based on Next.js Best Practices**

### 1. **Server Components First** (Principle #1)
- **Default**: All components are Server Components unless marked `'use client'`
- **Data Fetching**: Always in Server Components (faster, secure, smaller bundle)
- **Client Components**: Only for interactivity (useState, useEffect, onClick, etc.)

**Decision tree**:
```
Need data fetching?
├─ YES → Server Component (in _containers/)
│   └─ User interaction needed? → Pass to Client Component child
└─ NO → Need interactivity?
    ├─ YES → Client Component ('use client')
    └─ NO → Server Component (default)
```

### 2. **Tree-Based UI Decomposition** (Principle #2)
- **Top-down design**: Design component tree before implementation
- **Data dependencies**: Structure reflects data relationships
- **Scaffold first**: Create tree structure, then fill in details
- **Refactor freely**: Initial tree structure is not final

### 3. **Container/Presentational Pattern** (Principle #3)
- **Containers** (`_containers/`):
  - Server Components
  - Fetch data from `lib/api/`
  - Pass data to presentational components
  - Naming: `{Feature}Container`

- **Presentational** (`_components/`):
  - Render UI with received data
  - Can be Server or Client Components
  - Naming: `{Feature}View`, `{Feature}Card`, etc.

### 4. **Request Optimization** (Principle #4)
- **Request Memoization**:
  - Wrap fetch functions with `cache()` from React
  - Deduplicates identical requests in render cycle
  - Place in `lib/api/` layer

- **DataLoader Pattern** (when needed):
  - Batch N+1 queries in loops
  - Use DataLoader library for batching
  - Example: User info for multiple comments

### 5. **Composition Over Props Drilling** (Principle #5)
- **Avoid**: Passing props through multiple layers
- **Use**: Direct composition with children
- **Benefit**: Keeps more components as Server Components
- **Rule**: If component only passes props to children → use composition

### 6. **Colocation**
- Related files stay together:
  - Tests with source (`Button.tsx` + `Button.test.tsx`)
  - Containers and components under same route
  - Feature-specific code in feature directories

### 7. **Separation of Concerns**
- **app/**: Routing and composition (pages)
- **app/_containers/**: Data fetching (Server Components)
- **app/_components/**: Presentational (Server or Client Components)
- **components/**: Shared/reusable components
- **lib/api/**: Data fetching functions (with `cache()`)
- **lib/actions/**: Business logic and mutations (Server Actions)
- **lib/supabase/**: Data access layer (internal)
- **lib/types/**: Type definitions

### 8. **Single Responsibility**
- One component per file
- One clear purpose per file
- Related actions grouped (e.g., all coffee actions in `coffee.ts`)

### 9. **Testability**
- Pure functions where possible
- Clear input/output contracts
- Minimal side effects
- Server Actions testable in isolation

## Module Boundaries

**Following Next.js Best Practices Architecture**

### Route Groups (App Router)
- **(app)**: Authenticated routes - require user session
- **(auth)**: Public authentication routes - redirect if authenticated
- **_containers/**: Not a route (underscore prefix), data fetching layer
- **_components/**: Not a route (underscore prefix), presentational layer

### Dependency Direction (Server Components First)
```
app/page.tsx (composition root)
  ↓
app/_containers/ (Server Components - data fetching)
  ↓
lib/api/ (data fetching with cache())
  ↓
lib/supabase/server.ts (data access)

app/_containers/ → app/_components/ (presentational)
  ↓                     ↓
lib/api/          components/ui/ (shared)
  ↓
lib/supabase/

lib/actions/ (Server Actions)
  ↓
lib/supabase/server.ts
```

**Rules**:
- **app/page.tsx**: Composes containers/components (no data fetching)
- **app/_containers/**: Calls `lib/api/` for data, passes to `_components/`
- **app/_components/**: Receives data as props, renders UI
- **lib/api/**: Data fetching functions (wrapped with `cache()`)
- **lib/actions/**: Mutations (Server Actions)
- **components/**: Shared components (can import from `lib/types`, `lib/utils`)

### Public API vs Internal
- **app/_containers/**: Internal to route (data fetching)
- **app/_components/**: Internal to route (presentational)
- **components/ui/**: Public, shared across routes (design system)
- **lib/api/**: Public API for data fetching (used by containers)
- **lib/actions/**: Public API for mutations (used by forms)
- **lib/supabase/**: Internal (only accessed via `lib/api/` and `lib/actions/`)

### Server vs Client Boundaries
**Server-only** (never sent to client):
- `lib/supabase/server.ts` - Server Supabase client
- `lib/api/` - Data fetching functions
- `lib/actions/` - Server Actions
- `app/_containers/` - Data fetching containers

**Client-only** (with `'use client'`):
- Interactive components (forms, buttons with onClick, etc.)
- `lib/supabase/client.ts` - Client Supabase client (rare usage)

**Shared** (isomorphic):
- `lib/types/` - TypeScript type definitions
- `lib/utils/` - Pure utility functions
- `components/ui/` - UI components (Server Components by default)

**Key principle**: Keep as much Server-side as possible. Only mark Client Component when absolutely necessary.

## Code Size Guidelines

### File Size
- **Components**: < 200 lines (split into smaller components if larger)
- **Server Actions**: < 100 lines per action, < 300 lines per file
- **Utilities**: < 150 lines per file

### Function/Method Size
- **Server Actions**: < 50 lines per function
- **Event Handlers**: < 30 lines (extract logic if longer)
- **Utility Functions**: < 20 lines (single purpose)

### Component Complexity
- **Max Props**: 10 props per component (use composition instead)
- **Nesting Depth**: Max 4 levels of JSX nesting
- **Hooks per Component**: < 5 hooks (split component if more)

## Documentation Standards

### Code Comments
- **JSDoc for public APIs**: All exported functions/components
- **Inline comments**: Complex business logic only
- **No obvious comments**: Code should be self-documenting

### Example JSDoc:
```typescript
/**
 * Validates and creates a new coffee evaluation
 * @param formData - Form data containing evaluation fields
 * @returns Success redirect or error object
 */
export async function createCoffeeEvaluation(formData: FormData) {
  // ...
}
```

### README Files
- **Project root**: Setup instructions, project overview
- **Major modules**: Document purpose and usage (when needed)
- **CLAUDE.md**: Project principles and development guidelines

## Testing Patterns

### Test Co-location
- Tests live next to source files
- **Component tests**: `Button.test.tsx` next to `Button.tsx`
- **Action tests**: `auth.test.ts` next to `auth.ts`

### Test Naming
```typescript
describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

### Test Organization
```typescript
// 1. Imports
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

// 2. Test suite
describe('Button', () => {
  // 2a. Unit tests
  it('renders children', () => { ... })

  // 2b. Variant tests
  it('applies primary variant styles', () => { ... })

  // 2c. Interaction tests
  it('calls onClick when clicked', () => { ... })

  // 2d. Edge cases
  it('disables button when loading', () => { ... })
})
```

## Implemented Examples (実装済みの例)

**Following Container/Presentational Pattern** ✅

### Coffee Evaluation Feature (実装済み):

```
app/(app)/coffee/                      # ✅ IMPLEMENTED
  ├── page.tsx                        # List page (composition root) ✅
  ├── loading.tsx                     # Loading state ✅
  ├── error.tsx                       # Error boundary ✅
  ├── _containers/                    # ✅ Server Components
  │   └── list/
  │       ├── container.tsx          # Fetches evaluations list ✅
  │       └── __tests__/container.test.tsx ✅
  ├── _components/                    # ✅ Presentational
  │   ├── list/
  │   │   ├── view.tsx               # Displays list ✅
  │   │   ├── card.tsx               # Coffee card component ✅
  │   │   ├── search-and-sort.tsx    # Client: search/filter ✅
  │   │   └── __tests__/             # Tests ✅
  │   ├── shared/
  │   │   ├── rating-stars.tsx       # Shared rating display ✅
  │   │   ├── coffee-slider.tsx      # Slider component ✅
  │   │   └── __tests__/             # Tests ✅
  │   └── evaluation-form.tsx        # Client: form ✅
  │
  ├── new/                            # ✅ Create route
  │   ├── page.tsx                   # New evaluation page ✅
  │   └── loading.tsx                # Loading state ✅
  │
  └── [id]/                           # ✅ Dynamic routes
      ├── page.tsx                   # Detail page ✅
      ├── loading.tsx                # Loading state ✅
      ├── error.tsx                  # Error boundary ✅
      ├── edit/
      │   ├── page.tsx               # Edit page ✅
      │   └── loading.tsx            # Loading state ✅
      ├── _containers/
      │   └── evaluation/
      │       ├── container.tsx      # Fetches evaluation ✅
      │       └── __tests__/container.test.tsx ✅
      └── _components/
          ├── evaluation/
          │   ├── view.tsx           # Displays evaluation ✅
          │   └── __tests__/view.test.tsx ✅
          └── delete-button.tsx      # Client: delete action ✅

app/(app)/profile/                     # ✅ IMPLEMENTED
  ├── page.tsx                       # Profile page ✅
  ├── profile-form.tsx              # Client: profile edit ✅
  └── __tests__/page.test.tsx       # Tests ✅

lib/                                  # ✅ IMPLEMENTED
  ├── api/
  │   └── coffee.ts                 # Coffee data fetching (with cache()) ✅
  │
  ├── actions/
  │   ├── coffee.ts                 # Coffee CRUD actions ✅
  │   ├── profile.ts                # Profile update actions ✅
  │   └── auth.ts                   # Authentication actions ✅
  │
  ├── types/
  │   ├── database.types.ts         # Supabase generated types ✅
  │   └── coffee.ts                 # Coffee-specific types ✅
  │
  ├── supabase/
  │   ├── server.ts                 # Server-side client ✅
  │   ├── client.ts                 # Client-side client ✅
  │   └── middleware.ts             # Session update middleware ✅
  │
  └── __tests__/                    # Test utilities ✅
      ├── actions/coffee.test.ts
      └── api/coffee.test.ts

components/                           # ✅ IMPLEMENTED
  └── ui/
      ├── Button.tsx                # Shared button ✅
      ├── Button.test.tsx           # Tests ✅
      ├── Input.tsx                 # Shared input ✅
      ├── Input.test.tsx            # Tests ✅
      ├── Slider.tsx                # Rating slider ✅
      ├── Card.tsx                  # Card wrapper ✅
      ├── Select.tsx                # Dropdown select ✅
      └── LogoutButton.tsx          # Logout button ✅
```

### Key Architectural Decisions (実装済み):

1. **Colocation by Feature** ✅: 
   - Containers and components are kept near their routes
   - Tests are co-located with source files
   - Feature-specific code stays within feature directories

2. **API Layer Separation** ✅: 
   - All data fetching through `lib/api/` with `cache()`
   - Server Actions in `lib/actions/` for mutations
   - Clear separation between data access and business logic

3. **Shared Components** ✅: 
   - Only truly reusable components in `components/ui/`
   - Created when pattern repeats 3+ times
   - Currently: Button, Input, Slider, Card, Select

4. **Type Organization** ✅: 
   - Database types generated from Supabase
   - Feature-specific types (e.g., `coffee.ts`)
   - Clear type boundaries between layers

5. **No Premature Abstraction** ✅: 
   - Simple, focused components
   - Abstractions created only when proven necessary
   - Preference for composition over complex abstractions

6. **Test-Driven Development (TDD)** ✅:
   - Red-Green-Refactor cycle
   - Comprehensive test coverage (unit + integration)
   - Tests guide implementation

### Future Growth Considerations:

As new features are added:
- Continue Container/Presentational pattern
- Maintain test coverage above 85%
- Add shared components only when patterns repeat
- Keep Server Components as the default
- Use Client Components sparingly (only for interactivity)
