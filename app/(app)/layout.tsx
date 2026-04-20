import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { NavBar } from './_components/nav-bar'
import { Footer } from './_components/footer'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--paper)] border-b border-[var(--rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <NavBar userEmail={user?.email} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
