// lib/availability.ts — shared booking date + availability logic
import { prisma } from '@/lib/prisma'

/** Parse YYYY-MM-DD (or Date from DB) as local calendar date — avoids UTC timezone shifts. */
export function parseDateInput(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0)
  }
  const [y, m, d] = value.split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

export function startOfToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

export function validateStayDates(
  checkIn: Date,
  checkOut: Date,
  options?: { allowPast?: boolean }
): { ok: true } | { ok: false; message: string } {
  if (checkIn >= checkOut) {
    return { ok: false, message: 'Check-out must be after check-in.' }
  }

  if (!options?.allowPast) {
    const checkInDay = new Date(checkIn)
    checkInDay.setHours(0, 0, 0, 0)
    if (checkInDay < startOfToday()) {
      return { ok: false, message: 'Check-in date cannot be in the past.' }
    }
  }

  return { ok: true }
}

export type AvailabilityOptions = {
  /** Exclude a booking (e.g. when editing). */
  excludeBookingId?: string
  /** Public inquiries only block on confirmed stays; admin checks pending too. */
  includePending?: boolean
}

/**
 * Check if an apartment is free for [checkIn, checkOut).
 * Always scoped to a single apartmentId — other apartments never affect the result.
 */
export async function checkAvailability(
  apartmentId: string,
  checkIn: Date,
  checkOut: Date,
  options: AvailabilityOptions = {}
): Promise<{ available: boolean; reason?: string }> {
  const { excludeBookingId, includePending = true } = options

  const statuses = includePending ? (['PENDING', 'CONFIRMED'] as const) : (['CONFIRMED'] as const)

  const bookingOverlap = await prisma.booking.count({
    where: {
      apartmentId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: [...statuses] },
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
  })

  if (bookingOverlap > 0) {
    return { available: false, reason: 'These dates overlap with an existing booking.' }
  }

  const blockedOverlap = await prisma.blockedDate.count({
    where: {
      apartmentId,
      AND: [{ startDate: { lt: checkOut } }, { endDate: { gt: checkIn } }],
    },
  })

  if (blockedOverlap > 0) {
    return { available: false, reason: 'These dates are blocked.' }
  }

  return { available: true }
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
}
