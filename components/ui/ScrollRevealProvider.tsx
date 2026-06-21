// components/ui/ScrollRevealProvider.tsx
'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

export function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  useScrollReveal()
  return <>{children}</>
}
