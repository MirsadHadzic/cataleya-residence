// scratch_check.ts
import { prisma } from './lib/prisma'

async function main() {
  console.log('--- APARTMENTS ---')
  const apartments = await prisma.apartment.findMany()
  apartments.forEach(a => {
    console.log(`ID: ${a.id} | Name: ${a.name} | Slug: ${a.slug} | MaxGuests: ${a.maxGuests}`)
  })

  console.log('\n--- BOOKINGS ---')
  const bookings = await prisma.booking.findMany({
    include: { apartment: { select: { name: true } } }
  })
  bookings.forEach(b => {
    console.log(`ID: ${b.id} | Apt: ${b.apartment.name} (${b.apartmentId}) | Dates: ${b.checkIn.toISOString().split('T')[0]} to ${b.checkOut.toISOString().split('T')[0]} | Status: ${b.status} | Source: ${b.source} | Guest: ${b.guestName} (${b.guestEmail})`)
  })

  console.log('\n--- INQUIRIES ---')
  const inquiries = await prisma.bookingInquiry.findMany({
    include: { apartment: { select: { name: true } } }
  })
  inquiries.forEach(i => {
    console.log(`ID: ${i.id} | Apt: ${i.apartment.name} (${i.apartmentId}) | Dates: ${i.checkIn.toISOString().split('T')[0]} to ${i.checkOut.toISOString().split('T')[0]} | Status: ${i.status} | Guest: ${i.name} (${i.email})`)
  })

  console.log('\n--- BLOCKED DATES ---')
  const blocked = await prisma.blockedDate.findMany({
    include: { apartment: { select: { name: true } } }
  })
  blocked.forEach(bd => {
    console.log(`ID: ${bd.id} | Apt: ${bd.apartment.name} (${bd.apartmentId}) | Dates: ${bd.startDate.toISOString().split('T')[0]} to ${bd.endDate.toISOString().split('T')[0]} | Reason: ${bd.reason}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
