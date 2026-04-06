'use client'

import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { SUBSCRIPTION_PLANS } from '@/lib/products'

export default function SubscriptionsPage() {
  const router = useRouter()

  const monthlyPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'sub_monthly')
  const annualPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'sub_annual')

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Plan Card */}
          <Card
            className="p-8 flex flex-col border-border hover:border-primary transition-all cursor-pointer"
            onClick={() => router.push('/checkout/sub_monthly')}
          >
            <h3 className="text-3xl font-black mb-4">MONTHLY PASS</h3>
            <div className="mb-8">
              <div className="text-5xl font-black text-primary">$9.99</div>
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
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">✓</span>
                <span>Watch offline (coming soon)</span>
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push('/checkout/sub_monthly')
              }}
              className="mt-8 w-full py-3 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
          </Card>

          {/* Annual Plan Card */}
          <Card
            className="p-8 flex flex-col border-primary bg-primary/5 hover:border-primary transition-all cursor-pointer"
            onClick={() => router.push('/checkout/sub_annual')}
          >
            <div className="mb-4">
              <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-black">
                SAVE 17%
              </span>
            </div>
            <h3 className="text-3xl font-black mb-4">ANNUAL PASS</h3>
            <div className="mb-8">
              <div className="text-5xl font-black text-primary">$99.99</div>
              <div className="text-muted-foreground mt-2">per year</div>
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
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">✓</span>
                <span>Exclusive member community</span>
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push('/checkout/sub_annual')
              }}
              className="mt-8 w-full py-3 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
          </Card>
        </div>

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
                Not currently, but our monthly plan at $9.99 is affordable for trying out the service. You can cancel anytime if it is not for you.
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
                You can watch on any device with our apps for iOS, Android, smart TVs, and web browsers. Please note: only one device can stream at a time per account.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}