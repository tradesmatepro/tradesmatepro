# 🔐 TradeMate Pro Security Implementation Plan

## Current Status
- ✅ Site taken offline (GitHub/Vercel deleted)
- ✅ Data protected temporarily
- ❌ RLS disabled (security risk)
- ❌ API keys hardcoded in frontend
- ❌ Service role key exposed

---

## Security Implementation Phases

### Phase 1: Audit & Scan (AI Automated) ✅
**What I'll do:**
1. Scan entire codebase for hardcoded API keys
2. Identify all Supabase service role key usage
3. Find all tables that need RLS
4. Document current authentication flows
5. Create security audit report

**Tools I'll use:**
- AIDevTools scanner
- Regex search for API patterns
- Database schema analysis

**Output:**
- `SECURITY_AUDIT_REPORT.md` - Complete findings
- `API_KEYS_FOUND.json` - All exposed keys
- `TABLES_NEED_RLS.json` - Tables requiring RLS

---

### Phase 2: Move Keys to Secure Storage (AI Automated) ✅
**What I'll do:**
1. Create `.env.local` for local secrets
2. Move all API keys from code to `.env.local`
3. Update `.gitignore` to exclude `.env.local`
4. Create Supabase Edge Functions for sensitive operations
5. Replace frontend API calls with Edge Function calls

**Example:**

**Before (INSECURE):**
```javascript
// ❌ Frontend code with service key
const SUPABASE_SERVICE_KEY = 'eyJhbGci...'; // EXPOSED!
await supabase.from('work_orders').update(...);
```

**After (SECURE):**
```javascript
// ✅ Frontend calls Edge Function
await supabase.functions.invoke('update-work-order', {
  body: { workOrderId, data }
});

// ✅ Edge Function uses service key (server-side only)
// supabase/functions/update-work-order/index.ts
const serviceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
```

---

### Phase 3: Enable RLS with Policies (AI Automated) ✅
**What I'll do:**
1. Enable RLS on all tables
2. Create company-scoped policies
3. Create user role-based policies
4. Test policies with automated scripts

**RLS Policy Pattern:**

```sql
-- Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their company's data
CREATE POLICY "Users can view own company work orders"
ON work_orders
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can only modify their company's data
CREATE POLICY "Users can update own company work orders"
ON work_orders
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);
```

**Tables that need RLS:**
- work_orders
- customers
- employees
- invoices
- quotes
- schedule_events
- timesheets
- expenses
- inventory_items
- purchase_orders
- (and ~30 more)

---

### Phase 4: Public Portal Security (Special Case) ✅
**What I'll do:**
1. Create public RLS policy for portal tokens
2. Implement token expiration checks
3. Add rate limiting
4. Secure quote view endpoint

**Portal RLS Policy:**

```sql
-- Public can view quotes with valid, non-expired tokens
CREATE POLICY "Public can view quotes with valid token"
ON work_orders
FOR SELECT
USING (
  portal_token IS NOT NULL
  AND portal_link_expires_at > NOW()
  AND status IN ('sent', 'approved', 'rejected')
);

-- Public can update quote status via token
CREATE POLICY "Public can approve/reject quotes with token"
ON work_orders
FOR UPDATE
USING (
  portal_token IS NOT NULL
  AND portal_link_expires_at > NOW()
)
WITH CHECK (
  status IN ('approved', 'rejected', 'changes_requested')
);
```

---

### Phase 5: Automated Testing (AI Automated) ✅
**What I'll do:**
1. Create RLS test suite
2. Test cross-company data isolation
3. Test role-based permissions
4. Test public portal access
5. Generate test report

**Test Scenarios:**
```javascript
// Test 1: Company A cannot see Company B's data
await testCrossCompanyIsolation();

// Test 2: Employee role can view but not delete
await testRolePermissions('employee');

// Test 3: Admin can access all company data
await testRolePermissions('admin');

// Test 4: Public can view quote with valid token
await testPublicPortalAccess(validToken);

// Test 5: Public cannot view quote with expired token
await testPublicPortalAccess(expiredToken);
```

