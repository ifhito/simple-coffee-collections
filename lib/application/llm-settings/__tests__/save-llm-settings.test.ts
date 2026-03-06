import { SaveLlmSettingsUseCase } from '../save-llm-settings'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import type { ApiKeyEncryptor } from '@/lib/infrastructure/crypto/api-key-encryptor.interface'
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
    encryptedApiKey: 'existing:enc:key',
  })
}

const mockRepo: UserLlmSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

const mockEncryptor: ApiKeyEncryptor = {
  encrypt: jest.fn((s) => `enc:${s}`),
  decrypt: jest.fn((s) => s.replace('enc:', '')),
}

describe('SaveLlmSettingsUseCase', () => {
  let useCase: SaveLlmSettingsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new SaveLlmSettingsUseCase(mockRepo, mockEncryptor)
  })

  it('saves settings with new API key encrypted', async () => {
    const entity = makeEntity()
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(null))
    ;(mockRepo.save as jest.Mock).mockResolvedValue(ok(entity))

    const result = await useCase.execute('user-1', {
      provider: 'openai_compatible',
      apiUrl: 'https://api.together.xyz/v1',
      modelName: 'meta-llama/Llama-Vision-Free',
      providerTemplate: 'together',
      apiKey: 'sk-new-key',
    })

    expect('error' in result).toBe(false)
    expect(mockEncryptor.encrypt).toHaveBeenCalledWith('sk-new-key')
  })

  it('keeps existing API key when no new key provided', async () => {
    const entity = makeEntity()
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(entity))
    ;(mockRepo.save as jest.Mock).mockResolvedValue(ok(entity))

    const result = await useCase.execute('user-1', {
      provider: 'openai_compatible',
      apiUrl: 'https://api.together.xyz/v1',
      modelName: 'meta-llama/Llama-Vision-Free',
      providerTemplate: 'together',
      apiKey: '', // empty = keep existing
    })

    expect('error' in result).toBe(false)
    expect(mockEncryptor.encrypt).not.toHaveBeenCalled()
    // save should be called with the existing encrypted key
    expect(mockRepo.save).toHaveBeenCalledWith(
      'user-1',
      expect.anything(),
      'existing:enc:key'
    )
  })

  it('returns error for invalid provider', async () => {
    const result = await useCase.execute('user-1', {
      provider: 'openai_compatible',
      apiUrl: '', // missing URL
      modelName: 'model',
    })
    expect('error' in result).toBe(true)
  })

  it('returns error when repo save fails', async () => {
    ;(mockRepo.findByUserId as jest.Mock).mockResolvedValue(ok(null))
    ;(mockRepo.save as jest.Mock).mockResolvedValue(
      fail(new Error('Supabase error'))
    )

    const result = await useCase.execute('user-1', {
      provider: 'anthropic',
      modelName: 'claude-3-5-sonnet-20241022',
      apiKey: 'sk-key',
    })

    expect('error' in result).toBe(true)
  })
})
