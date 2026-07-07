// actions/inquiries.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/auth'
import {
  checkAvailability,
  nightsBetween,
  parseDateInput,
} from '@/lib/availability'

export async function updateInquiryStatus(
  id: string,
  status: 'PENDING' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED'
): Promise<void> {
  await verifyAdminSession()
  await prisma.bookingInquiry.update({ where: { id }, data: { status } })
  revalidatePath('/admin/inquiries')
}

export async function convertInquiryToBooking(inquiryId: string): Promise<{ ok: boolean; message: string }> {
  await verifyAdminSession()

  const inq = await prisma.bookingInquiry.findUnique({
    where: { id: inquiryId },
    include: { apartment: { select: { pricePerNight: true, maxGuests: true } } },
  })

  if (!inq) return { ok: false, message: 'Inquiry not found.' }

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
    notes: `Converted from inquiry #${inq.id.slice(-8)}`,
  }

  // Legacy: website used to create a PENDING booking alongside the inquiry — upgrade it
  const existingPending = await prisma.booking.findFirst({
    where: {
      apartmentId: inq.apartmentId,
      status: 'PENDING',
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
    orderBy: { createdAt: 'desc' },
  })

  if (existingPending) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: existingPending.id },
        data: bookingData,
      }),
      prisma.bookingInquiry.update({ where: { id: inquiryId }, data: { status: 'CONFIRMED' } }),
    ])

    revalidatePath('/admin/inquiries')
    revalidatePath('/admin/bookings')
    revalidatePath(`/apartments`)
    return { ok: true, message: 'Inquiry converted to booking.' }
  }

  // Only confirmed stays block conversion — pending inquiries from other guests do not
  const avail = await checkAvailability(inq.apartmentId, checkIn, checkOut, {
    includePending: false,
  })

  if (!avail.available) {
    return { ok: false, message: avail.reason ?? 'Dates already booked. Cannot convert.' }
  }

  await prisma.$transaction([
    prisma.booking.create({ data: bookingData }),
    prisma.bookingInquiry.update({ where: { id: inquiryId }, data: { status: 'CONFIRMED' } }),
  ])

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/bookings')
  revalidatePath(`/apartments`)
  return { ok: true, message: 'Inquiry converted to booking.' }
}
