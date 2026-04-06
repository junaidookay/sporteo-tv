'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'

import { startCheckoutSessionWithUser } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface CheckoutProps {
  productId: string
  userId: string
  autoStart?: boolean
}

export default function Checkout({ productId, userId, autoStart = false }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(autoStart)

  const handleStartCheckout = useCallback(async () => {
    setLoading(true)
    try {
      const secret = await startCheckoutSessionWithUser(productId, userId)
      setClientSecret(secret)
    } catch (error) {
      console.error('Failed to start checkout:', error)
      setLoading(false)
    }
  }, [productId, userId])

  useEffect(() => {
    if (autoStart) {
      handleStartCheckout()
    }
  }, [autoStart, productId])

  const options = useMemo(() => ({ clientSecret }), [clientSecret])

  if (clientSecret) {
    return (
      <div id="checkout" className="w-full bg-[#1A1A1A] rounded-lg p-6">
        <EmbeddedCheckoutProvider
          key={clientSecret}
          stripe={stripePromise}
          options={options}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  return (
    <Button
      onClick={handleStartCheckout}
      disabled={loading}
      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {loading ? 'Loading...' : 'Proceed to Payment'}
    </Button>
  )
}