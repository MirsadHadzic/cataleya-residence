// app/admin/apartments/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ApartmentForm } from '@/components/admin/ApartmentForm'
import { updateApartmentAction } from '@/actions/apartments'

interface Props { params: Promise<{ id: string }> }

export default async function EditApartmentPage({ params }: Props) {
  const { id } = await params
  const apt = await prisma.apartment.findUnique({ where: { id } })
  if (!apt) notFound()

  const action = async (prev: any, fd: FormData) => {
    'use server'
    return updateApartmentAction(id, prev, fd)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Edit Apartment</h2>
        <p className="text-gray-500 text-sm font-sans font-light">Update details for {apt.name}.</p>
      </div>
      <ApartmentForm
        action={action}
        initialData={{
          name: apt.name, internalName: apt.internalName ?? '', slug: apt.slug, tagline: apt.tagline ?? '',
          description: apt.description, longDescription: apt.longDescription ?? '',
          pricePerNight: apt.pricePerNight, maxGuests: apt.maxGuests,
          bedrooms: apt.bedrooms, bathrooms: apt.bathrooms, size: apt.size ?? undefined,
          location: apt.location, amenities: apt.amenities, images: apt.images,
          featured: apt.featured, active: apt.active,
        }}
        submitLabel="Save Changes"
      />
    </div>
  )
}
