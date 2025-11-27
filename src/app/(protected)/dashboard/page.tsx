'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { deleteStory, listScheduledStoriesByUser, listStoriesByUser, type Story } from '@/services/storyService'
import { listRecipientDetailsForStory } from '@/services/recipientService'
import Lightbox from '@/components/Lightbox'
import { useSubscription } from '@/context/SubscriptionContext'
import LockedFeatureOverlay from '@/components/LockedFeatureOverlay'

export default function DashboardPage() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [stories, setStories] = useState<Story[]>([])
  const [scheduled, setScheduled] = useState<Story[]>([])
  const [storyRecipients, setStoryRecipients] = useState<Record<string, string[]>>({})
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([listStoriesByUser(userId), listScheduledStoriesByUser(userId)])
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
  }, [userId])

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

  const canCreateStory = !subscription || subscription.storyCount < subscription.limits.stories
  const scheduledLocked = subscription?.plan === 'free'
  const storyUsageLabel = subscription ? `${subscription.storyCount}/${subscription.limits.stories}` : `${stories.length}`
  const videoUsageLabel = subscription ? `${subscription.videoCount}/${subscription.limits.videos}` : '—'
  const storageUsageLabel = subscription ? `${subscription.storageUsedMb}MB / ${subscription.limits.storageMb}MB` : '—'

  return (
    <div className="space-y-6 app-container">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">Dashboard</p>
            <h1 className="text-2xl font-semibold">Your Stories</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/recipients" className="btn btn-secondary">
              Manage Recipients
            </Link>
            <Link href={canCreateStory ? '/story/new' : '/settings/account'} className={`btn btn-primary ${canCreateStory ? '' : 'opacity-60'}`} aria-disabled={!canCreateStory}>
              {canCreateStory ? 'Add New Story' : 'Upgrade to add'}
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Stories</p>
            <p className="text-2xl font-semibold text-brand">{storyUsageLabel}</p>
            {subscription && subscription.plan === 'free' && !canCreateStory && <p className="text-sm text-brand-accent mt-1">Limit reached</p>}
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Video uploads</p>
            <p className="text-2xl font-semibold text-brand">{videoUsageLabel}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Storage</p>
            <p className="text-2xl font-semibold text-brand">{storageUsageLabel}</p>
          </div>
        </div>
        {subscription?.plan === 'free' && (
          <div className="card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-brand-light/30">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">Free plan</p>
                <p className="text-gray-700 mt-1">Free Test Drive lets you upload one video to explore Story Beyond. Upgrade to Individual or Family Legacy when you’re ready to unlock recipients and scheduled deliveries.</p>
            </div>
              <Link href="/settings/account" className="btn btn-primary">
              Upgrade
            </Link>
          </div>
        )}
      </div>
      <div>
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
        <div className="mt-10 relative">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Scheduled</h2>
            {scheduledLocked && <span className="text-sm text-brand">Premium feature</span>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 relative">
            {scheduled.length === 0 && !scheduledLocked && <div className="text-gray-500">No scheduled stories yet.</div>}
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
            {scheduledLocked && <LockedFeatureOverlay message="Scheduling future releases lives in Premium." title="Locked" />}
          </div>
        </div>
        {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
      </div>
    </div>
  )
}

