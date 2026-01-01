# Style and Conventions
- Language: TypeScript with `strict` on; `allowJs` true but primary TS/TSX. JSX preserved; moduleResolution bundler.
- Paths: `@/*` alias to repo root.
- Framework patterns: Next.js App Router; follow file-based routing in `app/`; server/client components per Next 15. Tailwind for styling.
- Linting: ESLint extends `next/core-web-vitals`; run `pnpm lint`.
- Testing: Jest + jsdom + RTL (`@testing-library/react`, `jest-dom`, `user-event`). Tests live in `__tests__/` mirroring features; use fixtures/util helpers.
- Formatting: No explicit formatter config found; follow Next/TypeScript defaults and Tailwind utility ordering.
- Supabase: Use `@supabase/supabase-js` + `@supabase/ssr`; envs from `.env.local`/`.env.example`; start local service with Supabase CLI.