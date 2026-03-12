/**
 * Tests for Coffee API functions
 * Testing search functionality including bean_name field
 */

import { getCoffeeEvaluations, searchCoffeeEvaluations } from '../coffee'

// Mock Supabase client
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockOr = jest.fn()
const mockOrder = jest.fn()
const mockIlike = jest.fn()
const mockFrom = jest.fn()

const createMockSupabaseClient = () => ({
  from: mockFrom,
})

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(createMockSupabaseClient())),
}))

describe('Coffee API - Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock chain
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq, or: mockOr, order: mockOrder, ilike: mockIlike })
    mockEq.mockReturnValue({ eq: mockEq, or: mockOr, order: mockOrder, ilike: mockIlike })
    mockOr.mockReturnValue({ order: mockOrder })
    mockIlike.mockResolvedValue({ data: [], error: null })
    mockOrder.mockResolvedValue({ data: [], error: null })
  })

  describe('getCoffeeEvaluations with search', () => {
    it('includes bean_name in search query', async () => {
      await getCoffeeEvaluations({ search: 'イルガチェフェ' })

      expect(mockIlike).toHaveBeenCalledWith('name', '%イルガチェフェ%')
      const orCall = mockOr.mock.calls[0][0]
      expect(orCall).toContain('bean_name.ilike.')
    })

    it('performs case-insensitive partial match on bean_name', async () => {
      const searchTerm = 'イルガ'
      await getCoffeeEvaluations({ search: searchTerm })

      const orCall = mockOr.mock.calls[0][0]
      expect(orCall).toContain(`%${searchTerm}%`)
      expect(orCall).toContain('bean_name.ilike')
    })

    it('searches across shop_id, bean_type, bean_name, and roast_level', async () => {
      mockIlike.mockResolvedValueOnce({ data: [{ id: 'shop-1' }], error: null })
      await getCoffeeEvaluations({ search: 'test' })

      const orCall = mockOr.mock.calls[0][0]
      expect(orCall).toContain('shop_id.in.(shop-1)')
      expect(orCall).toContain('bean_type.ilike')
      expect(orCall).toContain('bean_name.ilike')
      expect(orCall).toContain('roast_level.ilike')
      expect(orCall).not.toContain('shops.name.ilike')
    })
  })

  describe('searchCoffeeEvaluations', () => {
    it('includes bean_name in search query', async () => {
      await searchCoffeeEvaluations('イルガチェフェ')

      const orCall = mockOr.mock.calls[0][0]
      expect(orCall).toContain('bean_name.ilike.')
    })

    it('performs partial match search on bean_name', async () => {
      await searchCoffeeEvaluations('イルガ')

      const orCall = mockOr.mock.calls[0][0]
      expect(orCall).toContain('%イルガ%')
      expect(orCall).toContain('bean_name.ilike')
    })
  })
})
