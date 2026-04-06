'use client'

import { useCallback, useState, useMemo, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'

import { startCheckoutSession } from '../app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function Checkout({ productId, autoStart = false }: { productId: string; autoStart?: boolean }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(autoStart)

  useEffect(() => {
    if (autoStart) {
      handleStartCheckout()
    }
  }, [autoStart, productId])

  const handleStartCheckout = useCallback(async () => {
    setLoading(true)
    try {
      const secret = await startCheckoutSession(productId)
      setClientSecret(secret)
    } catch (error) {
      console.error('Failed to start checkout:', error)
      setLoading(false)
    }
  }, [productId])

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
