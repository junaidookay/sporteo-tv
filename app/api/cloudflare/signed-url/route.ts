import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getCloudflareSettings(supabase: any) {
  const { data: rows, error } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['cloudflare_account_id', 'cloudflare_api_token'])

  if (error || !rows) {
    throw new Error('Failed to load settings')
  }

  const settings = Object.fromEntries(rows.map((r: any) => [r.key, r.value]))

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

    // Force isLive to be a boolean
    const isLiveInput = isLive === true || isLive === 'true'

    console.log('[signed-url] Request received:', { videoId, expiresIn, isLive: isLiveInput, userId: user.id })

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

    let targetVideoId = videoId

    if (isLiveInput) {
      // For live inputs: fetch the live input details to find the actual video ID
      console.log('[signed-url] Fetching live input details for:', videoId)
      
      const liveInputRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${videoId}`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      )
      
      if (!liveInputRes.ok) {
        console.error('[signed-url] Failed to get live input details:', await liveInputRes.text())
        return NextResponse.json(
          { error: 'Failed to get live input details' },
          { status: liveInputRes.status }
        )
      }
      
      const liveInputData = await liveInputRes.json()
      
      // Get video ID from currentPlayback (for live) or lastRecording (for replay)
      targetVideoId = liveInputData.result?.status?.currentPlayback?.videoID || 
                      liveInputData.result?.recording?.lastRecordingID

      if (!targetVideoId) {
        console.error('[signed-url] No video ID found in live input:', liveInputData)
        return NextResponse.json(
          { error: 'No active recording found. Is the stream live?' },
          { status: 404 }
        )
      }
      
      console.log('[signed-url] Found video ID from live input:', targetVideoId)
    }

    // Use regular /stream/{videoId}/token endpoint (works for both live recordings and VOD)
    const tokenUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${targetVideoId}/token`
    console.log('[signed-url] Calling Cloudflare token API:', tokenUrl)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + expiresIn,
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

    let tokenData
    try {
      tokenData = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from Cloudflare' },
        { status: 500 }
      )
    }

    // Cloudflare returns: { result: { token: "..." }, success: true }
    // Token is in result.token
    const token = tokenData.result?.token

    if (!token) {
      console.error('[signed-url] No token in response:', tokenData)
      return NextResponse.json(
        { error: 'No token returned from Cloudflare' },
        { status: 500 }
      )
    }

    // Return the token to use in the player URL
    // Format: https://customer-{subdomain}.cloudflarestream.com/{token}/iframe
    return NextResponse.json({
      token: token,
      expiresIn,
    })
  } catch (error) {
    console.error('[signed-url] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Server error: ' + message },
      { status: 500 }
    )
  }
}