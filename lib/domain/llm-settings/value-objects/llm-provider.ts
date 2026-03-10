export type LlmProviderType = 'openai_compatible' | 'anthropic' | 'ollama' | 'google'

export class LlmProvider {
  private constructor(private readonly _type: LlmProviderType) {
    Object.freeze(this)
  }

  static create(type: string): LlmProvider | null {
    if (
      type === 'openai_compatible' ||
      type === 'anthropic' ||
      type === 'ollama' ||
      type === 'google'
    ) {
      return new LlmProvider(type as LlmProviderType)
    }
    return null
  }

  get type(): LlmProviderType {
    return this._type
  }

  equals(other: LlmProvider): boolean {
    return this._type === other._type
  }
}
