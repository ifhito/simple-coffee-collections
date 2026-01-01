# Simple Coffee Collections

コーヒー豆の評価記録アプリ

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Jest + React Testing Library (Testing)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase CLI

### Installation

```bash
# Install dependencies
pnpm install

# Start Supabase locally
supabase start

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Development

### Running Tests

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Project Structure

```
app/              # Next.js App Router pages
components/       # React components
  ui/            # Shared UI components
  features/      # Feature-specific components
lib/             # Utilities and helpers
  supabase/     # Supabase client and utilities
  types/        # TypeScript type definitions
  utils/        # Utility functions
__tests__/       # Test files
  utils/        # Test utilities
  fixtures/     # Test fixtures
```

## Features

- ✅ User authentication (Supabase Auth)
- ✅ User profiles
- ✅ Coffee bean evaluation records (CRUD)
  - Rating: Acidity, Bitterness, Overall, Aroma (1-5 scale)
  - Info: Bean name, type, roast level, shop, date
  - Notes: Free-text tasting notes
- ✅ Search functionality
- ✅ Sorting
- ✅ Card-based display
- ✅ Public/private sharing
- ✅ Responsive design

## Documentation

- 詳細: `docs/coffee-evaluation.md`

## Future Features

- Statistics & insights
- Data export (CSV/JSON)

## License

MIT
