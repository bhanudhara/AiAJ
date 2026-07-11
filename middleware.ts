import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './lib/env';

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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && (request.nextUrl.pathname.startsWith('/teacher') || request.nextUrl.pathname.startsWith('/student'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (request.nextUrl.pathname.startsWith('/teacher') && profile?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/student') && profile?.role !== 'student') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*'],
};
