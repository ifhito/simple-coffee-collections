import type { Metadata } from 'next'
import type { RoastLevelValue } from '@/lib/mastra/tools/coffee-ocr-tool'
import type { OcrExtractedData } from '@/lib/application/ocr'
import { NewEvaluationContainer } from './_components/new-evaluation-container'

export const metadata: Metadata = {
  title: '新規コーヒー評価',
  description: 'コーヒーの評価を新規作成します。',
}

export default async function NewCoffeeEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{
    bean_name?: string
    bean_type?: string
    roast_level?: string
    shop_name?: string
    shop_address?: string
  }>
}) {
  const params = await searchParams
  const ocrPreFill: OcrExtractedData | undefined =
    params.bean_name || params.roast_level || params.shop_name
      ? {
          bean_name: params.bean_name ?? null,
          bean_type: params.bean_type ?? null,
          roast_level: (params.roast_level as RoastLevelValue) ?? null,
          shop_name: params.shop_name ?? null,
          shop_address: params.shop_address ?? null,
        }
      : undefined

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <header className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">New</p>
        <h1 className="text-2xl font-bold text-neutral-900">コーヒー評価を作成</h1>
        <p className="text-sm text-neutral-600">
          香り・酸味・苦味・総合評価をスライダーで入力し、メモを残しましょう。
        </p>
      </header>

      <NewEvaluationContainer ocrPreFill={ocrPreFill} />
    </section>
  )
}
