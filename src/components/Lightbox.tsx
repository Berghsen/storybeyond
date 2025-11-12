'use client'

import { useEffect } from 'react'

type Props = {
  url: string
  title?: string
  onClose: () => void
}

// Simple lightbox to view images or videos
export default function Lightbox({ url, title, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isVideo = url.toLowerCase().endsWith('.webm') || url.toLowerCase().includes('video')

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative max-w-5xl w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 btn btn-danger"
          aria-label="Close"
        >
          Close
        </button>
        <div className="bg-black rounded-lg overflow-hidden">
          {isVideo ? (
            <video src={url} className="w-full h-[70vh] object-contain" controls autoPlay />
          ) : (
            <img src={url} alt={title ?? 'Media'} className="w-full h-[70vh] object-contain" />
          )}
        </div>
        {title && <div className="text-center text-white mt-3">{title}</div>}
      </div>
    </div>
  )
}


