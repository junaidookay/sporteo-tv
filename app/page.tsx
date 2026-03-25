'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

// Mock data for demonstration
const FEATURED_EVENTS = [
  {
    id: '1',
    title: 'Champions League Final - Football',
    description: 'The biggest club football tournament culminates in an epic final showdown',
    event_type: 'FOOTBALL',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    start_time: '2025-04-15T20:00:00Z',
    ticket_price_cents: 7999,
  },
  {
    id: '2',
    title: 'NBA Finals Game 1 - Basketball',
    description: 'The ultimate championship series as the best teams battle for glory',
    event_type: 'BASKETBALL',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=800&h=500&fit=crop',
    start_time: '2025-04-22T23:00:00Z',
    ticket_price_cents: 6999,
  },
  {
    id: '3',
    title: 'Wimbledon Tennis Tournament',
    description: 'The most prestigious tennis championship in the world',
    event_type: 'TENNIS',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    start_time: '2025-05-01T18:00:00Z',
    ticket_price_cents: 4999,
  },
]

const FEATURED_CATEGORY = [
  {
    id: '4',
    title: 'Premier League - Manchester Derby',
    event_type: 'FOOTBALL',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop',
    ticket_price_cents: 5499,
  },
  {
    id: '5',
    title: 'Lakers vs Celtics - NBA',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1549719386-74dfaf00b721?w=400&h=300&fit=crop',
    ticket_price_cents: 4999,
  },
  {
    id: '6',
    title: 'US Open - Tennis Grand Slam',
    event_type: 'TENNIS',
    featured_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    ticket_price_cents: 5999,
  },
]

const BASKETBALL_EVENTS = [
  {
    id: '7',
    title: 'Golden State vs Boston - NBA Playoffs',
    event_type: 'BASKETBALL',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=400&h=300&fit=crop',
    ticket_price_cents: 6999,
  },
  {
    id: '8',
    title: 'Luka Doncic - All Star Game',
    event_type: 'BASKETBALL',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    ticket_price_cents: 6499,
  },
  {
    id: '9',
    title: 'Euroleague Finals - Europe\'s Top Basketball',
    event_type: 'BASKETBALL',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop',
    ticket_price_cents: 6999,
  },
]

