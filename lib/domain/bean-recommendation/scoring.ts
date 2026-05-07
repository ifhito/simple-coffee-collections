import type {
  FriendPreference,
  RatedBeanForRecommendation,
  RecommendationConfidence,
  ScoredBeanRecommendationCandidate,
  TastePreference,
} from './types'

const FRUITY_KEYWORDS = [
  'フルーティー',
  '果実',
  'ベリー',
  'シトラス',
  '柑橘',
  '華やか',
  'ナチュラル',
  'エチオピア',
]

const BEGINNER_KEYWORDS = ['初心者', 'はじめて', '初めて', '飲みやすい', '苦手']
const MILK_KEYWORDS = ['ミルク', 'カフェオレ', 'ラテ', '牛乳']
const GIFT_KEYWORDS = ['プレゼント', 'ギフト', '贈り物', '手土産']

function includesAny(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()))
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase()
}

function keywordList(text: string, candidates: readonly string[]): string[] {
  return candidates.filter((keyword) => text.includes(keyword.toLowerCase()))
}

export function extractFriendPreference(friendPreferenceText: string): FriendPreference {
  const text = normalizeText(friendPreferenceText)
  const wantsFruity = includesAny(text, FRUITY_KEYWORDS)
  const wantsBeginnerFriendly = includesAny(text, BEGINNER_KEYWORDS)
  const wantsMilkFriendly = includesAny(text, MILK_KEYWORDS)
  const wantsGiftFriendly = includesAny(text, GIFT_KEYWORDS)

  const bitternessPreference: TastePreference = includesAny(text, ['苦いのは苦手', '苦味少なめ', '苦味控えめ', '苦くない'])
    ? 'low'
    : includesAny(text, ['苦味', 'ビター', '深煎り'])
      ? 'high'
      : 'unknown'
  const acidityPreference: TastePreference = includesAny(text, ['酸味苦手', '酸っぱいのは苦手'])
    ? 'low'
    : includesAny(text, ['酸味', 'フルーティー', 'シトラス', '柑橘'])
      ? 'high'
      : 'unknown'
  const aromaPreference: TastePreference = includesAny(text, ['香り', 'アロマ', '華やか', 'フルーティー'])
    ? 'high'
    : 'unknown'

  const roastPreference = includesAny(text, ['浅煎り', 'ライトロースト'])
    ? 'light'
    : includesAny(text, ['深煎り', 'ダークロースト'])
      ? 'dark'
      : includesAny(text, ['中煎り', 'ミディアム'])
        ? 'medium'
        : 'unknown'

  const positiveKeywords = keywordList(text, [
    ...FRUITY_KEYWORDS,
    '甘い',
    'チョコ',
    'ナッツ',
    'すっきり',
    'コク',
  ])
  const avoidKeywords = keywordList(text, ['苦い', '酸っぱい', '深煎り', '浅煎り'])

  return {
    acidityPreference,
    bitternessPreference,
    aromaPreference,
    roastPreference,
    wantsBeginnerFriendly,
    wantsFruity,
    wantsMilkFriendly,
    wantsGiftFriendly,
    positiveKeywords,
    avoidKeywords,
    isVague:
      acidityPreference === 'unknown' &&
      bitternessPreference === 'unknown' &&
      aromaPreference === 'unknown' &&
      roastPreference === 'unknown' &&
      !wantsBeginnerFriendly &&
      !wantsFruity &&
      !wantsMilkFriendly &&
      !wantsGiftFriendly,
  }
}

function targetValue(preference: TastePreference): number | null {
  switch (preference) {
    case 'low':
      return 3
    case 'medium':
      return 5.5
    case 'high':
      return 8
    case 'unknown':
      return null
  }
}

function similarity(value: number, target: number): number {
  return Math.max(0, Math.min(1, 1 - Math.abs(value - target) / 9))
}

