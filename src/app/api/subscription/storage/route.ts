import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { ensureSubscription, getLimitsForPlan } from '@/lib/subscriptionServer'
import type { PlanTier } from '@/lib/subscriptionPlans'

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json().catch(() => ({}))
  const bytes = Number(payload?.bytes ?? 0)
  const checkOnly = Boolean(payload?.checkOnly)
  if (!bytes || Number.isNaN(bytes)) {
    return NextResponse.json({ error: 'bytes is required' }, { status: 400 })
  }
  const mb = Math.ceil(bytes / (1024 * 1024))

  const subscription = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const row = subscription.data ?? (await ensureSubscription(user.id))
  const plan = (row.plan as PlanTier) ?? 'free'
  const limits = getLimitsForPlan(plan)
  const used = row.storage_used_mb ?? 0

  if (used + mb > limits.storageMb) {
    return NextResponse.json({ error: 'Storage limit reached' }, { status: 403 })
  }

  if (!checkOnly) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ storage_used_mb: used + mb })
      .eq('user_id', user.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}


