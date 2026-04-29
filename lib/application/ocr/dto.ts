import type { RoastLevelValue } from '@/lib/mastra/tools/coffee-ocr-tool'

/**
 * OCR extraction output - auto-fill target fields only.
 * shop_latitude/longitude are excluded (handled by geocoding).
 */
export type OcrExtractedData = {
  bean_name: string | null
  bean_type: string | null
  roast_level: RoastLevelValue | null
  shop_name: string | null
  shop_address: string | null
}
