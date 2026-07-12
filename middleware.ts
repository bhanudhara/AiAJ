import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, SESSION_NAME } from './src/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  // 1. Unauthenticated handling
  if (!user) {
    if (pathname.startsWith('/teacher')) {
      return NextResponse.redirect(new URL('/login?role=teacher', request.url));
    }
    if (pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/login?role=student', request.url));
    }
    return NextResponse.next();
  }

  // 2. Prevent logged-in users from lingering on the login page
  if (pathname === '/login' || pathname === '/signup') {
    return NextResponse.redirect(new URL(`/${user.role}`, request.url));
  }

  // 3. Strict role-to-route enforcement
  if (pathname.startsWith('/teacher') && user.role !== 'teacher') {
    return NextResponse.redirect(new URL('/student', request.url));
  }
  if (pathname.startsWith('/student') && user.role !== 'student') {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/teacher',
    '/teacher/:path*',
    '/student',
    '/student/:path*',
    '/login',
    '/signup',
  ],
};
