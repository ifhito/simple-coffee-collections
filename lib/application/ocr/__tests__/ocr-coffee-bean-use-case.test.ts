import { OcrCoffeeBeanUseCase } from '../ocr-coffee-bean-use-case'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor, LlmModelFactory, OcrExecutor } from '@/lib/application/ports'
import { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { LlmSettings } from '@/lib/domain/llm-settings/value-objects/llm-settings'
import { ok } from '@/lib/domain/shared/result'

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

const mockLlmModelFactory: LlmModelFactory = {
  createFromUserSettings: jest.fn(),
  createFromInlineSettings: jest.fn(),
}

const mockOcrExecutor: OcrExecutor = {
  execute: jest.fn(),
}

describe('OcrCoffeeBeanUseCase', () => {
  let useCase: OcrCoffeeBeanUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new OcrCoffeeBeanUseCase(
      mockRepo,
      mockEncryptor,
      mockLlmModelFactory,
      mockOcrExecutor
    )
  })

  it('returns error when settings not found', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(null))

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('未設定')
    }
    expect(mockLlmModelFactory.createFromUserSettings).not.toHaveBeenCalled()
    expect(mockOcrExecutor.execute).not.toHaveBeenCalled()
  })

  it('returns OCR extracted data on success', async () => {
    const entity = makeEntity()
    const model = { modelId: 'mock-model' }
    const ocrData = {
      bean_name: 'エチオピア イルガチェフェ',
      bean_type: 'エチオピア',
      roast_level: 'light',
      shop_name: 'テストロースタリー',
      shop_address: null,
    }

    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(entity))
    ;(mockEncryptor.decrypt as jest.Mock).mockReturnValue('sk-test-key')
    ;(mockLlmModelFactory.createFromUserSettings as jest.Mock).mockReturnValue(model)
    ;(mockOcrExecutor.execute as jest.Mock).mockResolvedValue({ success: true, data: ocrData })

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')

    expect('success' in result).toBe(true)
    expect(mockLlmModelFactory.createFromUserSettings).toHaveBeenCalledWith(
      entity,
      'sk-test-key'
    )
    expect(mockOcrExecutor.execute).toHaveBeenCalledWith(
      model,
      Buffer.from('img'),
      'image/jpeg'
    )
    if ('success' in result) {
      expect(result.data.bean_name).toBe('エチオピア イルガチェフェ')
      expect(result.data.roast_level).toBe('light')
    }
  })

  it('passes google provider settings to model factory', async () => {
    const entity = makeGoogleEntity()
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(entity))
    ;(mockEncryptor.decrypt as jest.Mock).mockReturnValue('AIza-test-key')
    ;(mockLlmModelFactory.createFromUserSettings as jest.Mock).mockReturnValue({ modelId: 'google-model' })
    ;(mockOcrExecutor.execute as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        bean_name: 'エチオピア イルガチェフェ',
        bean_type: 'ウォッシュド',
        roast_level: 'light',
        shop_name: null,
        shop_address: null,
      },
    })

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')

    expect('success' in result).toBe(true)
    const settingsArg = (mockLlmModelFactory.createFromUserSettings as jest.Mock).mock.calls[0]?.[0]
    expect(settingsArg.settings.provider.type).toBe('google')
  })

  it('returns error when OCR execution fails', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(makeEntity()))
    ;(mockEncryptor.decrypt as jest.Mock).mockReturnValue('sk-test-key')
    ;(mockLlmModelFactory.createFromUserSettings as jest.Mock).mockReturnValue({ modelId: 'mock-model' })
    ;(mockOcrExecutor.execute as jest.Mock).mockResolvedValue({
      error: 'OCR解析に失敗しました: API rate limit exceeded',
    })

    const result = await useCase.execute('user-1', Buffer.from('img'), 'image/jpeg')

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('OCR解析に失敗しました')
    }
  })
})
