// components/home/CtaSection.tsx
import Link from 'next/link'
import Image from 'next/image'
import { getWhatsAppUrl } from '@/lib/utils'

export function CtaSection() {
  const whatsappUrl = getWhatsAppUrl(
    "Hello, I'd like to book a stay at Cataleya Residence. Could you help me find availability?"
  )

  return (
    <section id="contact" className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80"
          alt="Book your stay at Cataleya Residence"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/85" />
      </div>

      <div className="relative z-10 container-narrow text-center py-28 md:py-36">
        <span className="label-text text-gold block mb-6">Reserve Your Stay</span>
        <h2 className="heading-xl text-white mb-6">
          Begin Your Sarajevo
          <br />
          <em className="text-gold">Experience</em>
        </h2>
        <p className="text-white/60 font-light leading-relaxed mb-12 max-w-md mx-auto">
          Book directly with us for the best available rates, complimentary early check-in 
          when available, and our personal concierge service from arrival to departure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apartments" className="btn-primary text-sm">
            View Apartments
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-white text-sm"
          >
            Contact via WhatsApp
          </a>
        </div>

        <p className="mt-8 text-white/30 text-xs font-sans tracking-wide">
          Best rate guaranteed · No booking fees · Direct contact
        </p>
      </div>
    </section>
  )
}
