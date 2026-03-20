import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center border-muted bg-secondary/50">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-black mb-4">PAYMENT CANCELLED</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your payment was cancelled. No charges have been made to your account.
            </p>

            <div className="space-y-3 my-12 p-6 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">You can try again or explore free content available on Prime Fight.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscriptions">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Try Again
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                  Browse Events
                </Button>
              </Link>
            </div>
          </Card>

          <div className="mt-12">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-black mb-6">Why Subscribe?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <div>
                    <p className="font-bold">Unlimited Access</p>
                    <p className="text-sm text-muted-foreground">Watch all live events and replays</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <div>
                    <p className="font-bold">Premium Quality</p>
                    <p className="text-sm text-muted-foreground">Stream in 4K on all your devices</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <div>
                    <p className="font-bold">Cancel Anytime</p>
                    <p className="text-sm text-muted-foreground">No long-term commitment required</p>
                  </div>
                </li>
              </ul>

              <Link href="/subscriptions" className="block mt-8">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  View Subscription Plans
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
