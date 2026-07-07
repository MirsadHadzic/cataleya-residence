// actions/adminBooking.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/auth'
import { checkAvailability, parseDateInput, validateStayDates } from '@/lib/availability'

// Feature 1: Manual booking

const manualBookingSchema = z.object({
  apartmentId:   z.string().min(1),
  guestName:     z.string().min(2, 'Name is required'),
  guestEmail:    z.string().email('Valid email required'),
  guestPhone:    z.string().optional(),
  checkIn:       z.string().min(1, 'Check-in required'),
  checkOut:      z.string().min(1, 'Check-out required'),
  guests:        z.coerce.number().min(1).max(20),
  pricePerNight: z.coerce.number().min(0),
  totalPrice:    z.coerce.number().min(0),
  notes:         z.string().optional(),
})

export type ManualBookingState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function createManualBooking(
  _prev: ManualBookingState,
  formData: FormData
): Promise<ManualBookingState> {
  await verifyAdminSession()

  const raw = Object.fromEntries(formData.entries())
  const validated = manualBookingSchema.safeParse(raw)

  if (!validated.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const {
    apartmentId, guestName, guestEmail, guestPhone,
    checkIn, checkOut, guests, pricePerNight, totalPrice, notes,
  } = validated.data

  const checkInDate  = parseDateInput(checkIn)
  const checkOutDate = parseDateInput(checkOut)

  const dateCheck = validateStayDates(checkInDate, checkOutDate)
  if (!dateCheck.ok) {
    return { success: false, message: dateCheck.message }
  }

  const avail = await checkAvailability(apartmentId, checkInDate, checkOutDate)
  if (!avail.available) {
    return { success: false, message: avail.reason ?? 'Dates not available.' }
  }

  await prisma.booking.create({
    data: {
      apartmentId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      status: 'CONFIRMED',
      source: 'MANUAL',
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      pricePerNight,
      totalPrice,
      notes: notes || null,
    },
  })

  revalidatePath('/admin/bookings')
  redirect('/admin/bookings')
}

// Feature 2: Block dates

const blockDatesSchema = z.object({
  apartmentId: z.string().min(1),
  startDate:   z.string().min(1, 'Start date required'),
  endDate:     z.string().min(1, 'End date required'),
  reason:      z.string().optional(),
})

export type BlockDatesState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function blockDates(
  _prev: BlockDatesState,
  formData: FormData
): Promise<BlockDatesState> {
  await verifyAdminSession()

  const raw = Object.fromEntries(formData.entries())
  const validated = blockDatesSchema.safeParse(raw)

  if (!validated.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, startDate, endDate, reason } = validated.data
  const start = new Date(startDate)
  const end   = new Date(endDate)

  if (start >= end) {
    return { success: false, message: 'End date must be after start date.' }
  }

  await prisma.blockedDate.create({
    data: {
      apartmentId,
      startDate: start,
      endDate: end,
      reason: reason || null,
    },
  })

  revalidatePath('/admin/bookings')
  return { success: true, message: 'Dates blocked successfully.' }
}

export async function deleteBlockedDate(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.blockedDate.delete({ where: { id } })
  revalidatePath('/admin/bookings')
}

// Feature 3: Season pricing

const seasonSchema = z.object({
  apartmentId:   z.string().min(1),
  label:         z.string().min(1, 'Label is required'),
  startDate:     z.string().min(1),
  endDate:       z.string().min(1),
  pricePerNight: z.coerce.number().min(1, 'Price must be at least 1'),
})

export type SeasonState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function createSeasonPrice(
  _prev: SeasonState,
  formData: FormData
): Promise<SeasonState> {
  await verifyAdminSession()

  const raw = Object.fromEntries(formData.entries())
  const validated = seasonSchema.safeParse(raw)

  if (!validated.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, label, startDate, endDate, pricePerNight } = validated.data
  const start = new Date(startDate)
  const end   = new Date(endDate)

  if (start >= end) {
    return { success: false, message: 'End date must be after start date.' }
  }

  await prisma.seasonPrice.create({
    data: { apartmentId, label, startDate: start, endDate: end, pricePerNight },
  })

  revalidatePath('/admin/pricing')
  return { success: true, message: 'Season created successfully.' }
}

export async function updateSeasonPrice(
  id: string,
  _prev: SeasonState,
  formData: FormData
): Promise<SeasonState> {
  await verifyAdminSession()

  const raw = Object.fromEntries(formData.entries())
  const validated = seasonSchema.safeParse(raw)

  if (!validated.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, label, startDate, endDate, pricePerNight } = validated.data

  await prisma.seasonPrice.update({
    where: { id },
    data: {
      apartmentId, label,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      pricePerNight,
    },
  })

  revalidatePath('/admin/pricing')
  return { success: true, message: 'Season updated.' }
}

export async function deleteSeasonPrice(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.seasonPrice.delete({ where: { id } })
  revalidatePath('/admin/pricing')
}

// Season price resolver -- used in booking flow
export async function resolvePrice(
  apartmentId: string,
  checkIn: Date,
  basePricePerNight: number
): Promise<{ pricePerNight: number; label: string | null }> {

  const season = await prisma.seasonPrice.findFirst({
    where: {
      apartmentId,
      startDate: { lte: checkIn },
      endDate:   { gt: checkIn },
    },
    orderBy: { startDate: 'desc' },
  })

  if (season) {
    return { pricePerNight: season.pricePerNight, label: season.label }
  }

  return { pricePerNight: basePricePerNight, label: null }
}

// Confirm / cancel booking -- used by BookingStatusButtons
export async function confirmBooking(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.booking.update({
    where: { id },
    data: { status: 'CONFIRMED' },
  })
  revalidatePath('/admin/bookings')
}

export async function cancelBooking(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })
  revalidatePath('/admin/bookings')
}