import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /protected to /dashboard
  if (pathname === '/protected') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

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
    return await updateSession(request)
  }

  // Check for auth cookie
  const supabaseCookie = request.cookies.get('sb-access-token') || request.cookies.get('sb:token')
  
  // If no auth cookie and route requires auth, redirect to login
  if (!supabaseCookie && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}