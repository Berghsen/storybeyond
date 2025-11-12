'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  bucket: string
  initialUrl?: string | null
  onUploaded: (publicUrl: string) => void
}

// Uploads an image to Supabase Storage and returns a public URL
export default function ImageUploader({ bucket, initialUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `stories/${fileName}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      const publicUrl = data.publicUrl
      setPreviewUrl(publicUrl)
      onUploaded(publicUrl)
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelect}
          className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
          disabled={uploading}
        />
        {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {previewUrl && (
        previewUrl.toLowerCase().endsWith('.webm') ? (
          <video src={previewUrl} className="mt-3 h-40 w-72 rounded object-cover border" controls />
        ) : (
          <img src={previewUrl} alt="Preview" className="mt-3 h-40 w-72 rounded object-cover border" />
        )
      )}
    </div>
  )
}


