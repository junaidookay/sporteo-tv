'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useForceLogout(onForceLogout?: () => void) {
  const onForceLogoutRef = useRef(onForceLogout)
  const isProcessingRef = useRef(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Keep callback ref up to date
  useEffect(() => {
    onForceLogoutRef.current = onForceLogout
  }, [onForceLogout])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      console.log('[force_logout] No device_id found, skipping monitoring')
      return
    }

    console.log('[force_logout] Starting session monitoring for device:', deviceId)
    isProcessingRef.current = false

    // Define logout function inside effect to avoid closure issues
    const doLogout = async (reason: string) => {
      if (isProcessingRef.current) {
        console.log('[force_logout] Logout already in progress')
        return
      }
      isProcessingRef.current = true

      console.log('[force_logout] Logging out, reason:', reason)

      // Stop polling immediately
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }

      // Clear device_id
      try {
        localStorage.removeItem('device_id')
      } catch (e) {
        // Ignore
      }

      // Call logout API
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
      } catch (e) {
        console.error('[force_logout] Logout API error:', e)
      }

      // Execute callback or redirect
      const callback = onForceLogoutRef.current
      if (callback && typeof callback === 'function') {
        try {
          callback()
        } catch (e) {
          console.error('[force_logout] Callback error:', e)
          window.location.href = '/auth/login?reason=session_expired'
        }
      } else {
        window.location.href = '/auth/login?reason=session_expired'
      }
    }

    // Check session function
    const checkSession = async () => {
      if (isProcessingRef.current) return

      const currentDeviceId = localStorage.getItem('device_id')
      if (!currentDeviceId) {
        console.log('[force_logout] No device_id during check')
        doLogout('no_device_id')
        return
      }

      try {
        // Check Supabase auth
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          console.log('[force_logout] Supabase auth invalid')
          doLogout('supabase_invalid')
          return
        }

        // Check database session
        const response = await fetch('/api/user-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: 'validate',
            device_id: currentDeviceId
          })
        })

        if (response.status === 401) {
          console.log('[force_logout] Session returned 401')
          doLogout('session_401')
          return
        }

        if (!response.ok) {
          return
        }

        const data = await response.json().catch(() => ({ valid: true }))
        if (data.valid === false) {
          console.log('[force_logout] Session invalid in database')
          doLogout('session_invalid')
        }
      } catch (e) {
        console.error('[force_logout] Check error:', e)
      }
    }

    // Initial check
    checkSession()

    // Start polling - check every 1 second for rapid detection
    pollIntervalRef.current = setInterval(checkSession, 1000)

    // Check on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[force_logout] Page visible')
        checkSession()
      }
    }

    // Check on focus
    const handleFocus = () => {
      console.log('[force_logout] Window focused')
      checkSession()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // Empty deps - only run once on mount
}
