uthentication and Database Access – How To Guide (Corrected)
🚫 NEVER DO THIS (Wrong Way)
// ❌ WRONG - Hardcoded keys (service or anon)
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";


Never hardcode any Supabase keys in source code.

Never bypass RLS with a service key in frontend code.

Never store secrets in components.

✅ ALWAYS DO THIS (Right Way)
1. Use Environment Variables
// ✅ CORRECT - Import from env system
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/utils/env.js';


Keep keys in .env files (never in code).

Use the anon key in frontend.

Service key is for backend/admin tasks only (never exposed to clients).

2. Use supaFetch Utility (Preferred)
// ✅ BEST - Use supaFetch for auto company isolation
import { supaFetch } from '../src/utils/supaFetch.js';

const response = await supaFetch(
  'customers?select=*&order=created_at.desc&limit=10',
  { method: 'GET' },
  user.company_id
);


Automatically attaches company_id for RLS.

Prevents cross-company data leakage.

Centralizes query handling for consistent error logging.

3. Use Supabase Client (When Needed)
// ✅ GOOD - Direct Supabase client when needed
import { getSupabaseClient } from '../src/utils/supabaseClient.js';

const supabase = getSupabaseClient();
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('company_id', user.company_id);


Useful for inserts, updates, deletes.

Always filter by company_id.

Keep queries explicit and clean.

🎯 Key Principles

Anon key only in frontend – service key stays server-side.

Respect RLS – rely on policies to enforce data isolation.

Use supaFetch whenever possible for built-in safety.

Never bypass auth – all requests must be tied to the logged-in user.

Centralize secrets – only in .env files, never in components.

✅ This version is lightweight, practical, and fully compatible with the new Dev Tools Playbook. No custom proxy servers, no over-engineering, no service key leakage.