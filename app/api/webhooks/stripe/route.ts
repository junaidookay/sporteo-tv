import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Get metadata
        const userId = session.metadata?.user_id
        const eventId = session.metadata?.event_id
        const subscriptionPlanId = session.metadata?.subscription_plan_id

        if (subscriptionPlanId && userId) {
          // Handle subscription purchase
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            plan_type: subscriptionPlanId.includes('annual') ? 'annual' : 'monthly',
            price_cents: (subscription.items.data[0].price.unit_amount || 0),
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
          })
        } else if (eventId && userId && session.payment_intent) {
          // Handle PPV purchase
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
          )

          await supabase.from('purchases').insert({
            user_id: userId,
            event_id: eventId,
            stripe_charge_id: paymentIntent.charges.data[0]?.id,
            amount_cents: (paymentIntent.amount_received || 0),
            status: 'completed',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          })

          // Create stream access
          const accessToken = crypto.randomUUID()
          await supabase.from('stream_access').insert({
            user_id: userId,
            event_id: eventId,
            access_type: 'purchased',
            access_token: accessToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        await supabase
          .from('purchases')
          .update({ status: 'refunded' })
          .eq('stripe_charge_id', charge.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Event processed', { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
}
