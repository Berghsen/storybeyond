import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { stripe } from '@/lib/stripe'
import { ensureSubscription, requireSupabaseAdmin } from '@/lib/subscriptionServer'
import type { PlanTier } from '@/lib/subscriptionPlans'
import { planPriceIdMap } from '@/lib/serverPricing'

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  const supabase = createSupabaseServerClient()
  const admin = requireSupabaseAdmin()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const plan = body?.plan as PlanTier | undefined
  const couponCode = body?.couponCode as string | undefined
  if (!plan) {
    return NextResponse.json({ error: 'Missing plan' }, { status: 400 })
  }
  const priceId = planPriceIdMap[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Plan is not available for checkout' }, { status: 400 })
  }

  const subscriptionRow = await ensureSubscription(user.id)
  let stripeCustomerId = subscriptionRow.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    })
    stripeCustomerId = customer.id
    await admin.from('subscriptions').update({ stripe_customer_id: customer.id }).eq('user_id', user.id)
  }

  let discounts: { coupon: string }[] | undefined
  if (couponCode) {
    const { data, error } = await admin
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('active', true)
      .maybeSingle()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (data?.stripe_coupon_id) {
      discounts = [{ coupon: data.stripe_coupon_id }]
    } else {
      return NextResponse.json({ error: 'Invalid voucher code' }, { status: 400 })
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const successUrl = `${appUrl}/subscription/success?plan=${plan}`
  const cancelUrl = `${appUrl}/subscription/cancel`

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      plan,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        plan,
      },
    },
    allow_promotion_codes: true,
    discounts,
  })

  return NextResponse.json({ url: session.url })
}


