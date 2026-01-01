import type { ReactNode } from 'react'

type EmptyStateProps = {
  message: string
  action?: ReactNode
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-700 animate-fade-in">
      <p className="mb-3">{message}</p>
      {action ? <div className="flex justify-center">{action}</div> : null}
    </div>
  )
}
