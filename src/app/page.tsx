import Link from 'next/link'
import { ArrowRightIcon, ChartBarIcon, DocumentTextIcon, PhotoIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const features = [
  {
    title: 'Video & Text Story Management',
    description: 'Keep every photo, clip, and journal entry in one cozy home that is easy to revisit from any device.',
    icon: PhotoIcon,
  },
  {
    title: 'Rich Text Editor & Multimedia Support',
    description: 'Write from the heart with playful formatting, mood-setting colors, and simple media drops.',
    icon: DocumentTextIcon,
  },
  {
    title: 'Collaboration & Sharing',
    description: 'Invite siblings, friends, or loved ones to add their memories with gentle sharing controls.',
    icon: UsersIcon,
  },
  {
    title: 'Analytics Dashboard',
    description: 'See which stories spark conversation with friendly snapshots of views and reactions.',
    icon: ChartBarIcon,
  },
]

const pricing = [
  {
    name: 'Free Test Drive',
    price: '$0',
    period: 'month',
    description: 'Upload a single story + video to feel the editor before looping in loved ones.',
    features: ['1 active story with video', '500MB secure storage', 'Upgrade to unlock recipients & delivery'],
    cta: 'Try for free',
    highlight: false,
  },
  {
    name: 'Individual',
    price: '$19',
    period: 'month',
    description: 'Unlock the full delivery system for sharing memories with the people you love.',
    features: ['Unlimited stories & HD uploads', 'Recipient & delivery system included', 'Priority human support'],
    cta: 'Choose Individual',
    highlight: true,
  },
  {
    name: 'Family Legacy',
    price: '$39',
    period: 'month',
    description: 'Premium collaboration for families and estate planners managing deep archives.',
    features: ['Family workrooms & analytics', 'Custom branding + concierge onboarding', 'Recipient & delivery system included'],
    cta: 'Choose Family Legacy',
    highlight: false,
  },
]

const testimonials = [
  {
    quote: 'Story Beyond became our family memory box. We pile in voice notes, videos, and journal entries so our kids can replay the moments we never want to forget.',
    author: 'Sophia Rivera',
    role: 'Mom of twins',
  },
  {
    quote: 'I share bedtime stories with my nana who lives three states away. She watches the videos, leaves a heart, and we both feel closer.',
    author: 'Marcus Lee',
    role: 'Grandson & storyteller',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />

      <main>
        <section id="home" className="overflow-hidden bg-gradient-to-br from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container grid items-center gap-12 py-20 md:grid-cols-2">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-sm text-white/80">
                <span className="h-2 w-2 rounded-full bg-brand-accent" /> Now welcoming shared spaces for families
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Hold onto the laughs, tears, and tiny moments that make your life yours.</h1>
              <p className="text-lg text-white/80">
                Story Beyond is a safe little corner of the internet for everyday memory keepers. Save bedtime giggles, graduation clips, love letters, and heritage interviews—then revisit them whenever your heart needs a reminder.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup" className="btn btn-primary bg-brand-accent text-brand-dark hover:bg-emerald-500">
                  Get Started
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link href="/login" className="btn btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Peek inside my space
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                <div>
                  <p className="text-2xl font-semibold text-white">10k+</p>
                  <p>Personal stories added every month</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">99.9%</p>
                  <p>Peace-of-mind secure storage</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">Global</p>
                  <p>Loved in 45+ countries</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-16 -top-10 hidden h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl sm:block" />
              <div className="relative rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-widest text-white/70">Live Story Timeline</p>
                  <div className="space-y-3 rounded-2xl bg-white/10 p-4">
                    <p className="text-base font-semibold text-white">“First steps by the lake”</p>
                    <p className="text-sm text-white/80">Video • 2m 14s</p>
                    <div className="h-2 w-full rounded-full bg-white/20">
                      <div className="h-2 w-2/3 rounded-full bg-brand-accent" />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-base font-semibold text-white">Heritage interview</p>
                    <p className="text-sm text-white/80">Audio • 12m 02s</p>
                    <p className="mt-2 text-sm text-white/70">“What would you tell your younger self?”</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-base font-semibold text-white">Draft: Wildflower memoir</p>
                    <p className="text-sm text-white/80">Rich text • Collaboration enabled</p>
                    <div className="mt-3 flex -space-x-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/20 text-xs font-semibold text-white">SR</span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/20 text-xs font-semibold text-white">ML</span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/20 text-xs font-semibold text-white">JV</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="app-container space-y-10 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-muted">Why Story Beyond</p>
            <h2 className="mt-3 text-3xl font-semibold text-brand">Carry every chapter of your life forward.</h2>
            <p className="mt-4 text-gray-600">Gentle, human tools that make it easy to keep memories safe and share them with the people who matter.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="card flex h-full flex-col gap-4 p-6">
                <feature.icon className="h-10 w-10 text-brand-accent" />
                <div>
                  <h3 className="text-xl font-semibold text-brand">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-gray-50 py-20">
          <div className="app-container space-y-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-muted">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold text-brand">Choose the plan that feels right for your memory keeping.</h2>
              <p className="mt-4 text-gray-600">Start with a 14-day free trial. Change plans anytime—your stories stay put.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {pricing.map((tier) => (
                <div key={tier.name} className={`card flex h-full flex-col p-6 ${tier.highlight ? 'border-brand-accent shadow-brand/10' : ''}`}>
                  <div className="mb-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">{tier.name}</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-brand">{tier.price}</span>
                      <span className="text-gray-500">/ {tier.period}</span>
                    </div>
                    <p className="mt-2 text-gray-600">{tier.description}</p>
                  </div>
                  <ul className="flex flex-1 flex-col gap-3">
                    {tier.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-700">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 text-brand-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={`btn mt-8 ${tier.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="app-container grid gap-10 py-20 lg:grid-cols-[1fr,1.1fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-muted">About Story Beyond</p>
            <h2 className="text-3xl font-semibold text-brand">Created for families, friends, and anyone who wants their memories to last.</h2>
            <p className="text-gray-600">
              We built Story Beyond after losing photos on old phones and half-written journals. Now you can tuck every video, letter, and milestone into one caring space and decide who gets to relive them with you.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-4xl font-bold text-brand">24/7</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-brand-muted">Real human support</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-6">
                <p className="text-4xl font-bold text-brand">SOC2</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-brand-muted">Serious security</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="card p-8">
              <h3 className="text-xl font-semibold text-brand">Testimonials</h3>
              <div className="mt-6 space-y-8">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.author}>
                    <p className="text-lg text-gray-800">“{testimonial.quote}”</p>
                    <p className="mt-3 text-sm font-semibold text-brand">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-r from-brand to-brand-light p-8 text-white">
              <h3 className="text-2xl font-semibold">Ready to tuck your next memory someplace safe?</h3>
              <p className="mt-3 text-white/80">Gather your favorite people, drop in your videos, and keep the good stuff close.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/signup" className="btn btn-primary bg-white text-brand hover:bg-gray-100">
                  Get Started
                </Link>
                <Link href="/contact" className="btn btn-secondary border-white bg-transparent text-white hover:bg-white/10">
                  Say hello
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

