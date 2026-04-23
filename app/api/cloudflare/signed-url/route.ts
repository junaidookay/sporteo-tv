import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function getCloudflareSettings() {
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
    const { videoId, sessionToken, expiresIn = 14400, isLive = false } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const cloudflare = await getCloudflareSettings()
    const accountId = cloudflare.accountId
    const apiToken = cloudflare.apiToken

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

    if (!response.ok) {
      const error = await response.json()
      console.error('Cloudflare token error:', error)
      return NextResponse.json(
        { error: error.errors?.[0]?.message || 'Failed to generate token' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Return the token to use in the player URL
    // Format: https://customer-{subdomain}.cloudflarestream.com/{token}/iframe
    return NextResponse.json({
      token: data.result,
      expiresIn,
    })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}