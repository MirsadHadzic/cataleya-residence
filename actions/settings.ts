// actions/settings.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/auth'

const settingsSchema = z.object({
  siteName:       z.string().min(1, 'Naziv stranice je obavezan.'),
  contactEmail:   z.string().email('Unesite ispravnu e-mail adresu.'),
  phoneNumber:    z.string().min(5, 'Broj telefona je obavezan.'),
  whatsappNumber: z.string().min(5, 'WhatsApp broj je obavezan.'),
  viberNumber:    z.string().min(5, 'Viber broj je obavezan.'),
  bookingEmail:   z.string().email('Unesite ispravnu adresu za obavijesti.'),
  currency:       z.string().min(1).default('EUR'),
})

export type SettingsState = { success: boolean; message: string; errors?: Record<string, string[]> }

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await verifyAdminSession()
  const raw = Object.fromEntries(formData.entries())
  const validated = settingsSchema.safeParse(raw)

  if (!validated.success) {
    return { success: false, message: 'Ispravite unesene podatke.', errors: validated.error.flatten().fieldErrors }
  }

  // Upsert -- create if not exists, update if exists
  const existing = await prisma.siteSettings.findFirst()

  if (existing) {
    await prisma.siteSettings.update({ where: { id: existing.id }, data: validated.data })
  } else {
    await prisma.siteSettings.create({ data: validated.data })
  }

  revalidatePath('/admin/settings')
  return { success: true, message: 'Postavke su uspješno sačuvane.' }
}