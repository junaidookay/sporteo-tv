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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const liveInputId = searchParams.get('liveInputId')

    if (!liveInputId) {
      return NextResponse.json({ error: 'Live Input ID is required' }, { status: 400 })
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

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${liveInputId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.errors?.[0]?.message || 'Failed to get stream status' },
        { status: response.status }
      )
    }

    const data: any = await response.json()
    
    return NextResponse.json({
      status: data.result?.status || 'unknown',
      enabled: data.result?.enabled || false,
      deleted: data.result?.deleted || false,
    })
  } catch (error) {
    console.error('Error getting stream status:', error)
    return NextResponse.json(
      { error: 'Failed to get stream status' },
      { status: 500 }
    )
  }
}