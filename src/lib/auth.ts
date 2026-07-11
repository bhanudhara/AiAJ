import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

const { url, anonKey } = getSupabaseEnv();

export type AppRole = 'teacher' | 'student' | null;

export async function getCurrentUserAndRole() {
  const cookieStore = cookies();

  const supabase = createServerClient(url, anonKey, {
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
  });

  const { data: { user } } = await supabase.auth.getUser();
  const role = cookieStore.get('app-role')?.value as AppRole;

  return { user, role };
}
