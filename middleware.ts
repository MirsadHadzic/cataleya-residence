// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle case where user visits login page
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_session')?.value
    if (token) {
      const secret = process.env.SESSION_SECRET || 'fallback_default_secret_key_1234567890'
      const session = await verifyToken(token, secret)
      if (session && session.expires && session.expires > Date.now()) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
    return NextResponse.next()
  }

  // Avoid redirect loops and exclude login page assets or api
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const secret = process.env.SESSION_SECRET || 'fallback_default_secret_key_1234567890'
    const session = await verifyToken(token, secret)

    if (!session || !session.expires || session.expires < Date.now()) {
      // Clear invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

// Config to specify the matcher
export const config = {
  matcher: ['/admin/:path*'],
}
