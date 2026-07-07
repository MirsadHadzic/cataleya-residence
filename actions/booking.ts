'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendBookingNotification, sendGuestConfirmation } from '@/lib/email'
import { checkAvailability, parseDateInput, validateStayDates } from '@/lib/availability'

const bookingSchema = z.object({
  apartmentId: z.string().min(1, 'Apartment is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.coerce.number().min(1, 'At least 1 guest required').max(20),
  message: z.string().optional(),
})

export type BookingFormState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function submitBookingInquiry(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {

  const raw = {
    apartmentId: formData.get('apartmentId') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    checkIn: formData.get('checkIn') as string,
    checkOut: formData.get('checkOut') as string,
    guests: formData.get('guests') as string,
    message: (formData.get('message') as string) || undefined,
  }

  const validated = bookingSchema.safeParse(raw)
  if (!validated.success) {
    return {
      success: false,
      message: 'Please check the form for errors.',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  const { apartmentId, name, email, phone, checkIn, checkOut, guests, message } = validated.data

  const checkInDate = parseDateInput(checkIn)
  const checkOutDate = parseDateInput(checkOut)

  const dateCheck = validateStayDates(checkInDate, checkOutDate)
  if (!dateCheck.ok) {
    const field = dateCheck.message.includes('past') ? 'checkIn' : 'checkOut'
    return {
      success: false,
      message: dateCheck.message,
      errors: { [field]: [dateCheck.message] },
    }
  }

  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { id: true, name: true, maxGuests: true },
    })

    if (!apartment) {
      return { success: false, message: 'Apartment not found.' }
    }

    if (guests > apartment.maxGuests) {
      return {
        success: false,
        message: `This apartment accommodates a maximum of ${apartment.maxGuests} guests.`,
        errors: { guests: [`Maximum ${apartment.maxGuests} guests allowed.`] },
      }
    }

    // Only confirmed bookings block new inquiries — pending requests do not hold dates
    const avail = await checkAvailability(apartmentId, checkInDate, checkOutDate, {
      includePending: false,
    })
    if (!avail.available) {
      return {
        success: false,
        message: 'Selected dates are not available.',
        errors: {
          checkIn: ['These dates overlap with an existing booking.'],
          checkOut: ['Please select different dates.'],
        },
      }
    }

    // Inquiry only — booking is created when admin confirms / converts
    await prisma.bookingInquiry.create({
      data: {
        apartmentId,
        name,
        email,
        phone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        message: message || null,
        status: 'PENDING',
      },
    })

    revalidatePath('/admin/inquiries')

    sendBookingNotification({
      apartmentName: apartment.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      name,
      email,
      phone,
      message: message || null,
    }).catch((err) => console.error('Background email error:', err))

    sendGuestConfirmation({
      apartmentName: apartment.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      name,
      email,
      phone,
      message: message || null,
    }).catch((err) => console.error('Guest confirmation email error:', err))

    return {
      success: true,
      message: `Thank you ${name}. Your booking request has been sent. We will contact you shortly.`,
    }
  } catch (error) {
    console.error('Booking error:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again or contact us via WhatsApp.',
    }
  }
}
