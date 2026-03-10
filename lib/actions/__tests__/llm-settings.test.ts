import {
  getLlmSettings,
  saveLlmSettings,
  deleteLlmSettings,
} from '@/lib/actions/llm-settings'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/di/container', () => ({
  getUserLlmSettingsRepository: jest.fn(() => ({ repo: true })),
  getApiKeyEncryptor: jest.fn(() => ({ encryptor: true })),
}))

jest.mock('@/lib/application/llm-settings', () => ({
  GetLlmSettingsUseCase: jest.fn(),
  SaveLlmSettingsUseCase: jest.fn(),
  DeleteLlmSettingsUseCase: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import {
  GetLlmSettingsUseCase,
  SaveLlmSettingsUseCase,
  DeleteLlmSettingsUseCase,
} from '@/lib/application/llm-settings'

const mockGetExecute = jest.fn()
const mockSaveExecute = jest.fn()
const mockDeleteExecute = jest.fn()

describe('llm-settings actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    })
    ;(GetLlmSettingsUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockGetExecute,
    }))
    ;(SaveLlmSettingsUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockSaveExecute,
    }))
    ;(DeleteLlmSettingsUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockDeleteExecute,
    }))
  })

  it('getLlmSettings returns null when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    })

    const result = await getLlmSettings()
    expect(result).toBeNull()
  })

  it('getLlmSettings returns use case output for authenticated user', async () => {
    mockGetExecute.mockResolvedValue({
      provider: 'google',
      providerTemplate: 'gemini',
      apiUrl: null,
      modelName: 'gemini-2.0-flash',
      hasApiKey: true,
    })

    const result = await getLlmSettings()
    expect(mockGetExecute).toHaveBeenCalledWith('user-1')
    expect(result?.provider).toBe('google')
  })

  it('saveLlmSettings returns auth error when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    })

    const result = await saveLlmSettings(new FormData())
    expect(result).toEqual({ error: '認証が必要です' })
  })

  it('saveLlmSettings returns validation error when provider is missing', async () => {
    const formData = new FormData()
    formData.set('model_name', 'gemini-2.0-flash')

    const result = await saveLlmSettings(formData)
    expect(result).toEqual({ error: 'プロバイダーは必須です' })
  })

  it('saveLlmSettings returns success when use case succeeds', async () => {
    const formData = new FormData()
    formData.set('provider', 'google')
    formData.set('provider_template', 'gemini')
    formData.set('model_name', 'gemini-2.0-flash')
    formData.set('api_key', 'AIza-test')

    mockSaveExecute.mockResolvedValue({ success: true })

    const result = await saveLlmSettings(formData)
    expect(mockSaveExecute).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        provider: 'google',
        providerTemplate: 'gemini',
        modelName: 'gemini-2.0-flash',
        apiKey: 'AIza-test',
      })
    )
    expect(result).toEqual({ success: true })
  })

  it('saveLlmSettings returns use case error message', async () => {
    const formData = new FormData()
    formData.set('provider', 'google')
    formData.set('provider_template', 'gemini')
    formData.set('model_name', 'gemini-2.0-flash')

    mockSaveExecute.mockResolvedValue({ error: 'APIキーの暗号化に失敗しました' })

    const result = await saveLlmSettings(formData)
    expect(result).toEqual({ error: 'APIキーの暗号化に失敗しました' })
  })

  it('deleteLlmSettings returns auth error when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    })

    const result = await deleteLlmSettings()
    expect(result).toEqual({ error: '認証が必要です' })
  })

  it('deleteLlmSettings delegates to use case for authenticated user', async () => {
    mockDeleteExecute.mockResolvedValue({})

    const result = await deleteLlmSettings()
    expect(mockDeleteExecute).toHaveBeenCalledWith('user-1')
    expect(result).toEqual({})
  })
})
