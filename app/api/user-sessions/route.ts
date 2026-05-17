import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const connectedClients = new Map<string, Map<ReadableStreamDefaultController, string>>()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const deviceId = request.nextUrl.searchParams.get('device_id')
    console.log(`[SSE CONNECT] userId: ${userId}, deviceId: ${deviceId}`)

    const stream = new ReadableStream({
      start(controller) {
        try {
          if (!connectedClients.has(userId)) {
            connectedClients.set(userId, new Map())
          }
          connectedClients.get(userId)!.set(controller, deviceId || 'unknown')
          console.log(`[SSE CONNECTED] userId: ${userId}, deviceId: ${deviceId}, total clients: ${connectedClients.get(userId)!.size}`)

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
              console.log(`[SSE DISCONNECTED] userId: ${userId}, deviceId: ${deviceId}, remaining: ${clients.size}`)
              if (clients.size === 0) {
                connectedClients.delete(userId)
              }
            }
          }

          request.signal.addEventListener('abort', cleanup)
        } catch (e) {
          console.error('[SSE START ERROR]', e)
          try { controller.close() } catch (e2) {}
        }
      },
      cancel() {
        const clients = connectedClients.get(userId)
        if (clients) {
          clients.delete(controller)
          console.log(`[SSE CANCEL] userId: ${userId}, remaining: ${clients.size}`)
          if (clients.size === 0) {
            connectedClients.delete(userId)
          }
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
  } catch (error) {
    console.error('[SSE ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { action, device_id, device_name } = body

    if (action === 'login') {
      if (!device_id || !device_name) {
        return NextResponse.json({ error: 'Missing device info' }, { status: 400 })
      }

      try {
        const { data: existingSession } = await supabase
          .from('user_sessions')
          .select('id, user_id, device_id, is_active, created_at')
          .eq('user_id', user.id)
          .eq('device_id', device_id)
          .eq('is_active', true)
          .maybeSingle()

        if (existingSession) {
          await supabase
            .from('user_sessions')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', existingSession.id)

          return NextResponse.json({ success: true, message: 'Session refreshed', session: existingSession })
        }

        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('user_id', user.id)

        const { data: newSession, error: insertError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            device_id: device_id,
            device_name: device_name,
            ip_address: (() => {
              const forwardedFor = request.headers.get('x-forwarded-for')
              return forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
            })(),
            is_active: true,
          })
          .select()
          .single()

        if (insertError) throw insertError

        return NextResponse.json({ success: true, session: newSession })
      } catch (error: any) {
        console.error('[LOGIN ERROR]', error)
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 })
      }
    }

    if (action === 'validate') {
      if (!device_id) {
        return NextResponse.json({ error: 'Missing device_id' }, { status: 400 })
      }

      try {
        const { data: session, error: sessionError } = await supabase
          .from('user_sessions')
          .select('id, user_id, device_id, is_active, created_at')
          .eq('user_id', user.id)
          .eq('device_id', device_id)
          .eq('is_active', true)
          .maybeSingle()

        if (sessionError) {
          console.error('[VALIDATE ERROR]', sessionError)
          return NextResponse.json({ valid: false, error: 'Session query failed' }, { status: 401 })
        }

        if (!session) {
          return NextResponse.json({ valid: false, error: 'Session expired' }, { status: 401 })
        }

        return NextResponse.json({ valid: true, session })
      } catch (error: any) {
        console.error('[VALIDATE ERROR]', error)
        return NextResponse.json({ valid: false, error: error.message }, { status: 401 })
      }
    }

    if (action === 'heartbeat') {
      if (!device_id) {
        return NextResponse.json({ error: 'Missing device_id' }, { status: 400 })
      }

      await supabase
        .from('user_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('device_id', device_id)

      return NextResponse.json({ success: true })
    }

    if (action === 'logout') {
      if (!device_id) {
        return NextResponse.json({ error: 'Missing device_id' }, { status: 400 })
      }

      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('device_id', device_id)

      return NextResponse.json({ success: true })
    }

    if (action === 'broadcast_logout') {
      broadcastToUser(user.id, 'force_logout', { reason: 'Logged in elsewhere' })
      return NextResponse.json({ success: true, broadcasted: true })
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

      broadcastToUser(user.id, 'force_logout', { reason: 'Logged out from all devices' })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[POST ERROR]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function broadcastToUser(userId: string, event: string, data: any) {
  const clients = connectedClients.get(userId)
  if (!clients) {
    console.log(`[BROADCAST] No clients for user ${userId}`)
    return
  }

  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  console.log(`[BROADCAST] Sending ${event} to ${clients.size} clients for user ${userId}`)

  const deadControllers: ReadableStreamDefaultController[] = []

  clients.forEach((controller, deviceId) => {
    try {
      if (typeof controller.enqueue !== 'function') {
        console.log(`[BROADCAST] Invalid controller for device ${deviceId}`)
        deadControllers.push(controller)
        return
      }
      controller.enqueue(new TextEncoder().encode(message))
    } catch (e: any) {
      console.error(`[BROADCAST ERROR] Device ${deviceId}:`, e?.message)
      if (e?.message?.includes('closed') || e?.message?.includes('abort')) {
        deadControllers.push(controller)
      }
    }
  })

  deadControllers.forEach(c => clients.delete(c))
  if (deadControllers.length > 0) {
    console.log(`[BROADCAST] Removed ${deadControllers.length} dead controllers`)
  }
}
