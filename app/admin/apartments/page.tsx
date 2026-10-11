// app/admin/apartments/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Eye } from 'lucide-react'
import { DeleteApartmentButton } from '@/components/admin/DeleteApartmentButton'

function fmtEur(n: number) {
  return new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n)
}

export default async function AdminApartmentsPage() {
  const apartments = await prisma.apartment.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Apartmani</h2>
          <p className="text-gray-500 text-sm font-sans font-light mt-1">{apartments.length} ukupno</p>
        </div>
        <Link href="/admin/apartments/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors">
          <Plus size={15} />
          Dodaj apartman
        </Link>
      </div>

      {apartments.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center text-gray-400 text-sm font-sans">
          Još nema apartmana.
        </div>
      ) : (
        <div className="hidden lg:block bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Apartman', 'Cijena / noć', 'Gosti', 'Status', 'Radnje'].map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-sans text-gray-400 uppercase tracking-widest whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {apartments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      {apt.images[0] && (
                        <div className="relative w-14 h-10 overflow-hidden flex-shrink-0">
                          <Image src={apt.images[0]} alt={apt.name} fill className="object-cover" sizes="56px" />
                        </div>
                      )}
                      <div>
                        <div className="font-sans font-500 text-sm text-charcoal">{apt.name}</div>
                        {apt.internalName && (
                          <div className="text-gold text-xs font-mono font-light">{apt.internalName}</div>
                        )}
                        <div className="text-gray-400 text-xs font-light">{apt.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-serif text-sm text-charcoal">{fmtEur(apt.pricePerNight)}</td>
                  <td className="px-5 py-4 text-sm font-sans text-gray-600">Najviše {apt.maxGuests}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-sans ${apt.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {apt.active ? 'Aktivan' : 'Skriven'}
                    </span>
                    {apt.featured && (
                      <span className="ml-2 inline-flex px-2.5 py-1 text-xs font-sans bg-gold/10 text-gold border border-gold/20">Istaknut</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/apartments/${apt.slug}`} target="_blank"
                        className="p-1.5 text-gray-400 hover:text-charcoal transition-colors" title="Pogledaj na stranici">
                        <Eye size={15} />
                      </Link>
                      <Link href={`/admin/apartments/${apt.id}`}
                        className="p-1.5 text-gray-400 hover:text-gold transition-colors" title="Uredi">
                        <Pencil size={15} />
                      </Link>
                      <DeleteApartmentButton id={apt.id} name={apt.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {apartments.length > 0 && (
        <div className="lg:hidden space-y-3">
          {apartments.map((apt) => (
            <div key={apt.id} className="bg-white border border-gray-200 p-4 flex gap-4">
              {apt.images[0] && (
                <div className="relative w-20 h-20 overflow-hidden flex-shrink-0">
                  <Image src={apt.images[0]} alt={apt.name} fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-sans text-sm text-charcoal">{apt.name}</div>
                <div className="text-gold text-sm mt-1">{fmtEur(apt.pricePerNight)} / noć</div>
                <div className="text-xs text-gray-400 mt-1">{apt.active ? 'Aktivan' : 'Skriven'} · do {apt.maxGuests} gostiju</div>
                <div className="flex items-center gap-3 mt-2">
                  <Link href={`/apartments/${apt.slug}`} target="_blank" className="text-xs text-gray-500 hover:text-charcoal">Pogledaj</Link>
                  <Link href={`/admin/apartments/${apt.id}`} className="text-xs text-gold">Uredi</Link>
                  <DeleteApartmentButton id={apt.id} name={apt.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
