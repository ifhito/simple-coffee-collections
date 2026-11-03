export const KNOWN_PROVIDERS = [
  {
    template: 'together',
    label: 'Together AI（無料Vision）',
    description: 'Llama-Vision-Free が完全無料',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-Vision-Free',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'groq',
    label: 'Groq（高速・安価）',
    description: '無料枠あり。超高速推論',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'qwen/qwen3.8-27b',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'openrouter',
    label: 'OpenRouter（多モデル対応）',
    description: '400+モデル。無料モデルあり',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'nvidia/nemotron-3.5-super-vl:free',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'fireworks',
    label: 'Fireworks AI（低コスト）',
    description: '$0.20/Mトークン〜',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p2-11b-vision-instruct',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
  {
    template: 'gemini',
    label: 'Google Gemini（無料枠あり）',
    description: 'Gemini Flash Latest。15RPM無料。初めての方におすすめ',
    baseUrl: null,
    defaultModel: 'gemini-flash-latest',
    requiresApiKey: true,
    providerType: 'google' as const,
  },
  {
    template: 'anthropic',
    label: 'Anthropic Claude',
    description: 'Claude Haiku / Sonnet 等。画像読み取りに強い',
    baseUrl: null,
    defaultModel: 'claude-haiku-5-5',
    requiresApiKey: true,
    providerType: 'anthropic' as const,
  },
  {
    template: 'custom',
    label: 'カスタム / Ollama',
    description: 'OpenAI互換URL直接入力。Ollamaローカルサーバーも対応',
    baseUrl: '',
    defaultModel: '',
    requiresApiKey: true,
    providerType: 'openai_compatible' as const,
  },
] as const

import type { LlmProviderType } from '@/lib/domain/llm-settings/value-objects/llm-provider'

export function getProviderTypeByTemplate(template: string): LlmProviderType {
  return KNOWN_PROVIDERS.find((p) => p.template === template)?.providerType ?? 'openai_compatible'
}
