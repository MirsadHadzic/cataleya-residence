// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionSecret, verifyToken } from './lib/auth'

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_session')?.value
  const secret = getSessionSecret()
  if (!token || !secret) return false
  const session = await verifyToken(token, secret)
  return Boolean(session && session.expires && session.expires > Date.now())
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle case where user visits login page
  if (pathname === '/admin/login') {
    if (await hasValidSession(request)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Every other /admin path (including ones containing a dot) requires a session
  if (!(await hasValidSession(request))) {
    // Clear invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('admin_session')
    return response
  }

  return NextResponse.next()
}

// Config to specify the matcher
export const config = {
  matcher: ['/admin/:path*'],
}
