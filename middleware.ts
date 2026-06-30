import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const publicPaths = ['/login', '/signup']
  const isPublic = publicPaths.some(p => pathname.startsWith(p))
  const isLanding = pathname === '/'
  // Open to everyone, with no redirect either way (info pages).
  const isOpen = pathname === '/privacy'

  if (!user && !isPublic && !isLanding && !isOpen) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged-in users skip the marketing/auth pages, but may still read info pages.
  if (user && (isPublic || isLanding)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Exclude Next internals, the API, and any path containing a dot (static
  // assets like icon.svg) so favicons/images aren't redirected to /login.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.).*)'],
}
