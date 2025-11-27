import type { PlanTier } from './subscriptionPlans'

export const planPriceIdMap: Record<PlanTier, string | undefined> = {
  free: undefined,
  pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
}


