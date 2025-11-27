'use client'

import Link from 'next/link'
import { useState } from 'react'
import clsx from 'clsx'

type Props = {
  title?: string
  message?: string
  className?: string
  inline?: boolean
  ctaLabel?: string
  onUpgradeClick?: () => void
}

export default function LockedFeatureOverlay({ title = 'Premium feature', message = 'Upgrade your plan to unlock this space.', className, inline, ctaLabel = 'Upgrade', onUpgradeClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const content = (
    <div
      className={clsx(
        'relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/40 bg-brand/80 text-white text-center p-6',
        inline ? 'min-h-[200px]' : 'absolute inset-0',
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-white/70">{title}</p>
        <p className="text-lg font-semibold">{message}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onUpgradeClick}
          className="btn btn-primary bg-white text-brand hover:bg-gray-100"
          type="button"
        >
          {ctaLabel}
        </button>
        <Link href="/settings/account" className="text-sm underline text-white/80 hover:text-white">
          View plans
        </Link>
      </div>
      {!inline && (
        <div className={clsx('absolute inset-0 rounded-2xl backdrop-blur-sm transition-opacity', hovered ? 'bg-black/0' : 'bg-black/10')} aria-hidden />
      )}
    </div>
  )
  if (inline) {
    return content
  }
  return (
    <div className={clsx('absolute inset-0 z-20 flex items-center justify-center px-6')}>
      {content}
    </div>
  )
}


