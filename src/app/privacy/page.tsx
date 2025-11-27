import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const privacySections = [
  {
    title: 'Information we collect',
    body: 'We collect the basics you share with us—name, email, and the stories or media you upload. We also gather limited device data to keep your account secure.',
  },
  {
    title: 'How we use your data',
    body: 'Your content powers core features like playback, search, and sharing. We also use metadata to improve recommendations and monitor platform health.',
  },
  {
    title: 'Cookies & tracking',
    body: 'Story Beyond uses essential cookies for authentication plus optional analytics cookies that you can disable anytime in your settings.',
  },
  {
    title: 'Sharing & disclosure',
    body: 'We never sell your data. We only share information with trusted subprocessors (like storage providers) that help us keep stories safe.',
  },
  {
    title: 'Your rights',
    body: 'Download your data, update account details, or delete your workspace whenever you like. Email privacy@storybeyond.com for any requests.',
  },
  {
    title: 'Security',
    body: 'We encrypt data at rest and in transit, maintain SOC2 practices, and run frequent backups so your memories remain protected.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-r from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-4 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Privacy Policy</p>
            <h1 className="text-4xl font-semibold">Your stories are yours. We simply keep them safe.</h1>
            <p className="text-white/80">Updated Nov 2025 • Placeholder legal language</p>
          </div>
        </section>
        <section className="app-container space-y-6 py-16">
          {privacySections.map((section) => (
            <article key={section.title} className="card p-6">
              <h2 className="text-2xl font-semibold text-brand">{section.title}</h2>
              <p className="mt-3 text-gray-600">{section.body}</p>
            </article>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}


