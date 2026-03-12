type ShopCardProps = {
  name: string
}

export function ShopCard({ name }: ShopCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <h3 className="text-base font-medium text-neutral-900">{name}</h3>
    </div>
  )
}
