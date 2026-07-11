import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createServerComponentClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { expires?: Date; path?: string; domain?: string; secure?: boolean; sameSite?: 'lax' | 'strict' | 'none' }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { path?: string; domain?: string; secure?: boolean; sameSite?: 'lax' | 'strict' | 'none' }) {
          cookieStore.set({ name, value: '', ...options, expires: new Date(0) });
        },
      },
    }
  );
}
