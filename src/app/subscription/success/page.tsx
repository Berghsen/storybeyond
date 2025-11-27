"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { useSubscription } from '@/context/SubscriptionContext'

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { refresh } = useSubscription()

  useEffect(() => {
    refresh().catch(() => {})
    const sessionId = params?.get('session_id')
    if (!sessionId) return
  }, [params, refresh])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-br from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-6 py-20 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Subscription updated</p>
            <h1 className="text-4xl font-semibold">Welcome to your upgraded Story Beyond space.</h1>
            <p className="text-white/80 max-w-3xl mx-auto">
              Your payment is complete and premium features are unlocking. Head back to your dashboard to start uploading more memories right away.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="btn btn-primary bg-white text-brand hover:bg-gray-100" onClick={() => router.push('/dashboard')}>
                Go to dashboard
              </button>
              <Link href="/settings/account" className="btn btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10">
                View account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}


