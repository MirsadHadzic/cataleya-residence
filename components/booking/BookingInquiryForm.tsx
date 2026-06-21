'use client'

import { useActionState, useState, useCallback } from 'react'
import { submitBookingInquiry, BookingFormState } from '@/actions/booking'
import { CheckCircle, AlertCircle, Loader2, MessageCircle, Phone } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/utils'

// --- Constants ---------------------------------------------------------------

const VIBER = 'viber://chat?number=%2B387603088762'
const PHONE = 'tel:+387603088762'

// --- Props -------------------------------------------------------------------

interface Props {
  apartmentId: string
  apartmentName: string
  maxGuests: number
  pricePerNight: number
}

// --- Helpers -----------------------------------------------------------------

function getTodayTomorrow() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { today: fmt(today), tomorrow: fmt(tomorrow) }
}

// "14 March 2026"
function formatEuropean(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// "14 Mar"
function formatShort(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function getNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Viber SVG icon (not in lucide)
function ViberIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C6.48 2 2 6.02 2 11c0 2.7 1.14 5.14 2.99 6.89L4 22l4.23-1.11A10.03 10.03 0 0 0 12 22c5.52 0 10-4.02 10-9s-4.48-9-10-9z" />
      <path d="M8 10.5c.5 2 2 3.5 4 4" />
      <path d="M14.5 15c.28-.1.54-.24.76-.44.48-.44.74-1.06.74-1.7v-.36c0-.96-.78-1.5-1.5-1.5h-.5" />
    </svg>
  )
}

// --- Initial state -----------------------------------------------------------

const initialState: BookingFormState = {
  success: false,
  message: '',
}

// --- Component ---------------------------------------------------------------

