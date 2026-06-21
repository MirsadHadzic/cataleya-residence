// app/page.tsx
import { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedApartments } from '@/components/home/FeaturedApartments'
import { ExperienceSection } from '@/components/home/ExperienceSection'
import { AmenitiesSection } from '@/components/home/AmenitiesSection'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { LocationSection } from '@/components/home/LocationSection'
import { CtaSection } from '@/components/home/CtaSection'

export const metadata: Metadata = {
  title: 'Cataleya Residence -- Luxury Apartments in Sarajevo',
  description:
    'Discover three impeccably designed luxury apartments in the heart of Sarajevo. Book directly for the best rates and complimentary concierge service.',
}

// Always fresh -- no caching so admin edits show immediately
export const revalidate = 0

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedApartments />
      <ExperienceSection />
      <AmenitiesSection />
      <ReviewsSection />
      <LocationSection />
      <CtaSection />
    </>
  )
}
