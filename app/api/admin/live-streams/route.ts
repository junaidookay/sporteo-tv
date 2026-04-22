'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadSettings } from '@/app/actions/settings'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const { data: event } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const settings = await loadSettings()
    const accountId = settings.cloudflareAccountId
    const apiToken = settings.cloudflareApiToken

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Cloudflare Stream not configured' }, { status: 400 })
    }

    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/stream/live_inputs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta: {
            name: `Live: ${event.title}`,
            description: `Live stream for ${event.title}`,
          },
          recording: {
            mode: 'automatic',
          },
          rtmpsPlayback: {},
          requireSignedURLs: true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Cloudflare error:', error)
      return NextResponse.json(
        { error: 'Failed to create live input', details: error },
        { status: response.status }
      )
    }

    const data: any = await response.json()
    if (!data.success) {
      console.error('Cloudflare error:', data.errors)
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Failed to create live input' },
        { status: 400 }
      )
    }

    const liveInput = data.result
    const liveInputId = liveInput.uid
    const rtmpsStreamKey = liveInput.rtmps.streamKey
    const rtmpsPlaybackKey = liveInput.rtmpsPlayback.streamKey
    
    const webRTCUrl = liveInput.webRTCPlayback?.url || ''
    const customerSubdomainMatch = webRTCUrl.match(/customer-([a-z0-9]+)\.cloudflarestream\.com/)
    const customerSubdomain = customerSubdomainMatch ? customerSubdomainMatch[1] : accountId

    await supabase
      .from('events')
      .update({
        cloudflare_live_input_id: liveInputId,
        cloudflare_stream_key: rtmpsStreamKey,
        cloudflare_rtmps_url: `rtmps://live.cloudflare.com:443/live/`,
        cloudflare_customer_subdomain: customerSubdomain,
        cloudflare_rtmps_playback_key: rtmpsPlaybackKey,
        is_live: true,
      })
      .eq('id', eventId)

    return NextResponse.json(
      {
        liveInputId,
        customerSubdomain,
        rtmpsUrl: `rtmps://live.cloudflare.com:443/live/`,
        rtmpsStreamKey,
        rtmpsPlaybackKey,
        playbackUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${liveInputId}/iframe`,
        hlsPlaybackUrl: `https://customer-${customerSubdomain}.cloudflarestream.com/${liveInputId}/manifest/video.m3u8`,
        webRTCPlaybackUrl: liveInput.webRTCPlayback?.url,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating live stream:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create live stream' },
      { status: 500 }
    )
  }
}