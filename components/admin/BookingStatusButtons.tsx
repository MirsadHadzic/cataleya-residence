// components/admin/BookingStatusButtons.tsx
'use client'

import { useTransition } from 'react'
import { confirmBooking, cancelBooking } from '@/actions/adminBooking'
import { Check, X, Loader2 } from 'lucide-react'

interface Props {
  bookingId: string
  status: string
}

export function BookingStatusButtons({ bookingId, status }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    if (!confirm('Confirm this booking?')) return
    startTransition(() => confirmBooking(bookingId))
  }

  const handleCancel = () => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return
    startTransition(() => cancelBooking(bookingId))
  }

  // Already in terminal state -- show locked indicator
  if (status === 'CONFIRMED') {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-xs font-sans">
        <Check size={13} strokeWidth={2.5} />
        Confirmed
      </div>
    )
  }

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-1.5 text-red-500 text-xs font-sans">
        <X size={13} strokeWidth={2.5} />
        Cancelled
      </div>
    )
  }

  // PENDING -- show both action buttons
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-sans tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Confirm booking"
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <Check size={11} strokeWidth={2.5} />
        )}
        Confirm
      </button>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 text-xs font-sans tracking-wide hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Cancel booking"
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <X size={11} strokeWidth={2.5} />
        )}
        Cancel
      </button>
    </div>
  )
}
