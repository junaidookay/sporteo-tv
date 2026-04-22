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
            name: event.title,
            description: `Live stream for: ${event.title}`,
          },
        }),
      }
    )

    const data: any = await response.json()

    if (!response.ok || !data.success) {
      console.error('Cloudflare API error:', data.errors)
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Failed to create live input' },
        { status: 400 }
      )
    }

    const liveInputId = data.result.uid
    const streamKey = data.result.rtmps?.streamKey
    const playbackKey = data.result.rtmpsPlayback?.streamKey
    const webRTCPlaybackUrl = data.result.webRTCPlayback?.url

    return NextResponse.json({
      liveInputId,
      streamKey,
      playbackKey,
      webRTCPlaybackUrl,
      rtmpUrl: `rtmps://live.cloudflare.com:443/live/`,
    })
  } catch (error) {
    console.error('Live stream creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}