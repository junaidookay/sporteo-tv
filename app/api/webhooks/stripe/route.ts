import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        const userId = session.metadata?.user_id
        const eventId = session.metadata?.event_id
        const subscriptionPlanId = session.metadata?.subscription_plan_id

        if (!userId) {
          console.error('Missing user_id in checkout session metadata')
          break
        }

        if (session.mode === 'subscription' && session.subscription) {
          console.log('Processing subscription purchase for user:', userId)
          
          const subscriptionData = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const planType = subscriptionPlanId?.includes('annual') ? 'annual' : 'monthly'

          const { error: subError } = await supabase.from('subscriptions').insert({
            user_id: userId,
            stripe_subscription_id: subscriptionData.id,
            subscription_type: planType,
            status: 'active',
            start_date: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            end_date: new Date(subscriptionData.current_period_end * 1000).toISOString(),
          })
          
          if (subError) {
            console.error('Error inserting subscription:', subError)
          } else {
            console.log('Subscription recorded successfully')
          }
        } else if (session.mode === 'payment' && eventId && session.payment_intent) {
          console.log('Processing PPV purchase for user:', userId, 'event:', eventId)
          
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string,
            { expand: ['latest_charge'] }
          )

          const chargeId = (paymentIntent as any).latest_charge?.id || null

          const { error: purchaseError } = await supabase.from('purchases').insert({
            user_id: userId,
            event_id: eventId,
            stripe_charge_id: chargeId,
            amount_paid_cents: paymentIntent.amount_received || paymentIntent.amount,
            purchase_date: new Date().toISOString(),
            status: 'completed',
          })

          if (purchaseError) {
            console.error('Error inserting purchase:', purchaseError)
          } else {
            console.log('Purchase recorded successfully')
          }

          const accessToken = crypto.randomUUID()
          const { error: accessError } = await supabase.from('stream_access').insert({
            user_id: userId,
            event_id: eventId,
            access_type: 'purchased',
            access_token: accessToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          
          if (accessError) {
            console.error('Error creating stream access:', accessError)
          } else {
            console.log('Stream access created successfully')
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 'cancelled',
            end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        
        if (updateError) {
          console.error('Error updating subscription:', updateError)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error: deleteError } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)
        
        if (deleteError) {
          console.error('Error cancelling subscription:', deleteError)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        const { error: refundError } = await supabase
          .from('purchases')
          .update({ status: 'refunded' })
          .eq('stripe_charge_id', charge.id)
        
        if (refundError) {
          console.error('Error processing refund:', refundError)
        }
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
