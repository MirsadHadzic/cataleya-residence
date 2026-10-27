// app/layout.tsx
import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Cataleya Residence -- Luxury Apartments in Sarajevo',
    template: '%s | Cataleya Residence Sarajevo',
  },
  description:
    'Discover Sarajevo through the lens of luxury living. Cataleya Residence offers three impeccably designed apartments in the heart of the city.',
  verification: {
    google: 'lMT31cZK1F0MDUxNRymcDWXwSCQ8ssv7IsvIi1fImyw',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
        <script>function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"4f19648551f0c7dfa5855241dd388112"})});</script>
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
