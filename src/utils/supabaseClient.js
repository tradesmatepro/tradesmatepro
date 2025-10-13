// Centralized Supabase client to avoid multiple GoTrueClient instances
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

// Create singleton clients
let supabaseClient = null;
let supabaseAdminClient = null;

export function getSupabaseClient() {
  const g = (typeof window !== 'undefined' ? window : {});
  if (!supabaseClient) {
    // Reuse across HMR to avoid multiple auth clients
    if (g.__tm_supabase_client) {
      supabaseClient = g.__tm_supabase_client;
    } else {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'tm-web-auth',
        }
      });
      g.__tm_supabase_client = supabaseClient;
    }
  }
  return supabaseClient;
}

export function getSupabaseAdminClient() {
  // Avoid creating admin client in the browser to prevent multiple auth clients and exposure
  if (process.env.NODE_ENV !== 'production') {
    console.warn('getSupabaseAdminClient called in browser. Returning user client to avoid multiple GoTrueClient instances.');
  }
  return getSupabaseClient();
}

// Export default client for convenience (keep singleton semantics)
export const supabase = getSupabaseClient();
export const supabaseAdmin = supabase;
