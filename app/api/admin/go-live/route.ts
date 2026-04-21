import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { eventId, action } = await request.json()

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action required' },
        { status: 400 }
      )
    }

    if (!['go-live', 'stop-preview', 'go-offline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be go-live, stop-preview, or go-offline' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Verify the event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    let updateData = {}

    if (action === 'go-live') {
      // Make stream visible to users
      if (!event.is_live) {
        return NextResponse.json(
          { error: 'Stream must be live (streaming from OBS) before going public' },
          { status: 400 }
        )
      }

      updateData = {
        is_publicly_live: true,
        status: 'live',
      }
    } else if (action === 'stop-preview') {
      // Stop preview but keep stream available
      updateData = {
        is_live: false,
      }
    } else if (action === 'go-offline') {
      // Stop all streaming and make private
      updateData = {
        is_live: false,
        is_publicly_live: false,
        status: 'completed',
      }
    }

    // Update event
    const { error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Stream ${action} successful`,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
