'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { HomeIcon, PlusCircleIcon, UsersIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { usePathname, useRouter } from 'next/navigation'
import { getMyProfile } from '@/services/profileService'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

type Props = {
  collapsed?: boolean
  onToggle?: () => void
  onClose?: () => void
}

// Reusable left-hand sidebar similar to ChatGPT/Supabase
export default function Sidebar({ collapsed = false, onToggle, onClose }: Props) {
  const { user, signOut } = useAuth()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const isCollapsed = collapsed
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    getMyProfile().then((p) => {
      if (p) {
        setAvatar(p.avatar_url ?? null)
        setFullName(p.full_name ?? null)
      }
    }).catch(() => {})
  }, [])

  const toggle = () => {
    onToggle?.()
  }

  const Item = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string
    icon: any
    label: string
  }) => {
    const isActive = useMemo(() => {
      if (!pathname) return false
      if (to === '/') {
        return pathname === '/'
      }
      return pathname === to || pathname.startsWith(`${to}/`)
    }, [pathname, to])

    const handleClick = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        onClose?.()
      }
    }

    return (
      <Link href={to} title={isCollapsed ? label : undefined} onClick={handleClick} className="block">
        <span
          className={clsx(
            'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            isActive ? 'bg-white/10 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>{label}</span>}
          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-white/60 rounded-full" />}
        </span>
      </Link>
    )
  }

  return (
    <aside
      className={clsx(
        'bg-gradient-to-b from-brand to-brand-light text-white h-screen',
        'flex flex-col border-r border-white/10',
        'w-64 md:transition-[width] md:duration-200 md:ease-in-out',
        isCollapsed ? 'md:w-16' : 'md:w-64',
        'overflow-y-auto overflow-x-hidden',
      )}
      aria-label="Main sidebar"
    >
      <div className={clsx(
        "h-16 flex items-center flex-shrink-0 relative",
        isCollapsed ? "justify-center px-2" : "justify-between px-3"
      )}>
        {!isCollapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && onClose?.()}>
              <div className="h-8 w-8 rounded-lg bg-white/20" />
              <span className="text-lg font-semibold">StoryBeyond</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Collapse menu"
                onClick={toggle}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                className="md:hidden p-1 text-white hover:bg-white/20 rounded"
                aria-label="Close menu"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center justify-center" onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && onClose?.()}>
              <div className="h-8 w-8 rounded-lg bg-white/20" />
            </Link>
            <button
              className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 items-center justify-center w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Expand menu"
              onClick={toggle}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <button
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white hover:bg-white/20 rounded"
              aria-label="Close menu"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <Link
        href="/profile"
        className="px-3 py-3 flex items-center gap-3 hover:bg-white/10 transition flex-shrink-0" 
        title="Profile"
        onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && onClose?.()}
      >
        <div className="h-9 w-9 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Profile" /> : null}
        </div>
        {!isCollapsed && (
          <div className="text-sm min-w-0">
            <div className="font-medium truncate">{fullName || (user?.email?.split('@')[0] ?? '')}</div>
            <div className="opacity-80 truncate">{user?.email}</div>
          </div>
        )}
      </Link>

      <nav className="px-2 py-2 flex-1 space-y-1 overflow-y-auto min-h-0">
        <Item to="/dashboard" icon={HomeIcon} label="Dashboard" />
        <Item to="/story/new" icon={PlusCircleIcon} label="Add New Story" />
        <Item to="/recipients" icon={UsersIcon} label="Recipients" />
        <Item to="/settings" icon={Cog6ToothIcon} label="Settings" />
      </nav>
      <div className="px-2 py-3 flex-shrink-0">
        <button
          className="w-full group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-white/90 hover:bg-white/10 hover:text-white"
          onClick={async () => {
            await signOut()
            router.push('/login')
          }}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}


