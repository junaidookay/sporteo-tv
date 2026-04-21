import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function getCloudflareSettings() {
  const { data: rows, error } = await supabase
    .from('platform_settings')
    .select('key, value')

  if (error || !rows) {
    throw new Error('Failed to load settings')
  }

  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return {
    accountId: settings.cloudflare_account_id || '',
    apiToken: settings.cloudflare_api_token || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, cloudflare_live_input_id, is_live, status, start_time')
      .not('cloudflare_live_input_id', 'is', null)
      .order('start_time', { ascending: false })

    if (error) throw error

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching live streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live streams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { eventId } = await request.json()
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const cloudflare = await getCloudflareSettings()
    const accountId = cloudflare.accountId
    const apiToken = cloudflare.apiToken

    console.log('Cloudflare settings loaded:', { accountId: !!accountId, apiToken: !!apiToken })

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare is not configured. Please add credentials in Admin Settings.' },
        { status: 503 }
      )
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const liveInputResponse = await fetch(
      `https://api.realtime.cloudflare.com/v2/livestreams`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: event.title,
        }),
      }
    )

    if (!liveInputResponse.ok) {
      const error = await liveInputResponse.json()
      console.error('Cloudflare API error:', error)
      return NextResponse.json(
        { error: 'Cloudflare API error: ' + JSON.stringify(error.error || error.message) },
        { status: liveInputResponse.status }
      )
    }

    const liveInputData: any = await liveInputResponse.json()
    console.log('Cloudflare response:', liveInputData)

    if (!liveInputData.success) {
      console.error('Cloudflare error:', liveInputData.error)
      return NextResponse.json(
        { error: liveInputData.error?.message || 'Failed to create live stream' },
        { status: 400 }
      )
    }

    const liveInput = liveInputData.data
    console.log('Full Cloudflare live stream response:', JSON.stringify(liveInput, null, 2))

    const streamId = liveInput?.id
    const streamKey = liveInput?.stream_key
    const ingestServer = liveInput?.ingest_server
    const playbackUrl = liveInput?.playback_url

    if (!streamId) {
      console.error('No stream ID in response:', liveInput)
      return NextResponse.json(
        { error: 'Failed to get stream ID from Cloudflare response' },
        { status: 400 }
      )
    }

    console.log('Live stream created:', { streamId, streamKey, ingestServer, playbackUrl })

    const { error: updateError } = await supabase
      .from('events')
      .update({ cloudflare_live_input_id: streamId })
      .eq('id', eventId)

    if (updateError) throw updateError

    return NextResponse.json(
      {
        liveInputId: streamId,
        rtmpUrl: ingestServer || `rtmps://live.cloudflare.com:443/live/`,
        rtmpsUrl: ingestServer || `rtmps://live.cloudflare.com:443/live/`,
        streamKey: streamKey,
        playbackUrl: playbackUrl,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating live stream:', error)
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    )
  }
}