'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function WatchPage() {
  const params = useParams()
  const eventId = params.id as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [addingToLibrary, setAddingToLibrary] = useState(false)

  useEffect(() => {
    const loadStreamData = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Not authenticated')
        }
        setUser(user)

        // Get event - query directly to avoid any RLS issues
        const { data: eventsData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle()

        if (eventError) {
          console.error('[v0] Database error:', eventError)
          throw new Error('Failed to load event details')
        }

        if (!eventsData) {
          throw new Error('Event not found')
        }

        const eventData = eventsData

        // Check if stream is publicly visible or completed (admins can always view)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        const admin = profile?.is_admin === true
        setIsAdmin(admin)

        if (!admin && !eventData.is_publicly_live && eventData.status !== 'completed') {
          throw new Error('This stream is not currently available. Please check back later.')
        }

        // Check access: admins can always view, others need subscription or purchase
        let hasEventAccess = admin

        // Check purchase (for non-admins or if admin wants to add to library)
        const { data: purchaseData } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_id', eventId)
          .maybeSingle()

        setHasPurchased(!!purchaseData)

        if (!hasEventAccess && eventData.subscription_required) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()

          hasEventAccess = !!subscription
        }

        if (!hasEventAccess && eventData.ticket_price_cents && eventData.ticket_price_cents > 0) {
          const { data: purchase } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('event_id', eventId)
            .maybeSingle()

          hasEventAccess = !!purchase
        }

        if (!hasEventAccess) {
          throw new Error('You do not have access to this event. Please purchase or subscribe.')
        }

        setEvent(eventData)
        setHasAccess(true)

        // Generate stream URL
        let url = ''
        if (eventData.cloudflare_live_input_id && eventData.cloudflare_customer_subdomain) {
          // Use Cloudflare signed token for live streams
          try {
            const response = await fetch('/api/cloudflare/signed-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                videoId: eventData.cloudflare_live_input_id,
                expiresIn: 14400, // 4 hours
                isLive: true,
              }),
            })
            if (response.ok) {
              const data = await response.json()
              if (data.token) {
                url = `https://customer-${eventData.cloudflare_customer_subdomain}.cloudflarestream.com/${data.token}/iframe`
              }
            }
          } catch (err) {
            console.error('Error getting Cloudflare live URL:', err)
          }
        } else if (eventData.cloudflare_stream_id) {
          // Use signed token for VOD
          try {
            const response = await fetch('/api/cloudflare/signed-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                videoId: eventData.cloudflare_stream_id,
                expiresIn: 14400,
                isLive: false,
              }),
            })
            if (response.ok) {
              const data = await response.json()
              if (data.token) {
                url = `https://customer-${eventData.cloudflare_customer_subdomain}.cloudflarestream.com/${data.token}/iframe`
              }
            }
          } catch (err) {
            console.error('Error getting Cloudflare VOD URL:', err)
          }
        }
        // Bunny.net fallback is disabled - using Cloudflare only
        setStreamUrl(url)
      } catch (err) {
        console.error('Failed to load stream:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stream')
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    loadStreamData()
  }, [eventId])

  const handleAddToLibrary = async () => {
    if (!user || !event) return

    setAddingToLibrary(true)
    try {
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          event_id: event.id,
          amount_cents: event.ticket_price_cents || 0,
          status: 'completed',
        })

      if (error) throw error

      setHasPurchased(true)
      setHasAccess(true)

      // Reload to get stream URL
      window.location.reload()
    } catch (err) {
      console.error('Failed to add to library:', err)
      alert('Failed to add to library')
    } finally {
      setAddingToLibrary(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading stream...</p>
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
            <p className="text-destructive mb-4">{error || 'Failed to load stream'}</p>
            <a href="/events" className="text-primary hover:text-primary/80">
              ← Back to Events
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href={`/events/${eventId}`} className="text-primary hover:text-primary/80 mb-6 inline-flex items-center gap-2">
          ← Back to Event
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            {streamUrl ? (
              event.cloudflare_live_input_id ? (
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src={streamUrl}
                    style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title="Live Stream"
                  />
                </div>
              ) : (
                <VideoPlayer
                  src={streamUrl}
                  poster={event.featured_image}
                  title={event.title}
                  autoplay={true}
                  controls={true}
                  className="w-full aspect-video"
                />
              )
            ) : (
              <div className="w-full aspect-video bg-secondary rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Stream not available</p>
              </div>
            )}

            {/* Event Info */}
            <Card className="mt-8 p-6 border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-black mb-2">{event.title}</h1>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
                {event.status === 'live' && (
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse">
                    🔴 LIVE
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-bold uppercase">{event.event_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-bold uppercase">{event.status}</p>
                </div>
                {event.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-bold">{event.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-bold text-sm">
                    {event.start_time ? new Date(event.start_time).toLocaleString() : 'TBA'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {isAdmin && !hasPurchased && (
              <Card className="p-6 mb-6 border-border border-primary">
                <h3 className="text-lg font-black mb-2">👋 ADMIN</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  As an admin, you have full access. Add this event to your library to test the purchase flow.
                </p>
                <Button
                  onClick={handleAddToLibrary}
                  disabled={addingToLibrary}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {addingToLibrary ? 'Adding...' : 'Add to My Library'}
                </Button>
              </Card>
            )}

            {hasPurchased && (
              <Card className="p-6 mb-6 border-border">
                <h3 className="text-lg font-black mb-2">✓ IN YOUR LIBRARY</h3>
                <p className="text-sm text-muted-foreground mb-2">You have access to this event.</p>
                <p className="text-xs text-muted-foreground">
                  Transaction ID: {event.id.slice(0, 8)}...
                </p>
              </Card>
            )}

            <Card className="p-6 border-border">
              <h3 className="text-lg font-black mb-4">EVENT DETAILS</h3>
              <div className="space-y-4">
                {event.duration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-bold">{event.duration}</p>
                  </div>
                )}
                {event.category && (
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-bold">{event.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Access Type</p>
                  <p className="font-bold">
                    {event.subscription_required ? 'Subscription' : event.ticket_price_cents > 0 ? 'Pay-Per-View' : 'Free'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}