import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './src/lib/env';

const { url, anonKey } = getSupabaseEnv();

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    // 1. Unauthenticated Handling
    if (!user) {
      if (pathname.startsWith('/teacher')) {
        return NextResponse.redirect(new URL('/login?role=teacher', request.url));
      }
      if (pathname.startsWith('/student')) {
        return NextResponse.redirect(new URL('/login?role=student', request.url));
      }
      return response; // Allow unauthenticated users onto /login
    }

    // 2. Authenticated Handling (Fetch Profile)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const userRole = profile?.role; // Expected strings: 'teacher' or 'student'

    // Prevent loop if the user profile doesn't exist or doesn't have a role assigned yet
    if (!userRole) {
      if (pathname !== '/login') {
        return NextResponse.redirect(new URL('/login?error=no_profile_role', request.url));
      }
      return response;
    }

    // 3. Prevent logged-in users from lingering on the login page
    if (pathname === '/login') {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }

    // 4. Strict Role-to-Route Enforcement
    if (pathname.startsWith('/teacher') && userRole !== 'teacher') {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    if (pathname.startsWith('/student') && userRole !== 'student') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }

  } catch (error) {
    console.error("Middleware Auth Crash:", error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// Fixed Matcher: Correctly captures the base routes /teacher and /student as well as all sub-paths
export const config = {
  matcher: [
    '/teacher',
    '/teacher/:path*',
    '/student',
    '/student/:path*',
    '/login'
  ],
};
