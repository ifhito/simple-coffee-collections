'use client'

import { useTransition } from 'react'
import { deleteCoffeeEvaluation } from '@/lib/actions/coffee'

type DeleteCoffeeButtonProps = {
  evaluationId: string
}

export function DeleteCoffeeButton({ evaluationId }: DeleteCoffeeButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const confirmed = window.confirm('本当に削除しますか？')
    if (!confirmed) return

    startTransition(async () => {
      await deleteCoffeeEvaluation(evaluationId)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
    
  >
      {isPending ? '削除中...' : 'この評価を削除'}
    </button>
  )
}
