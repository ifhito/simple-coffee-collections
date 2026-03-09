ALTER TABLE user_llm_settings
  DROP CONSTRAINT user_llm_settings_provider_check,
  ADD CONSTRAINT user_llm_settings_provider_check
    CHECK (provider IN ('openai_compatible', 'anthropic', 'ollama', 'google'));
