'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return ''

  // First check if we already have a persistent device ID
  let deviceId = localStorage.getItem('device_id')
  
  if (!deviceId) {
    // Generate a truly unique device ID using crypto random
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    deviceId = 'device_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
    localStorage.setItem('device_id', deviceId)
    console.log('[login] Created new device_id:', deviceId)
  } else {
    console.log('[login] Using existing device_id:', deviceId)
  }
  
  return deviceId
}

function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device'

  const ua = navigator.userAgent

  if (/(tablet|ipad|playbook)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet'
  }
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'Mobile Phone'
  }
  if (/(Win64|Win32|Macintosh|Mac OS X)/i.test(ua)) {
    return 'Desktop Computer'
  }
  return 'Unknown Device'
}

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Only check if already logged in, don't poll
  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // User is already logged in, redirect to home
        router.push('/')
      }
    }
    
    checkIfLoggedIn()
    // No polling - just one check on mount
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              `${window.location.origin}/dashboard`,
        },
      })

      if (signInError) throw signInError

      const deviceId = getOrCreateDeviceId()
      const deviceName = getDeviceName()

      console.log('[login] Logging in with device_id:', deviceId, 'device_name:', deviceName)

      const response = await fetch('/api/user-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          device_id: deviceId,
          device_name: deviceName
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create session')
      }

      document.cookie = `device_id=${deviceId}; path=/; max-age=86400; samesite=strict`

      await new Promise(resolve => setTimeout(resolve, 500))

      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-primary hover:text-primary/80 underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
