'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { getEventById, getPurchase, getUserSubscription } from '@/lib/db-client'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [purchase, setPurchase] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Get event details
        const eventData = await getEventById(supabase, eventId)
        
        if (!eventData) {
          setError('Event not found')
          setLoading(false)
          return
        }
        
        setEvent(eventData)

        if (user) {
          // Check purchase
          const purchaseData = await getPurchase(supabase, user.id, eventId)
          setPurchase(purchaseData)

          // Check subscription
          const subData = await getUserSubscription(supabase, user.id)
          setSubscription(subData)
        }
      } catch (err) {
        console.error('Failed to load event:', err)
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error || 'Event not found'}</p>
            <Link href="/events">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Back to Events
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isLive = event.status === 'live'
  const canWatch = user && (purchase || subscription || user.user_metadata?.is_admin)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/events" className="text-primary hover:text-primary/80 mb-6 inline-flex items-center gap-2">
          ← Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            <div className="relative h-96 bg-secondary rounded-lg overflow-hidden mb-8">
              {event.featured_image ? (
                <img
                  src={event.featured_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-muted-foreground">Event Image</span>
                </div>
              )}

              {isLive && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse">
                  🔴 LIVE NOW
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold uppercase">
                    {event.event_type}
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                      event.status === 'live'
                        ? 'bg-red-600/20 text-red-500'
                        : event.status === 'scheduled'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <h1 className="text-5xl font-black mb-4">{event.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">{event.description}</p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Card className="p-6 border-border">
                  <p className="text-sm text-muted-foreground mb-2">Date & Time</p>
                  <p className="font-bold">
                    {new Date(event.start_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="font-bold">
                    {new Date(event.start_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </p>
                </Card>

                {event.location && (
                  <Card className="p-6 border-border">
                    <p className="text-sm text-muted-foreground mb-2">Location</p>
                    <p className="font-bold">{event.location}</p>
                  </Card>
                )}

                <Card className="p-6 border-border">
                  <p className="text-sm text-muted-foreground mb-2">Access Type</p>
                  <p className="font-bold">
                    {event.subscription_required ? 'Members Only' : event.ticket_price_cents ? 'PPV' : 'Free'}
                  </p>
                </Card>

                {event.ticket_price_cents && (
                  <Card className="p-6 border-border">
                    <p className="text-sm text-muted-foreground mb-2">PPV Price</p>
                    <p className="text-2xl font-black text-primary">${(event.ticket_price_cents / 100).toFixed(2)}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-24 border-border">
              <h3 className="text-xl font-black mb-6">WATCH NOW</h3>

              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">Sign in to watch this event</p>
                  <Link href={`/auth/login?redirect=/events/${eventId}`} className="w-full block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" className="w-full block">
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Create Account
                    </Button>
                  </Link>
                </div>
              ) : canWatch ? (
                <div className="space-y-3">
                  <div className="p-4 bg-primary/10 border border-primary rounded-lg mb-4">
                    <p className="text-sm text-primary font-bold">✓ You have access to this event</p>
                  </div>
                  {isLive && (
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                      Watch Live
                    </Button>
                  )}
                  {event.status === 'completed' && (
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Watch Replay
                    </Button>
                  )}
                </div>
              ) : event.subscription_required ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">Get a membership to watch</p>
                  <Link href="/subscriptions" className="w-full block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Get Membership
                    </Button>
                  </Link>
                </div>
              ) : event.ticket_price_cents ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Pay per view: ${(event.ticket_price_cents / 100).toFixed(2)}
                  </p>
                  <Link href={`/checkout/${eventId}`} className="w-full block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Buy Access
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">This event is free to watch</p>
                  {isLive ? (
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                      Watch Live
                    </Button>
                  ) : (
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>
              )}

              {/* Share */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-bold mb-3">Share Event</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-secondary">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-secondary">
                    Facebook
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
