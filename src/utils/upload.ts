import { supabase } from '@/lib/supabaseClient'

// Uploads a Blob or File to Supabase Storage and returns the public URL
export async function uploadToStorage(params: {
  bucket: string
  directory?: string
  file: Blob | File
  extension?: string
  contentType?: string
}): Promise<string> {
  const dir = params.directory ?? 'stories'
  const guessedExtFromType = (() => {
    const type = (params.file as any)?.type as string | undefined
    if (!type) return undefined
    if (type === 'image/jpeg') return 'jpg'
    if (type === 'image/png') return 'png'
    if (type === 'image/webp') return 'webp'
    if (type === 'video/webm') return 'webm'
    if (type === 'video/mp4') return 'mp4'
    return undefined
  })()
  const ext =
    params.extension ??
    guessedExtFromType ??
    ((params.file as any) instanceof File
      ? params.file.name.split('.').pop() ?? 'bin'
      : 'bin')
  const filename = `${crypto.randomUUID()}.${ext}`
  const path = `${dir}/${filename}`

  const { error } = await supabase.storage.from(params.bucket).upload(path, params.file, {
    cacheControl: '3600',
    upsert: false,
    contentType: params.contentType,
  })
  if (error) throw error
  const { data } = supabase.storage.from(params.bucket).getPublicUrl(path)
  return data.publicUrl
}


