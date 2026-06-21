// app/admin/pricing/page.tsx
import { prisma } from '@/lib/prisma'
import { SeasonPriceForm } from '@/components/admin/SeasonPriceForm'
import { DeleteSeasonButton } from '@/components/admin/DeleteSeasonButton'
import { Tag } from 'lucide-react'

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtEur(n: number) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n)
}

export default async function AdminPricingPage() {
  const [apartments, seasons] = await Promise.all([
    prisma.apartment.findMany({ where: { active: true }, select: { id: true, name: true, pricePerNight: true }, orderBy: { name: 'asc' } }),
    prisma.seasonPrice.findMany({ orderBy: { startDate: 'asc' }, include: { apartment: { select: { name: true } } } }),
  ])

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Seasonal Pricing</h2>
        <p className="text-gray-500 text-sm font-sans font-light">
          Override base apartment prices for specific date ranges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create form */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="font-serif text-lg text-charcoal mb-5">Add Season</h3>
          <SeasonPriceForm apartments={apartments} />
        </div>

        {/* Base prices reference */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="font-serif text-lg text-charcoal mb-5">Base Prices</h3>
          <div className="space-y-3">
            {apartments.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-sans text-charcoal">{a.name}</span>
                <span className="font-serif text-sm text-gold">{fmtEur(a.pricePerNight)} / night</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasons table */}
      {seasons.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Tag size={28} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm font-sans">No seasons defined yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Apartment', 'Label', 'Start', 'End', 'Price / Night', 'Actions'].map((col) => (
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
      )}
    </div>
  )
}
