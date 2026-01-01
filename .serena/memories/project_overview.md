# Project Overview
- Purpose: Simple Coffee Collections is a Next.js 15 App Router app for logging and reviewing coffee bean evaluations (ratings, notes, bean info, shop, sharing, search/sort).
- Tech stack: Next.js 15 (App Router), TypeScript (strict), Tailwind CSS, Supabase (auth + DB), Jest + React Testing Library.
- Structure: `app/` pages/layouts, `components/ui` shared UI, `components/features` feature views, `lib/` utilities (`supabase/`, `types/`, `utils/`), `__tests__/` tests (+ fixtures/utils), `scripts/`, `docs/` for feature docs. Path alias `@/*` to repo root.
- Data: Supabase local dev via Supabase CLI; env templates in `.env.example`; sample CSVs `bean_batches_rows.csv`, `shops_rows.csv`.
- Notes: README (Japanese) lists features and instructions; CLAUDE.md exists; ESLint uses `next/core-web-vitals`.