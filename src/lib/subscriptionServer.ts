import { supabaseAdmin } from './supabaseAdmin'
import { LIMITS, PlanTier } from './subscriptionPlans'

export type SubscriptionRow = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: PlanTier
  status: string
  current_period_end: string | null
  storage_used_mb: number | null
  metadata: Record<string, any> | null
}

export function requireSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured')
  }
  return supabaseAdmin
}

export async function ensureSubscription(userId: string, defaults?: Partial<SubscriptionRow>) {
  const admin = requireSupabaseAdmin()
  const { data, error } = await admin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan: 'free',
        status: 'inactive',
        ...defaults,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()
  if (error) throw error
  return data as SubscriptionRow
}

export async function getSubscriptionByUser(userId: string) {
  const admin = requireSupabaseAdmin()
  const { data, error } = await admin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return (data as SubscriptionRow | null) ?? null
}

export function getLimitsForPlan(plan: PlanTier) {
  return LIMITS[plan]
}

export function isVideoUrl(url: string | null | undefined) {
  if (!url) return false
  return url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('/video')
}


