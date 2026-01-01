import { buildAbsoluteUrl, buildProfileShareUrl } from '../url'

const headersFrom = (init?: Record<string, string>) => new Headers(init)

describe('buildAbsoluteUrl', () => {
  it('builds absolute url from forwarded proto/host headers', () => {
    const headers = headersFrom({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'coffee.example.com',
    })

    const url = buildAbsoluteUrl('/users/user-123', headers)
    expect(url).toBe('https://coffee.example.com/users/user-123')
  })

  it('falls back to http when proto missing', () => {
    const headers = headersFrom({
      'x-forwarded-host': 'coffee.example.com',
    })

    const url = buildAbsoluteUrl('/users/user-123', headers)
    expect(url).toBe('http://coffee.example.com/users/user-123')
  })

  it('uses localhost:3000 when no headers provided', () => {
    const url = buildAbsoluteUrl('/users/user-123')
    expect(url).toBe('http://localhost:3000/users/user-123')
  })

  it('avoids double slashes when joining paths', () => {
    const headers = headersFrom({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'coffee.example.com',
    })

    const url = buildAbsoluteUrl('///users/user-123', headers)
    expect(url).toBe('https://coffee.example.com/users/user-123')
  })
})

describe('buildProfileShareUrl', () => {
  it('builds absolute profile URL for given userId', () => {
    const headers = headersFrom({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'coffee.example.com',
    })

    const url = buildProfileShareUrl('user-abc', headers)
    expect(url).toBe('https://coffee.example.com/users/user-abc')
  })

  it('falls back to localhost when headers missing', () => {
    const url = buildProfileShareUrl('user-abc')
    expect(url).toBe('http://localhost:3000/users/user-abc')
  })
})
