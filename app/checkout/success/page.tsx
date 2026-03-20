import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center border-primary bg-primary/5">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-black mb-4">PAYMENT SUCCESSFUL</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your subscription! You now have full access to all Prime Fight events.
            </p>

            <div className="space-y-3 my-12 p-6 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Your subscription is now active and you can start watching immediately.</p>
              <p className="text-sm text-muted-foreground">Check your email for a confirmation and your receipt.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Browse Events
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  View Account
                </Button>
              </Link>
            </div>
          </Card>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-border text-center">
              <div className="text-2xl mb-2">📺</div>
              <p className="font-bold mb-2">Watch on Any Device</p>
              <p className="text-sm text-muted-foreground">Stream on your phone, tablet, or TV</p>
            </Card>

            <Card className="p-6 border-border text-center">
              <div className="text-2xl mb-2">🔥</div>
              <p className="font-bold mb-2">Live & Replays</p>
              <p className="text-sm text-muted-foreground">Watch live fights or catch replays anytime</p>
            </Card>

            <Card className="p-6 border-border text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className="font-bold mb-2">Premium Quality</p>
              <p className="text-sm text-muted-foreground">4K streaming and HD available</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
