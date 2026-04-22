'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadSettings } from '@/app/actions/settings'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
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

    const settings = await loadSettings()
    const accountId = settings.cloudflareAccountId
    const apiToken = settings.cloudflareApiToken

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: 'Cloudflare is not configured' },
        { status: 503 }
      )
    }

    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/stream/live_inputs/${liveInputId}`,
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
    })
  } catch (error) {
    console.error('Error getting stream status:', error)
    return NextResponse.json(
      { error: 'Failed to get stream status' },
      { status: 500 }
    )
  }
}