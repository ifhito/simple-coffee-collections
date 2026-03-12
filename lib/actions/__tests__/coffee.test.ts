/**
 * Coffee Evaluation Server Actions Tests
 * Covers: bean-only creation, addEvaluation, update guards
 */

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))
jest.mock('@/lib/di/container', () => ({
  getShopRepository: jest.fn(() => ({
    findOrCreate: jest.fn().mockResolvedValue({ ok: true, value: { id: 'mock-shop-id' } }),
    search: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ ok: true, value: null }),
  })),
}))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  createCoffeeEvaluation,
  updateCoffeeEvaluation,
  addEvaluation,
} from '@/lib/actions/coffee'

// Helper to build FormData
function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const mockInsert = jest.fn().mockReturnValue({ error: null })
const mockUpdate = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()

function setupSupabaseMock(overrides?: {
  user?: { id: string } | null
  authError?: Error | null
  selectResult?: { data: any; error: any }
}) {
  const user = overrides?.user ?? { id: 'user-1' }
  const authError = overrides?.authError ?? null

  // Chain: supabase.from('coffee_evaluations').select(...).eq(...).single()
  mockSingle.mockResolvedValue(
    overrides?.selectResult ?? {
      data: { user_id: 'user-1', overall_rating: null },
      error: null,
    }
  )
  mockEq.mockReturnValue({ single: mockSingle, error: null })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockUpdate.mockReturnValue({ eq: jest.fn().mockReturnValue({ error: null }) })

  ;(createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: authError,
      }),
    },
    from: jest.fn().mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
      select: mockSelect,
    }),
  })
}

