import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const protectedPaths = ['/dashboard', '/profile', '/admin', '/checkout', '/events', '/watch', '/live', '/replays', '/subscriptions']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const deviceId = request.cookies.get('device_id')?.value

    if (deviceId) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return response.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  response.cookies.set(name, value, options)
                })
              },
            },
          }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          const url = request.nextUrl.clone()
          url.pathname = '/auth/login'
          url.searchParams.set('reason', 'session_expired')
          return NextResponse.redirect(url)
        }

        const { data: session, error: sessionError } = await supabase
          .from('user_sessions')
          .select('id, user_id, device_id, is_active, created_at')
          .eq('user_id', user.id)
          .eq('device_id', deviceId)
          .eq('is_active', true)
          .maybeSingle()

        if (sessionError) {
          console.error('Session query error:', sessionError)
        }

        if (!session) {
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