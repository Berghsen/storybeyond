'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Gate component that restricts access to authenticated users
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    if (!loading && !user) {
      let paramsString = ''
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        if (pathname) {
          params.set('redirect', pathname)
        }
        paramsString = params.toString()
      }
      router.replace(`/login${paramsString ? `?${paramsString}` : ''}`)
    }
  }, [loading, user, router, pathname])

  if (loading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="app-container">
        <div className="py-20 text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
