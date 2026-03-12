/**
 * TypeScript Type Tests for Coffee-related Types
 * TDD Red Phase: Type tests are written before implementation
 *
 * These tests verify:
 * - CoffeeEvaluationDisplay extends CoffeeEvaluation with shop_name
 * - CoffeeEvaluationWithUser includes display_name field
 * - Type-safe assignment works correctly
 */

import type { CoffeeEvaluation, CoffeeEvaluationDisplay, CoffeeEvaluationWithUser } from '@/lib/types/coffee'

describe('Coffee Type Definitions', () => {
  describe('CoffeeEvaluationDisplay', () => {
    it('should extend CoffeeEvaluation with shop_name field', () => {
      const mockEvaluation: CoffeeEvaluation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: 'user-123',
        shop_id: null,
        bean_name: 'イルガチェフェ G1',
        bean_type: 'エチオピア イルガチェフェ',
        roast_level: '中煎り',
        acidity: 8,
        bitterness: 4,
        aroma: 9,
        overall_rating: 8,
        is_public: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      const display: CoffeeEvaluationDisplay = {
        ...mockEvaluation,
        shop_name: 'カフェテスト',
      }

      expect(display.id).toBe(mockEvaluation.id)
      expect(display.shop_name).toBe('カフェテスト')
    })
  })

  describe('CoffeeEvaluationWithUser', () => {
    it('should extend CoffeeEvaluationDisplay with display_name', () => {
      const base: CoffeeEvaluationDisplay = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: 'user-123',
        shop_id: null,
        shop_name: 'カフェテスト',
        bean_name: 'イルガチェフェ G1',
        bean_type: 'エチオピア イルガチェフェ',
        roast_level: '中煎り',
        acidity: 8,
        bitterness: 4,
        aroma: 9,
        overall_rating: 8,
        is_public: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }

      const withUser: CoffeeEvaluationWithUser = {
        ...base,
        display_name: 'テストユーザー',
      }

      expect(withUser.id).toBe(base.id)
      expect(withUser.shop_name).toBe('カフェテスト')
      expect(withUser.display_name).toBe('テストユーザー')
    })

    it('should include display_name field as string | null', () => {
      const withDisplayName: CoffeeEvaluationWithUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: 'user-123',
        shop_id: null,
        shop_name: 'カフェテスト',
        bean_name: 'イルガチェフェ',
        bean_type: 'エチオピア',
        roast_level: '中煎り',
        acidity: 8,
        bitterness: 4,
        aroma: 9,
        overall_rating: 8,
        is_public: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        display_name: 'ユーザー名',
      }

      const withoutDisplayName: CoffeeEvaluationWithUser = {
        id: '223e4567-e89b-12d3-a456-426614174001',
        user_id: 'user-456',
        shop_id: null,
        shop_name: 'コーヒーショップ',
        bean_name: 'ブラジル スプレモ',
        bean_type: 'ブラジル',
        roast_level: '深煎り',
        acidity: 6,
        bitterness: 8,
        aroma: 7,
        overall_rating: 7,
        is_public: true,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        display_name: null,
      }

      expect(withDisplayName.display_name).toBe('ユーザー名')
      expect(withoutDisplayName.display_name).toBeNull()
      expect(typeof withDisplayName.display_name === 'string' || withDisplayName.display_name === null).toBe(true)
    })

    it('should work with arrays of CoffeeEvaluationWithUser', () => {
      const evaluations: CoffeeEvaluationWithUser[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          user_id: 'user-123',
          shop_id: null,
          shop_name: 'カフェA',
          bean_name: 'Ethiopia',
          bean_type: 'エチオピア',
          roast_level: '中煎り',
          acidity: 8,
          bitterness: 4,
          aroma: 9,
          overall_rating: 8,
          is_public: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
          display_name: 'ユーザーA',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          user_id: 'user-456',
          shop_id: null,
          shop_name: 'カフェB',
          bean_name: 'Brazil',
          bean_type: 'ブラジル',
          roast_level: '深煎り',
          acidity: 6,
          bitterness: 8,
          aroma: 7,
          overall_rating: 7,
          is_public: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
          display_name: null,
        },
      ]

      expect(evaluations).toHaveLength(2)
      expect(evaluations[0].display_name).toBe('ユーザーA')
      expect(evaluations[1].display_name).toBeNull()
    })
  })
})
