'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useForceLogout(onForceLogout?: () => void) {
  const router = useRouter()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const handleForceLogout = useCallback(async () => {
    if (!isLoggedIn) return
    setIsLoggedIn(false)
    
    eventSourceRef.current?.close()
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
    
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('device_id')
    
    if (onForceLogout) {
      onForceLogout()
    } else {
      router.push('/auth/login?reason=session_expired')
    }
  }, [router, onForceLogout, isLoggedIn])

  const checkSessionValidity = useCallback(async () => {
    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) return

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        handleForceLogout()
        return
      }

      const response = await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'validate', device_id: deviceId })
      })

      if (response.status === 401 || !response.ok) {
        handleForceLogout()
        return
      }

      const data = await response.json()
      if (data.valid === false) {
        handleForceLogout()
      }
    } catch (e) {
      console.error('[force_logout] Session check failed:', e)
    }
  }, [handleForceLogout])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) return

    const connectSSE = () => {
      try {
        eventSourceRef.current = new EventSource(`/api/user-sessions?device_id=${encodeURIComponent(deviceId)}`)

        eventSourceRef.current.addEventListener('force_logout', (event) => {
          console.log('[force_logout] Received SSE event:', event)
          handleForceLogout()
        })

        eventSourceRef.current.addEventListener('session_invalid', (event) => {
          console.log('[force_logout] Received session_invalid event')
          handleForceLogout()
        })

        eventSourceRef.current.onerror = () => {
          eventSourceRef.current?.close()
          eventSourceRef.current = null
          reconnectTimeoutRef.current = setTimeout(connectSSE, 5000)
        }
      } catch (e) {
        console.error('[force_logout] SSE connection failed:', e)
        reconnectTimeoutRef.current = setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    pollIntervalRef.current = setInterval(checkSessionValidity, 5000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[force_logout] Page became visible, checking session')
        checkSessionValidity()
      }
    }

    const handleFocus = () => {
      console.log('[force_logout] Window gained focus, checking session')
      checkSessionValidity()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [handleForceLogout, checkSessionValidity])
}
