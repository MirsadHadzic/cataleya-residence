// components/admin/BookingStatusButtons.tsx
'use client'

import { useState, useTransition } from 'react'
import { confirmBooking, cancelBooking } from '@/actions/adminBooking'
import { Check, X, Loader2 } from 'lucide-react'

interface Props {
  bookingId: string
  status: string
}

export function BookingStatusButtons({ bookingId, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const handleConfirm = () => {
    if (!confirm('Potvrditi ovu rezervaciju?')) return
    startTransition(async () => {
      const result = await confirmBooking(bookingId)
      setMessage(result.message)
    })
  }

  const handleCancel = () => {
    if (!confirm('Otkazati ovu rezervaciju? Ovu radnju nije moguće poništiti.')) return
    startTransition(() => cancelBooking(bookingId))
  }

  // Already in terminal state -- show locked indicator
  if (status === 'CONFIRMED') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-sans">
          <Check size={13} strokeWidth={2.5} />
          Potvrđena
        </div>
        {message && <p className="text-xs text-amber-700 bg-amber-50 p-2">{message}</p>}
      </div>
    )
  }

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-1.5 text-red-500 text-xs font-sans">
        <X size={13} strokeWidth={2.5} />
        Otkazana
      </div>
    )
  }

  // PENDING -- show both action buttons
  return (
    <div className="flex flex-col gap-2">
      {message && <p className="text-xs text-amber-700 bg-amber-50 p-2">{message}</p>}
      <div className="flex items-center gap-2">
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-sans tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Potvrdi rezervaciju"
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <Check size={11} strokeWidth={2.5} />
        )}
        Potvrdi
      </button>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 text-xs font-sans tracking-wide hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Otkaži rezervaciju"
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <X size={11} strokeWidth={2.5} />
        )}
        Otkaži
      </button>
      </div>
    </div>
  )
}
