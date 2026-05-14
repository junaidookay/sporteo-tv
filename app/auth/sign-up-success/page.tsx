'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SignUpSuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [countdown, setCountdown] = useState(5)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const supabase = createClient()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return

    setResendStatus('sending')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        console.error('Resend error:', error)
        setResendStatus('error')
      } else {
        setResendStatus('sent')
        setResendCooldown(60)
        setTimeout(() => setResendStatus('idle'), 3000)
      }
    } catch (err) {
      console.error('Resend error:', err)
      setResendStatus('error')
    }
  }

  return (
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

      <div className="mt-6 pt-6 border-t border-border space-y-4">
        <div className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or resend it.
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleResendEmail}
          disabled={resendCooldown > 0 || resendStatus === 'sending'}
        >
          {resendStatus === 'sending' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : resendStatus === 'sent' ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              Email Sent!
            </>
          ) : resendStatus === 'error' ? (
            <>
              <Mail className="w-4 h-4" />
              Failed - Try Again
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Resend Confirmation Email {resendCooldown > 0 && `(${resendCooldown}s)`}
            </>
          )}
        </Button>

        <Link href="/auth/login" className="text-sm text-primary hover:underline block">
          Already confirmed? Sign in here
        </Link>
      </div>
    </Card>
  )
}

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <SignUpSuccessContent />
      </Suspense>
    </div>
  )
}
