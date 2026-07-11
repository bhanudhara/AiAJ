// lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

const { url, anonKey } = getSupabaseEnv();

export function createClient() {
  return createBrowserClient(url, anonKey);
}
