'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { VideoPlayer } from '@/components/video-player'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { getEventById, getStreamAccess } from '@/lib/db-client'
import { getHLSPlaybackUrl, getStreamStats } from '@/lib/bunny'

export default function WatchPage() {
  const params = useParams()
  const eventId = params.id as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const loadStreamData = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Not authenticated')
        }
        setUser(user)

        // Get event
        const eventData = await getEventById(supabase, eventId)
        if (!eventData) {
          throw new Error('Event not found')
        }
        setEvent(eventData)

        // Generate unique device ID for this browser
        let deviceId = localStorage.getItem('deviceId')
        if (!deviceId) {
          deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('deviceId', deviceId)
        }

        // Create a stream session token (enforces one active device per user)
        const sessionResponse = await fetch('/api/stream-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, deviceId }),
        })

        if (!sessionResponse.ok) {
          const data = await sessionResponse.json()
          throw new Error(data.error || 'Failed to start stream session')
        }

        const { session } = await sessionResponse.json()
        setSessionToken(session.session_token)
        setHasAccess(true)

        // Generate stream URL with session token
        if (eventData.bunny_stream_id) {
          const url = getHLSPlaybackUrl(eventData.bunny_stream_id)
          setStreamUrl(url)

          // Get stream stats
          const streamStats = await getStreamStats(eventData.bunny_stream_id)
          setStats(streamStats)
        }
      } catch (err) {
        console.error('Failed to load stream:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stream')
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    loadStreamData()

    // Poll for stats updates every 10 seconds if stream is live
    const interval = setInterval(() => {
      if (event?.bunny_stream_id && event?.status === 'live') {
        getStreamStats(event.bunny_stream_id).then(setStats)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [eventId])

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
              <VideoPlayer
                src={streamUrl}
                poster={event.featured_image}
                title={event.title}
                autoplay={true}
                controls={true}
                className="w-full aspect-video"
              />
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
                  <p className="font-bold uppercase">{event.event_type}</p>
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
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Stream Stats */}
            {stats && (
              <Card className="p-6 mb-6 border-border">
                <h3 className="text-lg font-black mb-4">STREAM STATS</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Viewers</p>
                    <p className="text-2xl font-black text-primary">{stats.viewerCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quality</p>
                    <p className="font-bold">{stats.resolution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`font-bold ${stats.isHealthy ? 'text-primary' : 'text-destructive'}`}>
                      {stats.isHealthy ? '✓ Healthy' : '✗ Offline'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Chat Placeholder */}
            <Card className="p-6 border-border h-96 flex flex-col">
              <h3 className="text-lg font-black mb-4">LIVE CHAT</h3>
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <p className="mb-2">💬 Chat coming soon</p>
                  <p className="text-sm">Interact with other viewers in real time</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
