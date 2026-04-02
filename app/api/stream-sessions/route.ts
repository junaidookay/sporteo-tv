import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { eventId, deviceId } = await request.json()

    if (!eventId || !deviceId) {
      return new Response(JSON.stringify({ error: 'Missing eventId or deviceId' }), { status: 400 })
    }

    // Check if user has access to this event (purchase or subscription)
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single()

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!purchase && !subscription) {
      return new Response(JSON.stringify({ error: 'No access to this event' }), { status: 403 })
    }

    // Terminate any existing active sessions for this user
    await supabase
      .from('stream_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Create new session token
    const sessionToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours

    const { data: session, error: sessionError } = await supabase
      .from('stream_sessions')
      .insert({
        user_id: user.id,
        event_id: eventId,
        device_id: deviceId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to create stream session:', sessionError)
      return new Response(JSON.stringify({ error: 'Failed to create session' }), { status: 500 })
    }

    return new Response(JSON.stringify({ session }), { status: 200 })
  } catch (error) {
    console.error('Stream session error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const url = new URL(request.url)
    const sessionToken = url.searchParams.get('token')

    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Missing session token' }), { status: 400 })
    }

    // Verify session token
    const { data: session, error } = await supabase
      .from('stream_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error || !session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 403 })
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('stream_sessions')
        .update({ is_active: false })
        .eq('id', session.id)

      return new Response(JSON.stringify({ error: 'Session expired' }), { status: 403 })
    }

    return new Response(JSON.stringify({ valid: true, event_id: session.event_id }), { status: 200 })
  } catch (error) {
    console.error('Stream session verification error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
