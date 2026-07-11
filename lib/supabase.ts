import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

const { url, anonKey } = getSupabaseEnv();

export function createClient() {
  return createBrowserClient(url, anonKey);
}

export function createServerComponentClient() {
  const cookieStore = cookies();

  return createServerClient(url, anonKey,
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
