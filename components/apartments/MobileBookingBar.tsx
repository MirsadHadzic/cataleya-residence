// components/apartments/MobileBookingBar.tsx
'use client'

import { useState } from 'react'
import { formatPrice, getWhatsAppBookingUrl } from '@/lib/utils'
import { BookingInquiryForm } from '@/components/booking/BookingInquiryForm'
import { X } from 'lucide-react'

interface Props {
  apartmentId: string
  apartmentName: string
  pricePerNight: number
  maxGuests: number
}

export function MobileBookingBar({ apartmentId, apartmentName, pricePerNight, maxGuests }: Props) {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      {/* Sticky bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-ivory border-t border-champagne shadow-luxury-lg">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="font-serif text-xl text-charcoal">{formatPrice(pricePerNight)}</div>
            <div className="text-taupe text-xs font-light">per night</div>
          </div>
          <div className="flex gap-3">
            <a
              href={getWhatsAppBookingUrl(apartmentName)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-gold text-gold text-xs font-sans tracking-widest uppercase"
            >
              WhatsApp
            </a>
            <button
              onClick={() => setFormOpen(true)}
              className="px-5 py-2.5 bg-gold text-white text-xs font-sans tracking-widest uppercase"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Modal form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-ivory overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-champagne sticky top-0 bg-ivory">
            <h2 className="font-serif text-lg text-charcoal">Request Booking</h2>
            <button onClick={() => setFormOpen(false)} className="p-2 text-charcoal-muted">
              <X size={20} />
            </button>
          </div>
          <div className="p-5 pb-12">
            <BookingInquiryForm
              apartmentId={apartmentId}
              apartmentName={apartmentName}
              maxGuests={maxGuests}
              pricePerNight={pricePerNight}
            />
          </div>
        </div>
      )}
    </>
  )
}
