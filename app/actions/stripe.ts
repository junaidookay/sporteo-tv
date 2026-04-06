'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/products'

export async function startCheckoutSession(productId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('You must be logged in to make a purchase')
  }

  let product = SUBSCRIPTION_PLANS.find((p) => p.id === productId)
  let eventId: string | null = null

  if (!product) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('id, title, ticket_price_cents')
      .eq('id', productId)
      .single()
    
    if (error || !event) {
      throw new Error(`Product with id "${productId}" not found`)
    }
    
    eventId = event.id
    product = {
      id: event.id,
      name: event.title,
      description: `Purchase access to ${event.title}`,
      priceInCents: event.ticket_price_cents || 0,
    }
  }

  const isSubscription = productId.startsWith('sub_')

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: isSubscription ? 'subscription' : 'payment',
    metadata: {
      user_id: user.id,
      event_id: eventId || '',
      subscription_plan_id: isSubscription ? productId : '',
    },
  })

  return session.client_secret
}
