// components/apartments/AmenitiesList.tsx
import { Check } from 'lucide-react'

interface Props {
  amenities: string[]
}

export function AmenitiesList({ amenities }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {amenities.map((amenity) => (
        <div key={amenity} className="flex items-start gap-3 py-2 border-b border-champagne/60">
          <Check size={13} className="text-gold mt-0.5 flex-shrink-0" strokeWidth={2.5} />
          <span className="text-charcoal-muted text-sm font-light">{amenity}</span>
        </div>
      ))}
    </div>
  )
}
