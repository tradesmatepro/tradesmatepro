// Centralized environment configuration for Customer Portal
// NOTE: In CRA, only REACT_APP_* variables are exposed to the browser

// Defaults fall back to NEW project values to avoid breaking local runs
const FALLBACK_SUPABASE_URL = "https://cxlqzejzraczumqmsrcx.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg";

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || FALLBACK_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Convenience headers for REST calls
export function supabaseAnonHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}
