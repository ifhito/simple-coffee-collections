import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export const metadata: Metadata = {
  title: 'プロフィール',
  description: 'プロフィール情報を更新します。',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-serif-display text-2xl text-[var(--ink)]">プロフィール</h1>
        <p className="text-sm text-[var(--ink-3)]">表示名と自己紹介を更新できます。</p>
      </header>
      <ProfileForm
        initialDisplayName={profile?.display_name ?? ''}
        initialBio={profile?.bio ?? ''}
      />
    </section>
  )
}
