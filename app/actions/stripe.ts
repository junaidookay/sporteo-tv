'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/products'

export async function startCheckoutSession(productId: string) {
  console.log('Starting checkout for product:', productId)
  
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth result:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      throw new Error('You must be logged in to make a purchase')
    }

    let product = SUBSCRIPTION_PLANS.find((p) => p.id === productId)
    console.log('Product found in plans:', !!product)
    
    let eventId: string | null = null

    if (!product) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      console.log('Fetching event from database:', productId)
      const { data: event, error } = await supabaseAdmin
        .from('events')
        .select('id, title, ticket_price_cents')
        .eq('id', productId)
        .single()
      
      console.log('Event fetch result:', { event, error })
      
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
    console.log('Creating Stripe session:', { isSubscription, mode: isSubscription ? 'subscription' : 'payment' })

    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.priceInCents,
      },
      quantity: 1,
    }]

    if (isSubscription) {
      const billingPeriod = productId === 'sub_annual' ? 'year' : 'month'
      ;(lineItems[0].price_data as any).recurring = {
        interval: billingPeriod,
      }
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      line_items: lineItems,
      mode: isSubscription ? 'subscription' : 'payment',
      metadata: {
        user_id: user.id,
        event_id: eventId || '',
        subscription_plan_id: isSubscription ? productId : '',
      },
    })

    console.log('Stripe session created:', session.id)
    return session.client_secret
  } catch (error) {
    console.error('Checkout error:', error)
    throw error
  }
}
