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

    const pathname = window.location.pathname
    console.log('[force_logout] Mounted on page:', pathname)

    // CRITICAL: Don't run on auth pages at all
    if (pathname.startsWith('/auth/')) {
      console.log('[force_logout] Skipping - on auth page')
      return
    }

    const deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      console.log('[force_logout] Skipping - no device_id')
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

      console.log('[force_logout] FORCED LOGOUT triggered, reason:', reason)

      // Stop polling immediately
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }

      // Clear local storage device_id
      try {
        localStorage.removeItem('device_id')
        console.log('[force_logout] Cleared device_id from localStorage')
      } catch (e) {
        // Ignore
      }

      // Clear all Supabase auth state client-side
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        console.log('[force_logout] Cleared Supabase auth')
      } catch (e) {
        console.error('[force_logout] Supabase signOut error:', e)
      }

      // Call logout API to clear server-side session
      try {
        console.log('[force_logout] Calling logout API...')
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        console.log('[force_logout] Logout API completed')
      } catch (e) {
        console.error('[force_logout] Logout API error:', e)
      }

      // Execute callback or redirect
      const callback = onForceLogoutRef.current
      if (callback && typeof callback === 'function') {
        try {
          console.log('[force_logout] Executing callback...')
          callback()
        } catch (e) {
          console.error('[force_logout] Callback error:', e)
          // Fallback to full page reload redirect
          window.location.href = '/auth/login?reason=session_expired'
        }
      } else {
        console.log('[force_logout] Redirecting to login...')
        // Use full page reload to ensure clean state
        window.location.href = '/auth/login?reason=session_expired'
      }
    }

    // Check session function
    const checkSession = async () => {
      if (isProcessingRef.current) {
        return
      }

      const currentDeviceId = localStorage.getItem('device_id')
      if (!currentDeviceId) {
        console.log('[force_logout] No device_id during check')
        doLogout('no_device_id')
        return
      }

      try {
        // Check Supabase auth first
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          console.log('[force_logout] Auth error:', authError.message)
          doLogout('supabase_auth_error')
          return
        }

        if (!user) {
          console.log('[force_logout] No user in Supabase session')
          doLogout('no_supabase_user')
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
          console.log('[force_logout] Session validation returned 401 - session invalid')
          doLogout('session_401')
          return
        }

        if (!response.ok) {
          return
        }

        const data = await response.json().catch(() => ({ valid: true }))
        if (data.valid === false) {
          console.log('[force_logout] Session marked as invalid in response')
          doLogout('session_invalid_response')
        }
      } catch (e) {
        console.error('[force_logout] Check error:', e)
      }
    }

    // Initial check
    console.log('[force_logout] Running initial session check...')
    checkSession()

    // Start polling - check every 1 second for rapid detection
    pollIntervalRef.current = setInterval(() => {
      checkSession()
    }, 1000)

    // Check on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[force_logout] Page visible, checking session')
        checkSession()
      }
    }

    // Check on focus
    const handleFocus = () => {
      console.log('[force_logout] Window focused, checking session')
      checkSession()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      console.log('[force_logout] Cleaning up - stopping polling')
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // Empty deps - only run once on mount
}
