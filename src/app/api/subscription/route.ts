import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getLimitsForPlan, ensureSubscription, isVideoUrl } from '@/lib/subscriptionServer'
import type { PlanTier } from '@/lib/subscriptionPlans'
import type { Database } from '@/types/database'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subscription.error && subscription.error.code !== 'PGRST116') {
    return NextResponse.json({ error: subscription.error.message }, { status: 500 })
  }

  const subscriptionRow = subscription.data ?? (await ensureSubscription(user.id))

  const plan = (subscriptionRow.plan as PlanTier) ?? 'free'
  const limits = getLimitsForPlan(plan)

  const storiesCountQuery = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if (storiesCountQuery.error) {
    return NextResponse.json({ error: storiesCountQuery.error.message }, { status: 500 })
  }

  type StoryRow = Database['public']['Tables']['stories']['Row']
  const videoQuery = await supabase.from('stories').select('id,image_url').eq('user_id', user.id)
  const videoData = (videoQuery.data ?? []) as Pick<StoryRow, 'image_url'>[]
  const videoCount = videoData.filter((story) => isVideoUrl(story.image_url)).length

  return NextResponse.json({
    plan,
    status: subscriptionRow.status ?? 'inactive',
    storyCount: storiesCountQuery.count ?? 0,
    videoCount,
    storageUsedMb: subscriptionRow.storage_used_mb ?? 0,
    limits,
    currentPeriodEnd: subscriptionRow.current_period_end,
  })
}


