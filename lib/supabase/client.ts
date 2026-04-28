import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          return document.cookie.split('; ').map(pair => {
            const [name, ...rest] = pair.split('=')
            return { name, value: rest.join('=') }
          }).filter(c => c.name)
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            const expires = options?.expires
            let cookieStr = `${name}=${value}`
            if (expires) cookieStr += `; expires=${expires.toUTCString()}`
            if (options?.path) cookieStr += `; path=${options.path}`
            if (options?.domain) cookieStr += `; domain=${options.domain}`
            if (options?.secure) cookieStr += `; secure`
            if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`
            document.cookie = cookieStr
          })
        }
      }
    }
  )
}