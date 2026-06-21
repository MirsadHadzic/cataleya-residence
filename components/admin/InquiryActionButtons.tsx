// components/admin/InquiryActionButtons.tsx
'use client'

import { useTransition, useState } from 'react'
import { updateInquiryStatus, convertInquiryToBooking } from '@/actions/inquiries'
import { CheckCircle, X, ArrowRight, Loader2 } from 'lucide-react'

interface Props {
  inquiryId: string
  currentStatus: string
  apartmentName: string
  guestName: string
}

export function InquiryActionButtons({ inquiryId, currentStatus, apartmentName, guestName }: Props) {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState('')

  const handleStatus = (status: 'PENDING' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED') => {
    start(() => updateInquiryStatus(inquiryId, status))
  }

  const handleConvert = async () => {
    if (!confirm(`Convert ${guestName}'s inquiry for ${apartmentName} into a confirmed booking?`)) return
    start(async () => {
      const result = await convertInquiryToBooking(inquiryId)
      setMessage(result.message)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {message && (
        <p className={`text-xs font-sans p-2 ${message.includes('Cannot') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </p>
      )}

      {/* Status dropdown */}
      <select
        value={currentStatus}
        onChange={(e) => handleStatus(e.target.value as any)}
        disabled={pending}
        className={`w-full px-3 py-2 text-xs font-sans border cursor-pointer disabled:opacity-60 ${
          currentStatus === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          currentStatus === 'CONTACTED' ? 'bg-blue-50 border-blue-200 text-blue-700' :
          currentStatus === 'CONFIRMED' ? 'bg-green-50 border-green-200 text-green-700' :
          'bg-gray-100 border-gray-200 text-gray-500'
        }`}
      >
        <option value="PENDING">Pending</option>
        <option value="CONTACTED">Contacted</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {/* Convert to booking */}
      {currentStatus !== 'CONFIRMED' && currentStatus !== 'CANCELLED' && (
        <button onClick={handleConvert} disabled={pending}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-charcoal text-white text-xs font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60">
          {pending ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
          Convert to Booking
        </button>
      )}
    </div>
  )
}
