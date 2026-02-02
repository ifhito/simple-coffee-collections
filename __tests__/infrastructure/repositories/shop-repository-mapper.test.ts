/**
 * ShopRepositoryMapper Tests
 *
 * @module __tests__/infrastructure/repositories/shop-repository-mapper.test
 */

import { ShopRepositoryMapper } from '@/lib/infrastructure/repositories/shop-repository-mapper'

const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

describe('ShopRepositoryMapper', () => {
  afterEach(() => {
    consoleWarnSpy.mockClear()
  })

  it('converts database record with full data', () => {
    const result = ShopRepositoryMapper.toShopSearchResult({
      shop_name: 'Blue Bottle Coffee',
      shop_address: '東京都渋谷区神南1-1-1',
      shop_latitude: 35.6581,
      shop_longitude: 139.7414,
    })

    expect(result.name).toBe('Blue Bottle Coffee')
    expect(result.address).toBe('東京都渋谷区神南1-1-1')
    expect(result.location?.latitude).toBe(35.6581)
    expect(result.location?.longitude).toBe(139.7414)
    expect(result.source).toBe('database')
  })

  it('handles null address', () => {
    const result = ShopRepositoryMapper.toShopSearchResult({
      shop_name: 'Cafe No Address',
      shop_address: null,
      shop_latitude: 35.6581,
      shop_longitude: 139.7414,
    })

    expect(result.address).toBeNull()
    expect(result.location).not.toBeNull()
  })

  it('returns null location when coordinates are missing', () => {
    const result = ShopRepositoryMapper.toShopSearchResult({
      shop_name: 'Cafe Missing Location',
      shop_address: '東京都',
      shop_latitude: null,
      shop_longitude: null,
    })

    expect(result.location).toBeNull()
  })

  it('returns null location when coordinates are invalid', () => {
    const result = ShopRepositoryMapper.toShopSearchResult({
      shop_name: 'Cafe Invalid Location',
      shop_address: '東京都',
      shop_latitude: 999,
      shop_longitude: 999,
    })

    expect(result.location).toBeNull()
    expect(consoleWarnSpy).toHaveBeenCalled()
  })
})
