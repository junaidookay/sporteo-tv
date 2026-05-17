'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForceLogout } from '@/hooks/use-force-logout'

export default function ForceLogoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  useForceLogout({
    onForceLogout: () => {
      router.push('/auth/login?reason=session_expired')
    }
  })

  return <>{children}</>
}
