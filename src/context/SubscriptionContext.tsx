'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { LIMITS, PlanTier } from '@/lib/subscriptionPlans'
import { useAuth } from './AuthContext'

type LimitShape = (typeof LIMITS)['free']

type SubscriptionInfo = {
  plan: PlanTier
  status: string
  storyCount: number
  videoCount: number
  storageUsedMb: number
  limits: LimitShape
  currentPeriodEnd?: string | null
}

type SubscriptionContextValue = {
  subscription: SubscriptionInfo | null
  loading: boolean
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const userId = user?.id

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/subscription', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Failed to load subscription')
      }
      const data = await res.json()
      setSubscription({
        plan: data.plan,
        status: data.status,
        storyCount: data.storyCount,
        videoCount: data.videoCount,
        storageUsedMb: data.storageUsedMb,
        limits: data.limits,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
      })
    } catch (error) {
      console.warn('Subscription fetch failed', error)
      setSubscription({
        plan: 'free',
        status: 'inactive',
        storyCount: 0,
        videoCount: 0,
        storageUsedMb: 0,
        limits: LIMITS.free,
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const value = useMemo(() => ({ subscription, loading, refresh: fetchSubscription }), [subscription, loading, fetchSubscription])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return ctx
}


