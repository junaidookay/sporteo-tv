import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CloudflareStream } from '@/lib/cloudflare-stream'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Cloudflare Webhook] Received:', JSON.stringify(body, null, 2))

    const supabase = await createClient()

    // Get Cloudflare credentials from platform_settings
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

    // Handle Cloudflare webhook notifications
    const eventType = body.eventType || body.type

    if (eventType === 'video.downloadable' || eventType === 'stream.recording.complete') {
      // A recording is ready
      const videoId = body.videoId || body.result?.uid
      const liveInputId = body.liveInputId || body.result?.live?.inputId

      if (videoId && liveInputId) {
        console.log(`[Cloudflare Webhook] Recording ready: ${videoId} for live input: ${liveInputId}`)

        // Find the event with this live input
        const { data: event } = await supabase
          .from('events')
          .select('id, title, cloudflare_live_input_id')
          .eq('cloudflare_live_input_id', liveInputId)
          .maybeSingle()

        if (event) {
          // Update the event with the cloudflare_stream_id
          await supabase
            .from('events')
            .update({ 
              cloudflare_stream_id: videoId,
              status: 'completed'
            })
            .eq('id', event.id)

          console.log(`[Cloudflare Webhook] Updated event ${event.id} with stream ID ${videoId}`)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Cloudflare Webhook] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
