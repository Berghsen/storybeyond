import { supabase } from '../lib/supabaseClient'

export type Recipient = {
  id: string
  user_id: string
  name: string
  email: string
  first_name?: string | null
  last_name?: string | null
  relationship?: string | null
  phone?: string | null
  notes?: string | null
  avatar_url?: string | null
  created_at: string
}

export async function listRecipients() {
  const { data, error } = await supabase.from('recipients').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Recipient[]
}

export async function createRecipient(input: {
  name: string
  email: string
  first_name?: string
  last_name?: string
  relationship?: string
  phone?: string
  notes?: string
}) {
  // Include user_id explicitly to satisfy RLS if default is not yet set
  const { data: userRes } = await supabase.auth.getUser()
  const userId = userRes.user?.id
  const payload = userId ? { ...input, user_id: userId } : input
  const { data, error } = await supabase.from('recipients').insert(payload).select().single()
  if (error) throw error
  return data as Recipient
}

export async function deleteRecipient(id: string) {
  const { error } = await supabase.from('recipients').delete().eq('id', id)
  if (error) throw error
}

export async function updateRecipient(id: string, input: Partial<Recipient>) {
  const payload: any = { ...input }
  delete payload.id
  delete payload.user_id
  delete payload.created_at
  const { data, error } = await supabase.from('recipients').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as Recipient
}

export async function listRecipientsForStory(storyId: string) {
  const { data, error } = await supabase
    .from('story_recipients')
    .select('recipient_id, notify')
    .eq('story_id', storyId)
  if (error) throw error
  return (data ?? []).map((r: any) => r.recipient_id as string)
}

export async function listRecipientDetailsForStory(storyId: string) {
  const { data, error } = await supabase
    .from('story_recipients')
    .select('recipient_id, recipients(name, email)')
    .eq('story_id', storyId)
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.recipient_id as string,
    name: r.recipients?.name as string | undefined,
    email: r.recipients?.email as string | undefined,
  }))
}

export async function setRecipientsForStory(
  storyId: string,
  userId: string,
  recipientIds: string[],
  notify: boolean,
) {
  // Remove all current links then insert new ones (simple approach)
  const { error: delErr } = await supabase.from('story_recipients').delete().eq('story_id', storyId)
  if (delErr) throw delErr
  if (recipientIds.length === 0) return
  const rows = recipientIds.map((rid) => ({
    story_id: storyId,
    recipient_id: rid,
    user_id: userId,
    notify,
  }))
  const { error: insErr } = await supabase.from('story_recipients').insert(rows)
  if (insErr) throw insErr
}


