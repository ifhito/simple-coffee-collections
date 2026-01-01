import { headers as nextHeaders } from 'next/headers'

const DEFAULT_ORIGIN = 'http://localhost:3000'

const trimSlashes = (path: string) => path.replace(/^\/+/, '')

function resolveOrigin(incomingHeaders?: Headers): string {
  if (incomingHeaders) {
    return deriveOrigin(incomingHeaders)
  }

  try {
    const hdrs = nextHeaders()
    return deriveOrigin(hdrs)
  } catch {
    return DEFAULT_ORIGIN
  }
}

function deriveOrigin(hdrs: Headers): string {
  const forwardedHost = hdrs.get('x-forwarded-host')
  const forwardedProto = hdrs.get('x-forwarded-proto')
  const host = forwardedHost ?? hdrs.get('host')

  if (!host) {
    return DEFAULT_ORIGIN
  }

  const proto = forwardedProto ?? 'http'
  return `${proto}://${host}`
}

export function buildAbsoluteUrl(path: string, incomingHeaders?: Headers): string {
  const origin = resolveOrigin(incomingHeaders)
  const normalized = `/${trimSlashes(path)}`
  return `${origin}${normalized}`
}

export function buildProfileShareUrl(userId: string, incomingHeaders?: Headers): string {
  return buildAbsoluteUrl(`/users/${userId}`, incomingHeaders)
}
