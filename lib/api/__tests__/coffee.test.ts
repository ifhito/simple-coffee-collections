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
    mockSelect.mockReturnValue({ eq: mockEq, or: mockOr, order: mockOrder })
    mockEq.mockReturnValue({ eq: mockEq, or: mockOr, order: mockOrder })
    mockOr.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: [], error: null })
  })

  describe('getCoffeeEvaluations with search', () => {
    it('includes bean_name in search query', async () => {
      await getCoffeeEvaluations({ search: 'イルガチェフェ' })

      // Verify .or() was called with bean_name in the pattern
      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining('bean_name.ilike.')
      )
    })

    it('performs case-insensitive partial match on bean_name', async () => {
      const searchTerm = 'イルガ'
      await getCoffeeEvaluations({ search: searchTerm })

      // Verify the pattern includes the search term
      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining(`%${searchTerm}%`)
      )
      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining('bean_name.ilike')
      )
    })

    it('searches across shop_name, bean_type, bean_name, and roast_level', async () => {
      await getCoffeeEvaluations({ search: 'test' })

      const orCall = mockOr.mock.calls[0][0]
      expect(orCall).toContain('shop_name.ilike')
      expect(orCall).toContain('bean_type.ilike')
      expect(orCall).toContain('bean_name.ilike')
      expect(orCall).toContain('roast_level.ilike')
    })
  })

  describe('searchCoffeeEvaluations', () => {
    it('includes bean_name in search query', async () => {
      await searchCoffeeEvaluations('イルガチェフェ')

      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining('bean_name.ilike.')
      )
    })

    it('performs partial match search on bean_name', async () => {
      await searchCoffeeEvaluations('イルガ')

      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining('%イルガ%')
      )
      expect(mockOr).toHaveBeenCalledWith(
        expect.stringContaining('bean_name.ilike')
      )
    })
  })
})
