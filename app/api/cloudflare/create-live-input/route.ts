import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Get Cloudflare credentials
    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 400 }
      )
    }

    // Create live input on Cloudflare
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta: {
            name: `Event ${eventId}`,
          },
          recording: {
            mode: 'automatic',
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Cloudflare API error:', error)
      return NextResponse.json(
        { error: 'Failed to create live input' },
        { status: 400 }
      )
    }

    const data = await response.json()
    const liveInput = data.result

    // Save to database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    await supabase
      .from('events')
      .update({
        cloudflare_live_input_id: liveInput.id,
        cloudflare_live_input_key: liveInput.rtmps.streamKey,
        cloudflare_rtmps_url: liveInput.rtmps.url,
      })
      .eq('id', eventId)

    return NextResponse.json({
      success: true,
      rtmpsUrl: liveInput.rtmps.url,
      streamKey: liveInput.rtmps.streamKey,
      liveInputId: liveInput.id,
    })
  } catch (error) {
    console.error('Error creating live input:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
