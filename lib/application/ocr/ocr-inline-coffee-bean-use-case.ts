import type { LlmProviderType } from '@/lib/domain/llm-settings/value-objects/llm-provider'
import type { LlmModelFactory, OcrExecutor } from '@/lib/application/ports'
import type { OcrCoffeeBeanResult } from './ocr-coffee-bean-use-case'

export type OcrInlineInput = {
  providerType: LlmProviderType
  apiUrl: string | null
  modelName: string
  providerTemplate: string | null
  apiKey: string
  imageBuffer: Buffer
  mimeType: string
}

export class OcrInlineCoffeeBeanUseCase {
  constructor(
    private readonly llmModelFactory: LlmModelFactory,
    private readonly ocrExecutor: OcrExecutor
  ) {}

  async execute(input: OcrInlineInput): Promise<OcrCoffeeBeanResult> {
    const model = this.llmModelFactory.createFromInlineSettings({
      providerType: input.providerType,
      apiUrl: input.apiUrl,
      modelName: input.modelName,
      providerTemplate: input.providerTemplate,
      apiKey: input.apiKey,
    })
    return this.ocrExecutor.execute(model, input.imageBuffer, input.mimeType)
  }
}
