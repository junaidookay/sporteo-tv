'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useForceLogout(onForceLogout?: () => void) {
  const router = useRouter()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const handleForceLogout = useCallback(async () => {
    if (!isLoggedIn) return
    setIsLoggedIn(false)
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
    
    localStorage.removeItem('device_id')
    
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error('[force_logout] Logout fetch failed:', e)
    }
    
    if (onForceLogout) {
      onForceLogout()
    } else {
      window.location.href = '/auth/login?reason=session_expired'
    }
  }, [router, onForceLogout, isLoggedIn])

  const checkSessionValidity = useCallback(async () => {
    if (!isLoggedIn) return
    
    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      handleForceLogout()
      return
    }

    try {
      // Check Supabase auth - this gets invalidated when same user logs in elsewhere
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log('[force_logout] Supabase auth invalid:', authError?.message)
        handleForceLogout()
        return
      }

      // Also check database session
      const response = await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'validate', device_id: deviceId })
      })

      if (response.status === 401) {
        handleForceLogout()
        return
      }

      if (!response.ok) {
        return
      }

      const data = await response.json().catch(() => ({}))
      if (data.valid === false) {
        handleForceLogout()
      }
    } catch (e) {
      console.error('[force_logout] Session check failed:', e)
    }
  }, [handleForceLogout, isLoggedIn])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      console.log('[force_logout] No device_id found, redirecting')
      handleForceLogout()
      return
    }

    console.log('[force_logout] Starting polling with device_id:', deviceId)

    checkSessionValidity()
    pollIntervalRef.current = setInterval(checkSessionValidity, 3000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        console.log('[force_logout] Page became visible, checking session')
        checkSessionValidity()
      }
    }

    const handleFocus = () => {
      if (isLoggedIn) {
        console.log('[force_logout] Window gained focus, checking session')
        checkSessionValidity()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [handleForceLogout, checkSessionValidity, isLoggedIn])
}
