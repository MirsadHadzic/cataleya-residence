// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Cataleya Residence -- Luxury Apartments in Sarajevo',
    template: '%s | Cataleya Residence Sarajevo',
  },
  description:
    'Discover Sarajevo through the lens of luxury living. Cataleya Residence offers three impeccably designed apartments in the heart of the city.',
  keywords: [
    'luxury apartments sarajevo',
    'boutique residence sarajevo',
    'cataleya residence',
    'luxury accommodation sarajevo',
    'sarajevo luxury stay',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Cataleya Residence',
    title: 'Cataleya Residence -- Luxury Apartments in Sarajevo',
    description: 'Three impeccably designed luxury apartments in the heart of Sarajevo.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
