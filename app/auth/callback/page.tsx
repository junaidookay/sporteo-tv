'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      
      if (!code) {
        setStatus('error')
        setErrorMessage('No authorization code received')
        return
      }

      try {
        const supabase = createClient()
        
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('Callback error:', error)
          setStatus('error')
          setErrorMessage(error.message)
          return
        }

        // If we got here, the callback was successful
        setStatus('success')
        
        // Redirect to login or dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err: any) {
        console.error('Callback error:', err)
        setStatus('error')
        setErrorMessage(err.message || 'An unexpected error occurred')
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Activating your account...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-2">Activation Failed</h1>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-green-500 mb-2">Account Activated!</h1>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
