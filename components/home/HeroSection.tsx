// components/home/HeroSection.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Car, Plane, Tag, ShoppingBag } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Car,         label: 'Free parking' },
  { icon: Plane,       label: '5 min from airport' },
  { icon: Tag,         label: 'Direct booking - best price' },
  { icon: ShoppingBag, label: 'Grocery store in the building' },
]

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[960px] flex items-end overflow-hidden">

      {/* Background image -- local hero photo */}
      <div className="absolute inset-0">
        <Image
          src="/images/apartments/president-suite/hero.jpg"
          alt="Cataleya Residence -- luxury apartments in Sarajevo"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Strong bottom-up gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        {/* Subtle warm vignette */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-content w-full pb-16 md:pb-24 lg:pb-28">
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold flex-shrink-0" />
            <span className="label-text text-gold/90 tracking-widest">Sarajevo, Bosnia & Herzegovina</span>
          </div>

          {/* Headline */}
          <h1 className="heading-display text-white mb-5 leading-tight">
            Stay in Sarajevo,
            <br />
            <em className="text-gold not-italic">the right way</em>
          </h1>

          {/* Subheadline */}
          <p className="text-white/75 text-base md:text-lg font-light leading-relaxed mb-9 max-w-lg">
            Spacious, fully equipped apartments in Ilidza -- perfect for business and leisure stays.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/apartments" className="btn-primary text-sm">
              Book your stay
            </Link>
            <Link href="/apartments" className="btn-outline-white text-sm">
              Explore apartments
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={13} className="text-gold/80 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-white/60 text-xs font-sans font-light tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2">
        <span
          className="text-white/30 text-xs tracking-[0.2em] uppercase font-sans"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}
