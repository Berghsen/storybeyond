import { supabase } from '@/lib/supabaseClient'

// Uploads a Blob or File to Supabase Storage and returns the public URL
type UploadParams = {
  bucket: string
  directory?: string
  file: Blob | File
  extension?: string
  contentType?: string
  countTowardsQuota?: boolean
}

async function ensureStorageAllowance(bytes: number, checkOnly: boolean) {
  if (typeof fetch === 'undefined') return
  await fetch('/api/subscription/storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bytes, checkOnly }),
  }).then(async (res) => {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? 'Storage limit reached')
    }
  })
}

export async function uploadToStorage(params: UploadParams): Promise<string> {
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
  const fileName = typeof (params.file as File).name === 'string' ? (params.file as File).name : undefined
  const ext =
    params.extension ??
    guessedExtFromType ??
    (fileName ? fileName.split('.').pop() ?? 'bin' : 'bin')
  const filename = `${crypto.randomUUID()}.${ext}`
  const path = `${dir}/${filename}`

  const fileSizeBytes = (params.file as File).size ?? (params.file as Blob).size ?? 0
  const shouldTrack = params.countTowardsQuota !== false && fileSizeBytes > 0

  if (shouldTrack) {
    await ensureStorageAllowance(fileSizeBytes, true)
  }

  const { error } = await supabase.storage.from(params.bucket).upload(path, params.file, {
    cacheControl: '3600',
    upsert: false,
    contentType: params.contentType,
  })
  if (error) throw error
  const { data } = supabase.storage.from(params.bucket).getPublicUrl(path)
  if (shouldTrack) {
    await ensureStorageAllowance(fileSizeBytes, false)
  }
  return data.publicUrl
}


