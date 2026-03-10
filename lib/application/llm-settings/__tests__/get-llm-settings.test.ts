import { GetLlmSettingsUseCase } from '../get-llm-settings'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { LlmSettings } from '@/lib/domain/llm-settings/value-objects/llm-settings'
import { ok, fail } from '@/lib/domain/shared/result'

function makeEntity(): UserLlmSettings {
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
    encryptedApiKey: 'iv:tag:enc',
  })
}

const mockRepo: UserLlmSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('GetLlmSettingsUseCase', () => {
  let useCase: GetLlmSettingsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new GetLlmSettingsUseCase(mockRepo)
  })

  it('returns settings output when found', async () => {
    const entity = makeEntity()
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(entity))

    const result = await useCase.execute('user-1')

    expect(result).not.toBeNull()
    expect(result!.provider).toBe('openai_compatible')
    expect(result!.providerTemplate).toBe('together')
    expect(result!.apiUrl).toBe('https://api.together.xyz/v1')
    expect(result!.modelName).toBe('meta-llama/Llama-Vision-Free')
    expect(result!.hasApiKey).toBe(true)
  })

  it('returns null when no settings exist', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(null))

    const result = await useCase.execute('user-1')

    expect(result).toBeNull()
  })

  it('returns null when repo fails', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(
      fail(new Error('DB error'))
    )

    const result = await useCase.execute('user-1')

    expect(result).toBeNull()
  })
})
