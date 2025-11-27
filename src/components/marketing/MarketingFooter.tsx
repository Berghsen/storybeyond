import Link from 'next/link'

const footerLinks = [
  { label: 'About', href: '/about' },
  { label: 'Help Center', href: '/help' },
  { label: 'Contact', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]

export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="app-container flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-lg font-semibold text-brand">
            StoryBeyond
          </Link>
          <p className="mt-2 text-sm text-gray-500">Keeping life’s memories safe, organized, and ready to relive.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <Link href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-brand">
            X
          </Link>
          <Link href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand">
            IG
          </Link>
          <Link href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-brand">
            YT
          </Link>
        </div>
      </div>
    </footer>
  )
}


