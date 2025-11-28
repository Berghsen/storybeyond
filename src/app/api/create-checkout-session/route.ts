// src/pages/api/create-subscription.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { requireSupabaseAdmin, ensureSubscription } from '@/lib/subscriptionServer'
import type { PlanTier } from '@/lib/subscriptionPlans'
import { planPriceIdMap } from '@/lib/serverPricing'
import type { Database } from '@/types/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' })
  }



  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' })
  }

  const body = req.body || {}
  const plan = body.plan as PlanTier | undefined
  const couponCode = body.couponCode as string | undefined

  if (!plan) {
    return res.status(400).json({ error: 'Missing plan' })
  }

  const priceId = planPriceIdMap[plan]
  if (!priceId) {
    return res.status(400).json({
      error: 'Plan is not available for checkout. Missing Stripe price ID.'
    })
  }

  // Ensure subscription row exists
  const subscriptionRow = await ensureSubscription(user.id)
  let stripeCustomerId = subscriptionRow.stripe_customer_id

  // Create Stripe customer if missing
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id },
    })
    stripeCustomerId = customer.id

    await admin
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', user.id)
  }

  // Handle coupon if provided
  let discounts: { coupon: string }[] | undefined
  if (couponCode) {
    const { data: coupon, error: couponError } = await admin
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('active', true)
      .maybeSingle()

    if (couponError) {
      return res.status(400).json({ error: couponError.message })
    }
    if (!coupon?.stripe_coupon_id) {
      return res.status(400).json({ error: 'Invalid voucher code' })
    }
    discounts = [{ coupon: coupon.stripe_coupon_id }]
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const successUrl = `${appUrl}/subscription/success?plan=${plan}`
  const cancelUrl = `${appUrl}/subscription/cancel`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { userId: user.id, plan }
      },
      discounts,
      allow_promotion_codes: true
    })

    if (!session.url) {
      return res.status(500).json({ error: 'Stripe session created but no URL returned' })
    }

    return res.status(200).json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout session creation failed:', err)
    return res.status(500).json({
      error: err?.message ?? 'Failed to create checkout session. Check Stripe configuration.'
    })
  }
}