describe('createCoffeeEvaluation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupSupabaseMock()
  })

  it('should create bean-only evaluation when skip_evaluation is true', async () => {
    const fd = buildFormData({
      bean_name: 'Ethiopia Yirgacheffe',
      shop_name: 'Blue Bottle',
      bean_type: 'エチオピア',
      roast_level: 'medium',
      notes: '酸味がきれい',
      is_public: 'false',
      skip_evaluation: 'true',
    })

    await createCoffeeEvaluation(fd)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        bean_name: 'Ethiopia Yirgacheffe',
        notes: '酸味がきれい',
        shop_id: 'mock-shop-id',
      })
    )
    // Rating fields and shop_name should NOT be in the payload
    const payload = mockInsert.mock.calls[0][0]
    expect(payload).not.toHaveProperty('shop_name')
    expect(payload).not.toHaveProperty('acidity')
    expect(payload).not.toHaveProperty('bitterness')
    expect(payload).not.toHaveProperty('aroma')
    expect(payload).not.toHaveProperty('overall_rating')
    expect(redirect).toHaveBeenCalledWith('/coffee/my')
  })

  it('should create evaluation with ratings when skip_evaluation is false', async () => {
    const fd = buildFormData({
      bean_name: 'Test Bean',
      shop_name: '',
      bean_type: '',
      roast_level: '',
      notes: '余韻が長い',
      is_public: 'true',
      skip_evaluation: 'false',
      acidity: '7',
      bitterness: '5',
      aroma: '8',
      overall_rating: '9',
    })

    await createCoffeeEvaluation(fd)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        acidity: 7,
        bitterness: 5,
        aroma: 8,
        notes: '余韻が長い',
        overall_rating: 9,
      })
    )
  })

  it('should normalize blank notes to null on create', async () => {
    const fd = buildFormData({
      bean_name: 'Test Bean',
      shop_name: '',
      bean_type: '',
      roast_level: '',
      notes: '   ',
      is_public: 'true',
      skip_evaluation: 'true',
    })

    await createCoffeeEvaluation(fd)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: null,
      })
    )
  })

  it('should reject notes longer than 500 characters on create', async () => {
    const fd = buildFormData({
      bean_name: 'Test Bean',
      shop_name: '',
      bean_type: '',
      roast_level: '',
      notes: 'a'.repeat(501),
      is_public: 'true',
      skip_evaluation: 'true',
    })

    const result = await createCoffeeEvaluation(fd)
    expect(result).toEqual({ error: 'notes: notes must be 500 characters or less' })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('should reject partial ratings (all-or-nothing)', async () => {
    const fd = buildFormData({
      bean_name: 'Test Bean',
      shop_name: '',
      bean_type: '',
      roast_level: '',
      is_public: 'true',
      skip_evaluation: 'false',
      acidity: '7',
      bitterness: '5',
      // aroma and overall_rating missing
    })

    const result = await createCoffeeEvaluation(fd)
    expect(result).toEqual({ error: '評価値は全て入力するか、全て空にしてください' })
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('updateCoffeeEvaluation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should ignore skip_evaluation flag (cannot nullify ratings via update)', async () => {
    // Existing record has ratings
    setupSupabaseMock({
      selectResult: {
        data: { user_id: 'user-1', overall_rating: 8 },
        error: null,
      },
    })

    const fd = buildFormData({
      bean_name: 'Updated Bean',
      shop_name: 'New Shop',
      bean_type: '',
      roast_level: '',
      is_public: 'true',
      skip_evaluation: 'true', // should be ignored
      // No rating fields → parsed as null since skip_evaluation is ignored but fields are absent
    })

    const result = await updateCoffeeEvaluation('eval-1', fd)

    // Should be rejected because existing has ratings but update has null ratings
    expect(result).toEqual({ error: '評価済みの豆から評価を取り消すことはできません' })
  })

  it('should allow updating bean info on unevaluated record without adding ratings', async () => {
    setupSupabaseMock({
      selectResult: {
        data: { user_id: 'user-1', overall_rating: null },
        error: null,
      },
    })

    const fd = buildFormData({
      bean_name: 'Updated Bean Name',
      shop_name: 'New Shop',
      bean_type: 'コロンビア',
      roast_level: 'city',
      notes: '甘さが続く',
      is_public: 'false',
      // No rating fields → null → unevaluated stays unevaluated
    })

    await updateCoffeeEvaluation('eval-1', fd)

    // Update should not include rating fields
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        bean_name: 'Updated Bean Name',
        notes: '甘さが続く',
        shop_id: 'mock-shop-id',
      })
    )
    // Rating keys should NOT be in the payload
    const payload = mockUpdate.mock.calls[0][0]
    expect(payload).not.toHaveProperty('acidity')
    expect(payload).not.toHaveProperty('overall_rating')
  })

  it('should reject notes longer than 500 characters on update', async () => {
    setupSupabaseMock({
      selectResult: {
        data: { user_id: 'user-1', overall_rating: null },
        error: null,
      },
    })

    const fd = buildFormData({
      bean_name: 'Updated Bean Name',
      shop_name: 'New Shop',
      bean_type: 'コロンビア',
      roast_level: 'city',
      notes: 'a'.repeat(501),
      is_public: 'false',
    })

    const result = await updateCoffeeEvaluation('eval-1', fd)
    expect(result).toEqual({ error: 'notes: notes must be 500 characters or less' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('addEvaluation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add ratings to an unevaluated record', async () => {
    setupSupabaseMock({
      selectResult: {
        data: { user_id: 'user-1', overall_rating: null },
        error: null,
      },
    })

    const fd = buildFormData({
      acidity: '7',
      bitterness: '5',
      aroma: '8',
      overall_rating: '9',
    })

    await addEvaluation('eval-1', fd)

    expect(mockUpdate).toHaveBeenCalledWith({
      acidity: 7,
      bitterness: 5,
      aroma: 8,
      overall_rating: 9,
    })
    expect(redirect).toHaveBeenCalledWith('/coffee/eval-1')
  })

  it('should allow re-evaluation on already evaluated record', async () => {
    setupSupabaseMock({
      selectResult: {
        data: { user_id: 'user-1', overall_rating: 5 },
        error: null,
      },
    })

    const fd = buildFormData({
      acidity: '3',
      bitterness: '9',
      aroma: '4',
      overall_rating: '6',
    })

    await addEvaluation('eval-1', fd)

    expect(mockUpdate).toHaveBeenCalledWith({
      acidity: 3,
      bitterness: 9,
      aroma: 4,
      overall_rating: 6,
    })
  })

  it('should reject invalid rating values', async () => {
    setupSupabaseMock()

    const fd = buildFormData({
      acidity: '15',
      bitterness: '5',
      aroma: '8',
      overall_rating: '9',
    })

    const result = await addEvaluation('eval-1', fd)
    expect(result).toEqual({ error: 'rating must be between 1-10' })
  })

  it('should reject if not owner', async () => {
    setupSupabaseMock({
      selectResult: {
        data: { user_id: 'other-user', overall_rating: null },
        error: null,
      },
    })

    const fd = buildFormData({
      acidity: '7',
      bitterness: '5',
      aroma: '8',
      overall_rating: '9',
    })

    const result = await addEvaluation('eval-1', fd)
    expect(result).toEqual({ error: '権限がありません' })
  })

  it('should reject if not authenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('not authenticated'),
        }),
      },
    })

    const fd = buildFormData({
      acidity: '7',
      bitterness: '5',
      aroma: '8',
      overall_rating: '9',
    })

    const result = await addEvaluation('eval-1', fd)
    expect(result).toEqual({ error: '認証が必要です' })
  })
})
