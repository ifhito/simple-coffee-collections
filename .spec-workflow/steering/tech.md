# Technology Stack

## Project Type
レスポンシブWebアプリケーション - コーヒー愛好家向けの評価記録プラットフォーム

## Core Technologies

### Primary Language(s)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js (via Next.js)
- **Package Manager**: pnpm (lockfile version 9.x)

### Key Dependencies/Libraries

#### Frontend Framework
- **Next.js 15.1.3**: React-based framework with App Router (RSC support)
- **React 19.0.0**: UI library with Server Components
- **React DOM 19.0.0**: React renderer for web

#### Backend & Database
- **Supabase (@supabase/supabase-js 2.47.10)**: PostgreSQL-based backend platform
  - Authentication (Supabase Auth)
  - Database (PostgreSQL 17)
  - Realtime subscriptions
  - Storage (for future image support)
- **Supabase SSR (@supabase/ssr 0.5.2)**: Server-side rendering support for Supabase

#### Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **PostCSS 8.x**: CSS processing
- **Autoprefixer 10.4.20**: CSS vendor prefixing

#### Testing (実装済み)
- **Jest 29.7.0**: JavaScript testing framework ✅
- **React Testing Library 16.1.0**: React component testing utilities ✅
- **@testing-library/jest-dom 6.6.3**: Custom Jest matchers for DOM ✅
- **@testing-library/user-event 14.5.2**: User interaction simulation ✅
- **jest-environment-jsdom 29.7.0**: DOM environment for Jest ✅

**Test Coverage**:
- Unit tests: Components, Server Actions, API functions
- Integration tests: Complete user flows (CRUD, search/sort, auth)
- Test co-location: Tests next to source files (`.test.tsx`, `.test.ts`)
- TDD approach: Red-Green-Refactor cycle

**Test Files Implemented**:
- Components: `Button.test.tsx`, `Input.test.tsx`, `nav-bar.test.tsx`
- Coffee feature: 10+ test files covering CRUD flows
- Auth: `LoginForm.test.tsx`, `SignupForm.test.tsx`, `auth.test.ts`
- API/Actions: `coffee.test.ts` (both lib/api and lib/actions)

#### Code Quality
- **ESLint 9.x**: JavaScript/TypeScript linter
- **eslint-config-next 15.1.3**: Next.js-specific ESLint configuration

### Application Architecture

**Server-First Architecture with Next.js App Router** (実装済み):
- **Server Components**: Default for data fetching and rendering ✅
- **Client Components**: Interactive UI elements only ✅
- **Server Actions**: Form submissions and mutations ✅
- **Route Handlers**: API endpoints when needed (未使用 - Server Actionsで代替)

**Implemented Patterns** (実装済みパターン):
- **Container/Presentational Pattern**: 
  - `_containers/`: Server Components that fetch data
  - `_components/`: Presentational components (Server or Client)
- **Request Memoization**: `cache()` wrapper in `lib/api/` layer
- **Composition Over Props Drilling**: Direct component composition
- **Colocation**: Tests co-located with source files

**Authentication Flow** (実装済み):
- Supabase Auth with SSR support ✅
- Middleware-based session management ✅
- Cookie-based authentication state ✅

**Data Flow** (実装済み):
```
User → Next.js Server → Supabase (Auth/DB) → Response
         ↑                    ↓
    Middleware           Realtime Updates (準備済み)
```

**Implemented Features**:
- Coffee evaluation CRUD with Server Actions
- User authentication (login/signup)
- Profile management
- Search and sort functionality
- Mobile-responsive navigation
- Comprehensive test coverage (Jest + RTL)

### Data Storage

- **Primary Database**: PostgreSQL 17 (via Supabase) ✅
  - **Implemented Tables**:
    - `profiles`: User profile information (name, bio)
    - `coffee_evaluations`: Coffee evaluation records
      - Ratings: acidity, bitterness, aroma, overall (1-10)
      - Metadata: shop_name, bean_type, roast_level
      - Timestamps: created_at, updated_at
      - User reference: user_id (FK to auth.users)
      - Visibility: is_public (currently always true)
  - **Migrations**: 3 migration files in `supabase/migrations/`
    - Initial schema (profiles, RLS policies)
    - Coffee evaluations schema
    - Sample seed data

- **Authentication**: Supabase Auth ✅
  - Email/password authentication
  - JWT-based session management (1 hour expiry)
  - Refresh token rotation enabled
  - Row Level Security (RLS) policies enforced

- **Real-time**: Supabase Realtime (準備済み、未使用)
  - Infrastructure ready for live updates
  - Not yet implemented in UI

- **Data Formats**: JSON for API communication ✅

### External Integrations

- **Supabase API**: RESTful API and PostgreSQL connection
- **Protocols**:
  - HTTP/REST for data operations
  - WebSocket for real-time subscriptions
- **Authentication**:
  - JWT tokens
  - Cookie-based session management

### Monitoring & Dashboard Technologies

- **Frontend Framework**: React 19 with Next.js 15 App Router
- **Real-time Communication**: Supabase Realtime (WebSocket)
- **State Management**: React Server Components (server state) + React hooks (client state)
- **UI Components**: Custom components with Tailwind CSS
- **Form Handling**: Server Actions + Progressive Enhancement

## Development Environment

### Build & Development Tools
- **Build System**: Next.js build system (Turbopack-ready)
- **Package Management**: pnpm
- **Development Workflow**:
  - `pnpm dev`: Hot reload development server (port 3000)
  - `pnpm build`: Production build
  - `pnpm test`: Jest test runner with watch mode

