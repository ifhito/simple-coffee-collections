import { createClient } from '@/lib/supabase/server'
import { ShopCard } from './shop-card'

type ShopListProps = {
  search?: string
}

export async function ShopList({ search }: ShopListProps) {
  const supabase = await createClient()

  let query = supabase.from('shops').select('id, name').order('name', { ascending: true })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: shops, error } = await query.limit(50)

  if (error) {
    return <p className="text-sm text-red-600">店舗の取得に失敗しました</p>
  }

  if (!shops || shops.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        {search ? `「${search}」に一致する店舗はありません` : '登録されている店舗はありません'}
      </p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <ShopCard key={shop.id} name={shop.name} />
      ))}
    </div>
  )
}
