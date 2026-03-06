import { createClient } from '../supabase/server'
import type { UserLlmSettingsRepository } from '@/lib/domain/llm-settings/repository'
import { UserLlmSettings } from '@/lib/domain/llm-settings/entity'
import { LlmSettings } from '@/lib/domain/llm-settings/value-objects/llm-settings'
import type { LlmProviderType } from '@/lib/domain/llm-settings/value-objects/llm-provider'
import { ok, fail, type Result } from '@/lib/domain/shared/result'
import type { Database } from '@/lib/types/database.types'

type Row = Database['public']['Tables']['user_llm_settings']['Row']

function mapRowToEntity(row: Row): UserLlmSettings {
  const settings = LlmSettings.fromPrimitive(
    row.provider as LlmProviderType,
    row.provider_template,
    row.api_url,
    row.model_name
  )
  return UserLlmSettings.reconstruct({
    id: row.id,
    userId: row.user_id,
    settings,
    encryptedApiKey: row.encrypted_api_key,
  })
}

export class SupabaseUserLlmSettingsRepository implements UserLlmSettingsRepository {
  async findByUserId(userId: string): Promise<Result<UserLlmSettings | null, Error>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('user_llm_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return ok(null)
        return fail(new Error(`LLM設定の取得に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  async save(
    userId: string,
    settings: LlmSettings,
    encryptedApiKey: string | null
  ): Promise<Result<UserLlmSettings, Error>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('user_llm_settings')
        .upsert(
          {
            user_id: userId,
            provider: settings.provider.type,
            provider_template: settings.providerTemplate,
            api_url: settings.apiUrl,
            encrypted_api_key: encryptedApiKey,
            model_name: settings.modelName,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single()

      if (error) {
        return fail(new Error(`LLM設定の保存に失敗しました: ${error.message}`))
      }

      return ok(mapRowToEntity(data))
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }

  async delete(userId: string): Promise<Result<void, Error>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('user_llm_settings')
        .delete()
        .eq('user_id', userId)

      if (error) {
        return fail(new Error(`LLM設定の削除に失敗しました: ${error.message}`))
      }

      return ok(undefined)
    } catch (err) {
      return fail(err instanceof Error ? err : new Error('Unknown error'))
    }
  }
}
