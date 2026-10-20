import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';
import { formatSupabaseUrl, isSupabaseConfigured } from './client';

export const getSupabaseServerClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = formatSupabaseUrl(rawUrl);
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};
