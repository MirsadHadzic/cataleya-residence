// actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { signToken } from '@/lib/auth'

export type LoginState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!password) {
    return { success: false, message: 'Password is required.' }
  }

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedPassword) {
    return {
      success: false,
      message: 'Server configuration error: ADMIN_PASSWORD is not set in environment.',
    }
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return { success: false, message: 'Invalid username or password.' }
  }

  const duration = 7 * 24 * 60 * 60 * 1000 // 7 days
  const expires = Date.now() + duration
  const payload = { user: username, expires }

  const secret = process.env.SESSION_SECRET || 'fallback_default_secret_key_1234567890'
  const token = await signToken(payload, secret)

  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })

  return { success: true, message: 'Logged in successfully.' }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
