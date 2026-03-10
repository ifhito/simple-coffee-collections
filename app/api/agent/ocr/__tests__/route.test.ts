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

jest.mock('@/lib/infrastructure/ocr/ocr-upload-parser', () => ({
  parseOcrUpload: jest.fn(),
}))

jest.mock('@/lib/di/container', () => ({
  getUserLlmSettingsRepository: jest.fn(() => ({ repo: true })),
  getApiKeyEncryptor: jest.fn(() => ({ encryptor: true })),
  getLlmModelFactory: jest.fn(() => ({ factory: true })),
  getOcrExecutor: jest.fn(() => ({ executor: true })),
}))

jest.mock('@/lib/constants/llm-providers', () => ({
  getProviderTypeByTemplate: jest.fn(() => 'google'),
}))

jest.mock('@/lib/application/ocr', () => ({
  OcrCoffeeBeanUseCase: jest.fn(),
  OcrInlineCoffeeBeanUseCase: jest.fn(),
}))

import { POST } from '../route'
import { createClient } from '@/lib/supabase/server'
import { parseOcrUpload } from '@/lib/infrastructure/ocr/ocr-upload-parser'
import { OcrCoffeeBeanUseCase, OcrInlineCoffeeBeanUseCase } from '@/lib/application/ocr'
import { getProviderTypeByTemplate } from '@/lib/constants/llm-providers'

const mockSavedExecute = jest.fn()
const mockInlineExecute = jest.fn()

function makeRequest(): Request {
  return {
    formData: jest.fn().mockResolvedValue(new FormData()),
  } as unknown as Request
}

describe('POST /api/agent/ocr', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
    })

    ;(OcrCoffeeBeanUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockSavedExecute,
    }))
    ;(OcrInlineCoffeeBeanUseCase as jest.Mock).mockImplementation(() => ({
      execute: mockInlineExecute,
    }))
  })

  it('returns 401 when user is not authenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('認証が必要です')
  })

  it('returns parse error response when upload parsing fails', async () => {
    ;(parseOcrUpload as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      error: '画像ファイルが必要です',
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('画像ファイルが必要です')
  })

  it('uses saved-settings use case when inline template is not provided', async () => {
    ;(parseOcrUpload as jest.Mock).mockResolvedValue({
      ok: true,
      value: {
        imageBuffer: Buffer.from('img'),
        mimeType: 'image/jpeg',
        inlineProviderTemplate: null,
        inlineApiUrl: null,
        inlineApiKey: '',
        inlineModelName: '',
      },
    })
    mockSavedExecute.mockResolvedValue({
      success: true,
      data: {
        bean_name: 'Kenya Blend',
        bean_type: 'Blend',
        roast_level: 'medium',
        shop_name: 'Roastery',
        shop_address: null,
      },
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(OcrCoffeeBeanUseCase).toHaveBeenCalled()
    expect(mockSavedExecute).toHaveBeenCalledWith('user-1', Buffer.from('img'), 'image/jpeg')
    expect(response.status).toBe(200)
    expect(body.data.bean_name).toBe('Kenya Blend')
  })

  it('uses inline use case when inline template is provided', async () => {
    ;(parseOcrUpload as jest.Mock).mockResolvedValue({
      ok: true,
      value: {
        imageBuffer: Buffer.from('img'),
        mimeType: 'image/jpeg',
        inlineProviderTemplate: 'gemini',
        inlineApiUrl: null,
        inlineApiKey: 'AIza-test',
        inlineModelName: 'gemini-2.0-flash',
      },
    })
    mockInlineExecute.mockResolvedValue({
      success: true,
      data: {
        bean_name: 'Colombia',
        bean_type: 'Single Origin',
        roast_level: 'medium',
        shop_name: null,
        shop_address: null,
      },
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(getProviderTypeByTemplate).toHaveBeenCalledWith('gemini')
    expect(OcrInlineCoffeeBeanUseCase).toHaveBeenCalled()
    expect(mockInlineExecute).toHaveBeenCalledWith({
      providerType: 'google',
      apiUrl: null,
      modelName: 'gemini-2.0-flash',
      providerTemplate: 'gemini',
      apiKey: 'AIza-test',
      imageBuffer: Buffer.from('img'),
      mimeType: 'image/jpeg',
    })
    expect(response.status).toBe(200)
    expect(body.data.bean_name).toBe('Colombia')
  })

  it('returns 422 when use case execution fails', async () => {
    ;(parseOcrUpload as jest.Mock).mockResolvedValue({
      ok: true,
      value: {
        imageBuffer: Buffer.from('img'),
        mimeType: 'image/jpeg',
        inlineProviderTemplate: null,
        inlineApiUrl: null,
        inlineApiKey: '',
        inlineModelName: '',
      },
    })
    mockSavedExecute.mockResolvedValue({
      error: 'OCR解析に失敗しました: quota exceeded',
    })

    const response = await POST(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.error).toContain('OCR解析に失敗しました')
  })
})
