import { MastraOcrExecutor } from '../mastra-ocr-executor'

jest.mock('@/lib/mastra/agents/coffee-ocr-agent', () => ({
  createCoffeeOcrAgent: jest.fn(() => ({
    model: { provider: 'mock-model' },
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

import { createCoffeeOcrAgent } from '@/lib/mastra/agents/coffee-ocr-agent'
import { generateObject } from 'ai'

const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>

describe('MastraOcrExecutor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns extracted OCR data on success', async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        bean_name: 'Kenya Blend',
        bean_type: 'Blend',
        roast_level: 'medium',
        shop_name: 'Roastery',
        shop_address: null,
      },
    } as never)

    const executor = new MastraOcrExecutor()
    const result = await executor.execute(
      { provider: 'mock-model' } as never,
      Buffer.from('image'),
      'image/jpeg'
    )

    expect(createCoffeeOcrAgent).toHaveBeenCalled()
    expect(mockGenerateObject).toHaveBeenCalled()
    expect('success' in result).toBe(true)

    const args = mockGenerateObject.mock.calls[0]?.[0]
    const userMessage = args?.messages?.[1]
    expect(userMessage?.role).toBe('user')
    if (userMessage && Array.isArray(userMessage.content)) {
      const imagePart = userMessage.content[0] as { type?: string; mediaType?: string }
      expect(imagePart.type).toBe('image')
      expect(imagePart.mediaType).toBe('image/jpeg')
    }
  })

  it('returns wrapped error message on failure', async () => {
    mockGenerateObject.mockRejectedValue(new Error('quota exceeded'))

    const executor = new MastraOcrExecutor()
    const result = await executor.execute(
      { provider: 'mock-model' } as never,
      Buffer.from('image'),
      'image/jpeg'
    )

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('OCR解析に失敗しました')
      expect(result.error).toContain('quota exceeded')
    }
  })
})
