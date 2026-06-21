// app/apartments/[slug]/not-found.tsx
import Link from 'next/link'

export default function ApartmentNotFound() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <span className="label-text block mb-6">404</span>
        <h1 className="heading-lg text-charcoal mb-5">Apartment Not Found</h1>
        <p className="text-taupe font-light leading-relaxed mb-10">
          The apartment you are looking for does not exist or is no longer available.
        </p>
        <Link href="/apartments" className="btn-primary text-sm">
          View All Apartments
        </Link>
      </div>
    </div>
  )
}
