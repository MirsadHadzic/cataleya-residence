// components/admin/InquiryStatusUpdater.tsx
'use client'

import { useTransition } from 'react'
import { updateInquiryStatus } from '@/actions/inquiries'

type Status = 'PENDING' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED'

interface Props {
  inquiryId: string
  currentStatus: Status
}

const statusOptions: { value: Status; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const statusColors: Record<Status, string> = {
  PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
  CONTACTED: 'bg-blue-50 border-blue-200 text-blue-700',
  CONFIRMED: 'bg-green-50 border-green-200 text-green-700',
  CANCELLED: 'bg-gray-100 border-gray-200 text-gray-500',
}

export function InquiryStatusUpdater({ inquiryId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status
    startTransition(() => {
      updateInquiryStatus(inquiryId, newStatus)
    })
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`w-full px-3 py-2 text-xs font-sans border ${statusColors[currentStatus]} cursor-pointer disabled:opacity-60`}
    >
      {statusOptions.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
