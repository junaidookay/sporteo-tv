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
  purchase_date: string
  amount_paid_cents: number
  stripe_charge_id: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  subscription_type: 'monthly' | 'annual'
  stripe_subscription_id: string | null
  status: 'active' | 'inactive' | 'cancelled'
  start_date: string
  end_date: string | null
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
    .order('purchase_date', { ascending: false })

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
