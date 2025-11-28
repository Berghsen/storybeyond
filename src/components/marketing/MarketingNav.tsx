'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getMyProfile } from '@/services/profileService'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function MarketingNav() {
  const { user } = useAuth()
  const [firstName, setFirstName] = useState('friend')

  useEffect(() => {
    if (!user) {
      setFirstName('friend')
      return
    }

    // Try to get first name from profile
    getMyProfile()
      .then((profile) => {
        if (profile?.full_name) {
          const nameParts = profile.full_name.trim().split(' ').filter(Boolean)
          if (nameParts.length > 0) {
            setFirstName(nameParts[0])
            return
          }
        }
        // Fallback to user metadata
        const metadataName =
          (user?.user_metadata?.full_name as string | undefined) ||
          (user?.user_metadata?.name as string | undefined) ||
          ''
        const nameParts = metadataName.trim().split(' ').filter(Boolean)
        if (nameParts.length > 0) {
          setFirstName(nameParts[0])
        } else {
          setFirstName('friend')
        }
      })
      .catch(() => {
        // Fallback to user metadata on error
        const metadataName =
          (user?.user_metadata?.full_name as string | undefined) ||
          (user?.user_metadata?.name as string | undefined) ||
          ''
        const nameParts = metadataName.trim().split(' ').filter(Boolean)
        if (nameParts.length > 0) {
          setFirstName(nameParts[0])
        } else {
          setFirstName('friend')
        }
      })
  }, [user])

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="app-container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">SB</span>
          <span>StoryBeyond</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-brand hover:border-brand hover:text-brand-dark"
            >
              Hello, <span className="font-semibold underline-offset-2 hover:underline">{firstName}</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-secondary hidden md:inline-flex">
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
