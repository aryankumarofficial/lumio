import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/notes', '/insights']
const authRoutes = ['/login', '/signup']

function hasToken(request: NextRequest) {
  return Boolean(request.cookies.get('token')?.value)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authenticated = hasToken(request)

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  const isAuthRoute = authRoutes.includes(pathname)

  if (authenticated && (pathname === '/' || isAuthRoute)) {
    return NextResponse.redirect(new URL('/notes', request.url))
  }

  if (!authenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}