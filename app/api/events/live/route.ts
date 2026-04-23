import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'live')
      .eq('is_publicly_live', true)
      .order('start_time', { ascending: false })

    if (error) {
      console.error('[v0] Database error fetching live events:', error)
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('[v0] Live events API error:', error)
    return NextResponse.json({ data: [] })
  }
}