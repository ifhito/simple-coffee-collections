import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const baseURL = process.env.EVAL_OLLAMA_BASE_URL ?? 'http://localhost:11434/v1'

const provider = createOpenAICompatible({
  baseURL,
  apiKey: 'ollama',
  name: 'ollama',
  supportsStructuredOutputs: true,
})

/**
 * Ollama 経由で AI SDK モデルを取得する。
 * 環境変数:
 *   EVAL_OLLAMA_BASE_URL  (default: http://localhost:11434/v1)
 *   EVAL_TARGET_MODEL     (default: llama3.1)              — text-mode case 用
 *   EVAL_VISION_MODEL     (default: qwen2.5vl:latest)      — image-mode case 用
 *   EVAL_JUDGE_MODEL      (default: llama3.1)              — judge 用
 */
export function ollamaModel(modelName: string) {
  return provider(modelName)
}

export function targetModel() {
  return ollamaModel(process.env.EVAL_TARGET_MODEL ?? 'llama3.1')
}

export function visionModel() {
  return ollamaModel(process.env.EVAL_VISION_MODEL ?? 'qwen2.5vl:latest')
}

export function judgeModel() {
  return ollamaModel(process.env.EVAL_JUDGE_MODEL ?? 'llama3.1')
}
