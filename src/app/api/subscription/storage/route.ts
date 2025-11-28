import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { ensureSubscription, getLimitsForPlan, requireSupabaseAdmin } from '@/lib/subscriptionServer'
import type { PlanTier } from '@/lib/subscriptionPlans'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request payload
  const payload = await request.json().catch(() => ({}))
  const bytes = Number(payload?.bytes ?? 0)
  const checkOnly = Boolean(payload?.checkOnly)

  if (!bytes || Number.isNaN(bytes)) {
    return NextResponse.json({ error: 'bytes is required' }, { status: 400 })
  }

  const mb = Math.ceil(bytes / (1024 * 1024))

  // Fetch subscription
  const subscription = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Ensure subscription exists
  const row = subscription.data ?? (await ensureSubscription(user.id))
  const typedRow = row as Database['public']['Tables']['subscriptions']['Row']

  // Plan and limits
  const plan = (typedRow.plan as PlanTier) ?? 'free'
  const limits = getLimitsForPlan(plan)
  const used = typedRow.storage_used_mb ?? 0

  if (used + mb > limits.storageMb) {
    return NextResponse.json({ error: 'Storage limit reached' }, { status: 403 })
  }

  // Update storage usage using admin client to avoid typing issues
  if (!checkOnly) {
    const admin = requireSupabaseAdmin()
    const { error } = await admin
      .from('subscriptions')
      .update({ storage_used_mb: used + mb })
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
