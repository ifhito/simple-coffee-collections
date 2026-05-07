import { generateObject } from 'ai'
import type { BeanRecommendationExecutor, BeanRecommendationExecutionResult, OcrModel } from '@/lib/application/ports'
import type { BeanRecommendation, ScoredBeanRecommendationCandidate } from '@/lib/domain/bean-recommendation'
import { createBeanRecommendationAgent, BeanRecommendationOutputSchema } from '@/lib/mastra/agents/bean-recommendation-agent'

type MastraGenerateModel = Parameters<typeof generateObject>[0]['model']

function sanitizedNotes(notes: string | null): string | null {
  if (!notes) return null
  return notes.replace(/\s+/g, ' ').slice(0, 160)
}

function candidatePayload(candidates: ScoredBeanRecommendationCandidate[]) {
  return candidates.map((candidate) => ({
    evaluationId: candidate.bean.evaluationId,
    beanName: candidate.bean.beanName,
    beanType: candidate.bean.beanType,
    roastLevel: candidate.bean.roastLevel,
    shopName: candidate.bean.shopName,
    acidity: candidate.bean.acidity,
    bitterness: candidate.bean.bitterness,
    aroma: candidate.bean.aroma,
    overallRating: candidate.bean.overallRating,
    notes: sanitizedNotes(candidate.bean.notes),
    score: Number(candidate.score.toFixed(3)),
    confidence: candidate.confidence,
  }))
}

function mergeLlmRecommendation(
  recommendation: { evaluationId: string; reason: string; howToRecommend: string; caution: string | null; confidence: BeanRecommendation['confidence'] },
  candidates: ScoredBeanRecommendationCandidate[]
): BeanRecommendation | null {
  const candidate = candidates.find((item) => item.bean.evaluationId === recommendation.evaluationId)
  if (!candidate) return null

  return {
    evaluationId: candidate.bean.evaluationId,
    beanName: candidate.bean.beanName,
    beanType: candidate.bean.beanType,
    roastLevel: candidate.bean.roastLevel,
    shopName: candidate.bean.shopName,
    reason: recommendation.reason,
    howToRecommend: recommendation.howToRecommend,
    caution: recommendation.caution,
    confidence: recommendation.confidence,
  }
}

export class MastraBeanRecommendationExecutor implements BeanRecommendationExecutor {
  async recommend(input: Parameters<BeanRecommendationExecutor['recommend']>[0]): Promise<BeanRecommendationExecutionResult> {
    const agent = createBeanRecommendationAgent(input.model as OcrModel)

    try {
      const instructions = await agent.getInstructions()
      const result = await generateObject({
        model: agent.model as MastraGenerateModel,
        schema: BeanRecommendationOutputSchema,
        messages: [
          {
            role: 'system' as const,
            content: typeof instructions === 'string' ? instructions : '',
          },
          {
            role: 'user' as const,
            content: JSON.stringify(
              {
                task: '友達の好みに合いそうな豆を候補から選び、紹介理由と伝え方を作成してください。',
                friendPreferenceText: input.friendPreferenceText,
                structuredPreference: input.friendPreference,
                limit: input.limit,
                candidates: candidatePayload(input.candidates),
              },
              null,
              2
            ),
          },
        ],
      })

      const recommendations = result.object.recommendations
        .slice(0, input.limit)
        .map((recommendation) => mergeLlmRecommendation(recommendation, input.candidates))
        .filter((recommendation): recommendation is BeanRecommendation => recommendation !== null)

      return {
        success: true,
        data: {
          summary: result.object.summary,
          recommendations,
        },
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '豆推薦の生成中にエラーが発生しました'
      return { error: `豆推薦の生成に失敗しました: ${message}` }
    }
  }
}
