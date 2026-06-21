// actions/inquiries.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/auth'

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

  // Check for overlaps
  const overlap = await prisma.booking.count({
    where: {
      apartmentId: inq.apartmentId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      AND: [{ checkIn: { lt: inq.checkOut } }, { checkOut: { gt: inq.checkIn } }],
    },
  })

  if (overlap > 0) return { ok: false, message: 'Dates already booked. Cannot convert.' }

  const nights = Math.round((inq.checkOut.getTime() - inq.checkIn.getTime()) / 86400000)
  const ppn = inq.apartment.pricePerNight
  const total = nights * ppn

  await prisma.$transaction([
    prisma.booking.create({
      data: {
        apartmentId: inq.apartmentId,
        checkIn: inq.checkIn,
        checkOut: inq.checkOut,
        guests: inq.guests,
        status: 'CONFIRMED',
        source: 'WEBSITE',
        guestName: inq.name,
        guestEmail: inq.email,
        guestPhone: inq.phone,
        pricePerNight: ppn,
        totalPrice: total,
        notes: `Converted from inquiry #${inq.id.slice(-8)}`,
      },
    }),
    prisma.bookingInquiry.update({ where: { id: inquiryId }, data: { status: 'CONFIRMED' } }),
  ])

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/bookings')
  return { ok: true, message: 'Inquiry converted to booking.' }
}