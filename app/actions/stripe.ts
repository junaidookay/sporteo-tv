'use server'

import { stripe } from '../../lib/stripe'
import { SUBSCRIPTION_PLANS } from '../../lib/products'

export async function startCheckoutSession(productId: string) {
  const product = SUBSCRIPTION_PLANS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

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
      mode: 'payment',
      redirect_on_completion: 'never',
    })

    return session.client_secret
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw new Error(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