---

### Phase 6: Fix Breaking Changes (AI Automated) ✅
**What I'll do:**
1. Monitor for RLS errors
2. Fix queries that break with RLS
3. Add proper company_id filters
4. Update service calls to use Edge Functions

**Common fixes:**

**Before:**
```javascript
// ❌ Breaks with RLS - no company filter
const { data } = await supabase
  .from('work_orders')
  .select('*');
```

**After:**
```javascript
// ✅ Works with RLS - company filter
const { data } = await supabase
  .from('work_orders')
  .select('*')
  .eq('company_id', user.company_id);
```

---

## Implementation Timeline

| Phase | Duration | AI Automated? |
|-------|----------|---------------|
| 1. Audit & Scan | 10 min | ✅ Yes |
| 2. Move Keys | 20 min | ✅ Yes |
| 3. Enable RLS | 30 min | ✅ Yes |
| 4. Portal Security | 15 min | ✅ Yes |
| 5. Testing | 20 min | ✅ Yes |
| 6. Fix Errors | 30 min | ✅ Yes (with monitoring) |
| **Total** | **~2 hours** | **Fully Automated** |

---

## What I Need From You

### 1. Confirmation to Proceed
- [ ] Yes, implement full security
- [ ] Start with audit only
- [ ] Wait until app is more complete

### 2. Access Credentials
I already have in `AIDevTools/credentials.json`:
- ✅ Supabase access token
- ✅ Supabase project ref
- ✅ Supabase URL
- ✅ Supabase anon key

**Do I have permission to:**
- [ ] Enable RLS on all tables?
- [ ] Create Edge Functions?
- [ ] Modify database policies?

### 3. Testing Accounts
I'll need test accounts for:
- [ ] Company A (admin user)
- [ ] Company A (employee user)
- [ ] Company B (admin user)
- [ ] Public user (no login)

---

## Security Layers We'll Implement

### Layer 1: Frontend (React)
- ✅ Only anon key exposed
- ✅ No service keys
- ✅ No hardcoded secrets
- ✅ Environment variables only

### Layer 2: Backend (Edge Functions)
- ✅ Service key in secure env
- ✅ Server-side validation
- ✅ Rate limiting
- ✅ Input sanitization

### Layer 3: Database (RLS)
- ✅ RLS enabled on all tables
- ✅ Company-scoped policies
- ✅ Role-based permissions
- ✅ Public portal policies

### Layer 4: Authentication
- ✅ Supabase Auth
- ✅ JWT tokens
- ✅ Session management
- ✅ Token expiration

---

## After Implementation

### What Will Be Secure:
- ✅ No API keys in frontend code
- ✅ Company data isolated (Company A can't see Company B)
- ✅ Role-based permissions enforced
- ✅ Public portal tokens expire
- ✅ Service keys only on server
- ✅ All database access controlled by RLS

### What You Can Do:
- ✅ Deploy to Vercel safely
- ✅ Share portal links publicly
- ✅ Add new companies without data leaks
- ✅ Grant different user permissions
- ✅ Pass security audits

---

## Next Steps

**Option 1: Full Auto (Recommended)**
```
I'll implement all 6 phases automatically with AIDevTools
You review the changes before deploying
Estimated time: 2 hours
```

**Option 2: Phase by Phase**
```
I'll do Phase 1 (audit) first
You review the findings
We proceed phase by phase
Estimated time: 3-4 hours
```

**Option 3: Manual Review**
```
I'll create all the SQL and code
You review and approve each change
You run the changes manually
Estimated time: 1 day
```

---

## My Recommendation

**Do Option 1 (Full Auto) because:**
1. ✅ I have AIDevTools to test everything
2. ✅ I can monitor for errors in real-time
3. ✅ I can fix issues as they come up
4. ✅ Faster than manual review
5. ✅ You can review the final result before deploying

**Start with Phase 1 (Audit) to see what we're dealing with?**

---

**Ready to proceed? Say "full auto security" and I'll start!**

