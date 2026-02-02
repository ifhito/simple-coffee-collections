/**
 * NominatimClient Tests
 *
 * @module __tests__/infrastructure/nominatim/nominatim-client.test
 */

import { NominatimAPIClient } from '@/lib/infrastructure/nominatim/nominatim-client'
import type { NominatimPlace } from '@/lib/infrastructure/nominatim/nominatim-types'

const buildMockRateLimiter = () => ({
  canMakeRequest: jest.fn().mockResolvedValue(true),
  waitUntilReady: jest.fn().mockResolvedValue(undefined),
  recordRequest: jest.fn().mockResolvedValue(undefined),
})

describe('NominatimAPIClient', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('returns results on successful search and sets headers', async () => {
    const mockRateLimiter = buildMockRateLimiter()
    const places: NominatimPlace[] = [
      {
        place_id: 1,
        display_name: 'Mock Cafe, Tokyo, Japan',
        name: 'Mock Cafe',
        lat: '35.1',
        lon: '139.1',
        class: 'amenity',
        type: 'cafe',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(places),
    })

    const client = new NominatimAPIClient(mockRateLimiter, {
      userAgent: 'TestAgent/1.0',
      referer: 'http://localhost:3000',
      baseUrl: 'https://example.test',
    })

    const results = await client.search('Mock Cafe')

    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Mock Cafe')
    expect(mockRateLimiter.recordRequest).toHaveBeenCalled()

    const [requestedUrl, options] = (global.fetch as jest.Mock).mock.calls[0]
    const url = new URL(requestedUrl)
    expect(url.searchParams.get('q')).toBe('Mock Cafe')
    expect(url.searchParams.get('amenity')).toBeNull()
    expect(url.searchParams.get('addressdetails')).toBe('1')
    expect((options as any).headers['User-Agent']).toBe('TestAgent/1.0')
    expect((options as any).headers.Referer).toBe('http://localhost:3000')
  })

  it('filters results by amenity types when provided', async () => {
    const mockRateLimiter = buildMockRateLimiter()
    const places: NominatimPlace[] = [
      {
        place_id: 1,
        display_name: 'Mock Cafe, Tokyo, Japan',
        name: 'Mock Cafe',
        lat: '35.1',
        lon: '139.1',
        class: 'amenity',
        type: 'cafe',
      },
      {
        place_id: 2,
        display_name: 'Mock Diner, Tokyo, Japan',
        name: 'Mock Diner',
        lat: '35.2',
        lon: '139.2',
        class: 'amenity',
        type: 'restaurant',
      },
      {
        place_id: 3,
        display_name: 'Mock Grocery, Tokyo, Japan',
        name: 'Mock Grocery',
        lat: '35.3',
        lon: '139.3',
        class: 'shop',
        type: 'supermarket',
      },
      {
        place_id: 4,
        display_name: 'Mock Fast Food, Tokyo, Japan',
        name: 'Mock Fast Food',
        lat: '35.4',
        lon: '139.4',
        class: 'amenity',
        type: 'fast_food',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(places),
    })

    const client = new NominatimAPIClient(mockRateLimiter, {
      userAgent: 'TestAgent/1.0',
      baseUrl: 'https://example.test',
    })

    const results = await client.search('Mock Cafe', {
      amenity: 'cafe,restaurant',
    })

    expect(results.map((result) => result.name)).toEqual([
      'Mock Cafe',
      'Mock Diner',
    ])
  })

  it('waits when rate limit blocks request', async () => {
    const mockRateLimiter = buildMockRateLimiter()
    mockRateLimiter.canMakeRequest.mockResolvedValue(false)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue([]),
    })

    const client = new NominatimAPIClient(mockRateLimiter, {
      userAgent: 'TestAgent/1.0',
      baseUrl: 'https://example.test',
    })

    await client.search('Mock Cafe')

    expect(mockRateLimiter.waitUntilReady).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalled()
  })

  it('returns empty array on 429/503 errors', async () => {
    const mockRateLimiter = buildMockRateLimiter()

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: jest.fn().mockResolvedValue([]),
    })

    const client = new NominatimAPIClient(mockRateLimiter, {
      userAgent: 'TestAgent/1.0',
      baseUrl: 'https://example.test',
    })

    const results = await client.search('Mock Cafe')

    expect(results).toEqual([])
    expect(mockRateLimiter.recordRequest).toHaveBeenCalled()
  })

  it('returns empty array on network errors', async () => {
    const mockRateLimiter = buildMockRateLimiter()

    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const client = new NominatimAPIClient(mockRateLimiter, {
      userAgent: 'TestAgent/1.0',
      baseUrl: 'https://example.test',
    })

    const results = await client.search('Mock Cafe')

    expect(results).toEqual([])
  })
})
