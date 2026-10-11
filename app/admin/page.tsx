// app/admin/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { BookingStatusButtons } from '@/components/admin/BookingStatusButtons'
import { CalendarCheck, Users } from 'lucide-react'

function fmtDate(date: Date): string {
  return date.toLocaleDateString('bs-BA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getNights(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
}

function fmtEur(amount: number): string {
  return new Intl.NumberFormat('bs-BA', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount)
}

type BadgeStyle = {
  bg: string
  text: string
  label: string
}

const STATUS_STYLES: Record<string, BadgeStyle> = {
  PENDING: {
    bg: 'bg-amber-50 border border-amber-200',
    text: 'text-amber-700',
    label: 'Na čekanju',
  },
  CONFIRMED: {
    bg: 'bg-green-50 border border-green-200',
    text: 'text-green-700',
    label: 'Potvrđena',
  },
  CANCELLED: {
    bg: 'bg-red-50 border border-red-200',
    text: 'text-red-600',
    label: 'Otkazana',
  },
}

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      apartment: {
        select: { name: true, slug: true, pricePerNight: true },
      },
    },
  })

  const inquiries = await prisma.bookingInquiry.findMany({
    where: {
      apartmentId: { in: bookings.map((b) => b.apartmentId) },
    },
    select: {
      id: true,
      apartmentId: true,
      name: true,
      email: true,
      phone: true,
      checkIn: true,
      checkOut: true,
    },
  })

  const inquiryMap = new Map<string, typeof inquiries[0]>()
  for (const inq of inquiries) {
    const key = `${inq.apartmentId}-${inq.checkIn.toISOString()}-${inq.checkOut.toISOString()}`
    inquiryMap.set(key, inq)
  }

  // Counts for summary cards
  const total = bookings.length
  const pending = bookings.filter((b) => b.status === 'PENDING').length
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length

  // Analytics
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const bookingsThisMonth = bookings.filter(
    (b) => new Date(b.createdAt) >= monthStart
  ).length

  const activeBookings = bookings.filter((b) => b.status !== 'CANCELLED')

  const estimatedRevenue = activeBookings.reduce((sum, b) =>
    sum + (b.totalPrice ?? getNights(b.checkIn, b.checkOut) * b.apartment.pricePerNight), 0)

  const avgNights =
    activeBookings.length > 0
      ? activeBookings.reduce((sum, b) => sum + getNights(b.checkIn, b.checkOut), 0) /
        activeBookings.length
      : 0

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Rezervacije</h2>
        <p className="text-gray-500 text-sm font-sans font-light">
          Upravljajte rezervacijama i njihovim statusima.
        </p>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 border-l-2 border-l-gold">
          <div className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
            Ovaj mjesec
          </div>
          <div className="font-serif text-3xl text-charcoal mb-0.5">
            {bookingsThisMonth}
          </div>
          <div className="text-xs font-sans text-gray-400 font-light">
            {now.toLocaleString('bs-BA', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 border-l-2 border-l-gold">
          <div className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
            Procijenjeni prihod
          </div>
          <div className="font-serif text-3xl text-charcoal mb-0.5">
            {fmtEur(estimatedRevenue)}
          </div>
          <div className="text-xs font-sans text-gray-400 font-light">
            Bez otkazanih
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 border-l-2 border-l-gold">
          <div className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
            Prosječan boravak
          </div>
          <div className="font-serif text-3xl text-charcoal mb-0.5">
            {avgNights > 0 ? `${avgNights.toFixed(1)}` : '-'}
          </div>
          <div className="text-xs font-sans text-gray-400 font-light">
            noćenja po rezervaciji
          </div>
        </div>

        <div className="bg-white border border-amber-200 p-5 border-l-2 border-l-amber-400">
          <div className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">
            Na čekanju
          </div>
          <div className="font-serif text-3xl text-amber-600 mb-0.5">
            {pending}
          </div>
          <div className="text-xs font-sans text-gray-400 font-light">
            čeka obradu
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ukupno', value: total, color: 'text-charcoal' },
          { label: 'Na čekanju', value: pending, color: 'text-amber-600' },
          { label: 'Potvrđene', value: confirmed, color: 'text-green-600' },
          { label: 'Otkazane', value: cancelled, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 p-5">
            <div className={`font-serif text-3xl mb-1 ${color}`}>{value}</div>
            <div className="text-gray-400 text-xs font-sans uppercase tracking-widest">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* No bookings state */}
      {bookings.length === 0 && (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <CalendarCheck size={32} className="text-gold mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm font-sans">Još nema rezervacija.</p>
        </div>
      )}

      {/* Desktop table */}
      {bookings.length > 0 && (
        <>
          <div className="hidden lg:block bg-white border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    'Apartman',
                    'Gost',
                    'Datumi',
                    'Gosti',
                    'Procijenjeni iznos',
                    'Status',
                    'Kreirano',
                    'Radnje',
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-sans font-500 text-gray-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => {
                  const key = `${booking.apartmentId}-${booking.checkIn.toISOString()}-${booking.checkOut.toISOString()}`
                  const inquiry = inquiryMap.get(key)
                  const nights = getNights(booking.checkIn, booking.checkOut)
                  const style = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING
                  const guestName = booking.guestName || inquiry?.name
                  const guestEmail = booking.guestEmail || inquiry?.email
                  const guestPhone = booking.guestPhone || inquiry?.phone
                  const nightlyRate = booking.pricePerNight ?? booking.apartment.pricePerNight
                  const totalPrice = booking.totalPrice ?? nights * nightlyRate

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Apartment */}
                      <td className="px-5 py-4">
                        <span className="font-sans text-sm font-500 text-charcoal">
                          {booking.apartment.name}
                        </span>
                      </td>

                      {/* Guest */}
                      <td className="px-5 py-4">
                        {guestName ? (
                          <div>
                            <div className="font-sans text-sm text-charcoal">
                              {guestName}
                            </div>
                            {guestEmail && <a
                              href={`mailto:${guestEmail}`}
                              className="text-xs text-gold hover:underline font-light block"
                            >
                              {guestEmail}
                            </a>}
                            {guestPhone && (
                              <a
                                href={`tel:${guestPhone}`}
                                className="text-xs text-gray-400 hover:text-charcoal font-light block"
                              >
                                {guestPhone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-sans italic">
                            Nije pronađen gost
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4">
                        <div className="font-sans text-sm text-charcoal">
                          {fmtDate(booking.checkIn)}
                        </div>
                        <div className="text-xs text-gray-400 font-light">
                          do {fmtDate(booking.checkOut)}
                        </div>
                        <div className="text-xs text-taupe font-light mt-0.5">
                          {nights} {nights === 1 ? 'noćenje' : 'noćenja'}
                        </div>
                      </td>

                      {/* Guests */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-charcoal font-sans">
                          <Users size={13} className="text-gold" strokeWidth={1.5} />
                          {booking.guests}
                        </div>
                      </td>

                      {/* Est. Total */}
                      <td className="px-5 py-4">
                        <div className="font-serif text-sm text-charcoal">
                          {fmtEur(totalPrice)}
                        </div>
                        <div className="text-xs text-gray-400 font-sans font-light">
                          {nights} × {fmtEur(nightlyRate)}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-sans font-500 ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-400 font-sans font-light">
                          {fmtDate(booking.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <BookingStatusButtons
                          bookingId={booking.id}
                          status={booking.status}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {bookings.map((booking) => {
              const key = `${booking.apartmentId}-${booking.checkIn.toISOString()}-${booking.checkOut.toISOString()}`
              const inquiry = inquiryMap.get(key)
              const nights = getNights(booking.checkIn, booking.checkOut)
              const style = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING
              const guestName = booking.guestName || inquiry?.name
              const guestEmail = booking.guestEmail || inquiry?.email
              const nightlyRate = booking.pricePerNight ?? booking.apartment.pricePerNight
              const totalPrice = booking.totalPrice ?? nights * nightlyRate

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 p-5 space-y-4"
                >
                  {/* Top row: apartment + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-serif text-base text-charcoal">
                        {booking.apartment.name}
                      </div>
                      <div className="text-xs text-taupe font-sans font-light mt-0.5">
                        {fmtDate(booking.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-sans font-500 flex-shrink-0 ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 py-3 border-t border-b border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-sans mb-0.5">
                        Dolazak
                      </div>
                      <div className="text-sm text-charcoal font-sans">
                        {fmtDate(booking.checkIn)}
                      </div>
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-sans mb-0.5">
                        Odlazak
                      </div>
                      <div className="text-sm text-charcoal font-sans">
                        {fmtDate(booking.checkOut)}
                      </div>
                    </div>
                  </div>

                  {/* Guest + nights */}
                  <div className="flex items-center justify-between">
                    {guestName ? (
                      <div>
                        <div className="font-sans text-sm text-charcoal">{guestName}</div>
                        {guestEmail && <a
                          href={`mailto:${guestEmail}`}
                          className="text-xs text-gold font-light"
                        >
                          {guestEmail}
                        </a>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-sans italic">
                        Nije pronađen gost
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-sm text-charcoal font-sans">
                      <Users size={13} className="text-gold" strokeWidth={1.5} />
                      {booking.guests} {booking.guests === 1 ? 'gost' : 'gostiju'}
                      <span className="text-gray-400 ml-1 font-light">
                        &bull; {nights} noćenja
                      </span>
                    </div>
                  </div>

                  {/* Est. Total */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-sans uppercase tracking-widest">
                      Ukupno
                    </span>
                    <div className="text-right">
                      <span className="font-serif text-sm text-charcoal">
                        {fmtEur(totalPrice)}
                      </span>
                      <span className="text-xs text-gray-400 font-sans font-light ml-1.5">
                        ({nights} × {fmtEur(nightlyRate)})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <BookingStatusButtons
                    bookingId={booking.id}
                    status={booking.status}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
