'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import ImageUploader from '@/components/ImageUploader'
import LiveMediaCapture from '@/components/LiveMediaCapture'
import { uploadToStorage } from '@/utils/upload'
import { createStory, getStoryById, updateStory } from '@/services/storyService'
import { listRecipients, listRecipientsForStory, setRecipientsForStory, type Recipient } from '@/services/recipientService'
import { useAuth } from '@/context/AuthContext'
import Modal from '@/components/Modal'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  release_at: z.string().optional(),
})

type Props =
  | { mode: 'create'; storyId?: undefined }
  | { mode: 'edit'; storyId: string }

// Reusable form for creating and editing stories
export default function StoryForm(props: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(props.mode === 'edit')
  const [error, setError] = useState<string | null>(null)
  const [uploadingCapture, setUploadingCapture] = useState(false)
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const { user } = useAuth()
  const [addRecipientOpen, setAddRecipientOpen] = useState(false)
  const [newRecName, setNewRecName] = useState('')
  const [newRecEmail, setNewRecEmail] = useState('')
  const [creatingRecipient, setCreatingRecipient] = useState(false)
  const [newRecAvatarFile, setNewRecAvatarFile] = useState<File | null>(null)
  const [newRecFirst, setNewRecFirst] = useState('')
  const [newRecLast, setNewRecLast] = useState('')
  const [newRecRelationship, setNewRecRelationship] = useState('')
  const [newRecPhone, setNewRecPhone] = useState('')
  const [newRecNotes, setNewRecNotes] = useState('')
  const [newRecNotify, setNewRecNotify] = useState(false)
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [releaseAt, setReleaseAt] = useState<string>('')

  useEffect(() => {
    listRecipients().then(setAllRecipients).catch(() => {})
  }, [])

  useEffect(() => {
    if (props.mode !== 'edit') return
    let mounted = true
    getStoryById(props.storyId)
      .then((story) => {
        if (!mounted) return
        setTitle(story.title)
        setDescription(story.description ?? '')
        setImageUrl(story.image_url ?? undefined)
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load story'))
      .finally(() => setInitialLoading(false))
    listRecipientsForStory(props.storyId)
      .then((ids) => setSelectedRecipients(ids))
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [props.mode, props.mode === 'edit' ? props.storyId : null])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const parse = schema.safeParse({ title, description, image_url: imageUrl, release_at: publishImmediately ? undefined : releaseAt })
    if (!parse.success) {
      const msg = parse.error.issues[0]?.message ?? 'Validation error'
      setError(msg)
      return
    }
    setLoading(true)
    try {
      if (props.mode === 'create') {
        const story = await createStory({
          title,
          description,
          image_url: imageUrl,
          release_at: publishImmediately ? new Date().toISOString() : releaseAt || new Date().toISOString(),
        })
        if (selectedRecipients.length > 0 && user) {
          await setRecipientsForStory(story.id, user.id, selectedRecipients, false)
        }
      } else if (props.mode === 'edit') {
        await updateStory(props.storyId, {
          title,
          description,
          image_url: imageUrl,
          release_at: publishImmediately ? new Date().toISOString() : releaseAt || new Date().toISOString(),
        })
        if (user) {
          await setRecipientsForStory(props.storyId, user.id, selectedRecipients, false)
        }
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const onCreateRecipientInline = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreatingRecipient(true)
    try {
      const res = await fetch('/__/recipients-create', { method: 'POST' })
      void res
    } catch {}
    try {
      const { createRecipient } = await import('@/services/recipientService')
      let avatar_url: string | undefined = undefined
      if (newRecAvatarFile) {
        const url = await uploadToStorage({
          bucket: 'avatars',
          directory: 'recipients',
          file: newRecAvatarFile,
          contentType: newRecAvatarFile.type,
        })
        avatar_url = url
      }
      const rec = await createRecipient({
        name: newRecName,
        email: newRecEmail,
        first_name: newRecFirst || undefined,
        last_name: newRecLast || undefined,
        relationship: newRecRelationship || undefined,
        phone: newRecPhone || undefined,
        notes: newRecNotes || undefined,
        ...(avatar_url ? { avatar_url } : {}),
      })
      setAllRecipients((prev) => [rec, ...prev])
      setSelectedRecipients((prev) => Array.from(new Set([rec.id, ...prev])))
      setNewRecName('')
      setNewRecEmail('')
      setNewRecFirst('')
      setNewRecLast('')
      setNewRecRelationship('')
      setNewRecPhone('')
      setNewRecNotes('')
      setNewRecAvatarFile(null)
      setAddRecipientOpen(false)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add recipient')
    } finally {
      setCreatingRecipient(false)
    }
  }

  const handleCaptured = async (blob: Blob, kind: 'photo' | 'video') => {
    setError(null)
    setUploadingCapture(true)
    try {
      const ext = kind === 'photo' ? 'jpg' : 'webm'
      const url = await uploadToStorage({
        bucket: 'story-images',
        directory: 'stories',
        file: blob,
        extension: ext,
        contentType: kind === 'photo' ? 'image/jpeg' : 'video/webm',
      })
      setImageUrl(url)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to upload captured media')
    } finally {
      setUploadingCapture(false)
    }
  }

  if (initialLoading) {
    return <div className="app-container text-gray-500">Loading...</div>
  }

  return (
    <div className="app-container max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{props.mode === 'create' ? 'Add New Story' : 'Edit Story'}</h1>
      <form onSubmit={onSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="A concise story title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Optional context about what happened..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Image (optional)</label>
          <ImageUploader bucket="story-images" initialUrl={imageUrl ?? null} onUploaded={(url) => setImageUrl(url)} />
          <div className="my-4" />
          <LiveMediaCapture onCaptured={handleCaptured} />
          {uploadingCapture && <p className="mt-2 text-sm text-gray-500">Uploading captured media...</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              id="publish-immediately"
              type="checkbox"
              className="rounded border-gray-300"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
            />
            <label htmlFor="publish-immediately" className="text-sm text-gray-700">
              Publish on death trigger
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Release date & time</label>
            <input type="datetime-local" className="input" value={releaseAt} onChange={(e) => setReleaseAt(e.target.value)} disabled={publishImmediately} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Recipients (optional)</label>
          <div className="card p-3 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" className="btn btn-secondary" onClick={() => setAddRecipientOpen(true)}>
                + Add Recipient
              </button>
              {allRecipients.map((r) => (
                <label key={r.id} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedRecipients.includes(r.id)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setSelectedRecipients((prev) => (checked ? Array.from(new Set([...prev, r.id])) : prev.filter((id) => id !== r.id)))
                    }}
                  />
                  <span>
                    {r.name} ({r.email})
                  </span>
                </label>
              ))}
              {allRecipients.length === 0 && <p className="text-sm text-gray-500">No recipients yet. Add some under Recipients.</p>}
            </div>
          </div>
        </div>
        <Modal
          open={addRecipientOpen}
          title="Add Recipient"
          onClose={() => setAddRecipientOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setAddRecipientOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={(e) => onCreateRecipientInline(e as any)} disabled={creatingRecipient}>
                {creatingRecipient ? 'Adding...' : 'Add'}
              </button>
            </>
          }
        >
          <form onSubmit={onCreateRecipientInline} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                required
                value={newRecName}
                onChange={(e) => setNewRecName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                required
                value={newRecEmail}
                onChange={(e) => setNewRecEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First name</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                  value={newRecFirst}
                  onChange={(e) => setNewRecFirst(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                  value={newRecLast}
                  onChange={(e) => setNewRecLast(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Relationship</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Friend, Partner, Sibling..."
                  value={newRecRelationship}
                  onChange={(e) => setNewRecRelationship(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                  value={newRecPhone}
                  onChange={(e) => setNewRecPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                value={newRecNotes}
                onChange={(e) => setNewRecNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile picture (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setNewRecAvatarFile(e.target.files?.[0] ?? null)} className="text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="notify-new-recipient"
                type="checkbox"
                className="rounded border-gray-300"
                checked={newRecNotify}
                onChange={(e) => setNewRecNotify(e.target.checked)}
              />
              <label htmlFor="notify-new-recipient" className="text-sm text-gray-700">
                Notify recipient they were added
              </label>
            </div>
          </form>
        </Modal>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/dashboard')} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

