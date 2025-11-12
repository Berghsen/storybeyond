'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { getMyProfile } from '@/services/profileService'
import Sidebar from '@/components/Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    getMyProfile().then((p) => {
      if (p) {
        setUsername(p.full_name || user?.email?.split('@')[0] || 'User')
      } else {
        setUsername(user?.email?.split('@')[0] || 'User')
      }
    }).catch(() => {
      setUsername(user?.email?.split('@')[0] || 'User')
    })
  }, [user])

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed md:fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className={`flex flex-col min-h-screen flex-1 md:transition-[margin-left] md:duration-200 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <header className="border-b bg-white h-16 flex items-center sticky top-0 z-30">
          <div className="app-container flex-1 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="text-sm text-gray-600 ml-2 md:ml-0">
              Welcome {username ?? 'User'}
            </div>
          </div>
        </header>
        <main className="flex-1 py-8">
          <div className="app-container">{children}</div>
        </main>
        <footer className="border-t bg-white">
          <div className="app-container py-4 text-sm text-gray-600 flex items-center justify-between">
            <span>© {new Date().getFullYear()} StoryBeyond</span>
            <span>Crafted with ❤️</span>
          </div>
        </footer>
      </div>
    </div>
  )
}


