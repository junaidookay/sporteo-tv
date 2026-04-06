'use server'

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/products'

export async function startCheckoutSession(productId: string) {
  throw new Error('This function has been deprecated. Use startCheckoutSessionWithUser instead.')
}

export async function startCheckoutSessionWithUser(productId: string, userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  let product = SUBSCRIPTION_PLANS.find((p) => p.id === productId)
  let eventId: string | null = null

  if (!product) {
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

  let secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    const { data: settingsData, error } = await supabaseAdmin
      .from('platform_settings')
      .select('key, value')

    if (!error && settingsData) {
      const settings: Record<string, string> = {}
      for (const row of settingsData) {
        settings[row.key] = row.value
      }
      const mode = settings.stripe_mode || 'test'
      secretKey = mode === 'live' ? settings.stripe_live_secret_key : settings.stripe_test_secret_key
    }
  }

  if (!secretKey) {
    throw new Error('Stripe secret key is not configured. Please add it in Admin Dashboard > Settings.')
  }

  const stripe = new Stripe(secretKey)

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
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
      redirect_on_completion: 'never',
      metadata: {
        user_id: userId,
        event_id: eventId || '',
        subscription_plan_id: isSubscription ? productId : '',
      },
    })

    return session.client_secret
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw new Error(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}