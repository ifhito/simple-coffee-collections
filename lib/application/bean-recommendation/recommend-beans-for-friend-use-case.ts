import type { BeanRecommendationOutput, ScoredBeanRecommendationCandidate } from '@/lib/domain/bean-recommendation'
import { extractFriendPreference, rankBeansForFriend } from '@/lib/domain/bean-recommendation'
import type { BeanRecommendationExecutor } from '@/lib/application/ports'
import type { OcrModel } from '@/lib/application/ports'
import type { BeanRecommendationRepository } from '@/lib/domain/bean-recommendation'

export type RecommendBeansForFriendInput = {
  userId: string
  model: OcrModel
  friendPreferenceText: string
  limit?: number
  now?: Date
}

export type RecommendBeansForFriendResult =
  | { success: true; data: BeanRecommendationOutput; candidates: ScoredBeanRecommendationCandidate[] }
  | { error: string }

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) return 3
  if (!Number.isFinite(limit)) return 3
  return Math.min(5, Math.max(1, Math.trunc(limit)))
}

export class RecommendBeansForFriendUseCase {
  constructor(
    private readonly repository: BeanRecommendationRepository,
    private readonly executor: BeanRecommendationExecutor
  ) {}

  async execute(input: RecommendBeansForFriendInput): Promise<RecommendBeansForFriendResult> {
    const beansResult = await this.repository.findRatedBeansByUserId(input.userId, 100)
    if (!beansResult.ok) {
      return { error: 'おすすめ候補の取得に失敗しました' }
    }

    if (beansResult.value.length === 0) {
      return {
        success: true,
        candidates: [],
        data: {
          summary: 'まだ評価済みの豆がないため、おすすめを作れません。まずは飲んだ豆をいくつか評価してみてください。',
          recommendations: [],
        },
      }
    }

    const limit = normalizeLimit(input.limit)
    const friendPreference = extractFriendPreference(input.friendPreferenceText)
    const rankedCandidates = rankBeansForFriend({
      beans: beansResult.value,
      preference: friendPreference,
      now: input.now,
    })
    const candidates = rankedCandidates.slice(0, Math.max(limit, 8))

    const result = await this.executor.recommend({
      model: input.model,
      friendPreferenceText: input.friendPreferenceText,
      friendPreference,
      candidates,
      limit,
    })

    if ('error' in result) {
      return { error: result.error }
    }

    return {
      success: true,
      data: result.data,
      candidates,
    }
  }
}
