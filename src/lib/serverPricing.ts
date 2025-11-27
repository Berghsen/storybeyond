import type { PlanTier } from './subscriptionPlans'

export const planPriceIdMap: Record<PlanTier, string | undefined> = {
  free: undefined,
  premium: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
}


