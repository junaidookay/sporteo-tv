'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'

// Mock live events data
const LIVE_EVENTS = [
  {
    id: '1',
    title: 'Champions League Final - Football',
    description: 'The biggest club football tournament culminates in an epic final showdown',
    event_type: 'FOOTBALL',
    featured_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop',
    start_time: new Date().toISOString(),
    ticket_price_cents: 7999,
    viewers: 45230,
  },
  {
    id: '2',
    title: 'NBA Finals Game 1 - Basketball',
    description: 'The ultimate championship series as the best teams battle for glory',
    event_type: 'BASKETBALL',
    featured_image: 'https://images.unsplash.com/photo-1518611505868-d2b4f0ff69d5?w=800&h=500&fit=crop',
    start_time: new Date().toISOString(),
    ticket_price_cents: 6999,
    viewers: 38450,
  },
]

export default function LivePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">Loading live events...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            <h1 className="text-5xl font-black">LIVE NOW</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Watch live events streaming right now
          </p>
        </div>

        {/* Live Events Grid */}
        {LIVE_EVENTS.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {LIVE_EVENTS.map((event) => (
              <Card key={event.id} className="overflow-hidden border-border hover:border-primary transition-colors group">
                <div className="relative">
                  {/* Image */}
                  <img
                    src={event.featured_image}
                    alt={event.title}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-black text-sm animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    LIVE
                  </div>

                  {/* Viewers Count */}
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium">
                    👥 {event.viewers.toLocaleString()} watching
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-primary uppercase">{event.event_type}</span>
                    <span className="text-lg font-black text-primary">${(event.ticket_price_cents / 100).toFixed(2)}</span>
                  </div>

                  <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    {event.description}
                  </p>

                  <Link href={`/watch/${event.id}`}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base py-6">
                      WATCH NOW
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-border">
            <p className="text-lg text-muted-foreground mb-4">
              No live events at the moment
            </p>
            <Link href="/events">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View Upcoming Events
              </Button>
            </Link>
          </Card>
        )}

        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-3xl font-black mb-6">COMING UP NEXT</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: '3',
                title: 'Wimbledon Tennis Tournament',
                event_type: 'TENNIS',
                start_time: '2 hours from now',
                ticket_price_cents: 4999,
              },
              {
                id: '4',
                title: 'Premier League - Manchester Derby',
                event_type: 'FOOTBALL',
                start_time: '5 hours from now',
                ticket_price_cents: 5499,
              },
            ].map((event) => (
              <Card key={event.id} className="p-4 border-border hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-bold text-primary uppercase">{event.event_type}</span>
                  <span className="text-sm font-bold text-muted-foreground">{event.start_time}</span>
                </div>
                <h4 className="text-lg font-black mb-3">{event.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${(event.ticket_price_cents / 100).toFixed(2)}</span>
                  <Link href="/events">
                    <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                      View Details →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
