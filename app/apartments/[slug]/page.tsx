// app/apartments/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { BookingInquiryForm } from '@/components/booking/BookingInquiryForm'
import { BookingSignalBadge } from '@/components/apartments/BookingSignalBadge'
import { AvailabilityCalendar } from '@/components/apartments/AvailabilityCalendar'
import { ApartmentGallery } from '@/components/apartments/ApartmentGallery'
import { getBookingSignal } from '@/lib/bookingSignals'
import { getWhatsAppUrl } from '@/lib/utils'
import {
  BedDouble,
  Bath,
  Users,
  Maximize2,
  MapPin,
  ArrowLeft,
  Check,
} from 'lucide-react'

// --- Types ------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>
}

// --- Metadata ---------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const apartment = await prisma.apartment.findUnique({
    where: { slug: slug },
    select: { name: true, description: true, images: true },
  })

  if (!apartment) {
    return { title: 'Apartment Not Found' }
  }

  return {
    title: `${apartment.name} -- Luxury Apartment Sarajevo`,
    description: apartment.description,
    openGraph: {
      title: apartment.name,
      description: apartment.description,
      images: apartment.images[0] ? [{ url: apartment.images[0] }] : [],
    },
  }
}

// --- Static Params (optional pre-rendering) ---------------------------------

export async function generateStaticParams() {
  const apartments = await prisma.apartment.findMany({
    where: { active: true },
    select: { slug: true },
  })
  return apartments.map((a) => ({ slug: a.slug }))
}

// --- Page --------------------------------------------------------------------

export default async function ApartmentDetailPage({ params }: Props) {
  const { slug } = await params

  const apartment = await prisma.apartment.findUnique({
    where: { slug: slug },
  })

  // 404 if not found or inactive
  if (!apartment || !apartment.active) {
    notFound()
  }

  const [priceFormatted, signal, bookedRanges] = await Promise.all([
    Promise.resolve(
      new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
      }).format(apartment.pricePerNight)
    ),
    getBookingSignal(apartment.id),
    // Only confirmed bookings block the public calendar (pending inquiries do not hold dates)
    prisma.booking.findMany({
      where: {
        apartmentId: apartment.id,
        status: 'CONFIRMED',
        checkOut: { gte: new Date() },
      },
      select: { checkIn: true, checkOut: true },
      orderBy: { checkIn: 'asc' },
    }).then((rows) =>
      rows.map((r) => ({
        checkIn:  r.checkIn.toISOString().split('T')[0],
        checkOut: r.checkOut.toISOString().split('T')[0],
      }))
    ),
  ])

  return (
    <>
      {/* -- Image Gallery --------------------------------------- */}
      <ApartmentGallery images={apartment.images} name={apartment.name} />

      {/* -- Main Content ---------------------------------------- */}
      <div className="container-content py-12 pb-28 md:py-16 md:pb-32">

        {/* Back link */}
        <Link
          href="/apartments"
          className="inline-flex items-center gap-2 text-taupe text-xs font-sans tracking-widest uppercase mb-10 hover:text-gold transition-colors duration-300"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          All Apartments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* -- Left: Details ------------------------------------ */}
          <div className="lg:col-span-2 space-y-12">

            {/* Header */}
            <div>
              {apartment.tagline && (
                <span className="label-text block mb-3">{apartment.tagline}</span>
              )}
              <h1 className="heading-xl text-charcoal mb-4">{apartment.name}</h1>

              <div className="flex items-center gap-2 text-taupe text-sm font-sans font-light mb-8">
                <MapPin size={13} className="text-gold" strokeWidth={1.5} />
                {apartment.location}
              </div>

              {/* Specs row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-t border-b border-champagne">
                {[
                  {
                    icon: BedDouble,
                    label: 'Bedrooms',
                    value: apartment.bedrooms,
                  },
                  {
                    icon: Bath,
                    label: 'Bathrooms',
                    value: apartment.bathrooms,
                  },
                  {
                    icon: Users,
                    label: 'Max Guests',
                    value: `Up to ${apartment.maxGuests}`,
                  },
                  {
                    icon: Maximize2,
                    label: 'Size',
                    value: apartment.size ? `${apartment.size} m2` : 'Spacious',
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-2">
                    <Icon size={16} className="text-gold" strokeWidth={1.5} />
                    <span className="text-charcoal font-sans text-sm font-light">
                      {value}
                    </span>
                    <span className="text-taupe font-sans text-xs tracking-widest uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-5">
                About This Apartment
              </h2>
              <div className="space-y-4">
                {(apartment.longDescription || apartment.description)
                  .split('\n\n')
                  .map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-taupe font-light leading-relaxed text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-6">
                Amenities &amp; Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {apartment.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 py-3 border-b border-champagne/70"
                  >
                    <Check
                      size={12}
                      className="text-gold flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="text-charcoal-muted text-sm font-sans font-light">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability calendar */}
            <AvailabilityCalendar bookedRanges={bookedRanges} />

          </div>

          {/* -- Right: Price + Booking Form ---------------------- */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">

              {/* Price card */}
              <div className="mb-4" style={{ background: '#F8F5EF', border: '1px solid #E8E0D2', padding: '2rem' }}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif text-5xl font-semibold" style={{ color: '#1A1A1A' }}>
                    {priceFormatted}
                  </span>
                  <span className="text-sm font-sans font-light" style={{ color: '#8A7F70' }}>
                    / night
                  </span>
                </div>
                <p className="text-xs font-sans font-light mb-4" style={{ color: '#8A7F70' }}>
                  Best rate -- book direct, no fees
                </p>

                {/* Social proof signal -- renders nothing if no data */}
                <BookingSignalBadge signal={signal} />

                <div className="h-px mt-4 mb-6" style={{ background: '#E8E0D2' }} />

                {/* Real booking form -- connected to database */}
                <BookingInquiryForm
                  apartmentId={apartment.id}
                  apartmentName={apartment.name}
                  maxGuests={apartment.maxGuests}
                  pricePerNight={apartment.pricePerNight}
                />
              </div>

              {/* WhatsApp alternative */}
              <a
                href={getWhatsAppUrl(`Hello, I am interested in the ${apartment.name} at Cataleya Residence.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full justify-center text-sm"
              >
                Contact via WhatsApp
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* -- Mobile sticky bar ----------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-ivory border-t border-champagne shadow-luxury-lg">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="font-serif text-xl text-charcoal">{priceFormatted}</div>
            <div className="text-taupe text-xs font-sans font-light">per night</div>
          </div>
          <a
            href="#booking"
            className="btn-primary text-xs px-6 py-3"
          >
            Book Now
          </a>
        </div>
      </div>
    </>
  )
}
