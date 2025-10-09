# Enum Standardization Plan

## Problem
Database has **BOTH uppercase and lowercase** enum values (28 total in work_order_status_enum):
- Lowercase: `'draft', 'quote', 'sent', 'approved', 'rejected', 'scheduled', 'in_progress', 'completed', 'invoiced', 'cancelled', 'paid', 'closed'`
- UPPERCASE: `'DRAFT', 'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'INVOICED', 'PAID', 'CLOSED'`

This causes confusion and hours of debugging.

## Root Cause
- **Locked schema** (MASTER_DATABASE_SCHEMA_LOCKED.md) specifies **lowercase only**
- **Old migration files** added UPPERCASE values (legacy from years ago when PostgreSQL had keyword conflicts)
- **Modern PostgreSQL** doesn't have this issue - lowercase is standard

## Industry Standard
- **PostgreSQL convention**: lowercase with underscores (`snake_case`)
- **REST APIs**: lowercase or camelCase
- **Database enums**: **lowercase** (matches SQL keywords convention)
- **All competitors**: Use lowercase enums

## Why We Can't Just Remove UPPERCASE Values
1. PostgreSQL doesn't support `DROP VALUE` from enums
2. To remove values, we must:
   - Drop 7 database views that reference work_orders.status
   - Recreate the enum
   - Recreate all 7 views
   - Risk breaking production

## Pragmatic Solution (For Beta)

### ✅ IMMEDIATE: Frontend Standardization
**Update all frontend code to ONLY use lowercase:**

1. **QuotesDatabasePanel.js** - Line 75:
   ```javascript
   // CURRENT (WRONG - mixed case):
   const response = await supaFetch(`work_orders?select=*&status=in.(quote,sent,approved)&order=created_at.desc`, { method: 'GET' }, user.company_id);
   
   // SHOULD BE (all lowercase):
   const response = await supaFetch(`work_orders?select=*&status=in.(quote,sent,approved)&order=created_at.desc`, { method: 'GET' }, user.company_id);
   ```

2. **SendQuoteModal.js** - Line 55:
   ```javascript
   // CURRENT (CORRECT):
   status: 'sent',  // ✅ Lowercase
   ```

3. **Search all files for UPPERCASE enum usage:**
   - Find: `status.*=.*['"]QUOTE['"]` or `status.*=.*['"]SENT['"]` etc.
   - Replace with lowercase versions

### ✅ RULE: Always Use Lowercase
**From now on, ALL status values must be lowercase:**
- ✅ `'draft'`, `'quote'`, `'sent'`, `'approved'`, `'rejected'`
- ✅ `'scheduled'`, `'in_progress'`, `'completed'`, `'invoiced'`, `'cancelled'`
- ❌ Never use `'DRAFT'`, `'QUOTE'`, `'SENT'`, etc.

### 🔜 POST-BETA: Database Cleanup
**After beta launch, when we can afford downtime:**

1. Drop all 7 views
2. Recreate work_order_status_enum with lowercase only
3. Recreate all 7 views
4. Remove UPPERCASE values permanently

## Files to Update

### Frontend Files (Use lowercase only):
- `src/components/QuotesDatabasePanel.js`
- `src/components/quotes/SendQuoteModal.js`
- `src/pages/QuotesPro.js`
- `src/services/QuotePDFService.js`
- Any other files that reference work order status

### Search Pattern:
```bash
# Find all UPPERCASE enum usage:
grep -r "status.*=.*['\"]QUOTE['\"]" src/
grep -r "status.*=.*['\"]SENT['\"]" src/
grep -r "status.*=.*['\"]ACCEPTED['\"]" src/
grep -r "status.*=.*['\"]DRAFT['\"]" src/
```

## Testing Checklist
- [ ] Create quote → status should be `'quote'` (lowercase)
- [ ] Send quote → status should be `'sent'` (lowercase)
- [ ] Quote appears in quotes list after sending
- [ ] Accept quote → status should be `'approved'` (lowercase)
- [ ] Convert to job → status should be `'scheduled'` (lowercase)
- [ ] No 400 errors in console
- [ ] No enum case mismatch errors

## Summary
**For beta: Use lowercase everywhere in frontend, database accepts both**
**Post-beta: Clean up database to remove UPPERCASE duplicates**

This is the pragmatic approach that gets us to launch without breaking production.

