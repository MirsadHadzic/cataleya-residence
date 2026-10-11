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
    <form action={action} className="bg-white border border-gray-200 p-4 sm:p-6 md:p-8 space-y-5">

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
        <h3 className="font-serif text-lg text-charcoal">Općenito</h3>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Naziv stranice</label>
        <input name="siteName" type="text" required defaultValue={defaults.siteName} className={inp} />
        {err.siteName && <p className="text-red-500 text-xs mt-1">{err.siteName[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Valuta</label>
        <select name="currency" defaultValue={defaults.currency} className={inp}>
          <option value="EUR">EUR (Euro)</option>
          <option value="USD">USD (US Dollar)</option>
          <option value="BAM">BAM (Konvertibilna marka)</option>
        </select>
      </div>

      <div className="pb-4 pt-2 border-b border-gray-100">
        <h3 className="font-serif text-lg text-charcoal">Kontakt</h3>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Kontakt e-mail</label>
        <input name="contactEmail" type="email" required defaultValue={defaults.contactEmail} className={inp} />
        {err.contactEmail && <p className="text-red-500 text-xs mt-1">{err.contactEmail[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">E-mail za obavijesti o rezervacijama</label>
        <input name="bookingEmail" type="email" required defaultValue={defaults.bookingEmail} className={inp} />
        <p className="text-xs text-gray-400 mt-1 font-light">Na ovu adresu stižu novi zahtjevi za rezervaciju.</p>
        {err.bookingEmail && <p className="text-red-500 text-xs mt-1">{err.bookingEmail[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Broj telefona</label>
        <input name="phoneNumber" type="tel" required defaultValue={defaults.phoneNumber} className={inp} />
        {err.phoneNumber && <p className="text-red-500 text-xs mt-1">{err.phoneNumber[0]}</p>}
      </div>

      <div className="pb-4 pt-2 border-b border-gray-100">
        <h3 className="font-serif text-lg text-charcoal">Poruke</h3>
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">WhatsApp broj</label>
        <input name="whatsappNumber" type="tel" required defaultValue={defaults.whatsappNumber}
          placeholder="+387603088762" className={inp} />
        <p className="text-xs text-gray-400 mt-1 font-light">Unesite pozivni broj države, bez razmaka.</p>
        {err.whatsappNumber && <p className="text-red-500 text-xs mt-1">{err.whatsappNumber[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Viber broj</label>
        <input name="viberNumber" type="tel" required defaultValue={defaults.viberNumber}
          placeholder="+387603088762" className={inp} />
        {err.viberNumber && <p className="text-red-500 text-xs mt-1">{err.viberNumber[0]}</p>}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-sm font-sans hover:bg-charcoal-light transition-colors disabled:opacity-60">
          {pending && <Loader2 size={14} className="animate-spin" />}
          Sačuvaj postavke
        </button>
      </div>
    </form>
  )
}
