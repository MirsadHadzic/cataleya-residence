// actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { getSessionSecret, signToken } from '@/lib/auth'

export type LoginState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!password) {
    return { success: false, message: 'Lozinka je obavezna.' }
  }

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedPassword) {
    return {
      success: false,
      message: 'Greška u konfiguraciji servera: ADMIN_PASSWORD nije postavljen.',
    }
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return { success: false, message: 'Neispravno korisničko ime ili lozinka.' }
  }

  const duration = 7 * 24 * 60 * 60 * 1000 // 7 days
  const expires = Date.now() + duration
  const payload = { user: username, expires }

  const secret = getSessionSecret()
  if (!secret) {
    return { success: false, message: 'Greška u konfiguraciji servera: SESSION_SECRET nije postavljen.' }
  }
  const token = await signToken(payload, secret)

  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })

  return { success: true, message: 'Uspješna prijava.' }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
