// app/admin/apartments/new/page.tsx
import { ApartmentForm } from '@/components/admin/ApartmentForm'
import { createApartmentAction } from '@/actions/apartments'

export default function NewApartmentPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Add Apartment</h2>
        <p className="text-gray-500 text-sm font-sans font-light">Create a new apartment listing.</p>
      </div>
      <ApartmentForm action={createApartmentAction} submitLabel="Create Apartment" />
    </div>
  )
}
