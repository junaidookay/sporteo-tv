'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { subscriptionId } = await request.json()
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    // Get subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Check if subscription has Stripe ID
    if (!subscription.stripe_subscription_id) {
      // No Stripe ID, just cancel locally
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

      return NextResponse.json({ success: true, message: 'Subscription cancelled locally' })
    }

    // Cancel in Stripe
    let stripeStatus = 'cancelled'
    try {
      const stripeSubscription = await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      stripeStatus = stripeSubscription.status === 'canceled' ? 'cancelled' : 'paused'

      await supabase
        .from('subscriptions')
        .update({
          status: stripeStatus,
          current_period_end: stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
            : null
        })
        .eq('id', subscriptionId)

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled in Stripe',
        status: stripeStatus
      })
    } catch (stripeError: any) {
      // If Stripe says subscription doesn't exist, cancel locally anyway
      if (stripeError.code === 'resource_missing' || stripeError.message?.includes('No such subscription')) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscriptionId)

        return NextResponse.json({
          success: true,
          message: 'Subscription cancelled (already removed from Stripe)'
        })
      }
      throw stripeError
    }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}