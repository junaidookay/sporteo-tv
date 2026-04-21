'use server'

import { createClient } from '@/lib/supabase/server'

export interface LoadedSettings {
  platformName: string
  platformEmail: string
  defaultPPVPrice: string
  monthlySubPrice: string
  yearlySubPrice: string
  maxConcurrentStreams: string
  allowPPV: boolean
  allowSubscriptions: boolean
  maintenanceMode: boolean
  stripeMode: 'test' | 'live'
  stripeTestPublishableKey: string
  stripeTestSecretKey: string
  stripeTestWebhookSecret: string
  stripeLivePublishableKey: string
  stripeLiveSecretKey: string
  stripeLiveWebhookSecret: string
  bunnyApiKey: string
  bunnyCdnHostname: string
  cloudflareAccountId: string
  cloudflareApiToken: string
}

export async function loadSettings(): Promise<LoadedSettings> {
  const supabaseClient = await createClient()

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error('Not authorized')
  }

  const { data: rows, error } = await supabaseClient
    .from('platform_settings')
    .select('key, value')

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`)
  }

  const settings: Record<string, string> = {}
  for (const row of rows || []) {
    settings[row.key] = row.value
  }

  return {
    platformName: settings.platform_name || 'Sporteo.tv',
    platformEmail: settings.platform_email || 'support@sporteo.tv',
    defaultPPVPrice: settings.default_ppv_price || '4999',
    monthlySubPrice: settings.monthly_sub_price || '999',
    yearlySubPrice: settings.yearly_sub_price || '9999',
    maxConcurrentStreams: settings.max_concurrent_streams || '4',
    allowPPV: settings.allow_ppv === 'true',
    allowSubscriptions: settings.allow_subscriptions === 'true',
    maintenanceMode: settings.maintenance_mode === 'true',
    stripeMode: (settings.stripe_mode as 'test' | 'live') || 'test',
    stripeTestPublishableKey: settings.stripe_test_publishable_key || '',
    stripeTestSecretKey: settings.stripe_test_secret_key || '',
    stripeTestWebhookSecret: settings.stripe_test_webhook_secret || '',
    stripeLivePublishableKey: settings.stripe_live_publishable_key || '',
    stripeLiveSecretKey: settings.stripe_live_secret_key || '',
    stripeLiveWebhookSecret: settings.stripe_live_webhook_secret || '',
    bunnyApiKey: settings.bunny_api_key || '',
    bunnyCdnHostname: settings.bunny_cdn_hostname || '',
    cloudflareAccountId: settings.cloudflare_account_id || '',
    cloudflareApiToken: settings.cloudflare_api_token || '',
  }
}

export async function saveSettings(settings: PlatformSettings, apiSettings: ApiSettings) {
  const supabaseClient = await createClient()

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error('Not authorized')
  }

  const rows = [
    { key: 'platform_name', value: settings.platformName },
    { key: 'platform_email', value: settings.platformEmail },
    { key: 'default_ppv_price', value: settings.defaultPPVPrice },
    { key: 'monthly_sub_price', value: settings.monthlySubPrice },
    { key: 'yearly_sub_price', value: settings.yearlySubPrice },
    { key: 'max_concurrent_streams', value: settings.maxConcurrentStreams },
    { key: 'allow_ppv', value: String(settings.allowPPV) },
    { key: 'allow_subscriptions', value: String(settings.allowSubscriptions) },
    { key: 'maintenance_mode', value: String(settings.maintenanceMode) },
    { key: 'stripe_mode', value: apiSettings.stripeMode },
    { key: 'stripe_test_publishable_key', value: apiSettings.stripeTestPublishableKey },
    { key: 'stripe_test_secret_key', value: apiSettings.stripeTestSecretKey },
    { key: 'stripe_test_webhook_secret', value: apiSettings.stripeTestWebhookSecret },
    { key: 'stripe_live_publishable_key', value: apiSettings.stripeLivePublishableKey },
    { key: 'stripe_live_secret_key', value: apiSettings.stripeLiveSecretKey },
    { key: 'stripe_live_webhook_secret', value: apiSettings.stripeLiveWebhookSecret },
    { key: 'bunny_api_key', value: apiSettings.bunnyApiKey },
    { key: 'bunny_cdn_hostname', value: apiSettings.bunnyCdnHostname },
    { key: 'cloudflare_account_id', value: apiSettings.cloudflareAccountId },
    { key: 'cloudflare_api_token', value: apiSettings.cloudflareApiToken },
  ]

  for (const row of rows) {
    const { error } = await supabaseClient
      .from('platform_settings')
      .upsert({ key: row.key, value: row.value }, { onConflict: 'key' })

    if (error) {
      throw new Error(`Failed to save ${row.key}: ${error.message}`)
    }
  }

  return { success: true, mode: apiSettings.stripeMode }
}

export interface PlatformSettings {
  platformName: string
  platformEmail: string
  defaultPPVPrice: string
  monthlySubPrice: string
  yearlySubPrice: string
  maxConcurrentStreams: string
  allowPPV: boolean
  allowSubscriptions: boolean
  maintenanceMode: boolean
}

export interface ApiSettings {
  stripeMode: 'test' | 'live'
  stripeTestPublishableKey: string
  stripeTestSecretKey: string
  stripeTestWebhookSecret: string
  stripeLivePublishableKey: string
  stripeLiveSecretKey: string
  stripeLiveWebhookSecret: string
  bunnyApiKey: string
  bunnyCdnHostname: string
  cloudflareAccountId: string
  cloudflareApiToken: string
}
