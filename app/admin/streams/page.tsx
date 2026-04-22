'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getEvents } from '@/lib/db-client'
import { loadSettings } from '@/app/actions/settings'

export default function StreamsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [cloudflareConfig, setCloudflareConfig] = useState<any>(null)
  const [creatingLiveInput, setCreatingLiveInput] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profileError || !profile?.is_admin) {
          router.push('/')
          return
        }

        setUser(user)

        const eventsData = await getEvents(supabase)
        setEvents(eventsData)

        try {
          const settings = await loadSettings()
          if (settings.cloudflareAccountId) {
            setCloudflareConfig({
              cloudflareAccountId: settings.cloudflareAccountId,
            })
          }
        } catch (e) {
          console.error('Failed to load settings:', e)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleGenerateLiveInput = async (eventId: string) => {
    setCreatingLiveInput(true)
    setMessage(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/live-streams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create live input')
      }

      const data = await response.json()
      
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                cloudflare_live_input_id: data.liveInputId,
                cloudflare_stream_key: data.rtmpsStreamKey,
                cloudflare_rtmps_url: data.rtmpsUrl,
                cloudflare_customer_subdomain: data.customerSubdomain,
                cloudflare_rtmps_playback_key: data.rtmpsPlaybackKey,
                is_live: true,
              }
            : e
        )
      )

      if (selectedStream?.id === eventId) {
        setSelectedStream((prev: any) => ({
          ...prev,
          cloudflare_live_input_id: data.liveInputId,
          cloudflare_stream_key: data.rtmpsStreamKey,
          cloudflare_rtmps_url: data.rtmpsUrl,
          cloudflare_customer_subdomain: data.customerSubdomain,
          cloudflare_rtmps_playback_key: data.rtmpsPlaybackKey,
          is_live: true,
        }))
      }

      setMessage({ type: 'success', text: 'Live input created! OBS can now stream.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create live input' })
    } finally {
      setCreatingLiveInput(false)
    }
  }

  const handleGoLive = async (eventId: string) => {
    try {
      await supabase
        .from('events')
        .update({ status: 'live', is_publicly_live: true })
        .eq('id', eventId)

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, is_publicly_live: true, status: 'live' } : e
        )
      )

      if (selectedStream?.id === eventId) {
        setSelectedStream((prev: any) => ({ ...prev, is_publicly_live: true, status: 'live' }))
      }

      setMessage({ type: 'success', text: 'Stream is now LIVE for viewers!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to go live' })
    }
  }

  const handleStopStream = async (eventId: string) => {
    try {
      await supabase
        .from('events')
        .update({ is_live: false, is_publicly_live: false, status: 'completed' })
        .eq('id', eventId)

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, is_live: false, is_publicly_live: false, status: 'completed' }
            : e
        )
      )

      if (selectedStream?.id === eventId) {
        setSelectedStream((prev: any) => ({
          ...prev,
          is_live: false,
          is_publicly_live: false,
          status: 'completed',
        }))
      }

      setMessage({ type: 'success', text: 'Stream stopped and archived.' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to stop stream' })
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

  const liveStreamEvents = events.filter((e) => e.is_live)
  const publicLiveEvents = events.filter((e) => e.is_publicly_live)
  const scheduledEvents = events.filter((e) => e.status === 'scheduled')

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">STREAM MANAGEMENT</h1>
            <p className="text-muted-foreground">Manage live streams with admin preview before going public</p>
          </div>

          {message && (
            <Card className={`p-4 mb-6 border-2 ${message.type === 'success' ? 'border-green-600/50 bg-green-600/10' : 'border-red-600/50 bg-red-600/10'}`}>
              <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            </Card>
          )}

          {publicLiveEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-4">PUBLIC LIVE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publicLiveEvents.map((event) => (
                  <Card key={event.id} className="p-6 border-2 border-primary bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-primary uppercase">LIVE NOW</span>
                      </div>
                    </div>

                    <h3 className="font-black text-lg mb-4">{event.title}</h3>

                    <Button
                      onClick={() => handleStopStream(event.id)}
                      className="w-full border-red-600 text-red-600 bg-red-600/10 hover:bg-red-600/20"
                      variant="outline"
                    >
                      Stop & Archive
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {liveStreamEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-4">ADMIN PREVIEW (Not visible to users)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveStreamEvents.map((event) => (
                  <Card key={event.id} className="p-6 border-2 border-orange-600/50 bg-orange-600/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-orange-600 uppercase">OBS STREAMING</span>
                      </div>
                    </div>

                    <h3 className="font-black text-lg mb-4">{event.title}</h3>

                    {event.cloudflare_live_input_id && event.cloudflare_customer_subdomain && (
                      <div className="mb-6 bg-black rounded-lg overflow-hidden aspect-video border border-border">
                        <iframe
                          src={`https://customer-${event.cloudflare_customer_subdomain}.cloudflarestream.com/${event.cloudflare_live_input_id}/iframe`}
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    )}
                    {event.cloudflare_live_input_id && !event.cloudflare_customer_subdomain && (
                      <div className="mb-6 bg-secondary rounded-lg overflow-hidden aspect-video border border-border flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Loading preview...</p>
                      </div>
                    )}

                    <div className="space-y-2 mb-6 text-sm">
                      <p><span className="text-muted-foreground">RTMPS URL:</span> <span className="font-mono text-xs">{event.cloudflare_rtmps_url || 'Generating...'}</span></p>
                      <p><span className="text-muted-foreground">Stream Key:</span> <span className="font-mono text-xs truncate">{event.cloudflare_stream_key ? event.cloudflare_stream_key.substring(0, 24) + '...' : 'N/A'}</span></p>
                    </div>

                    {!event.is_publicly_live && (
                      <Button
                        onClick={() => handleGoLive(event.id)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        GO LIVE (Make Public)
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {scheduledEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-black mb-4">SCHEDULED EVENTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduledEvents.map((event) => (
                  <Card key={event.id} className="p-6 border-border">
                    <h3 className="font-black text-lg mb-4">{event.title}</h3>

                    <div className="space-y-2 mb-6 text-sm">
                      <p><span className="text-muted-foreground">Scheduled For:</span> <span className="font-bold">{new Date(event.start_time).toLocaleString()}</span></p>
                      <p><span className="text-muted-foreground">Type:</span> <span className="font-bold capitalize">{event.event_type}</span></p>
                    </div>

                    {!event.cloudflare_live_input_id && (
                      <Button
                        onClick={() => handleGenerateLiveInput(event.id)}
                        disabled={creatingLiveInput}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-2"
                      >
                        {creatingLiveInput ? 'Creating...' : 'Generate OBS Stream Key'}
                      </Button>
                    )}

                    {event.cloudflare_live_input_id && (
                      <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg text-xs mb-4">
                        <p className="font-bold text-green-600 mb-2">Ready for OBS Streaming:</p>
                        <p className="text-muted-foreground break-all">Key: {event.cloudflare_stream_key}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!cloudflareConfig?.cloudflareAccountId && (
            <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg mt-6">
              <p className="text-yellow-600 font-bold mb-2">Cloudflare Stream Not Configured</p>
              <p className="text-muted-foreground text-sm">
                Go to Admin Settings and add your Cloudflare Account ID and API Token.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}