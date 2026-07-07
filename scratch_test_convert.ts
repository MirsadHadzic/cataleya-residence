// scratch_test_convert.ts
import { prisma } from './lib/prisma'
import { parseDateInput, checkAvailability, nightsBetween } from './lib/availability'

async function simulateConversion() {
  const inquiries = await prisma.bookingInquiry.findMany({
    where: { status: 'PENDING' },
    include: { apartment: { select: { name: true, pricePerNight: true } } }
  })

  console.log(`Found ${inquiries.length} pending inquiries.\n`)

  for (const inq of inquiries) {
    console.log(`Checking Inquiry ID: ${inq.id} (${inq.name} for ${inq.apartment.name})`)
    console.log(`Raw checkIn in DB: ${inq.checkIn.toISOString()} | checkOut: ${inq.checkOut.toISOString()}`)

    const checkIn = parseDateInput(inq.checkIn)
    const checkOut = parseDateInput(inq.checkOut)

    console.log(`Parsed checkIn (local): ${checkIn.toString()} | checkOut: ${checkOut.toString()}`)
    console.log(`Nights: ${nightsBetween(checkIn, checkOut)}`)

    const existingPending = await prisma.booking.findFirst({
      where: {
        apartmentId: inq.apartmentId,
        status: 'PENDING',
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existingPending) {
      console.log(`-> Found existing pending booking: ${existingPending.id}. It would bypass checkAvailability and update directly.`)
      continue
    }

    console.log(`-> No existing pending booking. Running checkAvailability...`)
    const avail = await checkAvailability(inq.apartmentId, checkIn, checkOut, {
      includePending: false,
    })

    console.log(`-> Availability result: ${JSON.stringify(avail)}`)
    if (!avail.available) {
      console.log(`-> ERROR would be: ${avail.reason ?? 'Dates already booked. Cannot convert.'}`)
    } else {
      console.log(`-> SUCCESS: can convert.`)
    }
    console.log('-------------------------------------\n')
  }
}

simulateConversion()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
