import {
  extractFriendPreference,
  rankBeansForFriend,
  confidenceFromScore,
} from '../scoring'
import type { RatedBeanForRecommendation } from '../types'

function bean(overrides: Partial<RatedBeanForRecommendation>): RatedBeanForRecommendation {
  return {
    evaluationId: 'bean-1',
    beanName: 'Default Bean',
    beanType: null,
    roastLevel: null,
    shopName: null,
    acidity: 5,
    bitterness: 5,
    aroma: 5,
    overallRating: 7,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('friend bean recommendation scoring', () => {
  it('extracts beginner, low bitterness, fruity preferences from natural language', () => {
    const preference = extractFriendPreference(
      'コーヒー初心者。苦いのは苦手で、フルーティーで華やかな豆が好きそう。'
    )

    expect(preference.bitternessPreference).toBe('low')
    expect(preference.aromaPreference).toBe('high')
    expect(preference.wantsBeginnerFriendly).toBe(true)
    expect(preference.wantsFruity).toBe(true)
    expect(preference.avoidKeywords).toContain('苦い')
  })

  it('prioritizes beans that match the friend preference over highly rated mismatches', () => {
    const preference = extractFriendPreference('苦いのは苦手で、フルーティーなものが好き')
    const ranked = rankBeansForFriend({
      beans: [
        bean({
          evaluationId: 'fruity',
          beanName: 'Ethiopia Natural',
          acidity: 8,
          bitterness: 3,
          aroma: 9,
          overallRating: 8,
          notes: 'ベリーのようでフルーティー、華やか',
        }),
        bean({
          evaluationId: 'dark',
          beanName: 'Dark French',
          acidity: 2,
          bitterness: 9,
          aroma: 6,
          overallRating: 10,
          roastLevel: '深煎り',
          notes: '苦味が強い',
        }),
      ],
      preference,
      now: new Date('2026-05-01T00:00:00.000Z'),
    })

    expect(ranked[0]?.bean.evaluationId).toBe('fruity')
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0)
  })

  it('falls back to overall rating when friend preference is vague', () => {
    const preference = extractFriendPreference('なんかおすすめある？')
    const ranked = rankBeansForFriend({
      beans: [
        bean({ evaluationId: 'ok', overallRating: 7, notes: 'そこそこ' }),
        bean({ evaluationId: 'best', overallRating: 9, notes: 'かなり気に入った' }),
      ],
      preference,
      now: new Date('2026-05-01T00:00:00.000Z'),
    })

    expect(ranked[0]?.bean.evaluationId).toBe('best')
  })

  it('deduplicates the same bean by keeping the highest rated record', () => {
    const preference = extractFriendPreference('おすすめ')
    const ranked = rankBeansForFriend({
      beans: [
        bean({ evaluationId: 'old-low', beanName: 'Same Bean', overallRating: 6 }),
        bean({ evaluationId: 'new-high', beanName: 'Same Bean', overallRating: 9 }),
      ],
      preference,
      now: new Date('2026-05-01T00:00:00.000Z'),
    })

    expect(ranked).toHaveLength(1)
    expect(ranked[0]?.bean.evaluationId).toBe('new-high')
  })

  it('maps score to confidence', () => {
    expect(confidenceFromScore(0.8)).toBe('high')
    expect(confidenceFromScore(0.65)).toBe('medium')
    expect(confidenceFromScore(0.4)).toBe('low')
  })
})
