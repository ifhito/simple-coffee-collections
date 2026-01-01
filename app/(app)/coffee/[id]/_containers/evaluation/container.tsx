import { notFound } from 'next/navigation'
import { getCoffeeEvaluation } from '@/lib/api/coffee'
import { createClient } from '@/lib/supabase/server'
import { EvaluationDetailView } from '@/app/(app)/coffee/[id]/_components/evaluation/view'

type CoffeeEvaluationContainerProps = {
  params: { id: string }
}

export async function CoffeeEvaluationContainer({ params }: CoffeeEvaluationContainerProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const evaluation = await getCoffeeEvaluation(params.id)

  if (!evaluation) {
    notFound()
  }

  return <EvaluationDetailView evaluation={evaluation} currentUserId={user?.id} />
}
