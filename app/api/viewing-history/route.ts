import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addToViewingHistory } from '@/lib/db-client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await request.json()
    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId' },
        { status: 400 }
      )
    }

    // Add to viewing history
    const result = await addToViewingHistory(supabase, user.id, eventId)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Viewing history error:', error)
    return NextResponse.json(
      { error: 'Failed to track viewing history' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = request.nextUrl.searchParams.get('limit') || '50'

    // Get viewing history with event details
    const { data, error } = await supabase
      .from('viewing_history')
      .select(`
        *,
        events:event_id(*)
      `)
      .eq('user_id', user.id)
      .order('last_watched', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get viewing history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch viewing history' },
      { status: 500 }
    )
  }
}
