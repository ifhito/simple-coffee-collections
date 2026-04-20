type ShopCardProps = {
  name: string
}

export function ShopCard({ name }: ShopCardProps) {
  return (
    <div className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] p-4 transition hover:border-[var(--ink)]">
      <h3 className="font-medium text-[var(--ink)]">{name}</h3>
    </div>
  )
}
