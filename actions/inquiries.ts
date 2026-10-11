// actions/inquiries.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/auth'
import { sendBookingConfirmation } from '@/lib/email'
import {
  checkAvailability,
  nightsBetween,
  parseDateInput,
} from '@/lib/availability'

export async function updateInquiryStatus(
  id: string,
  status: 'PENDING' | 'CONTACTED' | 'CANCELLED'
): Promise<void> {
  await verifyAdminSession()
  await prisma.bookingInquiry.update({ where: { id }, data: { status } })
  revalidatePath('/admin/inquiries')
}

export async function convertInquiryToBooking(inquiryId: string): Promise<{ ok: boolean; message: string }> {
  await verifyAdminSession()

  const inq = await prisma.bookingInquiry.findUnique({
    where: { id: inquiryId },
    include: { apartment: { select: { name: true, pricePerNight: true, maxGuests: true } } },
  })

  if (!inq) return { ok: false, message: 'Zahtjev nije pronađen.' }
  if (inq.status === 'CONFIRMED') return { ok: false, message: 'Ovaj zahtjev je već potvrđen.' }
  if (inq.status === 'CANCELLED') return { ok: false, message: 'Otkazani zahtjev se ne može potvrditi.' }

  const checkIn = parseDateInput(inq.checkIn)
  const checkOut = parseDateInput(inq.checkOut)
  const nights = nightsBetween(checkIn, checkOut)
  const ppn = inq.apartment.pricePerNight
  const total = nights * ppn

  const bookingData = {
    apartmentId: inq.apartmentId,
    checkIn,
    checkOut,
    guests: inq.guests,
    status: 'CONFIRMED' as const,
    source: 'WEBSITE' as const,
    guestName: inq.name,
    guestEmail: inq.email,
    guestPhone: inq.phone,
    pricePerNight: ppn,
    totalPrice: total,
    notes: `Pretvoreno iz zahtjeva #${inq.id.slice(-8)}`,
  }

  // Reuse a matching legacy pending booking without touching another guest's request.
  const existingPending = await prisma.booking.findFirst({
    where: {
      apartmentId: inq.apartmentId,
      status: 'PENDING',
      checkIn,
      checkOut,
      guestEmail: inq.email,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Only confirmed stays block conversion — pending inquiries from other guests do not
  const avail = await checkAvailability(inq.apartmentId, checkIn, checkOut, {
    includePending: false,
  })

  if (!avail.available) {
    const reason = avail.reason === 'These dates are blocked.'
      ? 'Odabrani datumi su blokirani.'
      : 'Datumi su već rezervisani.'
    return { ok: false, message: `${reason} Nije moguće potvrditi zahtjev.` }
  }

  const settings = await prisma.siteSettings.findFirst({ select: { bookingEmail: true } })
  await prisma.$transaction(async (tx) => {
    if (existingPending) {
      await tx.booking.update({ where: { id: existingPending.id }, data: bookingData })
    } else {
      await tx.booking.create({ data: bookingData })
    }
    await tx.bookingInquiry.update({ where: { id: inquiryId }, data: { status: 'CONFIRMED' } })
  })

  const emailResult = await sendBookingConfirmation({
    apartmentName: inq.apartment.name,
    checkIn,
    checkOut,
    guests: inq.guests,
    name: inq.name,
    email: inq.email,
    phone: inq.phone ?? '',
    message: inq.message,
  }, settings?.bookingEmail || process.env.BOOKING_EMAIL)

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  revalidatePath('/apartments')
  return {
    ok: true,
    message: emailResult.sent
      ? 'Rezervacija je potvrđena, a gostu je poslana e-mail potvrda.'
      : `Rezervacija je potvrđena, ali e-mail gostu nije poslan: ${emailResult.error}`,
  }
}
