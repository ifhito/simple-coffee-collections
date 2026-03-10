import type { OcrExtractedData } from '@/lib/application/ocr/dto'
import type { OcrModel } from './llm-model-factory'

export type OcrExecutionResult =
  | { success: true; data: OcrExtractedData }
  | { error: string }

export interface OcrExecutor {
  execute(
    model: OcrModel,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<OcrExecutionResult>
}
