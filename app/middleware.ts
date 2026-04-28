import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const protectedPaths = ['/dashboard', '/profile', '/admin', '/checkout', '/events', '/watch', '/live', '/replays', '/subscriptions']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const deviceId = request.cookies.get('device_id')?.value
    const userId = request.cookies.get('sb-access-token')?.value ||
                   request.cookies.get('supabase-auth-token')?.value

    if (userId && !deviceId) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('reason', 'session_expired')
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}