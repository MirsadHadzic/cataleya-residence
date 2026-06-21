// components/admin/ManualBookingForm.tsx
'use client'

import { useActionState, useState, useEffect } from 'react'
import { createManualBooking, ManualBookingState } from '@/actions/adminBooking'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Apt { id: string; name: string; pricePerNight: number }

const init: ManualBookingState = { success: false, message: '' }

function fmt(d: Date) {
  return d.toISOString().split('T')[0]
}

export function ManualBookingForm({ apartments }: { apartments: Apt[] }) {
  const [state, action, pending] = useActionState(createManualBooking, init)
  const [selectedApt, setSelectedApt] = useState(apartments[0]?.id ?? '')
  const [checkIn, setCheckIn]   = useState(fmt(new Date()))
  const [checkOut, setCheckOut] = useState(fmt(new Date(Date.now() + 86400000)))
  const [ppn, setPpn] = useState(apartments[0]?.pricePerNight ?? 0)
  const [total, setTotal] = useState(0)

  // Auto-update price when apartment changes
  useEffect(() => {
    const apt = apartments.find((a) => a.id === selectedApt)
    if (apt) setPpn(apt.pricePerNight)
  }, [selectedApt, apartments])

  // Auto-calculate total
  useEffect(() => {
    const nights = Math.max(0, Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    ))
    setTotal(Math.round(nights * ppn * 100) / 100)
  }, [checkIn, checkOut, ppn])

  const err = state.errors ?? {}
  const inp = 'w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold font-sans font-light'

  return (
    <form action={action} className="bg-white border border-gray-200 p-8 space-y-5">

      {state.message && !state.success && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100">
          <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-600 text-xs font-sans">{state.message}</p>
        </div>
      )}

      {/* Apartment */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
          Apartment *
        </label>
        <select
          name="apartmentId"
          value={selectedApt}
          onChange={(e) => setSelectedApt(e.target.value)}
          className={inp}
        >
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {err.apartmentId && <p className="text-red-500 text-xs mt-1">{err.apartmentId[0]}</p>}
      </div>

      {/* Guest info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Guest Name *
          </label>
          <input name="guestName" type="text" required placeholder="Full name" className={inp} />
          {err.guestName && <p className="text-red-500 text-xs mt-1">{err.guestName[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Guest Email *
          </label>
          <input name="guestEmail" type="email" required placeholder="email@example.com" className={inp} />
          {err.guestEmail && <p className="text-red-500 text-xs mt-1">{err.guestEmail[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Phone
          </label>
          <input name="guestPhone" type="tel" placeholder="+387 61 000 000" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Guests *
          </label>
          <input name="guests" type="number" min="1" max="20" defaultValue="2" required className={inp} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Check In *
          </label>
          <input
            name="checkIn" type="date" required
            value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Check Out *
          </label>
          <input
            name="checkOut" type="date" required
            value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
            className={inp}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Price / Night (EUR) *
          </label>
          <input
            name="pricePerNight" type="number" step="0.01" required
            value={ppn} onChange={(e) => setPpn(Number(e.target.value))}
            className={inp}
          />
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Total Price (EUR) *
          </label>
          <input
            name="totalPrice" type="number" step="0.01" required
            value={total} onChange={(e) => setTotal(Number(e.target.value))}
            className={inp}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
          Notes (internal)
        </label>
        <textarea name="notes" rows={3} placeholder="Internal notes, special arrangements..." className={`${inp} resize-none`} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <button
          type="submit" disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Create Booking
        </button>
        <Link href="/admin/bookings" className="text-sm text-gray-500 hover:text-charcoal font-sans transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  )
}
