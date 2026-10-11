import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const apartments = [
  {
    aliases: ['president-suite', 'cataleya-1'],
    oldName: 'President Suite',
    name: 'Cataleya 1',
    pricePerNight: 80,
    tagline: 'President Suite - Largest Apartment',
    description: 'The largest apartment at Cataleya Residence, offering a comfortable stay in Sarajevo.',
    longDescription: 'Cataleya 1 is the largest apartment at Cataleya Residence and offers a spacious base for your stay in Sarajevo.',
    amenities: [],
    images: [
      '/images/apartments/Cataleya-1/bedroom-0.jpg',
      '/images/apartments/Cataleya-1/bedroom-1.jpg',
      '/images/apartments/Cataleya-1/livingroom-2.jpg',
      '/images/apartments/Cataleya-1/enterance-1.jpg',
    ],
  },
  {
    aliases: ['lumiere-apartment', 'cataleya-2'],
    oldName: 'Lumiere Apartment',
    name: 'Cataleya 2',
    pricePerNight: 70,
    tagline: 'Smallest Apartment - Private Entrance',
    description: 'The smallest apartment at Cataleya Residence, with its own entrance.',
    longDescription: 'Cataleya 2 is the smallest apartment at Cataleya Residence and has its own entrance.',
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
  {
    aliases: ['maison-noire', 'cataleya-3'],
    oldName: 'Maison Noire',
    name: 'Cataleya 3',
    pricePerNight: 90,
    tagline: 'Green Apartment',
    description: 'A comfortable apartment at Cataleya Residence featuring its distinctive green interior.',
    longDescription: 'Cataleya 3 is the apartment with the green interior, offering a comfortable stay in Sarajevo.',
    amenities: [],
    images: [
      '/images/apartments/cataleya-3/livingroom.jpg',
      '/images/apartments/cataleya-3/livingroom0.jpg',
      '/images/apartments/cataleya-3/masterroom.jpg',
      '/images/apartments/cataleya-3/enterance1.jpg',
      '/images/apartments/cataleya-3/bathroom.jpg',
    ],
  },
]

async function main() {
  const updates = await Promise.all(apartments.map(async (apartment) => {
    const current = await prisma.apartment.findFirst({
      where: {
        OR: [
          { slug: { in: apartment.aliases } },
          { name: apartment.oldName },
          { name: apartment.name },
        ],
      },
    })

    if (!current) throw new Error(`Could not find apartment record for ${apartment.name}.`)
    return { id: current.id, ...apartment }
  }))

  await prisma.$transaction(updates.map(({ id, ...apartment }) =>
    prisma.apartment.update({
      where: { id },
      data: {
        name: apartment.name,
        pricePerNight: apartment.pricePerNight,
        tagline: apartment.tagline,
        description: apartment.description,
        longDescription: apartment.longDescription,
        amenities: apartment.amenities,
        images: apartment.images,
        size: null,
      },
    })
  ))

  for (const apartment of updates) {
    console.log(`${apartment.name} updated to €${apartment.pricePerNight}/night.`)
  }
}

main()
  .catch((error) => {
    console.error('Apartment update failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
