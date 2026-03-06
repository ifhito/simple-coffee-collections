import type { RoastLevelValue } from '@/lib/mastra/tools/coffee-ocr-tool'

/**
 * OCR extraction output - field names match FormData keys used by createCoffeeEvaluation.
 * Ratings are 1-10 integers to match the existing Rating domain object.
 * shop_latitude/longitude are excluded (handled by geocoding).
 */
export interface OcrExtractedData {
  bean_name: string | null
  bean_type: string | null
  roast_level: RoastLevelValue | null
  shop_name: string | null
  shop_address: string | null
  acidity: number | null
  aroma: number | null
  bitterness: number | null
  overall_rating: number | null
}
