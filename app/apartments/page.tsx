// app/apartments/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BedDouble, Bath, Users, Maximize2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'

// Always fresh so admin edits appear immediately
export const revalidate = 0

export default async function ApartmentsPage() {
  const apartments = await prisma.apartment.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }],
  })

  return (
    <>
      {/* Page Hero */}
      <div className="pt-40 pb-20 md:pt-48 md:pb-24 bg-ivory-warm text-center">
        <span className="label-text block mb-4">Our Collection</span>
        <h1 className="heading-xl text-charcoal mb-4">Luxury Apartments</h1>
        <p className="text-taupe font-light max-w-lg mx-auto leading-relaxed">
          Three distinct residences. One uncompromising standard of excellence.
        </p>
      </div>

      {/* Apartments */}
      <section className="section-padding bg-ivory">
        <div className="container-content">
          {apartments.length === 0 ? (
            <div className="text-center py-24 text-taupe font-sans font-light">
              No apartments available at the moment.
            </div>
          ) : (
            <div className="space-y-24 md:space-y-32">
              {apartments.map((apt, i) => (
                <div key={apt.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  {/* Image -- always uses images[0] as cover, preserves order */}
                  <div className={`relative ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                    <div className="relative aspect-[4/3] overflow-hidden group">
                      <Image
                        src={apt.images[0] ?? 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85'}
                        alt={apt.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    {apt.images[1] && (
                      <div className="absolute -bottom-6 -right-6 w-32 h-24 overflow-hidden hidden md:block border-2 border-ivory shadow-luxury">
                        <Image src={apt.images[1]} alt={`${apt.name} interior`} fill className="object-cover" sizes="128px" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={i % 2 !== 0 ? 'lg:order-1' : ''}>
                    {apt.tagline && (
                      <span className="label-text text-taupe block mb-4">{apt.tagline}</span>
                    )}
                    <h2 className="heading-lg text-charcoal mb-4">{apt.name}</h2>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="font-serif text-3xl text-gold">
                        {new Intl.NumberFormat('en-EU', {
                          style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
                        }).format(apt.pricePerNight)}
                      </span>
                      <span className="text-taupe text-sm font-sans font-light">per night</span>
                    </div>

                    <p className="text-taupe font-light leading-relaxed mb-8">{apt.description}</p>

                    {/* Specs */}
                    <div className="grid grid-cols-4 gap-5 mb-8 pb-8 border-b border-champagne">
                      {[
                        { icon: BedDouble, value: `${apt.bedrooms} Bed` },
                        { icon: Bath,      value: `${apt.bathrooms} Bath` },
                        { icon: Users,     value: `${apt.maxGuests} Guests` },
                        { icon: Maximize2, value: apt.size ? `${apt.size}m2` : 'Spacious' },
                      ].map(({ icon: Icon, value }) => (
                        <div key={value} className="flex flex-col gap-1">
                          <Icon size={14} className="text-gold" strokeWidth={1.5} />
                          <span className="text-charcoal text-xs font-sans font-light">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Amenities preview */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {apt.amenities.slice(0, 5).map((a) => (
                        <span key={a} className="text-xs text-taupe border border-champagne-dark px-3 py-1 font-sans font-light">
                          {a}
                        </span>
                      ))}
                      {apt.amenities.length > 5 && (
                        <span className="text-xs text-taupe font-sans font-light px-3 py-1">
                          +{apt.amenities.length - 5} more
                        </span>
                      )}
                    </div>

                    <Link href={`/apartments/${apt.slug}`} className="btn-primary inline-flex items-center gap-2 text-sm">
                      View Apartment
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
