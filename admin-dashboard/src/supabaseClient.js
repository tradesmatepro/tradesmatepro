import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cxlqzejzraczumqmsrcx.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY is required');
}

if (!supabaseServiceKey) {
  console.error('❌ REACT_APP_SUPABASE_SERVICE_KEY is required for admin operations');
}

// Single Supabase client for Admin Dashboard with proper session handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Service client for admin operations (only when needed)
export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Service client created with key:', supabaseServiceKey ? 'Present' : 'Missing');

console.log('🔧 Admin Dashboard Supabase client initialized');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('🔒 Service Key:', supabaseServiceKey ? 'Present - Ready for admin operations!' : 'Missing');
