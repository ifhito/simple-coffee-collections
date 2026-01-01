import type { Metadata } from 'next'
import { CoffeeEvaluationContainer } from './_containers/evaluation/container'

type CoffeeDetailPageProps = {
  params: { id: string }
}

export const metadata: Metadata = {
  title: 'コーヒー評価詳細',
  description: 'コーヒー評価の詳細を表示します。',
}

export default function CoffeeDetailPage({ params }: CoffeeDetailPageProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <CoffeeEvaluationContainer params={params} />
    </section>
  )
}
