import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { videoId, sessionToken, expiresIn = 3600 } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token is required' }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      console.error('Cloudflare credentials not configured')
      return NextResponse.json(
        { error: 'Video streaming is not configured' },
        { status: 503 }
      )
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + expiresIn,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Cloudflare signed URL error:', error)
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ signedUrl: data.result })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}