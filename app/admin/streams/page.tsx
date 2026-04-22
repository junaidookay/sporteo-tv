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
  const [streamKey, setStreamKey] = useState('')
  const [cloudflareConfig, setCloudflareConfig] = useState<any>(null)
  const [rtmpUrl, setRtmpUrl] = useState('')
  const [streamStatus, setStreamStatus] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)

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

        // Load Cloudflare configuration from database
        try {
          const settings = await loadSettings()
          console.log('Loaded settings:', settings)
          if (settings.cloudflareAccountId) {
            setCloudflareConfig({
              cloudflareAccountId: settings.cloudflareAccountId,
              cloudflareApiToken: settings.cloudflareApiToken,
            })
            setRtmpUrl(`rtmp://live.cloudflare.com:1935/rtmp/`)
          } else {
            console.log('No Cloudflare Account ID found in settings')
          }
        } catch (e) {
          console.error('Failed to load cloudflare settings:', e)
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

  const generateStreamKey = () => {
    const key = `stream_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
    setStreamKey(key)
  }

  const handleGenerateStreamKey = async (eventId: string) => {
    console.log('handleGenerateStreamKey called with eventId:', eventId)
    console.log('cloudflareConfig:', cloudflareConfig)

    if (!cloudflareConfig?.cloudflareAccountId || !cloudflareConfig?.cloudflareApiToken) {
      alert('Cloudflare Stream not configured. Please add your credentials in Settings.')
      return
    }

    try {
      const event = events.find(e => e.id === eventId)
      if (!event) {
        console.error('Event not found:', eventId)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      console.log('Token available:', !!token)

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

      console.log('Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create live stream')
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (!data.liveInputId) {
        throw new Error('No live input ID returned')
      }

      await supabase
        .from('events')
        .update({
          cloudflare_live_input_id: data.liveInputId,
          cloudflare_stream_key: data.streamKey,
        })
        .eq('id', eventId)

      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, cloudflare_live_input_id: data.liveInputId, cloudflare_stream_key: data.streamKey } : e)))
      setSelectedStream({ ...event, cloudflare_live_input_id: data.liveInputId, cloudflare_stream_key: data.streamKey })
      setStreamKey(data.streamKey || data.liveInputId)
    } catch (error) {
      console.error('Failed to generate stream key:', error)
      alert('Failed to generate stream key: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleStartStream = async (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (!event?.cloudflare_live_input_id) {
      alert('Please generate a stream key first by clicking "Generate Stream Key"')
      return
    }

    try {
      await supabase
        .from('events')
        .update({ status: 'live' })
        .eq('id', eventId)

      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status: 'live' } : e)))
      if (selectedStream?.id === eventId) {
        setSelectedStream({ ...selectedStream, status: 'live' })
      }
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
      if (selectedStream?.id === eventId) {
        setSelectedStream({ ...selectedStream, status: 'completed' })
      }
    } catch (error) {
      console.error('Failed to stop stream:', error)
    }
  }

  const checkStreamStatus = async (liveInputId: string) => {
    if (!liveInputId) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) return

      const response = await fetch(`/api/cloudflare/live-input-status?liveInputId=${liveInputId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStreamStatus(data)
      }
    } catch (error) {
      console.error('Failed to check stream status:', error)
    }
  }

  useEffect(() => {
    if (selectedStream?.cloudflare_live_input_id && isPolling) {
      checkStreamStatus(selectedStream.cloudflare_live_input_id)
      const interval = setInterval(() => {
        checkStreamStatus(selectedStream.cloudflare_live_input_id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedStream, isPolling])

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
                  <Card
                    key={event.id}
                    className={`p-6 border-border border-red-600/50 bg-red-600/5 cursor-pointer hover:border-red-600 transition-colors ${selectedStream?.id === event.id ? 'border-red-600 bg-red-600/10' : ''}`}
                    onClick={() => setSelectedStream(event)}
                  >
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
                        <p className="text-muted-foreground">Cloudflare Live Input ID</p>
                        <p className="font-mono text-xs break-all">{event.cloudflare_live_input_id || 'Not generated yet'}</p>
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
                  <Card
                    key={event.id}
                    className={`p-6 border-border cursor-pointer hover:border-primary transition-colors ${selectedStream?.id === event.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedStream(event)}
                  >
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
                      {!event.cloudflare_live_input_id ? (
                        <Button
                          onClick={() => handleGenerateStreamKey(event.id)}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Generate Stream Key
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleStartStream(event.id)}
                          className="flex-1 bg-green-600 text-white hover:bg-green-600/90"
                        >
                          Go Live
                        </Button>
                      )}
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
                <h3 className="font-bold text-lg mb-4">Cloudflare Stream - RTMP Settings</h3>
                {cloudflareConfig?.cloudflareAccountId ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-muted-foreground mb-2">RTMP Server URL</label>
                      <input
                        type="text"
                        value={rtmpUrl || 'Loading...'}
                        readOnly
                        className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-muted-foreground mb-2">Account ID</label>
                      <input
                        type="text"
                        value={cloudflareConfig.cloudflareAccountId}
                        readOnly
                        className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                      />
                    </div>

                    <div className="p-3 bg-green-600/10 border border-green-600/30 rounded text-xs">
                      <p className="font-bold text-green-600 mb-2">OBS Configuration (Recommended: RTMPS)</p>
                      <p className="text-muted-foreground">
                        <strong>RTMPS Server:</strong> rtmps://live.cloudflare.com:443/live/
                        <br />
                        <strong>Stream Key:</strong> <span className="font-mono text-primary">{streamKey || selectedStream?.cloudflare_stream_key || selectedStream?.cloudflare_live_input_id || '[Generate stream key above]'}</span>
                        <br />
                        <br />
                        <span className="text-yellow-600">Make sure to use the exact stream key shown above (it may differ from the live input ID).</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded text-sm">
                    <p className="text-yellow-600 font-bold">Cloudflare Stream not configured</p>
                    <p className="text-muted-foreground mt-2">
                      Add your Cloudflare Account ID and API Token in Admin Settings → Cloudflare Stream to enable live streaming.
                    </p>
                  </div>
                )}
              </div>

              {/* Cloudflare Stream Info */}
              <div>
                <h3 className="font-bold text-lg mb-4">Cloudflare Stream Playback</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-muted-foreground mb-2">Live Stream</label>
                    <input
                      type="text"
                      value={selectedStream?.cloudflare_live_input_id ? `Live playback enabled for: ${selectedStream.title}` : 'Select a live event above'}
                      readOnly
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                    />
                  </div>

                  {selectedStream?.cloudflare_live_input_id && (
                    <div>
                      <Button
                        onClick={() => setIsPolling(!isPolling)}
                        variant={isPolling ? "destructive" : "default"}
                        className="w-full"
                      >
                        {isPolling ? 'Stop Preview' : 'Start Preview'}
                      </Button>
                      {streamStatus && (
                        <p className="text-xs mt-2 text-muted-foreground">
                          Status: <span className={streamStatus.enabled ? 'text-green-600' : 'text-yellow-600'}>{streamStatus.status}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {isPolling && selectedStream?.cloudflare_live_input_id && (
                    <div className="mt-4">
                      <label className="block text-muted-foreground mb-2">Stream Preview</label>
                      {streamStatus?.enabled ? (
                        <div className="w-full">
                          <video
                            controls
                            autoPlay
                            playsInline
                            className="w-full aspect-video bg-black rounded-lg"
                            src={`https://customer-${cloudflareConfig?.cloudflareAccountId}.cloudflarestream.com/${selectedStream.cloudflare_live_input_id}/manifest/video.m3u8`}
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-secondary rounded-lg border border-border flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">
                            {streamStatus?.status === 'disconnected' ? 'Waiting for OBS stream... Make sure OBS is connected.' : 'Stream not active yet. Start streaming in OBS first.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-muted-foreground mb-2">Replay Video</label>
                    <input
                      type="text"
                      value={selectedStream?.replay_video_id ? `Replay ID: ${selectedStream.replay_video_id}` : 'Automatically created after live stream ends'}
                      readOnly
                      className="w-full px-3 py-2 bg-secondary border border-border rounded text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 bg-blue-600/10 border border-blue-600/50 rounded text-xs">
                    <p className="font-bold text-blue-600 mb-2">Automatic Features</p>
                    <p className="text-muted-foreground">
                      Cloudflare Stream automatically:
                      <br />
                      • Records your live stream
                      <br />
                      • Creates a replay video when the live broadcast ends
                      <br />
                      • Generates signed URLs for secure playback
                      <br />
                      • Manages adaptive bitrate streaming
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
