'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForceLogout } from '@/hooks/use-force-logout'

export default function ForceLogoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  const handleForceLogout = useCallback(() => {
    console.log('[ForceLogoutProvider] Force logout triggered, redirecting...')
    // Use window.location for a full page redirect to ensure clean state
    window.location.href = '/auth/login?reason=session_expired'
  }, [])
  
  useForceLogout(handleForceLogout)

  return <>{children}</>
}
