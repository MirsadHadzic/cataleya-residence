// app/admin/bookings/new/page.tsx
import { prisma } from '@/lib/prisma'
import { ManualBookingForm } from '@/components/admin/ManualBookingForm'

export default async function NewManualBookingPage() {
  const apartments = await prisma.apartment.findMany({
    where: { active: true },
    select: { id: true, name: true, pricePerNight: true, maxGuests: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Ručna rezervacija</h2>
        <p className="text-gray-500 text-sm font-sans font-light">
          Kreirajte potvrđenu rezervaciju bez korištenja obrasca na stranici.
        </p>
      </div>
      <ManualBookingForm apartments={apartments} />
    </div>
  )
}
