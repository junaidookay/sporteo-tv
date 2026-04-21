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

    const cloudflare = await getCloudflareSettings()
    const accountId = cloudflare.accountId
    const apiToken = cloudflare.apiToken

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { success: false, message: 'Cloudflare is not configured. Please add credentials in Admin Settings.' },
        { status: 200 }
      )
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        return NextResponse.json({
          success: true,
          message: 'Connection successful! Cloudflare Stream is configured correctly.'
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'Cloudflare API error: ' + (data.errors?.[0]?.message || 'Unknown error')
        })
      }
    } else {
      const data = await response.json()
      return NextResponse.json({
        success: false,
        message: 'Authentication failed. Check your Account ID and API Token.'
      })
    }
  } catch (error) {
    console.error('Cloudflare test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Connection failed. Please check your credentials.'
    })
  }
}