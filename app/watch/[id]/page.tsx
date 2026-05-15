'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { VideoPlayer } from '@/components/cloudflare-video-player'
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
        // Get event first to determine if it's free
        const { data: eventsData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle()

        if (eventError) {
          console.error('[watch] Database error:', eventError)
          throw new Error('Failed to load event details')
        }

        if (!eventsData) {
          throw new Error('Event not found')
        }

        const eventData = eventsData
        const isFreeEvent = !eventData.subscription_required && (!eventData.ticket_price_cents || eventData.ticket_price_cents === 0)

        // Check if user is logged in
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (!isFreeEvent && (userError || !user)) {
          // Paid event requires login
          window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname)
          return
        }

        if (user) {
          setUser(user)
        }

        // Check access permissions
        let hasEventAccess = false

        if (isFreeEvent) {
          // Free events: anyone can watch (no login required)
          hasEventAccess = true
        } else {
          // Paid/subscription events: check permissions
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user?.id)
            .maybeSingle()

          const admin = profile?.is_admin === true
          setIsAdmin(admin)

          // Admins always have access
          if (admin) {
            hasEventAccess = true
          } else {
            // Check subscription
            if (eventData.subscription_required) {
              const { data: subscription } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user?.id)
                .eq('status', 'active')
                .maybeSingle()

              hasEventAccess = !!subscription
            }

            // Check purchase
            if (!hasEventAccess && eventData.ticket_price_cents && eventData.ticket_price_cents > 0) {
              const { data: purchase } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', user?.id)
                .eq('event_id', eventId)
                .maybeSingle()

              hasEventAccess = !!purchase
              setHasPurchased(!!purchase)
            }
          }
        }

        if (!hasEventAccess) {
          throw new Error('You do not have access to this event. Please purchase or subscribe.')
        }

        setEvent(eventData)
        setHasAccess(true)

        // Generate stream URL
        let url = ''
        const isCompleted = eventData.status === 'completed'

        // For completed events, use cloudflare_stream_id (replay)
        // For live events, use cloudflare_live_input_id
        const videoId = isCompleted ? eventData.cloudflare_stream_id : eventData.cloudflare_live_input_id
        const isLive = !isCompleted

        if (videoId && eventData.cloudflare_customer_subdomain) {
          // Use Cloudflare signed token
          try {
            const response = await fetch('/api/cloudflare/signed-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                videoId: videoId,
                expiresIn: 14400, // 4 hours
                isLive: isLive,
              }),
            })

            if (response.ok) {
              const data = await response.json()
              if (data.token) {
                url = `https://customer-${eventData.cloudflare_customer_subdomain}.cloudflarestream.com/${data.token}/iframe`
              } else if (data.error) {
                console.error('[watch] Signed URL error:', data.error)
              }
            } else {
              const data = await response.json()
              console.error('[watch] Signed URL failed:', response.status, data)
            }
          } catch (err) {
            console.error('Error getting Cloudflare URL:', err)
          }
        } else if (eventData.cloudflare_live_input_id && eventData.cloudflare_customer_subdomain) {
          // Fallback: use live input directly (for when recording is still processing)
          url = `https://customer-${eventData.cloudflare_customer_subdomain}.cloudflarestream.com/${eventData.cloudflare_live_input_id}/iframe`
        }
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
                  poster={event.thumbnail_url || undefined}
                />
              )
            ) : (
              <Card className="aspect-video flex items-center justify-center bg-secondary border-border">
                <p className="text-muted-foreground">Stream not available</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-border">
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <p className="text-muted-foreground text-sm mb-4">
                {event.status === 'completed' ? 'Replay' : event.status === 'live' ? 'Live Now' : 'Upcoming'}
              </p>

              {event.description && (
                <p className="text-sm mb-4">{event.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {event.ticket_price_cents > 0 && (
                  <p>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-bold">€{(event.ticket_price_cents / 100).toFixed(2)}</span>
                  </p>
                )}
                {event.subscription_required && (
                  <p className="text-muted-foreground">Requires subscription</p>
                )}
              </div>
            </Card>

            {/* Add to Library Button */}
            {!hasPurchased && !event.subscription_required && event.ticket_price_cents > 0 && (
              <Card className="p-6 border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Add this event to your library to access replays anytime.
                </p>
                <Button
                  onClick={handleAddToLibrary}
                  disabled={addingToLibrary || !user}
                  className="w-full"
                >
                  {addingToLibrary ? 'Adding...' : 'Add to Library'}
                </Button>
                {!user && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Please login to add to library
                  </p>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
