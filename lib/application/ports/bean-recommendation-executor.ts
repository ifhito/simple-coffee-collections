import type {
  BeanRecommendationOutput,
  FriendPreference,
  ScoredBeanRecommendationCandidate,
} from '@/lib/domain/bean-recommendation'
import type { OcrModel } from './llm-model-factory'

export type BeanRecommendationExecutorInput = {
  model: OcrModel
  friendPreferenceText: string
  friendPreference: FriendPreference
  candidates: ScoredBeanRecommendationCandidate[]
  limit: number
}

export type BeanRecommendationExecutionResult =
  | { success: true; data: BeanRecommendationOutput }
  | { error: string }

export type BeanRecommendationExecutor = {
  recommend(input: BeanRecommendationExecutorInput): Promise<BeanRecommendationExecutionResult>
}