function calculateTasteMatchScore(bean: RatedBeanForRecommendation, preference: FriendPreference): number {
  const dimensions = [
    {
      value: bean.acidity,
      target: targetValue(preference.acidityPreference),
      weight: preference.acidityPreference === 'unknown' ? 0 : 1,
    },
    {
      value: bean.bitterness,
      target: targetValue(preference.bitternessPreference),
      weight: preference.bitternessPreference === 'unknown' ? 0 : 1.5,
    },
    {
      value: bean.aroma,
      target: targetValue(preference.aromaPreference),
      weight: preference.aromaPreference === 'unknown' ? 0 : 1,
    },
  ].filter((dimension) => dimension.target !== null && dimension.weight > 0)

  if (dimensions.length === 0) {
    return 0.5
  }

  const weightedScore = dimensions.reduce(
    (sum, dimension) => sum + similarity(dimension.value, dimension.target as number) * dimension.weight,
    0
  )
  const totalWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0)

  return weightedScore / totalWeight
}

function searchableBeanText(bean: RatedBeanForRecommendation): string {
  return [bean.beanName, bean.beanType, bean.roastLevel, bean.shopName, bean.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function calculateContextMatchScore(bean: RatedBeanForRecommendation, preference: FriendPreference): number {
  let score = 0.5
  const text = searchableBeanText(bean)

  if (preference.wantsBeginnerFriendly) {
    if (bean.bitterness <= 5 && bean.overallRating >= 7) score += 0.15
    if (bean.bitterness >= 8) score -= 0.2
    if (bean.acidity >= 9) score -= 0.05
  }

  if (preference.wantsFruity && includesAny(text, FRUITY_KEYWORDS)) {
    score += 0.15
  }

  if (preference.wantsMilkFriendly) {
    if (bean.bitterness >= 5 && bean.aroma >= 6) score += 0.1
    if (bean.roastLevel?.includes('深') || bean.roastLevel?.includes('dark')) score += 0.08
    if (bean.acidity >= 8) score -= 0.05
  }

  if (preference.wantsGiftFriendly) {
    if (bean.overallRating >= 8) score += 0.1
    if (bean.bitterness <= 7 && bean.acidity <= 8) score += 0.05
  }

  for (const keyword of preference.positiveKeywords) {
    if (text.includes(keyword.toLowerCase())) score += 0.05
  }

  for (const keyword of preference.avoidKeywords) {
    if (text.includes(keyword.toLowerCase())) score -= 0.1
  }

  return Math.max(0, Math.min(1, score))
}

function calculateRecencyScore(createdAt: string, now: Date): number {
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 0
  const ageDays = Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, 1 - ageDays / 365)
}

function dedupeBeans(beans: RatedBeanForRecommendation[]): RatedBeanForRecommendation[] {
  const bestByKey = new Map<string, RatedBeanForRecommendation>()

  for (const bean of beans) {
    const key = [bean.beanName.trim().toLowerCase(), bean.roastLevel ?? '', bean.shopName ?? ''].join(':')
    const current = bestByKey.get(key)
    if (!current || bean.overallRating > current.overallRating) {
      bestByKey.set(key, bean)
    }
  }

  return Array.from(bestByKey.values())
}

export function confidenceFromScore(score: number): RecommendationConfidence {
  if (score >= 0.78) return 'high'
  if (score >= 0.6) return 'medium'
  return 'low'
}

export function rankBeansForFriend(input: {
  beans: RatedBeanForRecommendation[]
  preference: FriendPreference
  now?: Date
}): ScoredBeanRecommendationCandidate[] {
  const now = input.now ?? new Date()
  const beans = dedupeBeans(input.beans)
  const recommendableBeans = beans.filter((bean) => bean.overallRating >= 7)
  const candidates = recommendableBeans.length >= 3 ? recommendableBeans : beans

  return candidates
    .map((bean) => {
      const overallRatingScore = bean.overallRating / 10
      const contextMatchScore = calculateContextMatchScore(bean, input.preference)
      const recencyScore = calculateRecencyScore(bean.createdAt, now)
      const score = input.preference.isVague
        ? overallRatingScore * 0.7 + (bean.notes ? 0.2 : 0.05) + recencyScore * 0.1
        : calculateTasteMatchScore(bean, input.preference) * 0.5 +
          overallRatingScore * 0.35 +
          contextMatchScore * 0.1 +
          recencyScore * 0.05

      return {
        bean,
        score,
        confidence: confidenceFromScore(score),
      }
    })
    .sort((a, b) => b.score - a.score)
}
