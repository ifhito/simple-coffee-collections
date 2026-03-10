CREATE TABLE user_llm_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('openai_compatible', 'anthropic', 'ollama')),
  provider_template TEXT,
  api_url           TEXT,
  encrypted_api_key TEXT,  -- format: iv_hex:tag_hex:ciphertext_hex
  model_name        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_llm_settings UNIQUE (user_id)
);

CREATE TRIGGER trigger_user_llm_settings_updated_at
  BEFORE UPDATE ON user_llm_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_llm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_llm_settings_select_own" ON user_llm_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_llm_settings_insert_own" ON user_llm_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_llm_settings_update_own" ON user_llm_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_llm_settings_delete_own" ON user_llm_settings FOR DELETE USING (auth.uid() = user_id);
