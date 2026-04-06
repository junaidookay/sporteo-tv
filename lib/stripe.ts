import Stripe from 'stripe'
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getStripeSettings } from '@/lib/settings'

export async function getStripeClient() {
  const supabase = await createClient()
  const { secretKey } = await getStripeSettings(supabase)

  if (!secretKey) {
    throw new Error('Stripe secret key not configured. Please add it in Admin Dashboard > Settings.')
  }

  return new Stripe(secretKey)
}
