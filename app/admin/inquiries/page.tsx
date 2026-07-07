// app/admin/inquiries/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { InquiryActionButtons } from '@/components/admin/InquiryActionButtons'
import { MessageSquare } from 'lucide-react'

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtEur(n: number) {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n)
}
function getNights(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

const STATUS_LABEL: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: 'bg-amber-50 border border-amber-200',  text: 'text-amber-700',  label: 'New' },
  CONTACTED: { bg: 'bg-blue-50 border border-blue-200',    text: 'text-blue-700',   label: 'Contacted' },
  CONFIRMED: { bg: 'bg-green-50 border border-green-200',  text: 'text-green-700',  label: 'Converted' },
  CANCELLED: { bg: 'bg-gray-100 border border-gray-200',   text: 'text-gray-500',   label: 'Closed' },
}

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.bookingInquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { apartment: { select: { name: true, pricePerNight: true } } },
  })

  const counts = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'PENDING').length,
    contacted: inquiries.filter(i => i.status === 'CONTACTED').length,
    converted: inquiries.filter(i => i.status === 'CONFIRMED').length,
    closed: inquiries.filter(i => i.status === 'CANCELLED').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Booking Inquiries</h2>
        <p className="text-gray-500 text-sm font-sans font-light">{counts.total} total</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New', value: counts.new, color: 'text-amber-600' },
          { label: 'Contacted', value: counts.contacted, color: 'text-blue-600' },
          { label: 'Converted', value: counts.converted, color: 'text-green-600' },
          { label: 'Closed', value: counts.closed, color: 'text-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 p-5">
            <div className={`font-serif text-3xl mb-1 ${color}`}>{value}</div>
            <div className="text-gray-400 text-xs font-sans uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Table -- desktop */}
      {inquiries.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <MessageSquare size={28} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm font-sans">No inquiries yet.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Guest', 'Apartment', 'Dates', 'Est. Total', 'Message', 'Status', 'Actions'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-sans text-gray-400 uppercase tracking-widest whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inquiries.map((inq) => {
                  const nights = getNights(inq.checkIn, inq.checkOut)
                  const total = nights * inq.apartment.pricePerNight
                  const s = STATUS_LABEL[inq.status] ?? STATUS_LABEL.PENDING
                  return (
                    <tr key={inq.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-sans text-sm text-charcoal">{inq.name}</div>
                        <a href={`mailto:${inq.email}`} className="text-xs text-gold hover:underline font-light block">{inq.email}</a>
                        {inq.phone && <a href={`tel:${inq.phone}`} className="text-xs text-gray-400 font-light block">{inq.phone}</a>}
                        <div className="text-xs text-gray-400 mt-1">{fmtDate(inq.createdAt)}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-sans text-charcoal">{inq.apartment.name}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-sans text-charcoal">{fmtDate(inq.checkIn)}</div>
                        <div className="text-xs text-gray-400">to {fmtDate(inq.checkOut)}</div>
                        <div className="text-xs text-taupe">{nights}n, {inq.guests}g</div>
                      </td>
                      <td className="px-5 py-4 font-serif text-sm text-charcoal">{fmtEur(total)}</td>
                      <td className="px-5 py-4 max-w-xs">
                        {inq.message ? (
                          <p className="text-xs text-gray-500 font-light italic line-clamp-2">"{inq.message}"</p>
                        ) : <span className="text-xs text-gray-300">--</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-sans ${s.bg} ${s.text}`}>{s.label}</span>
                      </td>
                      <td className="px-5 py-4 min-w-[180px]">
                        <InquiryActionButtons
                          inquiryId={inq.id}
                          currentStatus={inq.status}
                          apartmentName={inq.apartment.name}
                          guestName={inq.name}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden space-y-3">
            {inquiries.map((inq) => {
              const nights = getNights(inq.checkIn, inq.checkOut)
              const total = nights * inq.apartment.pricePerNight
              const s = STATUS_LABEL[inq.status] ?? STATUS_LABEL.PENDING
              return (
                <div key={inq.id} className="bg-white border border-gray-200 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-sans font-500 text-sm text-charcoal">{inq.name}</div>
                      <a href={`mailto:${inq.email}`} className="text-xs text-gold font-light">{inq.email}</a>
                      <div className="text-xs text-gray-400 mt-0.5">{inq.apartment.name}</div>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-sans flex-shrink-0 ${s.bg} ${s.text}`}>{s.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-sans">
                    {fmtDate(inq.checkIn)} to {fmtDate(inq.checkOut)} &bull; {nights}n &bull; {fmtEur(total)}
                  </div>
                  {inq.message && <p className="text-xs text-gray-400 italic line-clamp-2">"{inq.message}"</p>}
                  <InquiryActionButtons
                    inquiryId={inq.id}
                    currentStatus={inq.status}
                    apartmentName={inq.apartment.name}
                    guestName={inq.name}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
