import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getShopRepository } from '@/lib/di/container'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q') ?? ''
  const limit = Math.min(
    parseInt(request.nextUrl.searchParams.get('limit') ?? '10', 10) || 10,
    50
  )

  if (!q.trim()) {
    return NextResponse.json([])
  }

  const repo = getShopRepository()
  const results = await repo.search(q.trim(), limit)

  return NextResponse.json(results)
}
