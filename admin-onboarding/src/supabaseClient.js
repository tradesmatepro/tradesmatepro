import { createClient } from '@supabase/supabase-js';

// Environment variables for admin app
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cxlqzejzraczumqmsrcx.supabase.co';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ REACT_APP_SUPABASE_SERVICE_KEY is required for admin operations');
}

// Admin client with service key for full access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Admin Supabase client initialized');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
