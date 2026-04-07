import { SupabaseClient } from '@supabase/supabase-js'

// This file contains database functions that can be used from client components
// These functions take a supabase client as a parameter instead of creating one internally

export interface Event {
  id: string
  title: string
  description: string | null
  featured_image: string | null
  event_type: 'boxing' | 'mma' | 'k1'
  start_time: string
  end_time: string | null
  location: string | null
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  ticket_price_cents: number | null
  subscription_required: boolean
  created_by: string
  bunny_stream_id: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_id: string
  event_id: string
  stripe_payment_intent_id: string | null
  status: string
  amount_cents: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  subscription_type: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: string
  current_period_start: string
  current_period_end: string | null
  created_at: string
  updated_at: string
}

// Profile functions
export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as Profile | null
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

// Events functions
export async function getEvents(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: false })

  if (error) throw error
  return data as Event[]
}

export async function getEvent(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Event | null
}

export async function getEventsByStatus(
  supabase: SupabaseClient,
  status: string
) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', status)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data as Event[]
}

// Subscription functions
export async function getUserSubscription(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data as Subscription | null
}

export async function createSubscription(
  supabase: SupabaseClient,
  subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscription])
    .select()
    .single()

  if (error) throw error
  return data as Subscription
}

// Purchase functions
export async function getPurchase(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) throw error
  return data as Purchase | null
}

export async function getUserPurchases(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Purchase[]
}

export async function createPurchase(
  supabase: SupabaseClient,
  purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchase])
    .select()
    .single()

  if (error) throw error
  return data as Purchase
}

// Additional helper functions
export async function getEventById(
  supabase: SupabaseClient,
  id: string
) {
  return getEvent(supabase, id)
}

export async function getStreamAccess(
  supabase: SupabaseClient,
  userId: string,
  eventId: string
) {
  const { data, error } = await supabase
    .from('stream_access')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) throw error
  return data as any
}

export async function createEvent(
  supabase: SupabaseClient,
  event: Omit<Event, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Event>
) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

// Stream Sessions
export async function getStreamSession(
  supabase: SupabaseClient,
  sessionToken: string
) {
  const { data, error } = await supabase
    .from('stream_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as any
}

export async function getUserActiveSessions(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('stream_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) throw error
  return data as any[]
}

export async function endStreamSession(
  supabase: SupabaseClient,
  sessionId: string
) {
  const { error } = await supabase
    .from('stream_sessions')
    .update({ is_active: false })
    .eq('id', sessionId)

  if (error) throw error
}

// Platform Settings
export async function getPlatformSetting(
  supabase: SupabaseClient,
  key: string
) {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('value, value_type')
    .eq('key', key)
    .single()

  if (error) throw error
  return data
}

export async function getPlatformSettings(
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value, value_type')

  if (error) throw error
  
  // Convert to object with proper types
  const settings: Record<string, any> = {}
  data?.forEach((setting: any) => {
    let value: any = setting.value
    if (setting.value_type === 'number') {
      value = parseInt(setting.value, 10)
    } else if (setting.value_type === 'boolean') {
      value = setting.value === 'true'
    } else if (setting.value_type === 'json') {
      value = JSON.parse(setting.value)
    }
    settings[setting.key] = value
  })
  
  return settings
}

export async function updatePlatformSetting(
  supabase: SupabaseClient,
  key: string,
  value: string | number | boolean | object
) {
  let valueStr = String(value)
  let valueType = 'string'
  
  if (typeof value === 'number') {
    valueType = 'number'
    valueStr = String(value)
  } else if (typeof value === 'boolean') {
    valueType = 'boolean'
    valueStr = String(value)
  } else if (typeof value === 'object') {
    valueType = 'json'
    valueStr = JSON.stringify(value)
  }

  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key, value: valueStr, value_type: valueType })
    .select()
    .single()

  if (error) throw error
  return data
}
