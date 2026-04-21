import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log('[Cloudflare] Webhook received:', data)

    const { live_input_id, status } = data

    if (!live_input_id) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    const isLive = status === 'input_application_connected' || status === 'live'

    const { error: updateError } = await supabase
      .from('events')
      .update({
        is_live: isLive,
        status: isLive ? 'live' : 'scheduled',
      })
      .eq('cloudflare_live_input_id', live_input_id)

    if (updateError) {
      console.error('[Cloudflare] Failed to update event:', updateError)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Cloudflare] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}