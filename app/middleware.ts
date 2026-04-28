import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const protectedPaths = ['/dashboard', '/profile', '/admin', '/checkout', '/events', '/watch', '/live', '/replays', '/subscriptions']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const deviceId = request.cookies.get('device_id')?.value

    if (deviceId) {
      const supabaseResponse = NextResponse.next({ request })
      const cookieHeader = request.headers.get('cookie') || ''

      try {
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        const host = request.headers.get('host') || request.nextUrl.host
        const baseUrl = `${protocol}://${host}`

        const sessionResponse = await fetch(`${baseUrl}/api/user-sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cookie': cookieHeader
          },
          body: JSON.stringify({
            action: 'validate',
            device_id: deviceId
          })
        })

        const sessionData = await sessionResponse.json()

        if (sessionData.valid === false) {
          const url = request.nextUrl.clone()
          url.pathname = '/auth/login'
          url.searchParams.set('reason', 'session_expired')
          return NextResponse.redirect(url)
        }
      } catch (e) {
        console.error('Session validation error:', e)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}