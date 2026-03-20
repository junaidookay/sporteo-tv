import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getEvents } from '@/lib/db'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  let featuredEvents = []
  let upcomingEvents = []

  try {
    featuredEvents = await getEvents({ upcoming: true })
    upcomingEvents = featuredEvents.slice(0, 3)
  } catch (error) {
    console.error('Failed to load events:', error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/50 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-balance">
            LIVE <span className="text-primary">COMBAT</span> SPORTS
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Premium PPV streaming of boxing, MMA, and K-1 fights. Watch live events and unlimited replays with a subscription.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                Watch Events
              </Button>
            </Link>
            <Link href="/subscriptions">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
                Get Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-black mb-2">UPCOMING EVENTS</h2>
          <p className="text-muted-foreground">Featured fights happening soon</p>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer h-full flex flex-col">
                  <div className="relative h-48 bg-secondary flex items-center justify-center overflow-hidden">
                    {event.featured_image ? (
                      <img
                        src={event.featured_image}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-muted-foreground">Event Image</div>
                    )}
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {event.event_type}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm font-medium text-muted-foreground">
                        {new Date(event.start_time).toLocaleDateString()}
                      </span>
                      {event.ticket_price_cents && (
                        <span className="text-primary font-bold">${(event.ticket_price_cents / 100).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No upcoming events at the moment</p>
            <Link href="/replays">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Watch Replays
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Subscription Section */}
      <section className="bg-secondary/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">MEMBERSHIP PLANS</h2>
            <p className="text-muted-foreground text-lg">Unlimited access to all events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Monthly Plan */}
            <Card className="p-8 flex flex-col border-border hover:border-primary transition-colors">
              <h3 className="text-2xl font-black mb-2">MONTHLY</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-primary">$9.99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Unlimited event access</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>HD video quality</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Watch on all devices</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>No ads</span>
                </li>
              </ul>
              <Link href="/subscriptions?plan=monthly" className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Subscribe Now
                </Button>
              </Link>
            </Card>

            {/* Annual Plan */}
            <Card className="p-8 flex flex-col border-primary bg-primary/5">
              <div className="inline-block mb-4 w-fit">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">SAVE 17%</span>
              </div>
              <h3 className="text-2xl font-black mb-2">ANNUAL</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-primary">$99.99</span>
                <span className="text-muted-foreground ml-2">/year</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Unlimited event access</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>4K video quality</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Watch on all devices</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/subscriptions?plan=annual" className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Subscribe Now
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-black text-primary">PRIME FIGHT</p>
              <p className="text-sm text-muted-foreground">Premium combat sports streaming</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Prime Fight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
