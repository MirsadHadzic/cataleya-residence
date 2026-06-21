// components/admin/ApartmentForm.tsx
'use client'

import { useActionState, useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export type AptFormState = { success: boolean; message: string; errors?: Record<string, string[]> }

interface Props {
  action: (prev: AptFormState, fd: FormData) => Promise<AptFormState>
  initialData?: {
    name?: string; internalName?: string; slug?: string; tagline?: string; description?: string
    longDescription?: string; pricePerNight?: number; maxGuests?: number
    bedrooms?: number; bathrooms?: number; size?: number; location?: string
    amenities?: string[]; images?: string[]; featured?: boolean; active?: boolean
  }
  submitLabel?: string
}

const init: AptFormState = { success: false, message: '' }
const inp = 'w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold font-sans font-light'

export function ApartmentForm({ action, initialData = {}, submitLabel = 'Save Apartment' }: Props) {
  const [state, formAction, pending] = useActionState(action, init)
  const err = state.errors ?? {}

  // Auto-generate slug from name
  const [name, setName] = useState(initialData.name ?? '')
  const [slug, setSlug] = useState(initialData.slug ?? '')
  const [autoSlug, setAutoSlug] = useState(!initialData.slug)

  useEffect(() => {
    if (autoSlug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }, [name, autoSlug])

  return (
    <form action={formAction} className="bg-white border border-gray-200 p-8 space-y-6">

      {state.message && (
        <div className={`flex items-start gap-2 p-3 border ${state.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <AlertCircle size={14} className={`mt-0.5 flex-shrink-0 ${state.success ? 'text-green-500' : 'text-red-500'}`} />
          <p className={`text-xs font-sans ${state.success ? 'text-green-700' : 'text-red-600'}`}>{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Name *</label>
          <input name="name" type="text" required value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Cataleya One" className={inp} />
          {err.name && <p className="text-red-500 text-xs mt-1">{err.name[0]}</p>}
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Internal Name <span className="normal-case tracking-normal text-gray-400">(admin only)</span>
          </label>
          <input name="internalName" type="text" defaultValue={initialData.internalName ?? ''}
            placeholder="CAT-01" className={inp} />
          <p className="text-gray-400 text-xs mt-1 font-light">Used internally for reference. Not shown to guests.</p>
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Slug *</label>
          <input name="slug" type="text" required value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false) }}
            placeholder="prestige-suite" className={inp} />
          {err.slug && <p className="text-red-500 text-xs mt-1">{err.slug[0]}</p>}
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Tagline</label>
          <input name="tagline" type="text" defaultValue={initialData.tagline ?? ''}
            placeholder="Old Town Views - Refined Elegance" className={inp} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Short Description *</label>
          <textarea name="description" rows={3} required defaultValue={initialData.description ?? ''}
            placeholder="A masterfully designed suite..." className={`${inp} resize-none`} />
          {err.description && <p className="text-red-500 text-xs mt-1">{err.description[0]}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Full Description</label>
          <textarea name="longDescription" rows={6} defaultValue={initialData.longDescription ?? ''}
            placeholder="Detailed apartment description..." className={`${inp} resize-none`} />
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Price / Night (EUR) *</label>
          <input name="pricePerNight" type="number" step="0.01" required
            defaultValue={initialData.pricePerNight ?? ''} placeholder="280" className={inp} />
          {err.pricePerNight && <p className="text-red-500 text-xs mt-1">{err.pricePerNight[0]}</p>}
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Max Guests *</label>
          <input name="maxGuests" type="number" min="1" max="20" required
            defaultValue={initialData.maxGuests ?? 2} className={inp} />
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Bedrooms</label>
          <input name="bedrooms" type="number" min="0" defaultValue={initialData.bedrooms ?? 1} className={inp} />
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Bathrooms</label>
          <input name="bathrooms" type="number" min="1" defaultValue={initialData.bathrooms ?? 1} className={inp} />
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Size (m2)</label>
          <input name="size" type="number" min="1" defaultValue={initialData.size ?? ''} placeholder="85" className={inp} />
        </div>

        <div>
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Location *</label>
          <input name="location" type="text" required defaultValue={initialData.location ?? ''}
            placeholder="Bascarsija, Sarajevo" className={inp} />
          {err.location && <p className="text-red-500 text-xs mt-1">{err.location[0]}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Amenities <span className="normal-case tracking-normal text-gray-400">(comma-separated)</span>
          </label>
          <textarea name="amenities" rows={3} defaultValue={(initialData.amenities ?? []).join(', ')}
            placeholder="Free Wi-Fi, Air Conditioning, King Bed, ..." className={`${inp} resize-none`} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
            Image URLs <span className="normal-case tracking-normal text-gray-400">(one per line)</span>
          </label>
          <textarea name="images" rows={5} defaultValue={(initialData.images ?? []).join('\n')}
            placeholder="https://images.unsplash.com/..." className={`${inp} resize-none font-mono text-xs`} />
          {/* Image preview */}
          {(initialData.images ?? []).length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {(initialData.images ?? []).slice(0,4).map((url, i) => (
                <div key={i} className="relative w-16 h-12 overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input name="featured" type="checkbox" value="true"
              defaultChecked={initialData.featured ?? false} className="accent-gold" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input name="active" type="checkbox" value="true"
              defaultChecked={initialData.active ?? true} className="accent-gold" />
            Active (visible on site)
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60">
          {pending && <Loader2 size={14} className="animate-spin" />}
          {submitLabel}
        </button>
        <Link href="/admin/apartments" className="text-sm text-gray-500 hover:text-charcoal font-sans transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  )
}
