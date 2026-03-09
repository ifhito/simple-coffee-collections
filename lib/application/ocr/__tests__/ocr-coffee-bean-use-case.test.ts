import { OcrCoffeeBeanUseCase } from '../ocr-coffee-bean-use-case'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor } from '@/lib/infrastructure/crypto/api-key-encryptor.interface'
import { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { LlmSettings } from '@/lib/domain/llm-settings/value-objects/llm-settings'
import { ok } from '@/lib/domain/shared/result'

// Mock the LLM factory and agent
jest.mock('@/lib/infrastructure/llm/llm-provider-factory', () => ({
  createLlmModel: jest.fn(() => ({ modelId: 'mock-model' })),
}))

jest.mock('@/lib/mastra/agents/coffee-ocr-agent', () => ({
  createCoffeeOcrAgent: jest.fn(() => ({
    model: { modelId: 'mock-model' },
    getInstructions: jest.fn().mockResolvedValue('mock instructions'),
  })),
  CoffeeOcrOutputSchema: require('zod').z.object({
    bean_name: require('zod').z.string().nullable(),
    bean_type: require('zod').z.string().nullable(),
    roast_level: require('zod').z.string().nullable(),
    shop_name: require('zod').z.string().nullable(),
    shop_address: require('zod').z.string().nullable(),
  }),
}))

jest.mock('ai', () => ({
  generateObject: jest.fn(),
}))

import { generateObject } from 'ai'

const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>

function makeEntity(hasApiKey = true): UserLlmSettings {
  const settings = LlmSettings.fromPrimitive(
    'openai_compatible',
    'together',
    'https://api.together.xyz/v1',
    'meta-llama/Llama-Vision-Free'
  )
  return UserLlmSettings.reconstruct({
    id: 'uuid-1',
    userId: 'user-1',
    settings,
    encryptedApiKey: hasApiKey ? 'iv:tag:enc' : null,
  })
}

function makeGoogleEntity(): UserLlmSettings {
  const settings = LlmSettings.fromPrimitive(
    'google',
    'gemini',
    null,
    'gemini-2.0-flash'
  )
  return UserLlmSettings.reconstruct({
    id: 'uuid-2',
    userId: 'user-1',
    settings,
    encryptedApiKey: 'iv:tag:google-enc',
  })
}

const mockRepo: UserLlmSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

const mockEncryptor: ApiKeyEncryptor = {
  encrypt: jest.fn((s) => `encrypted:${s}`),
  decrypt: jest.fn((s) => s.replace('encrypted:', '')),
}

describe('OcrCoffeeBeanUseCase', () => {
  let useCase: OcrCoffeeBeanUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new OcrCoffeeBeanUseCase(mockRepo, mockEncryptor)
  })

  it('returns error when settings not found', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(null))
    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('未設定')
    }
  })

  it('returns OCR extracted data on success', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(makeEntity()))
    ;(mockEncryptor.decrypt as jest.Mock).mockReturnValue('sk-test-key')

    const ocrData = {
      bean_name: 'エチオピア イルガチェフェ',
      bean_type: 'エチオピア',
      roast_level: 'light',
      shop_name: 'テストロースタリー',
      shop_address: null,
    }

    mockGenerateObject.mockResolvedValue({ object: ocrData } as any)

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')
    expect('success' in result).toBe(true)
    const generateObjectArgs = mockGenerateObject.mock.calls[0]?.[0]
    expect(generateObjectArgs).toBeDefined()
    const userMessage = generateObjectArgs?.messages?.[1]
    expect(userMessage?.role).toBe('user')
    if (userMessage && Array.isArray(userMessage.content)) {
      const imagePart = userMessage.content[0] as { type?: string; mediaType?: string }
      expect(imagePart.type).toBe('image')
      expect(imagePart.mediaType).toBe('image/jpeg')
    }
    if ('success' in result) {
      expect(result.data.bean_name).toBe('エチオピア イルガチェフェ')
      expect(result.data.roast_level).toBe('light')
    }
  })

  it('uses google provider when settings have google type', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(makeGoogleEntity()))
    ;(mockEncryptor.decrypt as jest.Mock).mockReturnValue('AIza-test-key')

    const ocrData = {
      bean_name: 'エチオピア イルガチェフェ',
      bean_type: 'ウォッシュド',
      roast_level: 'light',
      shop_name: null,
      shop_address: null,
    }
    mockGenerateObject.mockResolvedValue({ object: ocrData } as any)

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')
    expect('success' in result).toBe(true)
    if ('success' in result) {
      expect(result.data.bean_name).toBe('エチオピア イルガチェフェ')
    }
  })

  it('returns error when generateObject throws', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(makeEntity()))
    ;(mockEncryptor.decrypt as jest.Mock).mockReturnValue('sk-test-key')
    mockGenerateObject.mockRejectedValue(new Error('API rate limit exceeded'))

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('OCR')
    }
  })
})
