// app/admin/pricing/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { SeasonPriceForm } from '@/components/admin/SeasonPriceForm'
import { DeleteSeasonButton } from '@/components/admin/DeleteSeasonButton'
import { Tag } from 'lucide-react'

function fmtDate(d: Date) {
  return d.toLocaleDateString('bs-BA', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtEur(n: number) {
  return new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n)
}

export default async function AdminPricingPage() {
  const [apartments, seasons] = await Promise.all([
    prisma.apartment.findMany({ where: { active: true }, select: { id: true, name: true, pricePerNight: true }, orderBy: { name: 'asc' } }),
    prisma.seasonPrice.findMany({ orderBy: { startDate: 'asc' }, include: { apartment: { select: { name: true } } } }),
  ])

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Sezonske cijene</h2>
        <p className="text-gray-500 text-sm font-sans font-light">
          Promijenite osnovne cijene apartmana za odabrane datume.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create form */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="font-serif text-lg text-charcoal mb-5">Dodaj sezonu</h3>
          <SeasonPriceForm apartments={apartments} />
        </div>

        {/* Base prices reference */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="font-serif text-lg text-charcoal mb-5">Osnovne cijene</h3>
          <div className="space-y-3">
            {apartments.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-sans text-charcoal">{a.name}</span>
                <span className="font-serif text-sm text-gold">{fmtEur(a.pricePerNight)} / noć</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasons table */}
      {seasons.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Tag size={28} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm font-sans">Nema definisanih sezona.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Apartman', 'Naziv', 'Početak', 'Kraj', 'Cijena / noć', 'Radnje'].map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-sans text-gray-400 uppercase tracking-widest">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {seasons.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 text-sm font-sans text-charcoal">{s.apartment.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold/10 text-gold text-xs font-sans">
                      <Tag size={10} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-sans text-gray-600">{fmtDate(s.startDate)}</td>
                  <td className="px-5 py-4 text-sm font-sans text-gray-600">{fmtDate(s.endDate)}</td>
                  <td className="px-5 py-4 font-serif text-sm text-charcoal">{fmtEur(s.pricePerNight)}</td>
                  <td className="px-5 py-4">
                    <DeleteSeasonButton id={s.id} />
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {seasons.map((season) => (
              <div key={season.id} className="bg-white border border-gray-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-sans text-charcoal">{season.apartment.name}</div>
                    <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-gold/10 text-gold text-xs font-sans">
                      <Tag size={10} />
                      {season.label}
                    </div>
                  </div>
                  <DeleteSeasonButton id={season.id} />
                </div>
                <div className="text-xs text-gray-500">
                  {fmtDate(season.startDate)} – {fmtDate(season.endDate)}
                </div>
                <div className="font-serif text-sm text-charcoal">{fmtEur(season.pricePerNight)} / noć</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
