import type { RatedBeanForRecommendation } from './types'
import type { Result } from '@/lib/domain/shared/result'

export type BeanRecommendationRepository = {
  findRatedBeansByUserId(userId: string, limit?: number): Promise<Result<RatedBeanForRecommendation[], Error>>
}
