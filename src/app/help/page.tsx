import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const faqSections = [
  {
    title: 'Account & Billing',
    faqs: [
      {
        question: 'How do I switch plans?',
        answer: 'Visit Settings → Billing to upgrade, downgrade, or pause. Changes apply immediately and your stories stay safe through every plan.',
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Absolutely. Cancel in one click inside Billing. We will keep your data for 60 days in case you change your mind.',
      },
      {
        question: 'Do you offer family discounts?',
        answer: 'Yes! Annual Pro and Premium plans come with an extra 2 months free plus shared storage boosts.',
      },
    ],
  },
  {
    title: 'Using Story Beyond',
    faqs: [
      {
        question: 'What devices are supported?',
        answer: 'Any modern browser on desktop, tablet, or mobile works beautifully. Offline-friendly mobile apps are on the roadmap.',
      },
      {
        question: 'Can I invite collaborators?',
        answer: 'You can invite as many friends or relatives as you like. Choose whether they can view, comment, or co-create.',
      },
    ],
  },
  {
    title: 'Uploading stories & videos',
    faqs: [
      {
        question: 'Is there a file size limit?',
        answer: 'Individual uploads are capped at 5GB on Premium, 2GB on Pro, and 500MB on Free. Need more? Reach out and we will help.',
      },
      {
        question: 'What formats do you support?',
        answer: 'MP4, MOV, MP3, WAV, and all major image formats just work. PDFs and DOCX files can be attached to any story.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    faqs: [
      {
        question: 'My video is stuck processing.',
        answer: 'Most videos finish within a few minutes. If it takes longer, try refreshing. Still stuck? Email support@storybeyond.com with the file name.',
      },
      {
        question: 'I forgot my password.',
        answer: 'Use the “Forgot password” link on the login page. We will send a reset link within seconds.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-br from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-6 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Help Center</p>
            <h1 className="text-4xl font-semibold">Answers for every memory keeper.</h1>
            <p className="text-white/80">Find quick tips, simple guides, and friendly support whenever you need it.</p>
          </div>
        </section>
        <section className="app-container space-y-10 py-16">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-2xl font-semibold text-brand">{section.title}</h2>
              <div className="mt-6 space-y-4">
                {section.faqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl border border-gray-200 bg-white p-5">
                    <summary className="flex cursor-pointer items-center justify-between text-left text-lg font-semibold text-brand">
                      {faq.question}
                      <span className="text-sm text-brand-muted group-open:hidden">+</span>
                      <span className="text-sm text-brand-muted hidden group-open:inline">−</span>
                    </summary>
                    <p className="mt-3 text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}


