import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{
            name: string
            value: string
            options?: Parameters<NextResponse['cookies']['set']>[2]
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  // IMPORTANT: This ensures the user's auth state is refreshed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow unauthenticated access to specific public pages (e.g., community, user profiles)
  const pathname = request.nextUrl.pathname
  const publicMatchers: Array<(p: string) => boolean> = [
    (p) => p === '/',
    (p) => p === '/coffee', // handled in page.tsx to redirect appropriately
    (p) => /^\/coffee\/(?!new\/?$)[^/]+$/.test(p), // allow viewing coffee detail without auth, but not /coffee/new
    (p) => p.startsWith('/coffee/community'),
    (p) => p.startsWith('/users'),
    (p) => p.startsWith('/login'),
    (p) => p.startsWith('/signup'),
    (p) => p.startsWith('/auth'),
    (p) => p.startsWith('/_next'),
  ]
  const isPublic = publicMatchers.some((match) => match(pathname))

  // Protected routes - redirect to login if not authenticated
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
