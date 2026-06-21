// components/admin/LoginForm.tsx
'use client'

import { useActionState, useEffect } from 'react'
import { loginAction } from '@/actions/auth'
import { AlertCircle, Lock, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const init = { success: false, message: '' }

export function LoginForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState(loginAction, init)

  useEffect(() => {
    if (state.success) {
      router.push('/admin')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <form action={action} className="space-y-6">
      {state.message && !state.success && (
        <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-none animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-sans font-light text-red-300">{state.message}</p>
        </div>
      )}

      {/* Username field */}
      <div className="space-y-2">
        <label htmlFor="login-username" className="block text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-gold">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <User size={16} strokeWidth={1.5} />
          </span>
          <input
            id="login-username"
            name="username"
            type="text"
            required
            defaultValue="admin"
            className="w-full bg-white/5 border border-white/10 hover:border-gold/30 focus:border-gold px-10 py-3.5 text-sm font-sans font-light text-white placeholder:text-white/20 focus:outline-none transition-all duration-300"
            placeholder="Username"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-gold">
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Lock size={16} strokeWidth={1.5} />
          </span>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            className="w-full bg-white/5 border border-white/10 hover:border-gold/30 focus:border-gold px-10 py-3.5 text-sm font-sans font-light text-white placeholder:text-white/20 focus:outline-none transition-all duration-300"
            placeholder="Password"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        id="login-submit-button"
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-white text-xs font-sans uppercase font-medium tracking-[0.2em] py-4 transition-all duration-300 disabled:opacity-50 hover:shadow-luxury-lg cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin text-white" />
            Authenticating...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
