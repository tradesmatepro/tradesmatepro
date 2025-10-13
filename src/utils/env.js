// Centralized environment configuration for TradeMate Pro
// NOTE: In CRA, only REACT_APP_* variables are exposed to the browser

// ⚠️ SECURITY: No hardcoded keys! All keys must come from environment variables.
// If env vars are missing, the app will fail fast rather than use insecure defaults.

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// ⚠️ CRITICAL: Service key should NEVER be used in frontend!
// Service key export has been removed for security.
// Use Supabase Edge Functions for admin operations instead.

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('Required: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY');
  console.error('Check your .env file and restart the dev server.');
}

// Convenience headers for REST calls (anon key only)
export function supabaseAnonHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

// ⚠️ DEPRECATED: Do not use service key in frontend!
// Use Supabase Edge Functions instead.
export function supabaseServiceHeaders() {
  console.error('❌ supabaseServiceHeaders() is deprecated and insecure!');
  console.error('Use Supabase Edge Functions for admin operations.');
  throw new Error('Service key usage in frontend is disabled for security');
}

