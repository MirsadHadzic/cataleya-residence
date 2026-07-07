// app/admin/bookings/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { BookingStatusButtons } from '@/components/admin/BookingStatusButtons'
import { BlockDatesForm } from '@/components/admin/BlockDatesForm'
import { DeleteBlockedDateButton } from '@/components/admin/DeleteBlockedDateButton'
import { CalendarCheck, Users, Plus, Ban } from 'lucide-react'
import Link from 'next/link'

function fmtDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getNights(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
}

function fmtEur(amount: number): string {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount)
}

type BadgeStyle = { bg: string; text: string; label: string }

const STATUS_STYLES: Record<string, BadgeStyle> = {
  PENDING:   { bg: 'bg-amber-50 border border-amber-200',  text: 'text-amber-700',  label: 'Pending' },
  CONFIRMED: { bg: 'bg-green-50 border border-green-200',  text: 'text-green-700',  label: 'Confirmed' },
  CANCELLED: { bg: 'bg-red-50   border border-red-200',    text: 'text-red-600',    label: 'Cancelled' },
}

export default async function AdminBookingsPage() {
  const [bookings, apartments, blockedDates] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { apartment: { select: { name: true, slug: true, pricePerNight: true } } },
    }),
    prisma.apartment.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.blockedDate.findMany({
      orderBy: { startDate: 'asc' },
      include: { apartment: { select: { name: true } } },
    }),
  ])

  const inquiries = await prisma.bookingInquiry.findMany({
    where: { apartmentId: { in: bookings.map((b) => b.apartmentId) } },
    select: { apartmentId: true, name: true, email: true, phone: true, checkIn: true, checkOut: true },
  })

  const inquiryMap = new Map<string, typeof inquiries[0]>()
  for (const inq of inquiries) {
    const key = `${inq.apartmentId}-${inq.checkIn.toISOString()}-${inq.checkOut.toISOString()}`
    inquiryMap.set(key, inq)
  }

  // Analytics
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const bookingsThisMonth = bookings.filter((b) => new Date(b.createdAt) >= monthStart).length
  const activeBookings = bookings.filter((b) => b.status !== 'CANCELLED')
  const estimatedRevenue = activeBookings.reduce((sum, b) => {
    if (b.totalPrice) return sum + b.totalPrice
    const nights = getNights(b.checkIn, b.checkOut)
    return sum + nights * b.apartment.pricePerNight
  }, 0)
  const avgNights = activeBookings.length > 0
    ? activeBookings.reduce((s, b) => s + getNights(b.checkIn, b.checkOut), 0) / activeBookings.length
    : 0
  const pending = bookings.filter((b) => b.status === 'PENDING').length
  const total = bookings.length
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-charcoal mb-1">Bookings</h2>
          <p className="text-gray-500 text-sm font-sans font-light">Manage all bookings and blocked dates.</p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors"
        >
          <Plus size={15} />
          Manual Booking
        </Link>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'This Month', value: String(bookingsThisMonth), sub: now.toLocaleString('en-GB', { month: 'long', year: 'numeric' }), accent: true },
          { label: 'Est. Revenue', value: fmtEur(estimatedRevenue), sub: 'Excl. cancelled', accent: true },
          { label: 'Avg. Stay', value: avgNights > 0 ? `${avgNights.toFixed(1)}n` : '-', sub: 'nights per booking', accent: true },
          { label: 'Pending', value: String(pending), sub: 'awaiting action', accent: false, amber: true },
        ].map(({ label, value, sub, accent, amber }) => (
          <div key={label} className={`bg-white border border-gray-200 p-5 border-l-2 ${amber ? 'border-l-amber-400' : 'border-l-gold'}`}>
            <div className="text-xs font-sans uppercase tracking-widest text-gray-400 mb-2">{label}</div>
            <div className={`font-serif text-3xl mb-0.5 ${amber ? 'text-amber-600' : 'text-charcoal'}`}>{value}</div>
            <div className="text-xs font-sans text-gray-400 font-light">{sub}</div>
          </div>
        ))}
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-charcoal' },
          { label: 'Pending', value: pending, color: 'text-amber-600' },
          { label: 'Confirmed', value: confirmed, color: 'text-green-600' },
          { label: 'Cancelled', value: cancelled, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 p-5">
            <div className={`font-serif text-3xl mb-1 ${color}`}>{value}</div>
            <div className="text-gray-400 text-xs font-sans uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Bookings table */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <CalendarCheck size={32} className="text-gold mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm font-sans">No bookings yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Source','Apartment','Guest','Dates','Guests','Price/Night','Est. Total','Status','Actions'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-xs font-sans font-500 text-gray-400 uppercase tracking-widest whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => {
                  const key = `${booking.apartmentId}-${booking.checkIn.toISOString()}-${booking.checkOut.toISOString()}`
                  const inquiry = inquiryMap.get(key)
                  const nights = getNights(booking.checkIn, booking.checkOut)
                  const style = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING
                  const ppn = booking.pricePerNight ?? booking.apartment.pricePerNight
                  const total = booking.totalPrice ?? nights * ppn
                  const guestName = booking.guestName || inquiry?.name
                  const guestEmail = booking.guestEmail || inquiry?.email
                  const isManual = booking.source === 'MANUAL'

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-sans ${isManual ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                          {isManual ? 'Manual' : 'Website'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-sans font-500 text-charcoal whitespace-nowrap">{booking.apartment.name}</td>
                      <td className="px-4 py-4">
                        {guestName ? (
                          <div>
                            <div className="text-sm font-sans text-charcoal">{guestName}</div>
                            {guestEmail && <a href={`mailto:${guestEmail}`} className="text-xs text-gold hover:underline font-light block">{guestEmail}</a>}
                          </div>
                        ) : <span className="text-xs text-gray-400 italic">No match</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-sans text-charcoal">{fmtDate(booking.checkIn)}</div>
                        <div className="text-xs text-gray-400">to {fmtDate(booking.checkOut)}</div>
                        <div className="text-xs text-taupe">{nights}n</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-charcoal font-sans">
                          <Users size={12} className="text-gold" strokeWidth={1.5} />
                          {booking.guests}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-sans text-charcoal">{fmtEur(ppn)}</td>
                      <td className="px-4 py-4 font-serif text-sm text-charcoal">{fmtEur(total)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-sans font-500 ${style.bg} ${style.text}`}>{style.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <BookingStatusButtons bookingId={booking.id} status={booking.status} />
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
              const ppn = booking.pricePerNight ?? booking.apartment.pricePerNight
              const total = booking.totalPrice ?? nights * ppn
              const guestName = booking.guestName || inquiry?.name
              const isManual = booking.source === 'MANUAL'

              return (
                <div key={booking.id} className="bg-white border border-gray-200 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-sans ${isManual ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                          {isManual ? 'Manual' : 'Website'}
                        </span>
                      </div>
                      <div className="font-serif text-base text-charcoal">{booking.apartment.name}</div>
                      {guestName && <div className="text-xs text-taupe font-sans font-light">{guestName}</div>}
                    </div>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-sans font-500 flex-shrink-0 ${style.bg} ${style.text}`}>{style.label}</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 border-t border-b border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-sans mb-0.5">Check In</div>
                      <div className="text-sm text-charcoal font-sans">{fmtDate(booking.checkIn)}</div>
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-sans mb-0.5">Check Out</div>
                      <div className="text-sm text-charcoal font-sans">{fmtDate(booking.checkOut)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-charcoal font-sans">
                      <Users size={13} className="text-gold" strokeWidth={1.5} />
                      {booking.guests}
                      <span className="text-gray-400 ml-1">&bull; {nights}n</span>
                    </div>
                    <span className="font-serif text-sm text-charcoal">{fmtEur(total)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-sans uppercase tracking-widest">Est. Total</span>
                    <div className="text-right">
                      <span className="font-serif text-sm text-charcoal">{fmtEur(total)}</span>
                      <span className="text-xs text-gray-400 font-sans ml-1">({nights}n x {fmtEur(ppn)})</span>
                    </div>
                  </div>
                  <BookingStatusButtons bookingId={booking.id} status={booking.status} />
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Block dates section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Ban size={16} className="text-gold" strokeWidth={1.5} />
            <h3 className="font-serif text-lg text-charcoal">Block Dates</h3>
          </div>
          <BlockDatesForm apartments={apartments} />
        </div>

        <div className="bg-white border border-gray-200 p-6">
          <h3 className="font-serif text-lg text-charcoal mb-5">Blocked Periods</h3>
          {blockedDates.length === 0 ? (
            <p className="text-gray-400 text-sm font-sans">No dates blocked.</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-sans text-charcoal">{bd.apartment.name}</div>
                    <div className="text-xs text-gray-400 font-light">
                      {fmtDate(bd.startDate)} to {fmtDate(bd.endDate)}
                      {bd.reason && <span className="ml-1 italic">({bd.reason})</span>}
                    </div>
                  </div>
                  <DeleteBlockedDateButton id={bd.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
