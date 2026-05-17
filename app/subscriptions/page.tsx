'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'

function SubscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserAndSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()
          setSubscription(data)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setLoading(false)
      }
    }
    checkUserAndSubscription()
  }, [])

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      setSubscription({ ...subscription, status: 'cancelled' })
      alert('Subscription cancelled. You will retain access until the end of your billing period.')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">MEMBERSHIP PLANS</h1>
          <p className="text-xl text-muted-foreground">
            Choose your plan and get unlimited access to all live events and replays
          </p>
        </div>

        {subscription && subscription.status === 'active' ? (
          <Card className="p-8 border-primary bg-primary/5 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black mb-2">Current Subscription</h2>
                <div className="space-y-2">
                  <p className="text-2xl font-bold capitalize">{subscription.subscription_type} Plan</p>
                  <p className="text-muted-foreground">
                    Status: <span className="text-green-500 font-bold">Active</span>
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-muted-foreground">
                      Renews on: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Cancel Subscription
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Monthly Plan Card */}
            <Card className="p-8 flex flex-col border-border hover:border-primary transition-all">
              <h3 className="text-3xl font-black mb-4">MONTHLY PASS</h3>
              <div className="mb-8">
                <div className="text-5xl font-black text-primary">{formatPrice(999)}</div>
                <div className="text-muted-foreground mt-2">per month, cancel anytime</div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Unlimited access to all events</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>HD video quality (1080p)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Watch on phone, tablet, or TV</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Ad-free streaming</span>
                </li>
              </ul>

              <Button
                onClick={() => router.push(`/checkout/sub_monthly${eventId ? `?eventId=${eventId}` : ''}`)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>
            </Card>

            {/* Annual Plan Card */}
            <Card className="p-8 flex flex-col border-primary bg-primary/5 hover:border-primary transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-black">
                  BEST VALUE
                </span>
              </div>
              <h3 className="text-3xl font-black mb-4 mt-2">ANNUAL PASS</h3>
              <div className="mb-8">
                <div className="text-5xl font-black text-primary">{formatPrice(9999)}</div>
                <div className="text-muted-foreground mt-2">per year (save {formatPrice(1988)})</div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Everything in Monthly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>4K video quality</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>Early access to premium events</span>
                </li>
              </ul>

              <Button
                onClick={() => router.push(`/checkout/sub_annual${eventId ? `?eventId=${eventId}` : ''}`)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 pt-20 border-t border-border">
          <h2 className="text-3xl font-black mb-12">FREQUENTLY ASKED QUESTIONS</h2>

          <div className="space-y-8 max-w-3xl">
            <div>
              <h3 className="text-xl font-bold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Do you offer a free trial?</h3>
              <p className="text-muted-foreground">
                Not currently, but our monthly plan at €9.99 is affordable for trying out the service. You can cancel anytime if it is not for you.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and digital payment methods through our secure Stripe payment processor.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Can I switch between plans?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">What devices can I watch on?</h3>
              <p className="text-muted-foreground">
                You can watch on any device with our apps for iOS, Android, smart TVs, and web browsers.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  )
}