export function BookingInquiryForm({
  apartmentId,
  apartmentName,
  maxGuests,
  pricePerNight,
}: Props) {
  const [state, formAction, isPending] = useActionState(submitBookingInquiry, initialState)
  const { today, tomorrow } = getTodayTomorrow()

  // Controlled date/guest state for stay summary
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [guests, setGuests] = useState(1)

  // Submitted values (captured on submit for success state WhatsApp link)
  const [submitted, setSubmitted] = useState({
    checkIn: today,
    checkOut: tomorrow,
    guests: 1,
  })

  const nights = getNights(checkIn, checkOut)
  const totalPrice = nights * pricePerNight
  const showSummary = nights > 0 && checkIn && checkOut && checkIn < checkOut

  // Build WhatsApp prefilled message for success state
  const successWhatsApp = useCallback(() => {
    const msg =
      `Hello, I just submitted a booking request for ${apartmentName}.\n` +
      `Check-in: ${formatEuropean(submitted.checkIn)}\n` +
      `Check-out: ${formatEuropean(submitted.checkOut)}\n` +
      `Guests: ${submitted.guests}\n` +
      `Could you please confirm availability?`
    return getWhatsAppUrl(msg)
  }, [submitted, apartmentName])

  const isUnavailableError =
    !state.success &&
    state.message === 'Selected dates are not available.'

  const err = state.errors || {}

  // --- Success state ---------------------------------------------------------
  if (state.success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center py-4 gap-3">
          <CheckCircle size={36} className="text-gold" strokeWidth={1.5} />
          <h3 className="font-serif text-xl text-charcoal">Request sent successfully</h3>
          <p className="text-taupe text-sm font-sans font-light leading-relaxed">
            We will contact you shortly to confirm availability and details.
            For faster response, contact us directly on WhatsApp.
          </p>
          <p className="text-taupe/70 text-xs font-sans font-light">
            Typically responds within 10--15 minutes
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="border-t border-champagne-dark pt-5">
          <a
            href={successWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-xs font-sans tracking-widest uppercase transition-opacity hover:opacity-90"
          >
            <MessageCircle size={14} strokeWidth={2} />
            Confirm via WhatsApp
          </a>
        </div>
      </div>
    )
  }

  // --- Form state ------------------------------------------------------------
  return (
    <div className="space-y-5">
      <form
        action={(formData) => {
          setSubmitted({ checkIn, checkOut, guests })
          formAction(formData)
        }}
        noValidate
        className="space-y-4"
      >
        <input type="hidden" name="apartmentId" value={apartmentId} />

        {/* Unavailability error with contact buttons */}
        {isUnavailableError && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 border border-champagne-dark bg-champagne/30">
              <AlertCircle size={14} className="text-gold mt-0.5 flex-shrink-0" />
              <p className="text-charcoal text-xs font-sans font-light leading-relaxed">
                These dates are unavailable. Please select different dates or contact us for assistance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 border border-champagne-dark text-taupe hover:border-gold hover:text-gold transition-all duration-300 text-xs font-sans"
              >
                <MessageCircle size={13} strokeWidth={1.5} />
                WhatsApp
              </a>
              <a
                href={VIBER}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-champagne-dark text-taupe hover:border-gold hover:text-gold transition-all duration-300 text-xs font-sans"
              >
                <ViberIcon />
                Viber
              </a>
            </div>
          </div>
        )}

        {/* Generic global error (not unavailability) */}
        {state.message && !state.success && !isUnavailableError && !Object.keys(err).length && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-xs font-sans font-light">{state.message}</p>
          </div>
        )}

        {/* Check In / Check Out */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-sans tracking-widest uppercase text-taupe mb-1.5">
              Check In
            </label>
            <input
              name="checkIn"
              type="date"
              required
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="input-luxury-box w-full text-xs"
            />
            {err.checkIn && (
              <p className="text-red-500 text-xs mt-1">{err.checkIn[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-sans tracking-widest uppercase text-taupe mb-1.5">
              Check Out
            </label>
            <input
              name="checkOut"
              type="date"
              required
              min={checkIn || tomorrow}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="input-luxury-box w-full text-xs"
            />
            {err.checkOut && (
              <p className="text-red-500 text-xs mt-1">{err.checkOut[0]}</p>
            )}
          </div>
        </div>

        {/* Stay summary */}
        {showSummary && (
          <div className="bg-champagne/40 border border-champagne-dark px-4 py-3 space-y-1">
            <p className="text-xs font-sans tracking-widest uppercase text-taupe mb-2">
              Your Stay
            </p>
            <p className="font-serif text-charcoal text-sm">
              {formatShort(checkIn)} &mdash; {formatShort(checkOut)}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-taupe text-xs font-sans font-light">
                {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="font-serif text-charcoal text-sm">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Guests */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-sans tracking-widest uppercase text-taupe">
              Guests
            </label>
            <span className="text-xs font-sans font-light" style={{ color: '#8A7F70' }}>
              Up to {maxGuests} guests
            </span>
          </div>
          <select
            name="guests"
            className="input-luxury-box w-full"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
          {/* Master bedroom unlock: shown when apt has >6 capacity and guest selects >6 */}
          {maxGuests > 6 && guests > 6 && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2" style={{ background: '#F8F5EF', border: '1px solid #E8E0D2' }}>
              <span className="text-xs" style={{ color: '#C8A45C' }}>&#9733;</span>
              <p className="text-xs font-sans font-light" style={{ color: '#1A1A1A' }}>
                Master bedroom included
                <span className="ml-1 font-light" style={{ color: '#8A7F70' }}>
                  -- additional bedroom unlocked
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-champagne-dark" />

        {/* Full Name */}
        <div>
          <label className="block text-xs font-sans tracking-widest uppercase text-taupe mb-1.5">
            Full Name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className="input-luxury-box w-full"
          />
          {err.name && (
            <p className="text-red-500 text-xs mt-1">{err.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-sans tracking-widest uppercase text-taupe mb-1.5">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="input-luxury-box w-full"
          />
          {err.email && (
            <p className="text-red-500 text-xs mt-1">{err.email[0]}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-sans tracking-widest uppercase text-taupe mb-1.5">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue="+387 "
            placeholder="+387 60 30 88 762"
            className="input-luxury-box w-full"
          />
          {err.phone && (
            <p className="text-red-500 text-xs mt-1">{err.phone[0]}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-sans tracking-widest uppercase text-taupe mb-1.5">
            Message{' '}
            <span className="normal-case tracking-normal text-taupe/60">(optional)</span>
          </label>
          <textarea
            name="message"
            rows={3}
            placeholder="Special requests or questions..."
            className="input-luxury-box w-full resize-none"
          />
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 text-white text-xs font-sans tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
          style={{
            background: '#C8A45C',
            padding: '14px 24px',
            boxShadow: '0 2px 8px rgba(200, 164, 92, 0.35)',
          }}
          onMouseEnter={(e) => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = '#B8934E' }}
          onMouseLeave={(e) => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = '#C8A45C' }}
        >
          {isPending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Reserve Your Stay'
          )}
        </button>

        {/* Trust element */}
        <p className="text-center text-xs font-sans font-light" style={{ color: '#8A7F70' }}>
          No payment required now
        </p>
      </form>

      {/* Contact shortcuts */}
      <div className="pt-2 border-t border-champagne-dark">
        <p className="text-xs font-sans tracking-widest uppercase text-taupe text-center mb-3">
          Or contact us instantly
        </p>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 py-3 border border-champagne-dark hover:border-gold hover:text-gold transition-all duration-300 text-taupe"
            title="WhatsApp"
          >
            <MessageCircle size={16} strokeWidth={1.5} />
            <span className="text-xs font-sans font-light">WhatsApp</span>
          </a>
          <a
            href={VIBER}
            className="flex flex-col items-center gap-1.5 py-3 border border-champagne-dark hover:border-gold hover:text-gold transition-all duration-300 text-taupe"
            title="Viber"
          >
            <ViberIcon />
            <span className="text-xs font-sans font-light">Viber</span>
          </a>
          <a
            href={PHONE}
            className="flex flex-col items-center gap-1.5 py-3 border border-champagne-dark hover:border-gold hover:text-gold transition-all duration-300 text-taupe"
            title="Call us"
          >
            <Phone size={16} strokeWidth={1.5} />
            <span className="text-xs font-sans font-light">Call</span>
          </a>
        </div>
      </div>
    </div>
  )
}
