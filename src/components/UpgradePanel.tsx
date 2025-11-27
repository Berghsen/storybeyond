'use client'

import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { PlanTier } from '@/lib/subscriptionPlans'
import { useSubscription } from '@/context/SubscriptionContext'

async function startCheckout(plan: PlanTier, couponCode?: string) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, couponCode }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Unable to start checkout')
  }
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
  }
}

async function openPortal() {
  const res = await fetch('/api/create-portal-session', { method: 'POST' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? 'Unable to open billing portal')
  }
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
  }
}

const planCards = [
  {
    tier: 'premium' as PlanTier,
    label: 'Premium',
    description: 'Unlock the full delivery workflow with high limits and concierge onboarding.',
    price: '$39 / month',
    perks: ['Unlimited stories & HD uploads', 'Recipients + delivery system', 'Priority support & onboarding'],
  },
]

export default function UpgradePanel() {
  const { subscription } = useSubscription()
  const [coupon, setCoupon] = useState('')
  const [showVoucher, setShowVoucher] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | 'portal' | null>(null)
  const activePlan = subscription?.plan ?? 'free'

  const handlePlanSelect = async (plan: PlanTier) => {
    try {
      setLoadingPlan(plan)
      await startCheckout(plan, coupon || undefined)
    } catch (err) {
      if (typeof window !== 'undefined') window.alert((err as Error).message)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="card p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">Current plan</p>
          <p className="text-2xl font-semibold text-brand mt-2">
            {activePlan === 'free' ? 'Free' : 'Premium'} <span className="text-sm text-gray-500 font-normal">({subscription?.status ?? 'inactive'})</span>
          </p>
        </div>
        {activePlan !== 'free' ? (
          <button
            className="btn btn-secondary"
            onClick={async () => {
              try {
                setLoadingPlan('portal')
                await openPortal()
              } catch (err) {
                if (typeof window !== 'undefined') window.alert((err as Error).message)
              } finally {
                setLoadingPlan(null)
              }
            }}
            disabled={loadingPlan === 'portal'}
          >
            {loadingPlan === 'portal' ? 'Opening portal...' : 'Manage billing'}
          </button>
        ) : null}
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-muted">Upgrade options</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {planCards.map((plan) => (
            <div key={plan.tier} className="card border-2 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-brand">{plan.label}</p>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
                {loadingPlan === plan.tier && <CheckCircleIcon className="h-6 w-6 text-brand-accent animate-pulse" />}
              </div>
              <p className="mt-4 text-2xl font-semibold text-brand">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                className="btn btn-primary mt-6 w-full"
                type="button"
                onClick={() => handlePlanSelect(plan.tier)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.tier ? 'Opening checkout…' : `Choose ${plan.label}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-4">
        {!showVoucher ? (
          <button className="btn btn-secondary w-full text-sm py-2 bg-brand text-white hover:bg-brand-dark" type="button" onClick={() => setShowVoucher(true)}>
            I have a voucher/code
          </button>
        ) : (
          <div>
            <label htmlFor="coupon" className="text-sm font-medium text-gray-700">
              Voucher or promo code
            </label>
            <div className="flex gap-3 mt-2">
              <input
                id="coupon"
                className="input uppercase"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              />
              <button
                className="btn btn-primary whitespace-nowrap"
                type="button"
                onClick={() => setShowVoucher(false)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


