// components/admin/DeleteApartmentButton.tsx
'use client'

import { useTransition, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteApartmentAction } from '@/actions/apartments'

interface Props {
  id: string
  name: string
}

export function DeleteApartmentButton({ id, name }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    if (!confirm(`Obrisati apartman "${name}"? Ovu radnju nije moguće poništiti.`)) return

    setError(null)
    startTransition(async () => {
      try {
        await deleteApartmentAction(id)
      } catch (e) {
        console.error('Apartment deletion failed:', e)
        setError('Brisanje nije uspjelo. Pokušajte ponovo.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        title="Obriši apartman"
      >
        {isPending
          ? <Loader2 size={15} className="animate-spin text-red-400" />
          : <Trash2 size={15} />
        }
      </button>
      {error && (
        <p className="text-red-500 text-xs font-sans">{error}</p>
      )}
    </div>
  )
}
