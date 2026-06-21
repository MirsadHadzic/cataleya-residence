// components/admin/BlockDatesForm.tsx
'use client'

import { useActionState } from 'react'
import { blockDates, BlockDatesState } from '@/actions/adminBooking'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface Apt { id: string; name: string }

const init: BlockDatesState = { success: false, message: '' }
const inp = 'w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold font-sans font-light'

export function BlockDatesForm({ apartments }: { apartments: Apt[] }) {
  const [state, action, pending] = useActionState(blockDates, init)
  const err = state.errors ?? {}

  return (
    <form action={action} className="space-y-4">
      {state.message && (
        <div className={`flex items-start gap-2 p-3 border ${state.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          {state.success
            ? <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
            : <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          }
          <p className={`text-xs font-sans ${state.success ? 'text-green-700' : 'text-red-600'}`}>{state.message}</p>
        </div>
      )}
      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Apartment</label>
        <select name="apartmentId" className={inp}>
          {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Start Date</label>
          <input name="startDate" type="date" required className={inp} />
          {err.startDate && <p className="text-red-500 text-xs mt-1">{err.startDate[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">End Date</label>
          <input name="endDate" type="date" required className={inp} />
          {err.endDate && <p className="text-red-500 text-xs mt-1">{err.endDate[0]}</p>}
        </div>
      </div>
      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Reason (optional)</label>
        <input name="reason" type="text" placeholder="Maintenance, owner stay..." className={inp} />
      </div>
      <button type="submit" disabled={pending}
        className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60">
        {pending && <Loader2 size={13} className="animate-spin" />}
        Block Dates
      </button>
    </form>
  )
}
