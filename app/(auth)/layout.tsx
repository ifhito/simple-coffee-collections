import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="font-serif-display text-center text-3xl text-[var(--ink)]">
            Coffee Collections
          </h1>
          <p className="mt-2 text-center text-sm text-[var(--ink-3)]">
            あなたのコーヒー体験を記録しよう
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
