import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { requireSupabaseAdmin } from '@/lib/subscriptionServer'
import type Stripe from 'stripe'
import type { PlanTier } from '@/lib/subscriptionPlans'

async function findUserIdByCustomer(customerId: string) {
  const admin = requireSupabaseAdmin()
  const { data } = await admin.from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).maybeSingle()
  return data?.user_id as string | undefined
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 })
  }

  const body = await request.text()
  const signature = headers().get('stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature || '', secret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const admin = requireSupabaseAdmin()

  await admin
    .from('stripe_webhook_events')
    .upsert(
      {
        event_id: event.id,
        event_type: event.type,
        payload: event as Stripe.Event,
      },
      { onConflict: 'event_id', ignoreDuplicates: true },
    )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      if (userId && subscriptionId && typeof plan === 'string') {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await admin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              plan,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            },
            { onConflict: 'user_id' },
          )
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      let userId = (subscription.metadata?.userId as string | undefined) ?? undefined
      if (!userId && subscription.customer) {
        userId = await findUserIdByCustomer(subscription.customer as string)
      }
      if (userId) {
        const planMeta = (subscription.metadata?.plan as PlanTier | undefined) ?? 'pro'
        const nextPlan: PlanTier = subscription.status === 'canceled' || event.type === 'customer.subscription.deleted' ? 'free' : planMeta
        await admin
          .from('subscriptions')
          .update({
            plan: nextPlan,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_subscription_id: event.type === 'customer.subscription.deleted' ? null : subscription.id,
            stripe_customer_id: subscription.customer as string,
          })
          .eq('user_id', userId)
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}


