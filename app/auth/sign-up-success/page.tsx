'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center border-border">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-500/20 p-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Account Created!</h1>
        
        <p className="text-muted-foreground mb-6">
          {email ? (
            <>We've sent a confirmation email to <strong>{email}</strong>.</>
          ) : (
            <>We've sent a confirmation email to your inbox.</>
          )}
          <br />
          Please check your email and click the confirmation link to activate your account.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
          <Mail className="w-4 h-4" />
          <span>Check your inbox for activation link</span>
        </div>

        {countdown === 0 && (
          <Link href="/auth/login">
            <Button className="w-full gap-2">
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}

        {countdown > 0 && (
          <p className="text-sm text-muted-foreground">
            Redirecting to login in {countdown} seconds...
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Already confirmed? Sign in here
          </Link>
        </div>
      </Card>
    </div>
  )
}
