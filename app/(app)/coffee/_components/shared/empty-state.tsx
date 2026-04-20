import type { ReactNode } from 'react'

type EmptyStateProps = {
  message: string
  action?: ReactNode
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="rounded-sm border border-dashed border-[var(--rule)] bg-[var(--background-2)] p-8 text-center animate-fade-in">
      <p className="mb-4 text-sm text-[var(--ink-3)]">{message}</p>
      {action ? <div className="flex justify-center">{action}</div> : null}
    </div>
  )
}
