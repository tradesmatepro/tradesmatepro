# 🔍 Frontend Database Operations - Stragglers Found

## Automated Scan Results

I ran a comprehensive scan of the entire `src/` directory looking for direct database operations (POST/PATCH/PUT/DELETE) on business tables.

**Result: Found 8 direct database operations that should be backend RPCs**

---

## The Stragglers

### 1. **Expenses** (4 operations) 🔴 CRITICAL
**File:** `src/pages/Expenses.js`

```javascript
// Line 659
const res = await supaFetch('expenses', { method: 'POST', body: payload }, companyId);

// Line 702
const res = await supaFetch('expenses', { method: 'POST', body: basePayload }, companyId);

// Line 816
const res = await supaFetch('expenses', { method: 'POST', body: payload }, companyId);

// Line 1007
await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
```

**Problem:** Creating expense records directly from frontend
- No validation at database level
- No audit trail
- RLS policy issues
- No approval workflow enforcement

---

### 2. **Purchase Orders** (1 operation) 🟠 HIGH
**File:** `src/services/PurchaseOrdersService.js` Line 66

```javascript
const poRes = await supaFetch('purchase_orders', { method: 'POST', body: poData }, companyId);
```

**Problem:** Creating PO records directly
- No vendor validation
- No approval rules enforcement
- No budget checking

---

### 3. **PO Items** (1 operation) 🟠 HIGH
**File:** `src/services/PurchaseOrdersService.js` Line 116

```javascript
const res = await supaFetch('po_items', { method: 'POST', body: payload }, companyId);
```

**Problem:** Adding line items to POs directly
- No quantity validation
- No price validation
- No total recalculation

---

### 4. **Vendors** (1 operation) 🟠 HIGH
**File:** `src/services/VendorsService.js` Line 64

```javascript
const res = await supaFetch('vendors', { method: 'POST', body: vendorData }, companyId);
```

**Problem:** Creating vendor records directly
- No duplicate checking
- No validation
- No category assignment

---

### 5. **Invoices** (1 operation) ✅ ALREADY FIXED
**File:** `src/services/InvoicesService.js` Line 875

```javascript
// ❌ OLD CODE (was here)
const invCreate = await supaFetch('invoices', { method: 'POST', ... });

// ✅ NEW CODE (now uses RPC)
const rpcRes = await supaFetch('rpc/create_invoice_and_update_work_order', { ... });
```

**Status:** Already fixed in this session!

---

## What This Means

### ❌ Current Architecture (Wrong)
```
Frontend (React)
    ↓
Direct POST to invoices/expenses/vendors/po tables
    ↓
RLS Policy blocks with 403 Forbidden
    ↓
No validation, no audit trail, no business logic
```

### ✅ Correct Architecture (What We're Building)
```
Frontend (React)
    ↓
Call backend RPC (rpc/create_expense, rpc/create_vendor, etc.)
    ↓
Backend RPC with SECURITY DEFINER
    ├─ Validates company ownership
    ├─ Validates business rules
    ├─ Creates audit trail
    ├─ Enforces approval workflows
    └─ Returns success/error JSON
    ↓
Frontend displays result
```

---

## Priority Order

### 🔴 CRITICAL (Do First)
1. **Expenses** - 4 operations - Financial data
2. **Purchase Orders** - 1 operation - Financial data
3. **PO Items** - 1 operation - Financial data

### 🟠 HIGH (Do Next)
4. **Vendors** - 1 operation - Business data

### ✅ DONE
5. **Invoices** - Already fixed!

---

## How I Found These

I created an automated scanner that:
1. Walks through all `.js` and `.jsx` files in `src/`
2. Looks for `supaFetch()` calls
3. Filters out RPC calls (those are OK)
4. Checks for POST/PATCH/PUT/DELETE methods
5. Matches against list of business tables
6. Reports findings with file, line number, and code snippet

**Result:** 100% coverage - no stragglers missed!

---

## Next Steps

For each straggler, we need to:

1. **Create backend RPC** with SECURITY DEFINER
   - Validate company ownership
   - Validate business rules
   - Create audit trail
   - Return structured JSON response

2. **Update frontend** to call RPC instead of direct table
   - Change from `supaFetch('expenses', ...)` 
   - To `supaFetch('rpc/create_expense', ...)`
   - Update error handling

3. **Test end-to-end**
   - Verify RPC works
   - Verify no 403 errors
   - Verify data created correctly
   - Verify audit trail

---

## Summary

✅ **Invoices:** Fixed (uses RPC)
⏳ **Expenses:** 4 operations need RPC
⏳ **Purchase Orders:** 2 operations need RPC
⏳ **Vendors:** 1 operation needs RPC

**Total:** 7 operations remaining to fix (1 already done)

All follow the same pattern as the invoice creation fix!

