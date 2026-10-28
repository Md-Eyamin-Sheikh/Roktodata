import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { Database } from './types';
import { formatSupabaseUrl, isSupabaseConfigured } from './client';

/**
 * Standard server client. Uses service role key if available for administrative/backend functions,
 * or uses anon key with cookie persistence when NextRequest is supplied.
 */
export const getSupabaseServerClient = (req?: NextRequest): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = formatSupabaseUrl(rawUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  // If a NextRequest is provided with cookies, use @supabase/ssr server client to preserve user context
  if (req) {
    return createServerClient<Database>(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // Read-only in request handler query context
        },
      },
    });
  }

  const keyToUse = serviceRoleKey || anonKey;
  return createClient<Database>(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Validates and extracts the authentic Supabase User from an incoming Next.js API request.
 * Prioritizes Authorization: Bearer <token>, then falls back to session cookies.
 * This guarantees role and identity are verified against Supabase Auth, NEVER trusted from client state.
 */
export const getAuthenticatedUserFromRequest = async (
  req: NextRequest
): Promise<{ user: User | null; role: string | null; error: string | null }> => {
  if (!isSupabaseConfigured()) {
    return { user: null, role: null, error: 'Supabase is not configured' };
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = formatSupabaseUrl(rawUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  // 1. Check Bearer Token in Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]?.trim();
    if (token) {
      const client = createClient<Database>(supabaseUrl, anonKey, {
        auth: { persistSession: false },
      });
      const { data, error } = await client.auth.getUser(token);
      if (!error && data?.user) {
        // Query the authoritative role from public.profiles
        const { data: profile } = await client
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = (profile as any)?.role || 'donor';
        return { user: data.user, role, error: null };
      }
    }
  }

  // 2. Check SSR Session Cookies
  const ssrClient = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll() {},
    },
  });

  try {
    const { data: { user }, error: userErr } = await ssrClient.auth.getUser();
    if (!userErr && user) {
      // Query role directly from database
      const { data: profile } = await ssrClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = (profile as any)?.role || 'donor';
      return { user, role, error: null };
    }
  } catch (err: any) {
    return { user: null, role: null, error: err?.message || 'Authentication failed' };
  }

  return { user: null, role: null, error: 'No active session found' };
};
