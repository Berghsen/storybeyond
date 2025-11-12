import { supabase } from '../lib/supabaseClient'

export type Profile = {
  user_id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  updated_at: string
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: sessionRes } = await supabase.auth.getUser()
  const uid = sessionRes.user?.id
  if (!uid) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', uid).maybeSingle()
  if (error) throw error
  return (data as Profile) ?? null
}

export async function upsertMyProfile(input: {
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
}) {
  const { data: sessionRes } = await supabase.auth.getUser()
  const uid = sessionRes.user?.id
  if (!uid) throw new Error('Not authenticated')
  const payload = { user_id: uid, ...input, updated_at: new Date().toISOString() }
  const { data, error } = await supabase.from('profiles').upsert(payload).select().single()
  if (error) throw error
  return data as Profile
}


