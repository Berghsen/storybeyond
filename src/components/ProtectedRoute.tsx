'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Gate component that restricts access to authenticated users
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && !user) {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      if (pathname) {
        params.set('redirect', pathname)
      }
      router.replace(`/login${params.toString() ? `?${params.toString()}` : ''}`)
    }
  }, [loading, user, router, pathname, searchParams])

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
