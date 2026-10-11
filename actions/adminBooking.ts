// actions/adminBooking.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/auth'
import { checkAvailability, parseDateInput, validateStayDates } from '@/lib/availability'
import { sendBookingConfirmation } from '@/lib/email'

// Feature 1: Manual booking

const manualBookingSchema = z.object({
  apartmentId:   z.string().min(1, 'Odaberite apartman.'),
  guestName:     z.string().min(2, 'Ime gosta je obavezno.'),
  guestEmail:    z.string().email('Unesite ispravnu e-mail adresu.'),
  guestPhone:    z.string().optional(),
  checkIn:       z.string().min(1, 'Datum dolaska je obavezan.'),
  checkOut:      z.string().min(1, 'Datum odlaska je obavezan.'),
  guests:        z.coerce.number().min(1, 'Potreban je najmanje 1 gost.').max(20, 'Najveći dozvoljeni broj gostiju je 20.'),
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
      message: 'Ispravite unesene podatke.',
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
    return {
      success: false,
      message: dateCheck.message.includes('past')
        ? 'Datum dolaska ne može biti u prošlosti.'
        : 'Datum odlaska mora biti nakon datuma dolaska.',
    }
  }

  const avail = await checkAvailability(apartmentId, checkInDate, checkOutDate)
  if (!avail.available) {
    return {
      success: false,
      message: avail.reason === 'These dates are blocked.'
        ? 'Odabrani datumi su blokirani.'
        : 'Odabrani datumi se preklapaju s postojećom rezervacijom.',
    }
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { name: true, maxGuests: true },
  })
  if (!apartment) return { success: false, message: 'Odabrani apartman nije pronađen.' }
  if (guests > apartment.maxGuests) {
    return { success: false, message: `U ovom apartmanu može boraviti najviše ${apartment.maxGuests} gostiju.` }
  }
  const settings = await prisma.siteSettings.findFirst({ select: { bookingEmail: true } })

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

  const delivery = await sendBookingConfirmation({
    apartmentName: apartment.name,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    name: guestName,
    email: guestEmail,
    phone: guestPhone || '',
    message: notes || null,
  }, settings?.bookingEmail || process.env.BOOKING_EMAIL)

  revalidatePath('/admin/bookings')
  redirect(delivery.sent ? '/admin/bookings' : '/admin/bookings?email=failed')
}

// Feature 2: Block dates

const blockDatesSchema = z.object({
  apartmentId: z.string().min(1, 'Odaberite apartman.'),
  startDate:   z.string().min(1, 'Datum početka je obavezan.'),
  endDate:     z.string().min(1, 'Datum završetka je obavezan.'),
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
      message: 'Ispravite unesene podatke.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, startDate, endDate, reason } = validated.data
  const start = new Date(startDate)
  const end   = new Date(endDate)

  if (start >= end) {
    return { success: false, message: 'Datum završetka mora biti nakon datuma početka.' }
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
  return { success: true, message: 'Datumi su uspješno blokirani.' }
}

export async function deleteBlockedDate(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.blockedDate.delete({ where: { id } })
  revalidatePath('/admin/bookings')
}

// Feature 3: Season pricing

const seasonSchema = z.object({
  apartmentId:   z.string().min(1, 'Odaberite apartman.'),
  label:         z.string().min(1, 'Naziv je obavezan.'),
  startDate:     z.string().min(1, 'Datum početka je obavezan.'),
  endDate:       z.string().min(1, 'Datum završetka je obavezan.'),
  pricePerNight: z.coerce.number().min(1, 'Cijena mora biti najmanje 1.'),
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
      message: 'Ispravite unesene podatke.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, label, startDate, endDate, pricePerNight } = validated.data
  const start = new Date(startDate)
  const end   = new Date(endDate)

  if (start >= end) {
    return { success: false, message: 'Datum završetka mora biti nakon datuma početka.' }
  }

  await prisma.seasonPrice.create({
    data: { apartmentId, label, startDate: start, endDate: end, pricePerNight },
  })

  revalidatePath('/admin/pricing')
  return { success: true, message: 'Sezona je uspješno kreirana.' }
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
      message: 'Ispravite unesene podatke.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, label, startDate, endDate, pricePerNight } = validated.data

  if (new Date(startDate) >= new Date(endDate)) {
    return { success: false, message: 'Datum završetka mora biti nakon datuma početka.' }
  }

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
  return { success: true, message: 'Sezona je ažurirana.' }
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
export async function confirmBooking(id: string): Promise<{ message: string }> {
  await verifyAdminSession()
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { apartment: { select: { name: true } } },
  })
  if (!booking) return { message: 'Rezervacija nije pronađena.' }
  if (booking.status === 'CONFIRMED') return { message: 'Rezervacija je već potvrđena.' }
  if (booking.status === 'CANCELLED') return { message: 'Otkazana rezervacija se ne može potvrditi.' }

  const availability = await checkAvailability(booking.apartmentId, booking.checkIn, booking.checkOut, {
    includePending: false,
  })
  if (!availability.available) {
    return { message: availability.reason ?? 'Datumi su već rezervisani.' }
  }

  const settings = await prisma.siteSettings.findFirst({ select: { bookingEmail: true } })
  const inquiry = await prisma.bookingInquiry.findFirst({
    where: {
      apartmentId: booking.apartmentId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      ...(booking.guestEmail ? { email: booking.guestEmail } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        ...(booking.guestName || inquiry?.name ? {} : { guestName: inquiry?.name }),
        ...(booking.guestEmail || inquiry?.email ? {} : { guestEmail: inquiry?.email }),
        ...(booking.guestPhone || inquiry?.phone ? {} : { guestPhone: inquiry?.phone }),
      },
    }),
    ...(inquiry ? [
      prisma.bookingInquiry.update({ where: { id: inquiry.id }, data: { status: 'CONFIRMED' } }),
    ] : []),
  ])

  const email = booking.guestEmail || inquiry?.email
  if (!email) {
    console.error(`Booking ${id} confirmed without a guest email address.`)
    revalidatePath('/admin/bookings')
    revalidatePath('/admin')
    revalidatePath('/apartments')
    return { message: 'Rezervacija je potvrđena, ali gost nema unesenu e-mail adresu.' }
  }
  const delivery = await sendBookingConfirmation({
    apartmentName: booking.apartment.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    name: booking.guestName || inquiry?.name || email,
    email,
    phone: booking.guestPhone || inquiry?.phone || '',
  }, settings?.bookingEmail || process.env.BOOKING_EMAIL)

  revalidatePath('/admin/bookings')
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
  revalidatePath('/apartments')
  return {
    message: delivery.sent
      ? 'Rezervacija je potvrđena i e-mail je poslan gostu.'
      : `Rezervacija je potvrđena, ali e-mail nije poslan: ${delivery.error}`,
  }
}

export async function cancelBooking(id: string): Promise<void> {
  await verifyAdminSession()
  await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  revalidatePath('/apartments')
}