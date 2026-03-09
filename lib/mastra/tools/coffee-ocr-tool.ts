import { z } from 'zod'

export const ROAST_LEVEL_VALUES = [
  'light',
  'cinnamon',
  'medium',
  'high',
  'city',
  'full_city',
  'french',
] as const

export type RoastLevelValue = (typeof ROAST_LEVEL_VALUES)[number]

/**
 * Zod schema for OCR output.
 * OCR auto-fills text fields only; rating fields are intentionally excluded.
 */
export const CoffeeOcrOutputSchema = z.object({
  bean_name: z.string().nullable().describe('コーヒー豆の名前'),
  bean_type: z.string().nullable().describe('産地・品種'),
  roast_level: z
    .enum(ROAST_LEVEL_VALUES)
    .nullable()
    .describe('焙煎度（light/cinnamon/medium/high/city/full_city/french）'),
  shop_name: z.string().nullable().describe('ロースタリー名・店名'),
  shop_address: z.string().nullable().describe('住所（パッケージに記載がある場合）'),
})

export type CoffeeOcrOutput = z.infer<typeof CoffeeOcrOutputSchema>
