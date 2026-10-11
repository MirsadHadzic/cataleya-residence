// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.bookingInquiry.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.blockedDate.deleteMany()
  await prisma.apartment.deleteMany()

  // President Suite is Cataleya 1, the largest apartment.
  await prisma.apartment.create({
    data: {
      name: 'President Suite',
      slug: 'cataleya-1',
      tagline: 'Cataleya 1 - Largest Apartment',
      description:
        'The largest apartment at Cataleya Residence, offering a comfortable stay in Sarajevo.',
      longDescription:
        'President Suite (Cataleya 1) is the largest apartment at Cataleya Residence. It offers a spacious and comfortable base for your stay in Sarajevo.',
      pricePerNight: 80,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: null,
      location: 'Barska 2c, Otes, Ilidza, Sarajevo',
      featured: true,
      active: true,
      amenities: [],
      images: [
        '/images/apartments/Cataleya-1/bedroom-0.jpg',
        '/images/apartments/Cataleya-1/bedroom-1.jpg',
        '/images/apartments/Cataleya-1/livingroom-2.jpg',
        '/images/apartments/Cataleya-1/enterance-1.jpg',
      ],
    },
  })

  // Lumiere is Cataleya 2, the smallest apartment with its own entrance.
  await prisma.apartment.create({
    data: {
      name: 'Lumiere',
      slug: 'cataleya-2',
      tagline: 'Cataleya 2 - Smallest Apartment - Private Entrance',
      description:
        'The smallest apartment at Cataleya Residence, with its own entrance.',
      longDescription:
        'Lumiere (Cataleya 2) is the smallest apartment at Cataleya Residence and has its own entrance.',
      pricePerNight: 70,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      size: null,
      location: 'Barska 2c, Otes, Ilidza, Sarajevo',
      featured: true,
      active: true,
      amenities: ['Private Entrance'],
      images: [
        '/images/apartments/cataleya 2/IMG-20260707-WA0002.jpg',
        '/images/apartments/cataleya 2/IMG-20260707-WA0003.jpg',
        '/images/apartments/cataleya 2/IMG-20260707-WA0004.jpg',
        '/images/apartments/cataleya 2/IMG-20260707-WA0005.jpg',
        '/images/apartments/cataleya 2/IMG-20260707-WA0006.jpg',
        '/images/apartments/cataleya 2/IMG-20260707-WA0007.jpg',
      ],
    },
  })

  // Maison Noire is Cataleya 3, the apartment with the green interior.
  await prisma.apartment.create({
    data: {
      name: 'Maison Noire',
      slug: 'cataleya-3',
      tagline: 'Cataleya 3 - Green Apartment',
      description:
        'A comfortable apartment at Cataleya Residence featuring its distinctive green interior.',
      longDescription:
        'Maison Noire (Cataleya 3) is the apartment with the green interior, offering a comfortable stay in Sarajevo.',
      pricePerNight: 90,
      maxGuests: 3,
      bedrooms: 1,
      bathrooms: 1,
      size: null,
      location: 'Barska 2c, Otes, Ilidza, Sarajevo',
      featured: true,
      active: true,
      amenities: [],
      images: [
        '/images/apartments/cataleya-3/livingroom.jpg',
        '/images/apartments/cataleya-3/livingroom0.jpg',
        '/images/apartments/cataleya-3/masterroom.jpg',
        '/images/apartments/cataleya-3/enterance1.jpg',
        '/images/apartments/cataleya-3/bathroom.jpg',
      ],
    },
  })

  const count = await prisma.apartment.count()
  console.log('Done. ' + count + ' apartments created.')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })