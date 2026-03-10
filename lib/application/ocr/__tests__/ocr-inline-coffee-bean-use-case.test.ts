import { OcrInlineCoffeeBeanUseCase } from '../ocr-inline-coffee-bean-use-case'
import type { LlmModelFactory, OcrExecutor } from '@/lib/application/ports'

const mockLlmModelFactory: LlmModelFactory = {
  createFromUserSettings: jest.fn(),
  createFromInlineSettings: jest.fn(),
}

const mockOcrExecutor: OcrExecutor = {
  execute: jest.fn(),
}

describe('OcrInlineCoffeeBeanUseCase', () => {
  let useCase: OcrInlineCoffeeBeanUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new OcrInlineCoffeeBeanUseCase(mockLlmModelFactory, mockOcrExecutor)
  })

  it('runs OCR via model factory + executor', async () => {
    const model = { modelId: 'inline-model' }
    ;(mockLlmModelFactory.createFromInlineSettings as jest.Mock).mockReturnValue(model)
    ;(mockOcrExecutor.execute as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        bean_name: 'Kenya Blend',
        bean_type: 'Blend',
        roast_level: 'medium',
        shop_name: 'Roastery',
        shop_address: null,
      },
    })

    const result = await useCase.execute({
      providerType: 'google',
      apiUrl: null,
      modelName: 'gemini-2.0-flash',
      providerTemplate: 'gemini',
      apiKey: 'AIza-test-key',
      imageBuffer: Buffer.from('img'),
      mimeType: 'image/jpeg',
    })

    expect('success' in result).toBe(true)
    expect(mockLlmModelFactory.createFromInlineSettings).toHaveBeenCalledWith({
      providerType: 'google',
      apiUrl: null,
      modelName: 'gemini-2.0-flash',
      providerTemplate: 'gemini',
      apiKey: 'AIza-test-key',
    })
    expect(mockOcrExecutor.execute).toHaveBeenCalledWith(
      model,
      Buffer.from('img'),
      'image/jpeg'
    )
  })

  it('returns error when OCR execution fails', async () => {
    ;(mockLlmModelFactory.createFromInlineSettings as jest.Mock).mockReturnValue({ modelId: 'inline-model' })
    ;(mockOcrExecutor.execute as jest.Mock).mockResolvedValue({
      error: 'OCR解析に失敗しました: quota exceeded',
    })

    const result = await useCase.execute({
      providerType: 'openai_compatible',
      apiUrl: 'https://api.together.xyz/v1',
      modelName: 'meta-llama/Llama-Vision-Free',
      providerTemplate: 'together',
      apiKey: 'sk-inline',
      imageBuffer: Buffer.from('img'),
      mimeType: 'image/jpeg',
    })

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('OCR解析に失敗しました')
    }
  })
})
