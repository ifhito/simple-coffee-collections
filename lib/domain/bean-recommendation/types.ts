export type TastePreference = 'low' | 'medium' | 'high' | 'unknown'
export type RoastPreference = 'light' | 'medium' | 'dark' | 'unknown'
export type RecommendationConfidence = 'high' | 'medium' | 'low'

export type FriendPreference = {
  acidityPreference: TastePreference
  bitternessPreference: TastePreference
  aromaPreference: TastePreference
  roastPreference: RoastPreference
  wantsBeginnerFriendly: boolean
  wantsFruity: boolean
  wantsMilkFriendly: boolean
  wantsGiftFriendly: boolean
  positiveKeywords: string[]
  avoidKeywords: string[]
  isVague: boolean
}

export type RatedBeanForRecommendation = {
  evaluationId: string
  beanName: string
  beanType: string | null
  roastLevel: string | null
  shopName: string | null
  acidity: number
  bitterness: number
  aroma: number
  overallRating: number
  notes: string | null
  createdAt: string
}

export type ScoredBeanRecommendationCandidate = {
  bean: RatedBeanForRecommendation
  score: number
  confidence: RecommendationConfidence
}

export type BeanRecommendation = {
  evaluationId: string
  beanName: string
  beanType: string | null
  roastLevel: string | null
  shopName: string | null
  reason: string
  howToRecommend: string
  caution: string | null
  confidence: RecommendationConfidence
}

export type BeanRecommendationOutput = {
  summary: string
  recommendations: BeanRecommendation[]
}
