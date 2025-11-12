import { supabase } from '../lib/supabaseClient'

export type Story = {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  created_at: string
  release_at: string
}

export async function listStoriesByUser(userId: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .lte('release_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Story[]
}

export async function listScheduledStoriesByUser(userId: string) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .gt('release_at', new Date().toISOString())
    .order('release_at', { ascending: true })
  if (error) throw error
  return data as Story[]
}

export async function getStoryById(id: string) {
  const { data, error } = await supabase.from('stories').select('*').eq('id', id).single()
  if (error) throw error
  return data as Story
}

export async function createStory(input: {
  title: string
  description?: string
  image_url?: string | null
  release_at?: string
}) {
  const { data, error } = await supabase
    .from('stories')
    .insert({
      title: input.title,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      release_at: input.release_at ?? new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as Story
}

export async function updateStory(id: string, input: {
  title?: string
  description?: string | null
  image_url?: string | null
  release_at?: string | null
}) {
  const { data, error } = await supabase
    .from('stories')
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.image_url !== undefined ? { image_url: input.image_url } : {}),
      ...(input.release_at !== undefined ? { release_at: input.release_at } : {}),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Story
}

export async function deleteStory(id: string) {
  const { error } = await supabase.from('stories').delete().eq('id', id)
  if (error) throw error
}


