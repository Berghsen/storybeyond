import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { ensureSubscription, getLimitsForPlan, isVideoUrl, requireSupabaseAdmin } from '@/lib/subscriptionServer'
import type { PlanTier } from '@/lib/subscriptionPlans'
import type { Database } from '@/types/database'

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const admin = requireSupabaseAdmin()
  const body = await request.json().catch(() => ({}))
  const { title, description, image_url, release_at } = body ?? {}

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const subscription = await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
  const row = subscription.data ?? (await ensureSubscription(user.id))
  const plan = (row.plan as PlanTier) ?? 'free'
  const limits = getLimitsForPlan(plan)

  const storyCountQuery = await supabase.from('stories').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  if (storyCountQuery.error) {
    return NextResponse.json({ error: storyCountQuery.error.message }, { status: 500 })
  }
  if ((storyCountQuery.count ?? 0) >= limits.stories) {
    return NextResponse.json({ error: 'Story limit reached for your plan' }, { status: 403 })
  }

  type StoryRow = Database['public']['Tables']['stories']['Row']
  type StoryInsert = Database['public']['Tables']['stories']['Insert']

  if (image_url && isVideoUrl(image_url)) {
    const videoQuery = await supabase.from('stories').select('id,image_url').eq('user_id', user.id)
    const videoData = (videoQuery.data ?? []) as Pick<StoryRow, 'image_url'>[]
    const videoCount = videoData.filter((story) => isVideoUrl(story.image_url)).length
    if (videoCount >= limits.videos) {
      return NextResponse.json({ error: 'Video limit reached for your plan' }, { status: 403 })
    }
  }

  const insertPayload: StoryInsert = {
    title,
    description: description ?? null,
    image_url: image_url ?? null,
    release_at: release_at ?? new Date().toISOString(),
    user_id: user.id,
  }

  const insert = await admin.from('stories').insert(insertPayload).select('*').single()

  if (insert.error) {
    return NextResponse.json({ error: insert.error.message }, { status: 500 })
  }

  return NextResponse.json({ story: insert.data })
}


