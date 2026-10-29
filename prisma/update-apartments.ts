import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Renames the apartments in place (slugs, bookings and inquiries are kept).
const apartments = [
  {
    aliases: ['president-suite', 'cataleya-1'],
    oldNames: ['President Suite'],
    name: 'Cataleya 1',
    pricePerNight: 90,
    images: [
      '/images/apartments/Cataleya-1/bedroom-0.jpg',
      '/images/apartments/Cataleya-1/bedroom-1.jpg',
      '/images/apartments/Cataleya-1/bedroom-2.jpg',
      '/images/apartments/Cataleya-1/bedroom-3.jpg',
      '/images/apartments/Cataleya-1/bedroom-4.jpg',
      '/images/apartments/Cataleya-1/enterance-1.jpg',
      '/images/apartments/Cataleya-1/livingroom-2.jpg',
      '/images/apartments/Cataleya-1/livingroom-3.jpg',
      '/images/apartments/Cataleya-1/livingroom0.jpg',
    ],
  },
  {
    aliases: ['lumiere-apartment', 'cataleya-2'],
    oldNames: ['Lumiere Apartment', 'Lumiere'],
    name: 'Cataleya 2',
    pricePerNight: 80,
    images: [
      '/images/apartments/cataleya-3/livingroom.jpg',
      '/images/apartments/cataleya-3/livingroom0.jpg',
      '/images/apartments/cataleya-3/livingroom1.jpg',
      '/images/apartments/cataleya-3/masterroom.jpg',
      '/images/apartments/cataleya-3/livingroom4.jpg',
      '/images/apartments/cataleya-3/hodnik.jpg',
      '/images/apartments/cataleya-3/enterance1.jpg',
      '/images/apartments/cataleya-3/bathroom.jpg',
      '/images/apartments/cataleya-3/bedroom1.jpg',
    ],
  },
  {
    aliases: ['maison-noire', 'cataleya-3'],
    oldNames: ['Maison Noire'],
    name: 'Cataleya 3',
    pricePerNight: 70,
    images: [
      '/images/apartments/cataleya 2/IMG-20260707-WA0004.jpg',
      '/images/apartments/cataleya 2/IMG-20260707-WA0002.jpg',
      '/images/apartments/cataleya 2/IMG-20260707-WA0003.jpg',
      '/images/apartments/cataleya 2/IMG-20260707-WA0005.jpg',
      '/images/apartments/cataleya 2/IMG-20260707-WA0006.jpg',
      '/images/apartments/cataleya 2/IMG-20260707-WA0007.jpg',
    ],
  },
]

function renameIn(text: string | null, oldNames: string[], name: string): string | null {
  if (!text) return text
  return oldNames.reduce(
    (acc, old) => acc.replace(new RegExp(`(The )?${old}`, 'g'), name),
    text.replace('Lumiere Apartment takes its name from', 'Lumiere Apartment is known for')
  )
}

async function main() {
  const updates = await Promise.all(apartments.map(async (apartment) => {
    const current = await prisma.apartment.findFirst({
      where: {
        OR: [
          { slug: { in: apartment.aliases } },
          { name: { in: [...apartment.oldNames, apartment.name] } },
        ],
      },
    })

    if (!current) throw new Error(`Could not find apartment record for ${apartment.name}.`)
    return { current, apartment }
  }))

  await prisma.$transaction(updates.map(({ current, apartment }) =>
    prisma.apartment.update({
      where: { id: current.id },
      data: {
        name: apartment.name,
        pricePerNight: apartment.pricePerNight,
        images: apartment.images,
        tagline: renameIn(current.tagline, apartment.oldNames, apartment.name),
        description: renameIn(current.description, apartment.oldNames, apartment.name) ?? current.description,
        longDescription: renameIn(current.longDescription, apartment.oldNames, apartment.name),
      },
    })
  ))

  for (const { apartment } of updates) {
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
