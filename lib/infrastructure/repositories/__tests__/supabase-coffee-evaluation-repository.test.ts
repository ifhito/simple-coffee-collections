import { createClient } from '../../supabase/server'
import { SupabaseCoffeeEvaluationRepository } from '../supabase-coffee-evaluation-repository'
import type { Database } from '@/lib/types/database.types'

jest.mock('../../supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

type CoffeeEvaluationRow = Database['public']['Tables']['coffee_evaluations']['Row']

function makeRow(overrides: Partial<CoffeeEvaluationRow> = {}): CoffeeEvaluationRow {
  return {
    id: 'evaluation-1',
    user_id: 'user-1',
    shop_name: 'Coffee Stand',
    bean_name: 'Ethiopia',
    bean_type: 'エチオピア',
    roast_level: 'medium',
    acidity: 7,
    bitterness: 5,
    aroma: 8,
    overall_rating: 9,
    is_public: true,
    created_at: '2026-03-11T00:00:00.000Z',
    updated_at: '2026-03-11T00:00:00.000Z',
    ...overrides,
  }
}

function makeFindByIdClient(result: { data: CoffeeEvaluationRow | null; error: { code?: string; message: string } | null }) {
  return {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue(result),
        })),
      })),
    })),
  }
}

describe('SupabaseCoffeeEvaluationRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('reconstructs ratings when all rating columns exist', async () => {
      mockCreateClient.mockResolvedValue(makeFindByIdClient({ data: makeRow(), error: null }) as never)
      const repository = new SupabaseCoffeeEvaluationRepository()

      const result = await repository.findById('evaluation-1')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value?.acidity?.value).toBe(7)
        expect(result.value?.bitterness?.value).toBe(5)
        expect(result.value?.aroma?.value).toBe(8)
        expect(result.value?.overallRating?.value).toBe(9)
      }
    })

    it('returns unevaluated entity when all rating columns are null', async () => {
      mockCreateClient.mockResolvedValue(
        makeFindByIdClient({
          data: makeRow({
            acidity: null,
            bitterness: null,
            aroma: null,
            overall_rating: null,
          }),
          error: null,
        }) as never
      )
      const repository = new SupabaseCoffeeEvaluationRepository()

      const result = await repository.findById('evaluation-1')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value?.isEvaluated).toBe(false)
        expect(result.value?.acidity).toBeNull()
        expect(result.value?.overallRating).toBeNull()
      }
    })

    it('fails when only some rating columns are null', async () => {
      mockCreateClient.mockResolvedValue(
        makeFindByIdClient({
          data: makeRow({
            acidity: 7,
            bitterness: null,
            aroma: 8,
            overall_rating: 9,
          }),
          error: null,
        }) as never
      )
      const repository = new SupabaseCoffeeEvaluationRepository()

      const result = await repository.findById('evaluation-1')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.message).toBe('評価項目の永続化データが不正です')
      }
    })
  })
})
