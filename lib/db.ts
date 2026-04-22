import 'server-only'

import { createClient } from '@/lib/supabase/server'

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
  email: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_admin: boolean
  is_streamer: boolean
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_id: string
  event_id: string
  stripe_charge_id: string | null
  amount_cents: number
  status: 'completed' | 'failed' | 'refunded'
  purchase_date: string
  expires_at: string | null
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  plan_type: 'monthly' | 'annual'
  price_cents: number
  status: 'active' | 'paused' | 'cancelled'
  current_period_start: string | null
  current_period_end: string | null
}

export interface StreamAccess {
  id: string
  user_id: string
  event_id: string
  access_type: 'purchased' | 'subscription' | 'admin'
  access_token: string
  expires_at: string | null
}

// Events
export async function getEvents(filters?: {
  status?: string
  event_type?: string
  upcoming?: boolean
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.event_type) {
    query = query.eq('event_type', filters.event_type)
  }

  if (filters?.upcoming) {
    query = query.gte('start_time', new Date().toISOString())
  }

  const { data, error } = await query

  if (error) throw error
  return data as Event[]
}

export async function getEventById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Event | null
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

// Profiles
export async function getProfile(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Profile | null
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

// Purchases
export async function getPurchase(userId: string, eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) throw error
  return data as Purchase | null
}

export async function createPurchase(purchase: Omit<Purchase, 'id'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .insert([purchase])
    .select()
    .single()

  if (error) throw error
  return data as Purchase
}

// Subscriptions
export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data as Subscription | null
}

export async function createSubscription(subscription: Omit<Subscription, 'id'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .insert([subscription])
    .select()
    .single()

  if (error) throw error
  return data as Subscription
}

export async function updateSubscription(id: string, updates: Partial<Subscription>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Subscription
}

// Stream Access
export async function getStreamAccess(userId: string, eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stream_access')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) throw error
  return data as StreamAccess | null
}

export async function createStreamAccess(access: Omit<StreamAccess, 'id'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stream_access')
    .insert([access])
    .select()
    .single()

  if (error) throw error
  return data as StreamAccess
}

// Admin Functions
export async function getAllUsers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

export async function getUserPurchases(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('purchase_date', { ascending: false })

  if (error) throw error
  return data as Purchase[]
}

export async function getAllPurchases() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('purchase_date', { ascending: false })

  if (error) throw error
  return data as Purchase[]
}

export async function getAllSubscriptions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Subscription[]
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}
