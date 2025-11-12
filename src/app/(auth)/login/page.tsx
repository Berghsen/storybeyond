'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('/dashboard')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setRedirectTo(params.get('redirect') ?? '/dashboard')
    }
  }, [])

  useEffect(() => {
    if (user) {
      router.replace(redirectTo)
    }
  }, [user, router, redirectTo])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace(redirectTo || '/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-6 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
              <div className="h-6 w-6 rounded bg-brand" />
            </div>
            <h1 className="text-2xl font-semibold mt-3">Welcome back</h1>
            <p className="text-sm text-gray-600">Sign in to continue to StoryBeyond</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <p className="text-sm text-gray-600 text-center">
              No account?{' '}
              <Link className="text-brand hover:underline" href="/signup">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

