import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SITE_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_SITE_ADMIN_EMAIL?.trim().toLowerCase() || 'wuyy.77@qq.com';

let browserClient: SupabaseClient | null = null;

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function getSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const config = getSupabaseConfig();

  if (!config) {
    throw new Error('Supabase 尚未完成配置。');
  }

  browserClient = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

  return browserClient;
}
