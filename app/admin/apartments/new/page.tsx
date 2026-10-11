// app/admin/apartments/new/page.tsx
import { ApartmentForm } from '@/components/admin/ApartmentForm'
import { createApartmentAction } from '@/actions/apartments'

export default function NewApartmentPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Dodaj apartman</h2>
        <p className="text-gray-500 text-sm font-sans font-light">Kreirajte novi oglas apartmana.</p>
      </div>
      <ApartmentForm action={createApartmentAction} submitLabel="Kreiraj apartman" />
    </div>
  )
}
