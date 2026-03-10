import type { LlmModelFactory, InlineLlmModelInput, OcrModel } from '@/lib/application/ports'
import type { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { createLlmModel, createLlmModelFromPrimitives } from './llm-provider-factory'

export class DefaultLlmModelFactory implements LlmModelFactory {
  createFromUserSettings(
    settings: UserLlmSettings,
    decryptedApiKey: string
  ): OcrModel {
    return createLlmModel(settings, decryptedApiKey)
  }

  createFromInlineSettings(input: InlineLlmModelInput): OcrModel {
    return createLlmModelFromPrimitives(
      input.providerType,
      input.apiUrl,
      input.modelName,
      input.providerTemplate,
      input.apiKey
    )
  }
}
