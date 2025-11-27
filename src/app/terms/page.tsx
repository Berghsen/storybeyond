import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const sections = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating a Story Beyond account you agree to these Terms of Service, our Privacy Policy, and any updates we may post. If you are accessing on behalf of another person, you confirm you have permission to do so.',
  },
  {
    title: '2. Your stories & ownership',
    body: 'You own every photo, video, and word you upload. We simply host and process the content so you can store, organize, and share it. We never sell or license your memories.',
  },
  {
    title: '3. Acceptable use',
    body: 'Please keep Story Beyond a safe space. No illegal content, harassment, or spam. We reserve the right to remove content or suspend accounts that violate these guidelines.',
  },
  {
    title: '4. Billing & cancellations',
    body: 'Paid plans renew automatically each month or year until cancelled. You can cancel anytime in Settings and keep access through the end of the current billing period.',
  },
  {
    title: '5. Service changes',
    body: 'We may update features to improve performance or security. If a change significantly impacts your experience we will notify you in advance.',
  },
  {
    title: '6. Liability',
    body: 'Story Beyond is provided “as is.” While we protect your data with multiple safeguards, we cannot guarantee uninterrupted access and our liability is limited to the amount you paid in the past 12 months.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-r from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-4 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Terms of Service</p>
            <h1 className="text-4xl font-semibold">Caring for memories comes with shared promises.</h1>
            <p className="text-white/80">Updated Nov 2025 • Placeholder legal language</p>
          </div>
        </section>
        <section className="app-container space-y-6 py-16">
          {sections.map((section) => (
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