const TENNIS_EVENTS = [
  {
    id: '10',
    title: 'Novak Djokovic - Australian Open',
    event_type: 'TENNIS',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    ticket_price_cents: 4999,
  },
  {
    id: '11',
    title: 'Serena Williams - Monte Carlo Masters',
    event_type: 'TENNIS',
    featured_image: 'https://images.unsplash.com/photo-1549719386-74dfaf00b721?w=400&h=300&fit=crop',
    ticket_price_cents: 4499,
  },
  {
    id: '12',
    title: 'French Open - Roland Garros',
    event_type: 'TENNIS',
    featured_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    ticket_price_cents: 4999,
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Watch Live Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="text-lg font-black">LIVE EVENTS</span>
              </div>
              <p className="text-primary-foreground/80 text-sm">2 events streaming right now</p>
            </div>
            <Link href="/live">
              <Button className="bg-white text-primary hover:bg-white/90 font-black">
                WATCH LIVE →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary to-background py-20 md:py-40">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/50 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Featured - Large */}
            <div className="lg:col-span-2">
              <Link href={`/events/${FEATURED_EVENTS[0].id}`}>
                <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group h-full">
                  <div className="relative h-96 overflow-hidden">
                    <img
                      src={FEATURED_EVENTS[0].featured_image}
                      alt={FEATURED_EVENTS[0].title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="inline-block mb-3">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                          {FEATURED_EVENTS[0].event_type}
                        </span>
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2 line-clamp-2">{FEATURED_EVENTS[0].title}</h2>
                      <p className="text-white/80 line-clamp-2">{FEATURED_EVENTS[0].description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Secondary Featured Items */}
            <div className="space-y-4 h-96">
              {FEATURED_EVENTS.slice(1, 3).map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group h-full">
                    <div className="relative h-full min-h-[128px] overflow-hidden">
                      <img
                        src={event.featured_image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="inline-block bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-bold mb-1">
                          {event.event_type}
                        </span>
                        <h3 className="text-white font-bold line-clamp-1 text-sm">{event.title}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Streams Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                <h2 className="text-4xl font-black">LIVE NOW</h2>
              </div>
              <p className="text-muted-foreground">Watch premium events streaming live right now</p>
            </div>
            <Link href="/live">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                View All Live Events
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live Event 1 */}
            <Link href="/watch/1">
              <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group relative">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold">LIVE</span>
                </div>
                <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                  2,547 watching
                </div>
                <div className="relative h-64 overflow-hidden bg-secondary">
                  <img
                    src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=400&fit=crop"
                    alt="Live Event"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                </div>
                <div className="p-6">
                  <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold mb-3">
                    FOOTBALL
                  </span>
                  <h3 className="text-xl font-black mb-2 line-clamp-2">Champions League Final - Live</h3>
                  <p className="text-muted-foreground text-sm mb-4">Real Madrid vs Manchester City</p>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    WATCH NOW
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Live Event 2 */}
            <Link href="/watch/2">
              <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group relative">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold">LIVE</span>
                </div>
                <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                  1,823 watching
                </div>
                <div className="relative h-64 overflow-hidden bg-secondary">
                  <img
                    src="https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=500&h=400&fit=crop"
                    alt="Live Event"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                </div>
                <div className="p-6">
                  <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold mb-3">
                    BASKETBALL
                  </span>
                  <h3 className="text-xl font-black mb-2 line-clamp-2">NBA Finals Game 1 - Live</h3>
                  <p className="text-muted-foreground text-sm mb-4">Lakers vs Celtics</p>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    WATCH NOW
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Live Event 3 */}
            <Link href="/watch/3">
              <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group relative">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold">LIVE</span>
                </div>
                <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg text-sm font-bold">
                  942 watching
                </div>
                <div className="relative h-64 overflow-hidden bg-secondary">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=400&fit=crop"
                    alt="Live Event"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                </div>
                <div className="p-6">
                  <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold mb-3">
                    TENNIS
                  </span>
                  <h3 className="text-xl font-black mb-2 line-clamp-2">Wimbledon Semifinal - Live</h3>
                  <p className="text-muted-foreground text-sm mb-4">Top seeded players in action</p>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    WATCH NOW
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Football Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">FOOTBALL</h2>
              <p className="text-muted-foreground">Elite matches and championship tournaments</p>
            </div>
            <Link href="/events?sport=football">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_CATEGORY.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.featured_image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                        PPV
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold line-clamp-2">{event.title}</h3>
                    <div className="text-primary font-bold">${(event.ticket_price_cents / 100).toFixed(2)}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Basketball Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">BASKETBALL</h2>
              <p className="text-muted-foreground">NBA, Euroleague, and international championship games</p>
            </div>
            <Link href="/events?sport=basketball">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BASKETBALL_EVENTS.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.featured_image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                        PPV
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold line-clamp-2">{event.title}</h3>
                    <div className="text-primary font-bold">${(event.ticket_price_cents / 100).toFixed(2)}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tennis Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">TENNIS</h2>
              <p className="text-muted-foreground">Grand Slam tournaments and championship matches</p>
            </div>
            <Link href="/events?sport=tennis">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TENNIS_EVENTS.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.featured_image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                        PPV
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold line-clamp-2">{event.title}</h3>
                    <div className="text-primary font-bold">${(event.ticket_price_cents / 100).toFixed(2)}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-primary-foreground mb-4">
            Get Unlimited Access
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Subscribe to watch all events, live and on replay. No PPV limits. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/subscriptions">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold">
                View Plans
              </Button>
            </Link>
            <Link href="/events">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold"
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black mb-12 text-center">Why Choose Sporteo.tv</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-4">4K</div>
              <h3 className="text-xl font-bold mb-2">Crystal Clear</h3>
              <p className="text-muted-foreground">Watch in 4K with HDR for the ultimate viewing experience</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-4">24/7</div>
              <h3 className="text-xl font-bold mb-2">Always On</h3>
              <p className="text-muted-foreground">Stream anywhere, anytime on all your devices</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-primary mb-4">∞</div>
              <h3 className="text-xl font-bold mb-2">Unlimited</h3>
              <p className="text-muted-foreground">Access to all events, live and replays included</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">No buffering, no lag, premium stream quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-black text-primary text-xl">SPORTEO.TV</p>
              <p className="text-sm text-muted-foreground mt-2">Live sports streaming platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/events" className="hover:text-primary transition-colors">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/replays" className="hover:text-primary transition-colors">
                    Replays
                  </Link>
                </li>
                <li>
                  <Link href="/subscriptions" className="hover:text-primary transition-colors">
                    Subscribe
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-primary transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Prime Fight. All rights reserved. | Streaming premium combat sports worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
