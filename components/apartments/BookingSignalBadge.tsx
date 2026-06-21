// components/apartments/BookingSignalBadge.tsx
// Subtle social proof -- renders nothing if no signal data exists.

import { AlertCircle, Clock } from 'lucide-react'
import type { BookingSignal } from '@/lib/bookingSignals'

interface Props {
  signal: BookingSignal
}

export function BookingSignalBadge({ signal }: Props) {
  if (!signal.type) return null

  if (signal.type === 'limited') {
    return (
      <div className="flex items-start gap-2 py-3 px-4 border-l-2 border-gold bg-champagne/30">
        <AlertCircle size={13} className="text-gold mt-0.5 flex-shrink-0" strokeWidth={2} />
        <div>
          <p className="text-charcoal text-xs font-sans font-500 tracking-wide">
            Limited availability this month
          </p>
          <p className="text-taupe text-xs font-sans font-light mt-0.5">
            Only a few dates remaining
          </p>
        </div>
      </div>
    )
  }

  if (signal.type === 'popular') {
    return (
      <div className="flex items-start gap-2 py-3 px-4 border-l-2 border-gold bg-champagne/30">
        <AlertCircle size={13} className="text-gold mt-0.5 flex-shrink-0" strokeWidth={2} />
        <div>
          <p className="text-charcoal text-xs font-sans font-500 tracking-wide">
            Limited availability this month
          </p>
          <p className="text-taupe text-xs font-sans font-light mt-0.5">
            High demand for this period
          </p>
        </div>
      </div>
    )
  }

  if (signal.type === 'recent') {
    return (
      <div className="flex items-center gap-2 py-2.5 px-4 border-l-2 border-taupe-pale bg-champagne/20">
        <Clock size={12} className="text-taupe flex-shrink-0" strokeWidth={1.5} />
        <p className="text-taupe text-xs font-sans font-light">Booked recently</p>
      </div>
    )
  }

  return null
}
