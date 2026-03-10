import { DeleteLlmSettingsUseCase } from '../delete-llm-settings'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings'
import { ok, fail } from '@/lib/domain/shared/result'

const mockRepo: UserLlmSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('DeleteLlmSettingsUseCase', () => {
  let useCase: DeleteLlmSettingsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    useCase = new DeleteLlmSettingsUseCase(mockRepo)
  })

  it('returns empty object on success', async () => {
    ;(mockRepo.delete as jest.Mock).mockResolvedValue(ok(undefined))

    const result = await useCase.execute('user-1')

    expect(result).toEqual({})
    expect(mockRepo.delete).toHaveBeenCalledWith('user-1')
  })

  it('returns error when repo fails', async () => {
    ;(mockRepo.delete as jest.Mock).mockResolvedValue(
      fail(new Error('DB connection failed'))
    )

    const result = await useCase.execute('user-1')

    expect(result.error).toBe('DB connection failed')
  })
})
