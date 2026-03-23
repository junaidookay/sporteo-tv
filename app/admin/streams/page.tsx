'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getEvents } from '@/lib/db-client'

export default function StreamsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [streamKey, setStreamKey] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const isAdmin = user.user_metadata?.is_admin === true
        if (!isAdmin) {
          router.push('/')
          return
        }

        setUser(user)

        const eventsData = await getEvents(supabase)
        setEvents(eventsData)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const generateStreamKey = () => {
    const key = `stream_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
    setStreamKey(key)
  }

  const handleStartStream = async (eventId: string) => {
    try {
      await supabase
        .from('events')
        .update({ status: 'live' })
        .eq('id', eventId)

      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'live' } : e)))
    } catch (error) {
      console.error('Failed to start stream:', error)
    }
  }

  const handleStopStream = async (eventId: string) => {
    try {
      await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('id', eventId)

      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'completed' } : e)))
    } catch (error) {
      console.error('Failed to stop stream:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const liveEvents = events.filter((e) => e.status === 'live')
  const scheduledEvents = events.filter((e) => e.status === 'scheduled')

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">STREAM MANAGEMENT</h1>
            <p className="text-muted-foreground">Manage live streams and stream settings</p>
          </div>

          {/* Live Streams */}
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-4">LIVE STREAMS</h2>
            {liveEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveEvents.map((event) => (
                  <Card key={event.id} className="p-6 border-border border-red-600/50 bg-red-600/5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-red-600 uppercase">LIVE</span>
                        </div>
                        <h3 className="font-black text-lg">{event.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stream ID</p>
                        <p className="font-mono text-xs break-all">{event.bunny_stream_id || 'No ID assigned'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-bold capitalize">{event.event_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Time</p>
                        <p className="font-medium">{new Date(event.start_time).toLocaleString()}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStopStream(event.id)}
                      className="w-full border-red-600 text-red-600 bg-red-600/10 hover:bg-red-600/20"
                      variant="outline"
                    >
                      End Stream
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 border-border text-center text-muted-foreground">
                <p>No active streams</p>
              </Card>
            )}
          </div>

          {/* Scheduled Events */}
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-4">SCHEDULED EVENTS</h2>
            {scheduledEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduledEvents.map((event) => (
                  <Card key={event.id} className="p-6 border-border">
                    <h3 className="font-black text-lg mb-4">{event.title}</h3>

                    <div className="space-y-3 mb-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-bold capitalize">{event.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-bold capitalize">{event.event_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Scheduled For</p>
                        <p className="font-medium">{new Date(event.start_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Viewers/Buyers</p>
                        <p className="font-bold text-lg">
                          {event.subscription_required ? '∞ Subscribers' : 'Pay-Per-View'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartStream(event.id)}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Start Stream
                      </Button>
                      <Button variant="outline" className="flex-1 border-border hover:bg-secondary">
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 border-border text-center text-muted-foreground">
                <p>No scheduled events</p>
              </Card>
            )}
          </div>

          {/* Stream Configuration */}
          <Card className="border-border p-6">
            <h2 className="text-2xl font-black mb-6">STREAM CONFIGURATION</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* RTMP Settings */}
              <div>
                <h3 className="font-bold text-lg mb-4">RTMP Settings</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-muted-foreground mb-2">RTMP Server URL</label>
                    <input
                      type="text"
                      value="rtmp://your-bunny-ingest.bunnycdn.com:1935/live"
                      readOnly
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-2">Stream Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={streamKey || 'Click generate to create a key'}
                        readOnly
                        className="flex-1 px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                      />
                      <Button onClick={generateStreamKey} variant="outline" className="border-border">
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/10 border border-primary rounded text-xs">
                    <p className="font-bold mb-2">OBS Configuration</p>
                    <p className="text-muted-foreground">
                      Server: rtmp://your-bunny-ingest.bunnycdn.com:1935/live
                      <br />
                      Stream Key: {streamKey || '[Click Generate]'}
                    </p>
                  </div>
                </div>
              </div>

              {/* HLS/DASH Info */}
              <div>
                <h3 className="font-bold text-lg mb-4">Playback URLs</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-muted-foreground mb-2">HLS Playback URL</label>
                    <input
                      type="text"
                      value="https://your-bunny.bunnycdnh.com/your-library/your-video/playlist.m3u8"
                      readOnly
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-muted-foreground mb-2">DASH Playback URL</label>
                    <input
                      type="text"
                      value="https://your-bunny.bunnycdnh.com/your-library/your-video/manifest.mpd"
                      readOnly
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 bg-blue-600/10 border border-blue-600/50 rounded text-xs">
                    <p className="font-bold text-blue-600 mb-2">Integration Note</p>
                    <p className="text-muted-foreground">
                      These URLs are used for playback on the video player component. Update stream URLs as needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