### Code Quality Tools
- **Static Analysis**: ESLint with Next.js configuration
- **Formatting**: ESLint-integrated formatting rules
- **Testing Framework**: Jest with React Testing Library
  - Unit tests for components
  - Integration tests for auth flows
- **Type Safety**: TypeScript strict mode

### Version Control & Collaboration
- **VCS**: Git
- **Branching Strategy**: Feature branches with main as production-ready
- **Code Review Process**: Pull request reviews before merge

### Supabase Local Development
- **CLI**: Supabase CLI for local development
- **Database**: PostgreSQL 17 (Docker container)
- **Ports**:
  - API: 54321
  - Database: 54322
  - Studio: 54323
  - Inbucket (Email): 54324
- **Migrations**: SQL migrations in `supabase/migrations/`
- **Seed Data**: `supabase/seed.sql`

## Deployment & Distribution

### Target Platform(s)
- **Production**: Vercel (serverless deployment)
- **Development**:
  - Next.js dev server (frontend)
  - Supabase local instance (backend)

### Distribution Method
- **Web Application**: URL-based access
- **Progressive Web App**: Future consideration

### Installation Requirements
**Development**:
- Node.js 18+
- pnpm
- Docker (for Supabase local)
- Supabase CLI

**Production**:
- Modern web browser
- Internet connection

### Update Mechanism
- Vercel automatic deployments on git push
- Database migrations via Supabase CLI

## Technical Requirements & Constraints

### Performance Requirements
- **Initial Load**: < 3 seconds on 3G connection
- **Time to Interactive**: < 5 seconds
- **Server Response**: < 500ms for API calls
- **Database Queries**: < 100ms for simple reads

### Compatibility Requirements
- **Browser Support**: Last 2 versions of modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS 12+, Android 8+
- **Responsive**: 320px - 2560px viewport widths
- **Database**: PostgreSQL 17 (Supabase requirement)

### Security & Compliance
- **Authentication**:
  - JWT tokens with 1-hour expiry
  - Refresh token rotation
  - Secure cookie settings (httpOnly, sameSite)
- **Data Protection**:
  - Row Level Security (RLS) in PostgreSQL
  - User data isolation
  - Password hashing (Supabase Auth)
- **HTTPS**: Required in production (Vercel)
- **Environment Variables**: Sensitive data not committed to git

### Scalability & Reliability
- **Expected Load**:
  - Initial: < 100 concurrent users
  - Growth: 1000+ users over 6 months
- **Database**:
  - Supabase connection pooling
  - Optimized queries with indexes
- **Serverless**: Auto-scaling via Vercel

## Technical Decisions & Rationale

### Decision Log

1. **Next.js 15 App Router over Pages Router**:
   - **Why**: Server Components reduce client bundle size, improve SEO, and simplify data fetching
   - **Trade-offs**: Learning curve for RSC patterns, but better long-term maintainability
   - **Alternatives**: Pages Router (legacy), Remix, Astro

2. **Supabase over Custom Backend**:
   - **Why**:
     - Built-in authentication, real-time, and storage
     - PostgreSQL with Row Level Security
     - Local development environment
     - Fast iteration without backend code
   - **Trade-offs**: Vendor lock-in, but migration path exists via PostgreSQL dumps
   - **Alternatives**: Firebase, custom Node.js API, Prisma + raw PostgreSQL

3. **Server Actions over API Routes**:
   - **Why**:
     - Type-safe mutations
     - Automatic CSRF protection
     - Progressive enhancement
     - No need for separate API layer
   - **Trade-offs**: Requires React Server Components understanding
   - **Alternatives**: API Routes, tRPC, GraphQL

4. **Tailwind CSS over CSS-in-JS**:
   - **Why**:
     - Utility-first approach matches component-driven development
     - Zero runtime cost
     - Excellent IntelliSense support
     - Responsive design utilities
   - **Trade-offs**: Learning curve for utility classes
   - **Alternatives**: CSS Modules, styled-components, Emotion

5. **pnpm over npm/yarn**:
   - **Why**:
     - Faster installs with content-addressable storage
     - Strict dependency resolution
     - Disk space efficiency
   - **Trade-offs**: Less common than npm, but growing adoption
   - **Alternatives**: npm, yarn, bun

6. **Vercel Deployment**:
   - **Why**:
     - Native Next.js support
     - Automatic HTTPS and CDN
     - Preview deployments
     - Serverless functions
   - **Trade-offs**: Cost at scale, but free tier sufficient initially
   - **Alternatives**: Netlify, AWS Amplify, self-hosted

## Known Limitations

### Current Limitations (現在の制限)

- **Supabase Realtime**: 
  - Infrastructure ready but not yet implemented in UI
  - Free tier: 500 concurrent connections - upgrade needed for scaling
  
- **Image Support**: 
  - Not in MVP (実装済みMVPには含まれず)
  - Supabase Storage infrastructure ready for future implementation
  
- **Offline Support**: 
  - No offline-first architecture - requires internet connection
  - Future consideration: Service Worker + IndexedDB
  
- **Analytics**: 
  - No built-in analytics in current implementation
  - Future integration needed (Vercel Analytics, Plausible, etc.)
  
- **Internationalization**: 
  - Currently Japanese-only UI
  - i18n infrastructure not yet implemented
  - All UI strings are hardcoded in Japanese

### Completed in MVP (MVPで完了)

- ✅ **Testing Coverage**: Comprehensive unit and integration tests implemented
- ✅ **Authentication**: Full auth flow with Supabase Auth
- ✅ **Mobile Responsiveness**: Hamburger menu and responsive design
- ✅ **CRUD Operations**: Complete coffee evaluation CRUD
- ✅ **Search & Sort**: Functional search and sort features
