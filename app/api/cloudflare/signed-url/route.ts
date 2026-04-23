import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getCloudflareSettings(supabase: any) {
  const { data: rows, error } = await supabase
    .from('platform_settings')
    .select('key, value')

  if (error || !rows) {
    throw new Error('Failed to load settings')
  }

  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return {
    accountId: settings.cloudflare_account_id || '',
    apiToken: settings.cloudflare_api_token || '',
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[signed-url] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId, expiresIn = 14400, isLive = false } = await request.json()

    console.log('[signed-url] Request received:', { videoId, expiresIn, isLive, userId: user.id })

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const cloudflare = await getCloudflareSettings(supabase)
    const accountId = cloudflare.accountId
    const apiToken = cloudflare.apiToken

    console.log('[signed-url] Cloudflare settings:', { accountId: !!accountId, apiToken: !!apiToken })

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare is not configured' },
        { status: 503 }
      )
    }

    // Use /token endpoint for VOD or live inputs with signed URLs
    // Note: /token endpoint does not support Live WebRTC
    const tokenUrl = isLive
      ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${videoId}/token`
      : `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/token`

    console.log('[signed-url] Calling Cloudflare API:', tokenUrl)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + expiresIn, // Default 4 hours
      }),
    })

    const responseText = await response.text()
    console.log('[signed-url] Cloudflare response status:', response.status)
    console.log('[signed-url] Cloudflare response body:', responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }
      console.error('[signed-url] Cloudflare error:', errorData)
      return NextResponse.json(
        { error: errorData.errors?.[0]?.message || errorData.message || 'Failed to generate token' },
        { status: response.status }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from Cloudflare' },
        { status: 500 }
      )
    }

    // Return the token to use in the player URL
    // Format: https://customer-{subdomain}.cloudflarestream.com/{token}/iframe
    return NextResponse.json({
      token: data.result,
      expiresIn,
    })
  } catch (error) {
    console.error('[signed-url] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate signed URL: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}