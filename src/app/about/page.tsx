import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const highlights = [
  {
    title: 'Our Mission',
    description: 'Help everyday people save the silly, heartfelt, and meaningful moments that shape their lives—without needing tech skills or perfect habits.',
  },
  {
    title: 'What Story Beyond Does',
    description: 'We bring journals, videos, audio notes, and photos into one gentle space so you can organize memories, invite loved ones, and replay the moments that matter.',
  },
  {
    title: 'Why We Exist',
    description: 'Because too many memories disappear on old phones and forgotten hard drives. Story Beyond keeps them safe, searchable, and ready to share when nostalgia hits.',
  },
]

const values = [
  { label: 'People first', detail: 'Simple flows, calming colors, and copy that feels like a friend cheering you on.' },
  { label: 'Privacy matters', detail: 'You choose who sees what. Private, family, or public—every story is yours to share.' },
  { label: 'Memories live forever', detail: 'Export options, redundant storage, and ongoing care so your stories stay intact.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-br from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-6 py-20 text-center md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-sm text-white/80">Built with love for memory keepers</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">We are here for every everyday storyteller.</h1>
            <p className="text-lg text-white/80 md:max-w-3xl">
              Story Beyond started as a family project and turned into a heart-led platform for anyone who wants to keep their life moments safe. We blend thoughtful design with reliable tech so you can
              focus on telling your story.
            </p>
          </div>
        </section>

        <section className="app-container grid gap-8 py-20 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-muted">Our heartbeat</p>
            <h2 className="text-3xl font-semibold text-brand">We believe memories feel better when they are gathered, cared for, and shared.</h2>
            <p className="text-gray-600">
              Whether you are documenting a newborn’s first months, chronicling college adventures, or recording loved ones’ voices, Story Beyond keeps it all organized with warmth. We obsess over small
              touches—approachable language, soft gradients, and inclusive features—so everyone feels welcome.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value) => (
                <div key={value.label} className="card p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">{value.label}</p>
                  <p className="mt-2 text-gray-600">{value.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {highlights.map((item) => (
              <div key={item.title} className="card p-6">
                <h3 className="text-xl font-semibold text-brand">{item.title}</h3>
                <p className="mt-3 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}


