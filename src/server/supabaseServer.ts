import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverSupabaseClient: SupabaseClient | null = null;

function isValidHttpUrl(stringUrl?: string | null): boolean {
  if (!stringUrl || typeof stringUrl !== 'string') return false;
  const trimmed = stringUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getServerSupabase(): SupabaseClient | null {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const rawKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !rawKey) return null;

  const url = rawUrl.trim();
  const key = rawKey.trim();

  // Validate that the URL is a real HTTP/HTTPS URL before attempting to call createClient
  if (!isValidHttpUrl(url)) {
    return null;
  }

  if (key.length < 8) {
    return null;
  }

  if (!serverSupabaseClient) {
    try {
      serverSupabaseClient = createClient(url, key);
    } catch (e) {
      console.warn('[Server Supabase] Init notice:', e);
      return null;
    }
  }

  return serverSupabaseClient;
}
