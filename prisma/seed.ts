// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.bookingInquiry.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.blockedDate.deleteMany()
  await prisma.apartment.deleteMany()

  // Apartment 1: President Suite
  await prisma.apartment.create({
    data: {
      name: 'President Suite',
      slug: 'president-suite',
      tagline: 'Spacious Comfort - Free Parking - Airport Access',
      description:
        'Comfortable one-bedroom apartment with modern amenities, free parking, and convenient access to Sarajevo International Airport.',
      longDescription:
        'The President Suite at Cataleya Residence offers a spacious one-bedroom apartment designed for comfortable city stays.\n\nThe apartment includes a separate bedroom, a bright living area, a fully equipped kitchen, and a private bathroom.\n\nGuests benefit from free Wi-Fi, air conditioning, and free private parking.\n\nLocated close to Sarajevo International Airport with convenient access to the city, the suite is ideal for couples, business travelers, and short stays.',
      pricePerNight: 70,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: 66,
      location: 'Barska 2c, Otes, Ilidza, Sarajevo',
      featured: true,
      active: true,
      amenities: [
        'Free Parking',
        'Free WiFi',
        'Airport Shuttle',
        'Kitchen',
        'Private Bathroom',
        'View',
        'Non-Smoking Rooms',
        'Family Rooms',
        'Air Conditioning',
        'Private Entrance',
      ],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=85',
        'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=85',
        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=85',
      ],
    },
  })

  // Apartment 2: Lumiere Apartment
  await prisma.apartment.create({
    data: {
      name: 'Lumiere Apartment',
      slug: 'lumiere-apartment',
      tagline: 'Sunlit Interiors - Modern Luxury',
      description:
        'A luminous two-bedroom retreat where natural light pours through expansive windows, illuminating spaces crafted for the discerning traveller.',
      longDescription:
        'The Lumiere Apartment takes its name from the extraordinary quality of light that fills its rooms throughout the day. Spanning 120 square meters across two levels, this apartment offers the space and privacy of a private home.\n\nBoth bedrooms are individually air-conditioned and feature premium bedding, blackout curtains, and custom-built wardrobes.',
      pricePerNight: 380,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      size: 120,
      location: 'Barska 2c, Otes, Ilidza, Sarajevo',
      featured: true,
      active: true,
      amenities: [
        'City Skyline Views',
        'Private Terrace',
        '2 Bedrooms',
        '2 Bathrooms',
        'Free Wi-Fi',
        'Air Conditioning',
        'Smart TV',
        'Designer Kitchen',
        'Japanese Soaking Tub',
        'Garage Parking',
        'Nespresso Machine',
      ],
      images: [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=85',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=85',
      ],
    },
  })

  // Apartment 3: Maison Noire
  await prisma.apartment.create({
    data: {
      name: 'Maison Noire',
      slug: 'maison-noire',
      tagline: 'Dark Elegance - Architectural Drama',
      description:
        'A bold architectural statement in deep tones and dramatic contrasts. For those who seek a residence that commands attention.',
      longDescription:
        'Maison Noire is not an apartment, it is an experience. This 95-square-meter residence challenges convention with its fearless use of dark stone, brushed brass, and velvet textures.\n\nThe bathroom, entirely clad in Nero Marquina marble, is among the most striking in Sarajevo.',
      pricePerNight: 320,
      maxGuests: 3,
      bedrooms: 1,
      bathrooms: 1,
      size: 95,
      location: 'Barska 2c, Otes, Ilidza, Sarajevo',
      featured: true,
      active: true,
      amenities: [
        'Architectural Design',
        'Nero Marquina Marble Bathroom',
        'King Bed',
        'Free Wi-Fi',
        'Air Conditioning',
        'Smart TV',
        'Gourmet Kitchen',
        'Bose Sound System',
        'Espresso Machine',
        'Curated Library',
      ],
      images: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85',
        'https://images.unsplash.com/photo-1614604600420-f1b3b1e74f3b?w=1200&q=85',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=85',
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