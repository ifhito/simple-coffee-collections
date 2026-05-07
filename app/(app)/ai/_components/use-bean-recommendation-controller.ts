import { useCallback, useState } from 'react'

export type BeanRecommendationViewModel = {
  evaluationId: string
  beanName: string
  beanType: string | null
  roastLevel: string | null
  shopName: string | null
  reason: string
  howToRecommend: string
  caution: string | null
  confidence: 'high' | 'medium' | 'low'
}

export type BeanRecommendationResultViewModel = {
  summary: string
  recommendations: BeanRecommendationViewModel[]
}

type ApiResponse = {
  data?: BeanRecommendationResultViewModel
  error?: string
}

export function useBeanRecommendationController() {
  const [friendPreferenceText, setFriendPreferenceText] = useState('')
  const [limit, setLimit] = useState(3)
  const [isRecommending, setIsRecommending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BeanRecommendationResultViewModel | null>(null)

  const handleRecommend = useCallback(async () => {
    const trimmed = friendPreferenceText.trim()
    if (!trimmed) {
      setError('友達の好みを入力してください')
      return
    }

    setIsRecommending(true)
    setError(null)

    try {
      const response = await fetch('/api/agent/bean-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendPreferenceText: trimmed, limit }),
      })
      const json = (await response.json()) as ApiResponse

      if (!response.ok || json.error) {
        setError(json.error ?? 'おすすめの生成に失敗しました')
        return
      }

      setResult(json.data ?? { summary: '', recommendations: [] })
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setIsRecommending(false)
    }
  }, [friendPreferenceText, limit])

  return {
    friendPreferenceText,
    setFriendPreferenceText,
    limit,
    setLimit,
    isRecommending,
    error,
    result,
    handleRecommend,
    isRecommendDisabled: isRecommending || friendPreferenceText.trim().length === 0,
  }
}
