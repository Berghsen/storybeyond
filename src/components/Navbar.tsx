'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Top navigation bar with auth-aware actions
export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="border-b bg-gradient-to-r from-brand to-brand-light text-white">
      <div className="app-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm" />
          <span className="text-lg font-semibold">StoryBeyond</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className={`text-sm hover:underline ${pathname === '/dashboard' ? 'underline' : ''}`}>
                Dashboard
              </Link>
              <Link href="/recipients" className={`text-sm hover:underline ${pathname?.startsWith('/recipients') ? 'underline' : ''}`}>
                Recipients
              </Link>
              <Link href="/story/new" className={`text-sm hover:underline ${pathname === '/story/new' ? 'underline' : ''}`}>
                New Story
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20">Login</Link>
              <Link href="/signup" className="btn btn-primary bg-white text-brand hover:bg-gray-100">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}


