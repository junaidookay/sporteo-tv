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
    title: 'Canelo vs GGG III - Championship Rematch',
    description: 'The trilogy fight between two boxing legends for the undisputed title',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800&h=500&fit=crop',
    start_time: '2025-04-15T20:00:00Z',
    ticket_price_cents: 7999,
  },
  {
    id: '2',
    title: 'Adesanya vs Dricus II - UFC Middleweight Title',
    description: 'Epic rematch at the apex of UFC competition',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=800&h=500&fit=crop',
    start_time: '2025-04-22T23:00:00Z',
    ticket_price_cents: 6999,
  },
  {
    id: '3',
    title: 'Tenshin Nasukawa vs Top Bantamweight',
    description: 'High-flying K-1 action with the technical mastery you expect',
    event_type: 'K-1',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    start_time: '2025-05-01T18:00:00Z',
    ticket_price_cents: 4999,
  },
]

const BOXING_EVENTS = [
  {
    id: '4',
    title: 'Terence Crawford - Welterweight Champion',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop',
    ticket_price_cents: 5499,
  },
  {
    id: '5',
    title: 'Ryan Garcia Comeback Fight',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1549719386-74dfaf00b721?w=400&h=300&fit=crop',
    ticket_price_cents: 4999,
  },
  {
    id: '6',
    title: 'Devin Haney Returns to Ring',
    event_type: 'BOXING',
    featured_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    ticket_price_cents: 5999,
  },
]

const MMA_EVENTS = [
  {
    id: '7',
    title: 'Volkanovski - Featherweight Thriller',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=400&h=300&fit=crop',
    ticket_price_cents: 6999,
  },
  {
    id: '8',
    title: 'Oliveira vs Topuria - Lightweight Title',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    ticket_price_cents: 6499,
  },
  {
    id: '9',
    title: 'Aspinall vs Blaydes - Heavyweight Title',
    event_type: 'MMA',
    featured_image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop',
    ticket_price_cents: 6999,
  },
]

const K1_EVENTS = [
  {
    id: '10',
    title: 'Tenshin Nasukawa - Prime Time',
    event_type: 'K-1',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    ticket_price_cents: 4999,
  },
  {
    id: '11',
    title: 'Superbon vs Top Contender',
    event_type: 'K-1',
    featured_image: 'https://images.unsplash.com/photo-1549719386-74dfaf00b721?w=400&h=300&fit=crop',
    ticket_price_cents: 4499,
  },
  {
    id: '12',
    title: 'Rodtang - Flyweight Legend',
    event_type: 'K-1',
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
            <div className="space-y-4">
              {FEATURED_EVENTS.slice(1, 3).map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group">
                    <div className="relative h-32 overflow-hidden">
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

      {/* Boxing Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">BOXING</h2>
              <p className="text-muted-foreground">Heavyweight title fights and elite matchups</p>
            </div>
            <Link href="/events?sport=boxing">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BOXING_EVENTS.map((event) => (
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

      {/* MMA Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">MMA</h2>
              <p className="text-muted-foreground">Ultimate Fighting Championship events</p>
            </div>
            <Link href="/events?sport=mma">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MMA_EVENTS.map((event) => (
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

      {/* K-1 Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">K-1 KICKBOXING</h2>
              <p className="text-muted-foreground">Technical striking mastery on display</p>
            </div>
            <Link href="/events?sport=k1">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {K1_EVENTS.map((event) => (
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
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold"
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
          <h2 className="text-4xl font-black mb-12 text-center">Why Choose Prime Fight</h2>
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
              <div className="text-5xl font-black text-primary mb-4">⚡</div>
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
              <p className="font-black text-primary text-xl">PRIME FIGHT</p>
              <p className="text-sm text-muted-foreground mt-2">Premium combat sports streaming</p>
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
