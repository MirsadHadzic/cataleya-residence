// app/admin/settings/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findFirst()

  const defaults = {
    siteName: settings?.siteName ?? 'Cataleya Residence',
    contactEmail: settings?.contactEmail ?? 'sarajevotrips@gmail.com',
    phoneNumber: settings?.phoneNumber ?? '+387 61 000 000',
    whatsappNumber: settings?.whatsappNumber ?? '+387603088762',
    viberNumber: settings?.viberNumber ?? '+387603088762',
    bookingEmail: settings?.bookingEmail ?? 'sarajevotrips@gmail.com',
    currency: settings?.currency ?? 'EUR',
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal mb-1">Settings</h2>
        <p className="text-gray-500 text-sm font-sans font-light">Global site configuration.</p>
      </div>
      <SettingsForm defaults={defaults} />
    </div>
  )
}
