// components/admin/DeleteSeasonButton.tsx
'use client'

import { useTransition } from 'react'
import { deleteSeasonPrice } from '@/actions/adminBooking'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteSeasonButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => { if (!confirm('Obrisati ovu sezonu?')) return; start(() => deleteSeasonPrice(id)) }}
      disabled={pending}
      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Obriši"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}
