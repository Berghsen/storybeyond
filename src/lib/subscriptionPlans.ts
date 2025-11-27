export type PlanTier = 'free' | 'pro' | 'premium'

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
  pro: {
    stories: 1000,
    videos: 200,
    storageMb: 20480,
    recipientsEnabled: true,
    deliveryEnabled: true,
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
    tier: 'pro',
    label: 'Individual',
    description: 'For everyday storytellers who need the full delivery workflow.',
    perks: ['Unlimited stories & HD uploads', 'Recipient & delivery system included', 'Priority support'],
    price: '$19 / month',
    highlight: true,
  },
  {
    tier: 'premium',
    label: 'Family Legacy',
    description: 'Scale into multi-story family archives with advanced collaboration.',
    perks: ['Family workrooms & analytics', 'Custom branding + concierge onboarding', 'Recipient & delivery system included'],
    price: '$39 / month',
  },
]

export function getPlanDefinition(tier: PlanTier) {
  return plans.find((p) => p.tier === tier)
}


