import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <MarketingNav />
      <main>
        <section className="bg-gradient-to-br from-brand via-brand-light to-gray-900 text-white">
          <div className="app-container space-y-6 py-16 text-center md:text-left">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Contact</p>
            <h1 className="text-4xl font-semibold">We love hearing from fellow memory keepers.</h1>
            <p className="text-white/80 md:max-w-2xl">Have a question, need help with an upload, or just want to share a beautiful story? Send us a note—we read every message.</p>
          </div>
        </section>

        <section className="app-container grid gap-10 py-16 lg:grid-cols-[0.8fr,1fr]">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-brand">Reach out anytime</h2>
            <p className="mt-3 text-gray-600">support@storybeyond.com</p>
            <p className="mt-1 text-gray-500 text-sm">We typically reply within 1 business day.</p>
            <div className="mt-6 space-y-3 text-gray-600">
              <p className="font-semibold text-brand">Follow along</p>
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-brand">
                  X / Twitter
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand">
                  Instagram
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-brand">
                  YouTube
                </a>
              </div>
            </div>
          </div>
          <form className="card space-y-5 p-8">
            <div>
              <label className="label text-gray-700" htmlFor="name">
                Name
              </label>
              <input id="name" name="name" placeholder="Jane Memory Keeper" className="input" />
            </div>
            <div>
              <label className="label text-gray-700" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" name="email" placeholder="you@email.com" className="input" />
            </div>
            <div>
              <label className="label text-gray-700" htmlFor="message">
                Message
              </label>
              <textarea id="message" name="message" rows={5} placeholder="Tell us about your story, question, or idea..." className="input" />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Send message
            </button>
          </form>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}


