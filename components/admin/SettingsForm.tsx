// components/admin/SettingsForm.tsx
'use client'

import { useActionState } from 'react'
import { saveSettings, SettingsState } from '@/actions/settings'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface Defaults {
  siteName: string; contactEmail: string; phoneNumber: string
  whatsappNumber: string; viberNumber: string; bookingEmail: string; currency: string
}

const init: SettingsState = { success: false, message: '' }
const inp = 'w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold font-sans font-light'

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, action, pending] = useActionState(saveSettings, init)
  const err = state.errors ?? {}

  return (
    <form action={action} className="bg-white border border-gray-200 p-8 space-y-5">

      {state.message && (
        <div className={`flex items-start gap-2 p-3 border ${state.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          {state.success
            ? <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
            : <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          }
          <p className={`text-xs font-sans ${state.success ? 'text-green-700' : 'text-red-600'}`}>{state.message}</p>
        </div>
      )}

      <div className="pb-4 border-b border-gray-100">
        <h3 className="font-serif text-lg text-charcoal">General</h3>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Site Name</label>
        <input name="siteName" type="text" required defaultValue={defaults.siteName} className={inp} />
        {err.siteName && <p className="text-red-500 text-xs mt-1">{err.siteName[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Currency</label>
        <select name="currency" defaultValue={defaults.currency} className={inp}>
          <option value="EUR">EUR (Euro)</option>
          <option value="USD">USD (US Dollar)</option>
          <option value="BAM">BAM (Bosnian Mark)</option>
        </select>
      </div>

      <div className="pb-4 pt-2 border-b border-gray-100">
        <h3 className="font-serif text-lg text-charcoal">Contact</h3>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Contact Email</label>
        <input name="contactEmail" type="email" required defaultValue={defaults.contactEmail} className={inp} />
        {err.contactEmail && <p className="text-red-500 text-xs mt-1">{err.contactEmail[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Booking Notification Email</label>
        <input name="bookingEmail" type="email" required defaultValue={defaults.bookingEmail} className={inp} />
        <p className="text-xs text-gray-400 mt-1 font-light">Receives new booking request notifications.</p>
        {err.bookingEmail && <p className="text-red-500 text-xs mt-1">{err.bookingEmail[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
        <input name="phoneNumber" type="tel" required defaultValue={defaults.phoneNumber} className={inp} />
        {err.phoneNumber && <p className="text-red-500 text-xs mt-1">{err.phoneNumber[0]}</p>}
      </div>

      <div className="pb-4 pt-2 border-b border-gray-100">
        <h3 className="font-serif text-lg text-charcoal">Messaging</h3>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">WhatsApp Number</label>
        <input name="whatsappNumber" type="tel" required defaultValue={defaults.whatsappNumber}
          placeholder="+387603088762" className={inp} />
        <p className="text-xs text-gray-400 mt-1 font-light">Include country code, no spaces.</p>
        {err.whatsappNumber && <p className="text-red-500 text-xs mt-1">{err.whatsappNumber[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Viber Number</label>
        <input name="viberNumber" type="tel" required defaultValue={defaults.viberNumber}
          placeholder="+387603088762" className={inp} />
        {err.viberNumber && <p className="text-red-500 text-xs mt-1">{err.viberNumber[0]}</p>}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60">
          {pending && <Loader2 size={14} className="animate-spin" />}
          Save Settings
        </button>
      </div>
    </form>
  )
}
