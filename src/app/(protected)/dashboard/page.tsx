'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { deleteStory, listScheduledStoriesByUser, listStoriesByUser, type Story } from '@/services/storyService'
import { listRecipientDetailsForStory } from '@/services/recipientService'
import Lightbox from '@/components/Lightbox'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [scheduled, setScheduled] = useState<Story[]>([])
  const [storyRecipients, setStoryRecipients] = useState<Record<string, string[]>>({})
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([listStoriesByUser(user.id), listScheduledStoriesByUser(user.id)])
      .then(([published, future]) => {
        if (!active) return
        setStories(published)
        setScheduled(future)
        Promise.all(
          published.map(async (story) => {
            const details = await listRecipientDetailsForStory(story.id)
            return [story.id, details.map((d) => d.name || d.email || 'Recipient')] as const
          }),
        )
          .then((pairs) => {
            if (!active) return
            const map: Record<string, string[]> = {}
            for (const [id, names] of pairs) map[id] = names
            setStoryRecipients(map)
          })
          .catch(() => {})
      })
      .catch((err: any) => setError(err?.message ?? 'Failed to load stories'))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?.id])

  const onDelete = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this story?')) return
    setDeletingId(id)
    try {
      await deleteStory(id)
      setStories((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        window.alert(err?.message ?? 'Delete failed')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="app-container">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your Stories</h1>
          <div className="flex gap-2">
            <Link href="/recipients" className="btn btn-secondary">
              Manage Recipients
            </Link>
            <Link href="/story/new" className="btn btn-primary">
              Add New Story
            </Link>
          </div>
        </div>
      </div>
      <div className="app-container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && stories.length === 0 && <div className="text-gray-600">No stories yet. Create your first one!</div>}
          {stories.map((story) => (
            <div key={story.id} className="card overflow-hidden hover:shadow-md transition">
              {story.image_url ? (
                story.image_url.toLowerCase().endsWith('.webm') || story.image_url.toLowerCase().includes('video') ? (
                  <button className="block w-full" onClick={() => setLightboxUrl(story.image_url!)} type="button">
                    <div className="aspect-video w-full bg-black/5">
                      <video src={story.image_url} className="w-full h-full object-cover" muted />
                    </div>
                  </button>
                ) : (
                  <button className="block w-full" onClick={() => setLightboxUrl(story.image_url!)} type="button">
                    <div className="aspect-video w-full bg-black/5">
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                    </div>
                  </button>
                )
              ) : (
                <div className="aspect-video w-full bg-gray-100" />
              )}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-1">{story.title}</h3>
                {story.description && <p className="text-sm text-gray-600 line-clamp-2">{story.description}</p>}
                {storyRecipients[story.id]?.length ? (
                  <p className="text-xs text-gray-500">Recipients: {storyRecipients[story.id].join(', ')}</p>
                ) : null}
                <p className="text-xs text-gray-500">{format(new Date(story.created_at), 'PP p')}</p>
                <div className="pt-2 flex items-center gap-2">
                  <Link href={`/story/${story.id}/edit`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button className="btn btn-danger" onClick={() => onDelete(story.id)} disabled={deletingId === story.id}>
                    {deletingId === story.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {scheduled.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-3">Scheduled</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scheduled.map((story) => (
                <div key={story.id} className="card overflow-hidden hover:shadow-md transition">
                  {story.image_url ? (
                    story.image_url.toLowerCase().endsWith('.webm') || story.image_url.toLowerCase().includes('video') ? (
                      <div className="aspect-video w-full bg-black/5">
                        <video src={story.image_url} className="w-full h-full object-cover" muted />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-black/5">
                        <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                      </div>
                    )
                  ) : (
                    <div className="aspect-video w-full bg-gray-100" />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold line-clamp-1">{story.title}</h3>
                      <span className="text-xs text-brand-accent bg-emerald-50 px-2 py-1 rounded">
                        Releases {format(new Date(story.release_at), 'PP p')}
                      </span>
                    </div>
                    {story.description && <p className="text-sm text-gray-600 line-clamp-2">{story.description}</p>}
                    <div className="pt-2 flex items-center gap-2">
                      <Link href={`/story/${story.id}/edit`} className="btn btn-secondary">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
      </div>
    </div>
  )
}

