'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sendBookingNotification, sendBookingRequestReceived } from '@/lib/email'
import { checkAvailability, parseDateInput, validateStayDates } from '@/lib/availability'

const bookingSchema = z.object({
  apartmentId: z.string().min(1, 'Apartment is required'),
  name: z.string().min(2, 'Ime mora sadržavati najmanje 2 znaka.'),
  email: z.string().min(1, 'E-mail adresa je obavezna.').email('Unesite ispravnu e-mail adresu.'),
  phone: z.string().min(6, 'Broj telefona je obavezan.'),
  checkIn: z.string().min(1, 'Datum dolaska je obavezan.'),
  checkOut: z.string().min(1, 'Datum odlaska je obavezan.'),
  guests: z.coerce.number().min(1, 'Potreban je najmanje 1 gost.').max(20),
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
    apartmentId: String(formData.get('apartmentId') ?? ''),
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    checkIn: String(formData.get('checkIn') ?? ''),
    checkOut: String(formData.get('checkOut') ?? ''),
    guests: String(formData.get('guests') ?? ''),
    message: String(formData.get('message') ?? '') || undefined,
  }

  const validated = bookingSchema.safeParse(raw)
  if (!validated.success) {
    return {
      success: false,
      message: 'Provjerite unesene podatke.',
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
      return { success: false, message: 'Apartman nije pronađen.' }
    }

    if (guests > apartment.maxGuests) {
      return {
        success: false,
        message: `U ovom apartmanu može boraviti najviše ${apartment.maxGuests} gostiju.`,
        errors: { guests: [`Najveći dozvoljeni broj gostiju je ${apartment.maxGuests}.`] },
      }
    }

    // Only confirmed bookings block new inquiries — pending requests do not hold dates
    const avail = await checkAvailability(apartmentId, checkInDate, checkOutDate, {
      includePending: false,
    })
    if (!avail.available) {
      return {
        success: false,
        message: 'Odabrani datumi nisu dostupni.',
        errors: {
          checkIn: ['Ovi datumi se preklapaju s postojećom rezervacijom.'],
          checkOut: ['Odaberite druge datume.'],
        },
      }
    }

    const settings = await prisma.siteSettings.findFirst({ select: { bookingEmail: true } })
    const bookingEmail = settings?.bookingEmail || process.env.BOOKING_EMAIL

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

    const emailData = {
      apartmentName: apartment.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      name,
      email,
      phone,
      message: message || null,
    }
    const [adminEmail] = await Promise.all([
      sendBookingNotification(emailData, bookingEmail),
      sendBookingRequestReceived(emailData, bookingEmail),
    ])

    // The request is saved either way; only warn the guest if we (the hosts) weren't notified.
    // A failed guest confirmation is already logged by sendEmail.
    const emailWarning = !adminEmail.sent
      ? ' Zahtjev je sačuvan, ali obavijest nije poslana. Za brži odgovor kontaktirajte nas putem WhatsAppa.'
      : ''

    return {
      success: true,
      message: `Hvala, ${name}. Vaš zahtjev za rezervaciju je zaprimljen.${emailWarning}`,
    }
  } catch (error) {
    console.error('Booking error:', error)
    return {
      success: false,
      message: 'Došlo je do greške. Pokušajte ponovo ili nas kontaktirajte putem WhatsAppa.',
    }
  }
}
