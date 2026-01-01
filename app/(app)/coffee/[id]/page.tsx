import type { Metadata } from 'next'
import { CoffeeEvaluationContainer } from './_containers/evaluation/container'

export const metadata: Metadata = {
  title: 'コーヒー評価詳細',
  description: 'コーヒー評価の詳細を表示します。',
}

export default async function CoffeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <CoffeeEvaluationContainer params={{ id }} />
    </section>
  )
}
