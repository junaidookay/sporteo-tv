'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import Checkout from '@/components/checkout'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'
import { getEventById } from '@/lib/db-client'

export default function CheckoutPage() {
  const params = useParams()
  const productId = params.planId as string
  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === productId)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (!plan) {
          const eventData = await getEventById(supabase, productId)
          setEvent(eventData)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [productId, plan])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 border-border text-center">
            <p className="text-muted-foreground">Loading...</p>
          </Card>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 border-border text-center">
            <h1 className="text-3xl font-black mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to make a purchase.</p>
            <a href="/auth/login">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold">
                Sign In
              </button>
            </a>
          </Card>
        </main>
      </div>
    )
  }

  if (!plan && !event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 border-border text-center">
            <h1 className="text-3xl font-black mb-4">Product Not Found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </Card>
        </main>
      </div>
    )
  }

  const item = plan || event

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-8 border-border lg:sticky lg:top-20 h-fit">
            <h2 className="text-2xl font-black mb-6">{item.name || item.title}</h2>

            <div className="mb-8 pb-8 border-b border-border">
              <div className="text-5xl font-black text-primary mb-2">
                €{plan ? (plan.priceInCents / 100).toFixed(2) : (event?.ticket_price_cents / 100).toFixed(2)}
              </div>
              <p className="text-muted-foreground">
                {plan?.id === 'sub_monthly' ? 'per month' : plan?.id === 'sub_annual' ? 'per year' : 'one-time'}
              </p>
            </div>

            {plan ? (
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Unlimited access to all events</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>HD video quality (1080p)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Watch on phone, tablet, or TV</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Ad-free streaming</span>
                </div>
              </div>
            ) : event ? (
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Watch this event in HD</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>30 days access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Stream on any device</span>
                </div>
              </div>
            ) : null}

            {plan?.id === 'sub_annual' && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm font-bold text-primary">Save 17% vs Monthly</p>
                <p className="text-xs text-primary/80 mt-1">That's {formatPrice(1988)} per year in savings</p>
              </div>
            )}
          </Card>

          <div className="lg:col-span-2">
            <Card className="p-8 border-border">
              <h3 className="text-2xl font-black mb-8">Complete Your Purchase</h3>
              <Checkout productId={productId} eventId={!plan ? productId : undefined} autoStart={true} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}