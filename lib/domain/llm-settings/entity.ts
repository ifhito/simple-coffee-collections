import { LlmSettings } from './value-objects/llm-settings'

export interface UserLlmSettingsProps {
  id: string
  userId: string
  settings: LlmSettings
  encryptedApiKey: string | null
}

export class UserLlmSettings {
  private constructor(private readonly props: UserLlmSettingsProps) {
    Object.freeze(this)
  }

  static reconstruct(props: UserLlmSettingsProps): UserLlmSettings {
    return new UserLlmSettings(props)
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get settings(): LlmSettings {
    return this.props.settings
  }

  get encryptedApiKey(): string | null {
    return this.props.encryptedApiKey
  }

  get hasApiKey(): boolean {
    return this.props.encryptedApiKey !== null && this.props.encryptedApiKey.length > 0
  }
}
