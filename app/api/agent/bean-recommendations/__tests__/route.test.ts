jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockSettingsRepo = { findByUserId: jest.fn() }
const mockEncryptor = { decrypt: jest.fn() }
const mockModelFactory = { createFromUserSettings: jest.fn() }
const mockRepository = { repo: true }
const mockExecutor = { executor: true }

jest.mock('@/lib/di/container', () => ({
  getUserLlmSettingsRepository: jest.fn(() => mockSettingsRepo),
  getApiKeyEncryptor: jest.fn(() => mockEncryptor),
  getLlmModelFactory: jest.fn(() => mockModelFactory),
  getBeanRecommendationRepository: jest.fn(() => mockRepository),
  getBeanRecommendationExecutor: jest.fn(() => mockExecutor),
}))

jest.mock('@/lib/application/bean-recommendation', () => ({
  RecommendBeansForFriendUseCase: jest.fn(),
}))

import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { RecommendBeansForFriendUseCase } from '@/lib/application/bean-recommendation'

const mockExecute = jest.fn()

function makeRequest(body: unknown): Request {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Request
}

describe('POST /api/agent/bean-recommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    })
    mockSettingsRepo.findByUserId.mockResolvedValue({
      ok: true,
      value: { hasApiKey: true, encryptedApiKey: 'encrypted-key' },
    })
    mockEncryptor.decrypt.mockReturnValue('plain-key')
    mockModelFactory.createFromUserSettings.mockReturnValue({ model: true })
    ;(RecommendBeansForFriendUseCase as jest.Mock).mockImplementation(() => ({ execute: mockExecute }))
    mockExecute.mockResolvedValue({
      success: true,
      data: {
        summary: 'おすすめを選びました。',
        recommendations: [],
      },
    })
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    })

    const response = await POST(makeRequest({ friendPreferenceText: 'フルーティー' }))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('認証が必要です')
  })

  it('validates friendPreferenceText', async () => {
    const response = await POST(makeRequest({ friendPreferenceText: '' }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('友達の好みを入力してください')
  })



  it('rejects malformed limit values', async () => {
    const response = await POST(makeRequest({ friendPreferenceText: 'おすすめある？', limit: '5' }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('limitは1〜5の整数で指定してください')
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('rejects too long friendPreferenceText', async () => {
    const response = await POST(makeRequest({ friendPreferenceText: 'a'.repeat(1001) }))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('1000文字以内')
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('creates model from saved settings and runs the recommendation use case', async () => {
    const response = await POST(makeRequest({ friendPreferenceText: '苦味控えめでフルーティー', limit: 5 }))
    const body = await response.json()

    expect(mockSettingsRepo.findByUserId).toHaveBeenCalledWith('user-1')
    expect(mockEncryptor.decrypt).toHaveBeenCalledWith('encrypted-key')
    expect(mockModelFactory.createFromUserSettings).toHaveBeenCalledWith(
      { hasApiKey: true, encryptedApiKey: 'encrypted-key' },
      'plain-key'
    )
    expect(RecommendBeansForFriendUseCase).toHaveBeenCalledWith(mockRepository, mockExecutor)
    expect(mockExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      model: { model: true },
      friendPreferenceText: '苦味控えめでフルーティー',
      limit: 5,
    })
    expect(response.status).toBe(200)
    expect(body.data.summary).toBe('おすすめを選びました。')
  })

  it('returns 422 when LLM settings are missing', async () => {
    mockSettingsRepo.findByUserId.mockResolvedValue({ ok: true, value: null })

    const response = await POST(makeRequest({ friendPreferenceText: 'おすすめある？' }))
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.error).toContain('LLM設定が未設定です')
  })

  it('returns use case errors', async () => {
    mockExecute.mockResolvedValue({ error: 'おすすめ候補の取得に失敗しました' })

    const response = await POST(makeRequest({ friendPreferenceText: 'おすすめある？' }))
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.error).toBe('おすすめ候補の取得に失敗しました')
  })
})
