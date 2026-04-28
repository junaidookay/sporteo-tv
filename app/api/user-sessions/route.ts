import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const connectedClients = new Map<string, Map<ReadableStreamDefaultController, string>>()

function broadcastToUser(userId: string, event: string, data: any, excludeDeviceId?: string) {
  const clients = connectedClients.get(userId)
  if (clients) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    clients.forEach((controller, deviceId) => {
      if (deviceId === excludeDeviceId) return
      try {
        controller.enqueue(new TextEncoder().encode(message))
      } catch (e) {
        console.error('Failed to send to client:', e)
      }
    })
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const deviceId = new URL(request.url).searchParams.get('device_id')

  const stream = new ReadableStream({
    start(controller) {
      if (!connectedClients.has(userId)) {
        connectedClients.set(userId, new Map())
      }
      connectedClients.get(userId)!.set(controller, deviceId || 'unknown')

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'))
        } catch (e) {
          clearInterval(keepAlive)
        }
      }, 30000)

      const cleanup = () => {
        clearInterval(keepAlive)
        const clients = connectedClients.get(userId)
        if (clients) {
          clients.delete(controller)
          if (clients.size === 0) {
            connectedClients.delete(userId)
          }
        }
      }

      request.signal.addEventListener('abort', cleanup)
    },
    cancel() {
      const clients = connectedClients.get(userId)
      if (clients) {
        clients.forEach((_, c) => {
          try { c.close() } catch (e) {}
        })
        connectedClients.delete(userId)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { device_id, device_name, action } = body

    if (action === 'login') {
      const clientIp = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      const { error: deactivateError } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)

      if (deactivateError) {
        console.error('Failed to deactivate old sessions:', deactivateError)
      }

      const { error: insertError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          device_id,
          device_name: device_name || 'Unknown Device',
          ip_address: clientIp !== 'unknown' ? clientIp : null,
          user_agent: userAgent,
          is_active: true,
        })

      if (insertError) {
        console.error('Failed to create session:', insertError)
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
      }

      broadcastToUser(user.id, 'force_logout', { reason: 'new_login' }, device_id)

      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('id, device_id, device_name, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        success: true,
        session: activeSessions?.[0] || null,
        active_sessions: activeSessions || []
      })
    }

    if (action === 'heartbeat') {
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('device_id', device_id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'logout') {
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('device_id', device_id)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'validate') {
      const { data: session } = await supabase
        .from('user_sessions')
        .select('id, user_id, device_id, is_active, created_at')
        .eq('user_id', user.id)
        .eq('device_id', device_id)
        .eq('is_active', true)
        .single()

      if (!session) {
        return NextResponse.json({ valid: false, error: 'Session expired' }, { status: 401 })
      }

      return NextResponse.json({ valid: true, session })
    }

    if (action === 'list') {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('id, device_id, device_name, created_at, last_active_at, ip_address')
        .eq('user_id', user.id)
        .order('last_active_at', { ascending: false })

      return NextResponse.json({ sessions: sessions || [] })
    }

    if (action === 'logout_all') {
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to logout all devices' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}