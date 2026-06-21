// components/home/FeaturedApartments.tsx
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, BedDouble, Users, Maximize2 } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85'

// React Server Component -- always fresh, no caching
export async function FeaturedApartments() {
  const apartments = await prisma.apartment.findMany({
    where: { featured: true, active: true },
    orderBy: { createdAt: 'asc' },
    take: 6, // supports up to 6 featured apartments as we scale
  })

  if (apartments.length === 0) return null

  return (
    <section id="apartments" className="section-padding bg-ivory">
      <div className="container-content">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="label-text block mb-4">Our Collection</span>
          <h2 className="heading-xl text-charcoal mb-6">Our Residences</h2>
          <p className="text-taupe max-w-xl mx-auto text-base font-light leading-relaxed">
            Each apartment is a unique world -- individually designed, meticulously appointed,
            and offering an experience that no hotel can replicate.
          </p>
          <span className="gold-divider-short mx-auto mt-8 block" />
        </div>

        {/* Apartments grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {apartments.map((apt, i) => (
            <ApartmentCard key={apt.id} apartment={apt} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link href="/apartments" className="btn-outline inline-flex items-center gap-2">
            View All Apartments
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ApartmentCard({ apartment, index }: { apartment: any; index: number }) {
  // Safe image: use first image if available, fallback to placeholder
  const coverImage = apartment.images && apartment.images.length > 0
    ? apartment.images[0]
    : FALLBACK_IMAGE

  return (
    <Link
      href={`/apartments/${apartment.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] mb-6">
        <Image
          src={coverImage}
          alt={apartment.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Price tag */}
        <div className="absolute top-4 right-4 bg-charcoal/90 backdrop-blur-sm px-3 py-1.5">
          <span className="text-white text-xs font-sans font-500 tracking-wide">
            From {formatPrice(apartment.pricePerNight)}
            <span className="text-white/50"> / night</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div>
        {apartment.tagline && (
          <span className="label-text text-taupe block mb-2">{apartment.tagline}</span>
        )}
        <h3 className="heading-md text-charcoal mb-3 group-hover:text-gold transition-colors duration-300">
          {apartment.name}
        </h3>
        <p className="text-taupe text-sm font-light leading-relaxed mb-5">
          {apartment.description.slice(0, 120)}...
        </p>

        {/* Meta */}
        <div className="flex items-center gap-5 text-xs text-taupe-light font-sans">
          <span className="flex items-center gap-1.5">
            <BedDouble size={13} className="text-gold" />
            {apartment.bedrooms} bed
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-gold" />
            Up to {apartment.maxGuests}
          </span>
          {apartment.size && (
            <span className="flex items-center gap-1.5">
              <Maximize2 size={13} className="text-gold" />
              {apartment.size}m2
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-5 flex items-center gap-2 text-gold text-xs font-sans font-500 tracking-widest uppercase group-hover:gap-3 transition-all duration-300">
          View Details
          <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  )
}
