"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function SubscriptionCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-br from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-6 py-20 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Checkout canceled</p>
            <h1 className="text-4xl font-semibold">No worries—your memories are still safe.</h1>
            <p className="text-white/80 max-w-3xl mx-auto">
              You can restart the upgrade whenever you’re ready. In the meantime, keep capturing the everyday moments that matter the most.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="btn btn-primary bg-white text-brand hover:bg-gray-100" onClick={() => router.push('/dashboard')}>
                Back to dashboard
              </button>
              <Link href="/settings/account" className="btn btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10">
                Try upgrade again
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}


