import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CloudflareStream } from '@/lib/cloudflare-stream'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event.cloudflare_live_input_id) {
      return NextResponse.json({ error: 'No live input ID for this event' }, { status: 400 })
    }

    const { data: settings } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in(['cloudflare_account_id', 'cloudflare_api_token'])

    const settingsMap = Object.fromEntries(settings?.map(s => [s.key, s.value]) || [])
    const accountId = settingsMap.cloudflare_account_id
    const apiToken = settingsMap.cloudflare_api_token

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })
    }

    const cfStream = new CloudflareStream(accountId, apiToken)

    const liveInput = await cfStream.getLiveInput(event.cloudflare_live_input_id)

    if (liveInput.recording && liveInput.recording.uid) {
      const streamId = liveInput.recording.uid

      await supabase
        .from('events')
        .update({ 
          cloudflare_stream_id: streamId,
          status: 'completed'
        })
        .eq('id', eventId)

      return NextResponse.json({ 
        success: true, 
        message: 'Replay fetched successfully',
        streamId: streamId
      })
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Replay not yet available. Please wait for Cloudflare to finish processing.'
    })

  } catch (error: any) {
    console.error('[Fetch Replay] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
