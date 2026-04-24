import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need auth
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/support',
    '/privacy',
    '/terms',
    '/cookies',
    '/events',
    '/live',
    '/replays',
    '/subscriptions',
    '/auth/login',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/webhooks/stripe',
    '/api/cloudflare/webhooks',
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/events/') || pathname.startsWith('/watch/'))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const supabaseCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb:token')
  
  // If no auth cookie and route requires auth, redirect to login
  if (!supabaseCookie && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Admin routes - will be checked in each admin page
  // Middleware can't easily check database for admin status

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
