// lib/auth.ts
import { cookies } from 'next/headers'

const encoder = new TextEncoder()

function stringToHex(str: string): string {
  return Array.from(encoder.encode(str))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToString(hex: string): string {
  const matches = hex.match(/.{1,2}/g)
  if (!matches) return ''
  const bytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)))
  return new TextDecoder().decode(bytes)
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signToken(payload: object, secret: string): Promise<string> {
  const payloadStr = JSON.stringify(payload)
  const payloadHex = stringToHex(payloadStr)
  const key = await getCryptoKey(secret)
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadHex)
  )
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${payloadHex}.${signatureHex}`
}

export async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [payloadHex, signatureHex] = parts
    if (!payloadHex || !signatureHex) return null

    const key = await getCryptoKey(secret)
    const matches = signatureHex.match(/.{1,2}/g)
    if (!matches) return null
    const signatureBytes = new Uint8Array(matches.map((byte) => parseInt(byte, 16)))

    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadHex)
    )

    if (!verified) return null

    const payloadStr = hexToString(payloadHex)
    return JSON.parse(payloadStr)
  } catch (error) {
    return null
  }
}

export async function verifyAdminSession(): Promise<any> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) {
    throw new Error('Unauthorized: No session token found')
  }
  const secret = process.env.SESSION_SECRET || 'fallback_default_secret_key_1234567890'
  const session = await verifyToken(token, secret)
  if (!session || !session.expires || session.expires < Date.now()) {
    throw new Error('Unauthorized: Invalid or expired session')
  }
  return session
}
