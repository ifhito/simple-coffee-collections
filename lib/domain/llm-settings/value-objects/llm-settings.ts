import { Result, ok, fail } from '../../shared/result'
import { LlmProvider, LlmProviderType } from './llm-provider'

export interface LlmSettingsInput {
  provider: LlmProviderType
  providerTemplate?: string | null
  apiUrl?: string | null
  modelName: string
}

export class LlmSettings {
  private constructor(
    private readonly _provider: LlmProvider,
    private readonly _providerTemplate: string | null,
    private readonly _apiUrl: string | null,
    private readonly _modelName: string
  ) {
    Object.freeze(this)
  }

  static create(input: LlmSettingsInput): Result<LlmSettings, string> {
    const provider = LlmProvider.create(input.provider)
    if (!provider) {
      return fail(`不正なプロバイダーです: ${input.provider}`)
    }

    const modelName = input.modelName.trim()
    if (!modelName) {
      return fail('モデル名は必須です')
    }

    if (provider.type === 'openai_compatible') {
      const apiUrl = input.apiUrl?.trim() ?? ''
      if (!apiUrl) {
        return fail('OpenAI互換APIのURLは必須です')
      }
      return ok(
        new LlmSettings(provider, input.providerTemplate ?? null, apiUrl, modelName)
      )
    }

    if (provider.type === 'ollama') {
      const apiUrl = input.apiUrl?.trim() ?? 'http://localhost:11434/api'
      return ok(
        new LlmSettings(provider, input.providerTemplate ?? null, apiUrl, modelName)
      )
    }

    // anthropic: no apiUrl needed
    return ok(new LlmSettings(provider, input.providerTemplate ?? null, null, modelName))
  }

  static fromPrimitive(
    providerType: LlmProviderType,
    providerTemplate: string | null,
    apiUrl: string | null,
    modelName: string
  ): LlmSettings {
    const provider = LlmProvider.create(providerType)!
    return new LlmSettings(provider, providerTemplate, apiUrl, modelName)
  }

  get provider(): LlmProvider {
    return this._provider
  }

  get providerTemplate(): string | null {
    return this._providerTemplate
  }

  get apiUrl(): string | null {
    return this._apiUrl
  }

  get modelName(): string {
    return this._modelName
  }
}
