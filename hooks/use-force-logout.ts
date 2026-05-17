'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useForceLogout(onForceLogout?: () => void) {
  const router = useRouter()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleForceLogout = useCallback(async () => {
    eventSourceRef.current?.close()
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('device_id')
    
    if (onForceLogout) {
      onForceLogout()
    } else {
      router.push('/auth/login?reason=session_expired')
    }
  }, [router, onForceLogout])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) return

    const connectSSE = () => {
      eventSourceRef.current = new EventSource(`/api/user-sessions?device_id=${encodeURIComponent(deviceId)}`)

      eventSourceRef.current.addEventListener('force_logout', (event) => {
        console.log('[force_logout] Received event:', event)
        handleForceLogout()
      })

      eventSourceRef.current.onerror = async () => {
        eventSourceRef.current?.close()
        eventSourceRef.current = null
        
        const currentDeviceId = localStorage.getItem('device_id')
        if (currentDeviceId) {
          try {
            const response = await fetch('/api/user-sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ action: 'validate', device_id: currentDeviceId })
            })
            if (response.status === 401 || !response.ok) {
              handleForceLogout()
              return
            }
          } catch (e) {
            console.error('[force_logout] Session check failed:', e)
          }
        }
        reconnectTimeoutRef.current = setTimeout(connectSSE, 3000)
      }
    }

    connectSSE()

    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [handleForceLogout])
}
