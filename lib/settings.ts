import type { SupabaseClient } from '@supabase/supabase-js'
import 'server-only'

interface CachedSettings {
  data: Record<string, string>
  timestamp: number
}

let cache: CachedSettings | null = null
const CACHE_TTL_MS = 30_000

export async function getPlatformSettings(supabase: SupabaseClient) {
  const now = Date.now()
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data
  }

  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value')

  if (error || !data) {
    throw new Error(`Failed to load platform settings: ${error?.message}`)
  }

  const settings: Record<string, string> = {}
  for (const row of data) {
    settings[row.key] = row.value
  }

  cache = { data: settings, timestamp: now }
  return settings
}

export async function getStripeSettings(supabase: SupabaseClient) {
  const settings = await getPlatformSettings(supabase)
  const mode = settings.stripe_mode || 'test'

  return {
    mode,
    secretKey: mode === 'live' ? settings.stripe_live_secret_key : settings.stripe_test_secret_key,
    publishableKey: mode === 'live' ? settings.stripe_live_publishable_key : settings.stripe_test_publishable_key,
    webhookSecret: mode === 'live' ? settings.stripe_live_webhook_secret : settings.stripe_test_webhook_secret,
  }
}

export function invalidateSettingsCache() {
  cache = null
}
