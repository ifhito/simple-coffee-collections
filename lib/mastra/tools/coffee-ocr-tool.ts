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
 * Zod schema for OCR output - maps 1:1 to coffee_evaluations DB fields.
 * Ratings use 1-10 integer scale to match the existing Rating domain object.
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
  acidity: z
    .number()
    .int()
    .min(1)
    .max(10)
    .nullable()
    .describe('酸味スコア（1-10）'),
  aroma: z
    .number()
    .int()
    .min(1)
    .max(10)
    .nullable()
    .describe('香りスコア（1-10）'),
  bitterness: z
    .number()
    .int()
    .min(1)
    .max(10)
    .nullable()
    .describe('苦味スコア（1-10）'),
  overall_rating: z
    .number()
    .int()
    .min(1)
    .max(10)
    .nullable()
    .describe('総合評価スコア（1-10）'),
})

export type CoffeeOcrOutput = z.infer<typeof CoffeeOcrOutputSchema>
