import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/auth'

export const metadata: Metadata = {
  title: 'コーヒー評価一覧',
  description: 'お気に入りのコーヒー評価を一覧で確認できます。',
}

export default async function CoffeeListPage() {
  try {
    await getCurrentUser()
    redirect('/coffee/my')
  } catch {
    redirect('/coffee/community')
  }
}
