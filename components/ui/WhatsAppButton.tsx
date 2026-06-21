// components/ui/WhatsAppButton.tsx
'use client'

import { MessageCircle } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/utils'

export function WhatsAppButton() {
  const url = getWhatsAppUrl(
    "Hello, I'm interested in staying at Cataleya Residence. Could you help me with availability?"
  )

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 z-50 flex items-center gap-2 bg-[#25D366] text-white shadow-luxury-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
      style={{ borderRadius: '50px', padding: '14px 20px' }}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={20} strokeWidth={2} />
      <span className="text-xs font-sans font-500 tracking-wide hidden sm:block">
        WhatsApp Us
      </span>
    </a>
  )
}
