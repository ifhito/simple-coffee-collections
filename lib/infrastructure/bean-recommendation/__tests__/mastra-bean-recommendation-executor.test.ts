jest.mock('ai', () => ({
  generateObject: jest.fn(),
}))

jest.mock('@/lib/mastra/agents/bean-recommendation-agent', () => ({
  BeanRecommendationOutputSchema: {},
  createBeanRecommendationAgent: jest.fn((model) => ({
    model,
    getInstructions: jest.fn().mockResolvedValue('instructions'),
  })),
}))

import { generateObject } from 'ai'
import { MastraBeanRecommendationExecutor } from '../mastra-bean-recommendation-executor'
import type { FriendPreference, ScoredBeanRecommendationCandidate } from '@/lib/domain/bean-recommendation'

const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>

const friendPreference: FriendPreference = {
  acidityPreference: 'high',
  bitternessPreference: 'low',
  aromaPreference: 'high',
  roastPreference: 'light',
  wantsBeginnerFriendly: false,
  wantsFruity: true,
  wantsMilkFriendly: false,
  wantsGiftFriendly: false,
  positiveKeywords: ['フルーティー'],
  avoidKeywords: ['苦い'],
  isVague: false,
}

const candidates: ScoredBeanRecommendationCandidate[] = [
  {
    bean: {
      evaluationId: 'bean-1',
      beanName: 'Ethiopia Natural',
      beanType: 'エチオピア',
      roastLevel: '浅煎り',
      shopName: 'Coffee Shop',
      acidity: 8,
      bitterness: 3,
      aroma: 9,
      overallRating: 9,
      notes: 'フルーティーで華やか。'.repeat(20),
      createdAt: '2026-04-01T00:00:00.000Z',
    },
    score: 0.91,
    confidence: 'high',
  },
]

describe('MastraBeanRecommendationExecutor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('merges app-owned candidate facts with LLM generated reasons', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        summary: 'フルーティーな豆を選びました。',
        recommendations: [
          {
            evaluationId: 'bean-1',
            reason: '酸味と香りが高く、苦味が控えめです。',
            howToRecommend: '果実感があって飲みやすいよ、と伝える。',
            caution: null,
            confidence: 'high',
          },
        ],
      },
    } as never)

    const executor = new MastraBeanRecommendationExecutor()
    const result = await executor.recommend({
      model: {} as never,
      friendPreferenceText: '苦味控えめでフルーティー',
      friendPreference,
      candidates,
      limit: 3,
    })

    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.data.recommendations).toEqual([
        expect.objectContaining({
          evaluationId: 'bean-1',
          beanName: 'Ethiopia Natural',
          shopName: 'Coffee Shop',
          reason: '酸味と香りが高く、苦味が控えめです。',
        }),
      ])
    }
  })

  it('drops recommendations with IDs that are not in candidates', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        summary: '候補から選びました。',
        recommendations: [
          {
            evaluationId: 'unknown-bean',
            reason: '候補外です。',
            howToRecommend: '伝え方',
            caution: null,
            confidence: 'high',
          },
          {
            evaluationId: 'bean-1',
            reason: '候補内です。',
            howToRecommend: '伝え方',
            caution: null,
            confidence: 'medium',
          },
        ],
      },
    } as never)

    const executor = new MastraBeanRecommendationExecutor()
    const result = await executor.recommend({
      model: {} as never,
      friendPreferenceText: 'おすすめ',
      friendPreference,
      candidates,
      limit: 3,
    })

    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.data.recommendations).toHaveLength(1)
      expect(result.data.recommendations[0]?.evaluationId).toBe('bean-1')
    }
  })

  it('truncates candidate notes before sending them to the LLM', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        summary: 'おすすめです。',
        recommendations: [],
      },
    } as never)

    const executor = new MastraBeanRecommendationExecutor()
    await executor.recommend({
      model: {} as never,
      friendPreferenceText: 'おすすめ',
      friendPreference,
      candidates,
      limit: 3,
    })

    expect(mockGenerateObject).toHaveBeenCalled()
    const firstCall = mockGenerateObject.mock.calls[0]?.[0]
    expect(firstCall).toBeDefined()
    const messages = firstCall?.messages ?? []
    const payload = JSON.parse(messages[1]?.content as string)
    expect(payload.candidates[0].notes.length).toBeLessThanOrEqual(160)
  })

  it('maps LLM errors to an error result', async () => {
    mockGenerateObject.mockRejectedValue(new Error('quota exceeded'))

    const executor = new MastraBeanRecommendationExecutor()
    const result = await executor.recommend({
      model: {} as never,
      friendPreferenceText: 'おすすめ',
      friendPreference,
      candidates,
      limit: 3,
    })

    expect(result).toEqual({ error: '豆推薦の生成に失敗しました: quota exceeded' })
  })
})
