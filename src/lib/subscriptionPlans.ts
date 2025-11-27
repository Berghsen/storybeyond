export type PlanTier = 'free' | 'premium'

export type PlanDefinition = {
  tier: PlanTier
  label: string
  description: string
  perks: string[]
  price?: string
  highlight?: boolean
}

export const LIMITS = {
  free: {
    stories: 1,
    videos: 1,
    storageMb: 500,
    recipientsEnabled: false,
    deliveryEnabled: false,
  },
  premium: {
    stories: 10000,
    videos: 2000,
    storageMb: 102400,
    recipientsEnabled: true,
    deliveryEnabled: true,
  },
}

export const plans: PlanDefinition[] = [
  {
    tier: 'free',
    label: 'Free Test Drive',
    description: 'Upload one story + video to explore the editor before inviting loved ones.',
    perks: ['1 video to test the platform', '500MB secure storage', 'Upgrade to unlock recipients & delivery'],
  },
  {
    tier: 'premium',
    label: 'Premium',
    description: 'Full delivery workflow, high limits, and concierge onboarding for serious storytellers.',
    perks: ['Unlimited stories & HD uploads', 'Recipients + delivery tools unlocked', 'Priority support & onboarding'],
    price: '$39 / month',
    highlight: true,
  },
]

export function getPlanDefinition(tier: PlanTier) {
  return plans.find((p) => p.tier === tier)
}


