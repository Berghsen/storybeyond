'use client'

import UpgradePanel from '@/components/UpgradePanel'

export default function AccountSettingsPage() {
  return (
    <div className="app-container max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-muted">Account</p>
        <h1 className="text-3xl font-semibold text-brand mt-2">Account</h1>
        <p className="text-gray-600 mt-2">Choose the plan that keeps your stories safe and gives you enough room for every moment.</p>
      </div>
      <UpgradePanel />
    </div>
  )
}


