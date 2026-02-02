/**
 * SupabaseRateLimiter Tests
 *
 * @module __tests__/infrastructure/rate-limiter/supabase-rate-limiter.test
 */

import { SupabaseRateLimiter } from '@/lib/infrastructure/rate-limiter/supabase-rate-limiter'

const buildMockSupabase = () => {
  const mock: any = {
    rpc: jest.fn(),
    from: jest.fn(),
    update: jest.fn(),
    eq: jest.fn(),
  }

  mock.from.mockReturnValue(mock)
  mock.update.mockReturnValue(mock)
  mock.eq.mockResolvedValue({ error: null })

  return mock
}

describe('SupabaseRateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('returns true when rate limit allows request', async () => {
    const mockSupabase = buildMockSupabase()
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null })

    const limiter = new SupabaseRateLimiter(mockSupabase, { serviceName: 'nominatim' })

    await expect(limiter.canMakeRequest()).resolves.toBe(true)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('check_rate_limit', {
      p_service: 'nominatim',
      p_min_interval_ms: 1000,
    })
  })

  it('returns false when rate limit blocks request', async () => {
    const mockSupabase = buildMockSupabase()
    mockSupabase.rpc.mockResolvedValue({ data: false, error: null })

    const limiter = new SupabaseRateLimiter(mockSupabase, { serviceName: 'nominatim' })

    await expect(limiter.canMakeRequest()).resolves.toBe(false)
  })

  it('records request timestamp', async () => {
    const mockSupabase = buildMockSupabase()
    const limiter = new SupabaseRateLimiter(mockSupabase, { serviceName: 'nominatim' })

    await limiter.recordRequest()

    expect(mockSupabase.from).toHaveBeenCalledWith('rate_limiter_state')
    expect(mockSupabase.update).toHaveBeenCalledWith({
      last_request_at: expect.any(String),
    })
    expect(mockSupabase.eq).toHaveBeenCalledWith('service', 'nominatim')
  })

  it('waits until ready when rate limit is hit', async () => {
    const mockSupabase = buildMockSupabase()
    mockSupabase.rpc
      .mockResolvedValueOnce({ data: false, error: null })
      .mockResolvedValueOnce({ data: true, error: null })

    const limiter = new SupabaseRateLimiter(mockSupabase, {
      serviceName: 'nominatim',
      minIntervalMs: 1000,
      pollingIntervalMs: 50,
    })

    const promise = limiter.waitUntilReady()

    await jest.advanceTimersByTimeAsync(50)
    await promise

    expect(mockSupabase.rpc).toHaveBeenCalledTimes(2)
  })

  it('falls back to a conservative wait on database errors', async () => {
    const mockSupabase = buildMockSupabase()
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'fail' } })

    const limiter = new SupabaseRateLimiter(mockSupabase, {
      serviceName: 'nominatim',
      minIntervalMs: 1000,
      pollingIntervalMs: 50,
    })

    const promise = limiter.waitUntilReady()

    await jest.advanceTimersByTimeAsync(1000)
    await promise

    expect(mockSupabase.rpc).toHaveBeenCalledTimes(1)
  })
})
