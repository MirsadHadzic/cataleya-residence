// components/layout/Footer.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getWhatsAppUrl } from '@/lib/utils'

export async function Footer() {
  // Fetch active apartments so links always match the current slugs in the DB
  const apartments = await prisma.apartment.findMany({
    where: { active: true },
    select: { name: true, slug: true },
    orderBy: { createdAt: 'asc' },
  })

  const whatsappUrl = getWhatsAppUrl(
    'Hello, I am interested in booking an apartment at Cataleya Residence.'
  )

  return (
    <footer className="bg-charcoal text-white">
      {/* Main footer */}
      <div className="container-content py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">

          {/* Brand */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <span className="label-text text-gold block mb-1">Cataleya</span>
              <span className="font-serif text-3xl text-white">Residence</span>
            </div>
            <p className="text-white/50 text-sm font-light leading-relaxed max-w-xs">
              Spacious, fully equipped apartments in Ilidza, Sarajevo.
              Direct booking for the best rates.
            </p>
            <div className="mt-8 h-px w-12 bg-gold opacity-60" />
          </div>

          {/* Nav links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="label-text text-white/40 mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { label: 'Our Apartments', href: '/apartments' },
                { label: 'The Experience', href: '/#experience' },
                { label: 'Guest Reviews',  href: '/#reviews' },
                { label: 'Location',       href: '/#location' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors duration-300 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="label-text text-white/40 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:sarajevotrips@gmail.com"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-300 font-light"
                >
                  sarajevotrips@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+387603088762"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-300 font-light"
                >
                  +387 60 308 8762
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-300 font-light"
                >
                  WhatsApp
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <h4 className="label-text text-white/40 mb-4">Address</h4>
              <p className="text-sm text-white/50 font-light leading-relaxed">
                Barska 2C, Ilidza<br />
                Sarajevo, Bosnia &amp; Herzegovina
              </p>
            </div>
          </div>

          {/* Apartment links -- dynamic from DB */}
          <div className="md:col-span-3">
            <h4 className="label-text text-white/40 mb-6">Apartments</h4>
            <ul className="space-y-4">
              {apartments.map((apt) => (
                <li key={apt.slug}>
                  <Link
                    href={`/apartments/${apt.slug}`}
                    className="text-sm text-white/60 hover:text-gold transition-colors duration-300 font-light"
                  >
                    {apt.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-content py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs tracking-widest uppercase font-sans">
            &copy; {new Date().getFullYear()} Cataleya Residence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
