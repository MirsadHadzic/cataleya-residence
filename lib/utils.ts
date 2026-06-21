export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

// Centralised WhatsApp helper -- used everywhere in the project.
// Phone number is read from env; falls back to the correct Cataleya number.
const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '387603088762'

export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_PHONE}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

// Alias used by MobileBookingBar
export function getWhatsAppBookingUrl(apartmentName: string): string {
  return getWhatsAppUrl(
    `Hello, I am interested in booking the ${apartmentName} at Cataleya Residence. Could you confirm availability?`
  )
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(price)
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date)
}