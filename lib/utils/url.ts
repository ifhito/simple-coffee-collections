const DEFAULT_ORIGIN = 'http://localhost:3000'

type HeaderLike = Pick<Headers, 'get'>

const trimSlashes = (path: string) => path.replace(/^\/+/, '')
function resolveOrigin(incomingHeaders?: HeaderLike): string {
  if (incomingHeaders) {
    return deriveOrigin(incomingHeaders)
  }

  return DEFAULT_ORIGIN
}

function deriveOrigin(hdrs: HeaderLike): string {
  const forwardedHost = hdrs.get('x-forwarded-host')
  const forwardedProto = hdrs.get('x-forwarded-proto')
  const host = forwardedHost ?? hdrs.get('host')

  if (!host) {
    return DEFAULT_ORIGIN
  }

  const proto = forwardedProto ?? 'http'
  return `${proto}://${host}`
}

export function buildAbsoluteUrl(path: string, incomingHeaders?: HeaderLike): string {
  const origin = resolveOrigin(incomingHeaders)
  const normalized = `/${trimSlashes(path)}`
  return `${origin}${normalized}`
}

export function buildProfileShareUrl(userId: string, incomingHeaders?: HeaderLike): string {
  return buildAbsoluteUrl(`/users/${userId}`, incomingHeaders)
}
