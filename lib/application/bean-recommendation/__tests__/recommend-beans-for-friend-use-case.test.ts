import { RecommendBeansForFriendUseCase } from '../recommend-beans-for-friend-use-case'
import { ok, fail } from '@/lib/domain/shared/result'
import type { BeanRecommendationExecutor } from '@/lib/application/ports/bean-recommendation-executor'
import type { BeanRecommendationRepository, RatedBeanForRecommendation } from '@/lib/domain/bean-recommendation'

const ratedBean: RatedBeanForRecommendation = {
  evaluationId: 'bean-1',
  beanName: 'Ethiopia Natural',
  beanType: 'エチオピア',
  roastLevel: '浅煎り',
  shopName: 'Coffee Shop',
  acidity: 8,
  bitterness: 3,
  aroma: 9,
  overallRating: 9,
  notes: 'フルーティーで華やか',
  createdAt: '2026-04-01T00:00:00.000Z',
}

describe('RecommendBeansForFriendUseCase', () => {
  it('ranks user rated beans before asking executor to write recommendations', async () => {
    const repository: BeanRecommendationRepository = {
      findRatedBeansByUserId: jest.fn().mockResolvedValue(ok([ratedBean])),
    }
    const executor: BeanRecommendationExecutor = {
      recommend: jest.fn().mockResolvedValue({
        success: true,
        data: {
          summary: '苦味控えめの豆を選びました。',
          recommendations: [
            {
              evaluationId: 'bean-1',
              beanName: 'Ethiopia Natural',
              beanType: 'エチオピア',
              roastLevel: '浅煎り',
              shopName: 'Coffee Shop',
              reason: '苦味が低く香りが高いためです。',
              howToRecommend: 'フルーティーで飲みやすいよ、と伝える。',
              caution: null,
              confidence: 'high',
            },
          ],
        },
      }),
    }
    const useCase = new RecommendBeansForFriendUseCase(repository, executor)

    const result = await useCase.execute({
      userId: 'user-1',
      model: {} as never,
      friendPreferenceText: '苦いのが苦手でフルーティーな豆が好きそう',
      limit: 3,
      now: new Date('2026-05-01T00:00:00.000Z'),
    })

    expect('error' in result).toBe(false)
    expect(repository.findRatedBeansByUserId).toHaveBeenCalledWith('user-1', 100)
    expect(executor.recommend).toHaveBeenCalledWith(
      expect.objectContaining({
        friendPreferenceText: '苦いのが苦手でフルーティーな豆が好きそう',
        limit: 3,
        candidates: [
          expect.objectContaining({
            bean: expect.objectContaining({ evaluationId: 'bean-1' }),
            confidence: 'high',
          }),
        ],
      })
    )
  })

  it('returns an empty recommendation message when the user has no rated beans', async () => {
    const repository: BeanRecommendationRepository = {
      findRatedBeansByUserId: jest.fn().mockResolvedValue(ok([])),
    }
    const executor: BeanRecommendationExecutor = {
      recommend: jest.fn(),
    }
    const useCase = new RecommendBeansForFriendUseCase(repository, executor)

    const result = await useCase.execute({
      userId: 'user-1',
      model: {} as never,
      friendPreferenceText: 'おすすめある？',
    })

    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.data.recommendations).toEqual([])
      expect(result.data.summary).toContain('まだ評価済みの豆がない')
    }
    expect(executor.recommend).not.toHaveBeenCalled()
  })

  it('returns repository errors as user-facing errors', async () => {
    const repository: BeanRecommendationRepository = {
      findRatedBeansByUserId: jest.fn().mockResolvedValue(fail(new Error('db failed'))),
    }
    const executor: BeanRecommendationExecutor = {
      recommend: jest.fn(),
    }
    const useCase = new RecommendBeansForFriendUseCase(repository, executor)

    const result = await useCase.execute({
      userId: 'user-1',
      model: {} as never,
      friendPreferenceText: 'おすすめある？',
    })

    expect(result).toEqual({ error: 'おすすめ候補の取得に失敗しました' })
  })
})
