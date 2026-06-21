// lib/bookingSignals.ts
// Server-side helper -- derives social proof signals from booking data.
// No schema changes required.

import { prisma } from '@/lib/prisma'

export interface BookingSignal {
  type: 'popular' | 'recent' | 'limited' | null
  bookedThisMonth: number
  lastBookedDaysAgo: number | null
}

export async function getBookingSignal(apartmentId: string): Promise<BookingSignal> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Count non-cancelled bookings this month
  const bookedThisMonth = await prisma.booking.count({
    where: {
      apartmentId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      createdAt: { gte: monthStart },
    },
  })

  // Most recent booking date
  const lastBooking = await prisma.booking.findFirst({
    where: {
      apartmentId,
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  const lastBookedDaysAgo = lastBooking
    ? Math.floor((now.getTime() - lastBooking.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Priority: limited (>=3 this month) > popular (>=2) > recent (booked within 14 days)
  let type: BookingSignal['type'] = null

  if (bookedThisMonth >= 3) {
    type = 'limited'
  } else if (bookedThisMonth >= 2) {
    type = 'popular'
  } else if (lastBookedDaysAgo !== null && lastBookedDaysAgo <= 14) {
    type = 'recent'
  }

  return { type, bookedThisMonth, lastBookedDaysAgo }
}