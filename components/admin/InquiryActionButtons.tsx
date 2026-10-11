// components/admin/InquiryActionButtons.tsx
'use client'

import { useTransition, useState } from 'react'
import { updateInquiryStatus, convertInquiryToBooking } from '@/actions/inquiries'
import { ArrowRight, Loader2 } from 'lucide-react'

interface Props {
  inquiryId: string
  currentStatus: string
  apartmentName: string
  guestName: string
}

export function InquiryActionButtons({ inquiryId, currentStatus, apartmentName, guestName }: Props) {
  const [pending, start] = useTransition()
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleStatus = (status: 'PENDING' | 'CONTACTED' | 'CANCELLED') => {
    start(async () => {
      await updateInquiryStatus(inquiryId, status)
    })
  }

  const handleConvert = async () => {
    if (!confirm(`Potvrditi zahtjev gosta ${guestName} za apartman ${apartmentName}?`)) return
    start(async () => {
      const result = await convertInquiryToBooking(inquiryId)
      setMessage(result.message)
      setHasError(!result.ok || result.message.includes('e-mail gostu nije poslan'))
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {message && (
        <p className={`text-xs font-sans p-2 ${hasError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </p>
      )}

      {/* Status dropdown */}
      <select
        value={currentStatus}
        onChange={(e) => {
          const status = e.target.value
          if (status === 'CONFIRMED') {
            void handleConvert()
          } else if (status === 'PENDING' || status === 'CONTACTED' || status === 'CANCELLED') {
            handleStatus(status)
          }
        }}
        disabled={pending}
        className={`w-full px-3 py-2 text-xs font-sans border cursor-pointer disabled:opacity-60 ${
          currentStatus === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          currentStatus === 'CONTACTED' ? 'bg-blue-50 border-blue-200 text-blue-700' :
          currentStatus === 'CONFIRMED' ? 'bg-green-50 border-green-200 text-green-700' :
          'bg-gray-100 border-gray-200 text-gray-500'
        }`}
      >
        <option value="PENDING">Na čekanju</option>
        <option value="CONTACTED">Kontaktiran</option>
        <option value="CONFIRMED">Potvrdi i rezerviši</option>
        <option value="CANCELLED">Otkazan</option>
      </select>

      {/* Convert to booking */}
      {currentStatus !== 'CONFIRMED' && currentStatus !== 'CANCELLED' && (
        <button onClick={handleConvert} disabled={pending}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-charcoal text-white text-xs font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60">
          {pending ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
          Potvrdi rezervaciju
        </button>
      )}
    </div>
  )
}
