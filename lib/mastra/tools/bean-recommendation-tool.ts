import { z } from 'zod'

export const BeanRecommendationOutputSchema = z.object({
  summary: z.string().min(1),
  recommendations: z.array(
    z.object({
      evaluationId: z.string().min(1),
      reason: z.string().min(1),
      howToRecommend: z.string().min(1),
      caution: z.string().nullable(),
      confidence: z.enum(['high', 'medium', 'low']),
    })
  ),
})

export type BeanRecommendationLlmOutput = z.infer<typeof BeanRecommendationOutputSchema>
