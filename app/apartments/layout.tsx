// app/apartments/layout.tsx
// Shared layout for all /apartments/* routes.
// Header, Footer and WhatsApp button are rendered here once.

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

export default function ApartmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
