'use server'

import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/products'

export async function startCheckoutSession(productId: string) {
  const supabase = createClient()

  let product = SUBSCRIPTION_PLANS.find((p) => p.id === productId)

  if (!product) {
    const { data: event, error } = await supabase
      .from('events')
      .select('id, title, ticket_price_cents')
      .eq('id', productId)
      .single()

    if (error || !event) {
      throw new Error(`Product with id "${productId}" not found`)
    }

    product = {
      id: event.id,
      name: event.title,
      description: `Purchase access to ${event.title}`,
      priceInCents: event.ticket_price_cents || 0,
    }
  }

  try {
    const stripe = await getStripeClient()
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
      mode: 'payment',
      redirect_on_completion: 'never',
    })

    return session.client_secret
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw new Error(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}