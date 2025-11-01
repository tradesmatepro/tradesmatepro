# Frontend Database Operations Audit

## Summary
Found **8 direct database operations** that should be moved to backend RPCs for proper security and architecture.

---

## Findings by Priority

### 🔴 CRITICAL - Already Fixed
- **Invoices** (1 operation in InvoicesService.js line 875)
  - Status: ✅ ALREADY FIXED - Now uses `create_invoice_and_update_work_order` RPC
  - File: `src/services/InvoicesService.js`
  - Issue: Direct POST to invoices table
  - Fix: Updated to use backend RPC

---

### 🟠 HIGH PRIORITY - Financial Operations
These affect money/billing and need immediate backend RPC implementation:

#### 1. **Expenses** (4 operations)
- **File:** `src/pages/Expenses.js`
- **Lines:** 659, 702, 816, 1007
- **Method:** POST
- **Issue:** Creating expense records directly from frontend
- **Impact:** No audit trail, no validation, RLS bypass issues
- **Recommendation:** Create `create_expense` RPC with:
  - Company validation
  - Amount validation
  - Category validation
  - Audit logging
  - Approval workflow integration

#### 2. **Purchase Orders** (1 operation)
- **File:** `src/services/PurchaseOrdersService.js`
- **Line:** 66
- **Method:** POST
- **Issue:** Creating PO records directly
- **Impact:** No vendor validation, no approval workflow
- **Recommendation:** Create `create_purchase_order` RPC with:
  - Vendor validation
  - Company scoping
  - Approval rules enforcement
  - Budget checking

#### 3. **PO Items** (1 operation)
- **File:** `src/services/PurchaseOrdersService.js`
- **Line:** 116
- **Method:** POST
- **Issue:** Adding line items to POs directly
- **Impact:** No validation, no quantity checking
- **Recommendation:** Create `add_po_item` RPC with:
  - PO validation
  - Item validation
  - Quantity/price validation
  - Total recalculation

#### 4. **Vendors** (1 operation)
- **File:** `src/services/VendorsService.js`
- **Line:** 64
- **Method:** POST
- **Issue:** Creating vendor records directly
- **Impact:** No duplicate checking, no validation
- **Recommendation:** Create `create_vendor` RPC with:
  - Duplicate vendor checking
  - Contact validation
  - Category assignment
  - Status initialization

---

## Architecture Pattern

All these operations should follow the same pattern as the invoice creation fix:

```javascript
// ❌ WRONG - Frontend doing database operations
const res = await supaFetch('expenses', {
  method: 'POST',
  body: expenseData
}, companyId);

// ✅ RIGHT - Backend RPC handles all logic
const res = await supaFetch('rpc/create_expense', {
  method: 'POST',
  body: {
    p_company_id: companyId,
    p_amount: expenseData.amount,
    p_category_id: expenseData.category_id,
    p_description: expenseData.description,
    // ... other params
  }
}, companyId);
```

---

## Implementation Roadmap

### Phase 1: Financial Operations (CRITICAL)
1. Create `create_expense` RPC
2. Create `create_purchase_order` RPC
3. Create `add_po_item` RPC
4. Create `create_vendor` RPC
5. Update frontend services to use RPCs

### Phase 2: Other Operations
- Review and update any other direct database operations
- Implement audit logging for all financial operations
- Add approval workflows where needed

---

## Security Benefits

✅ **Company Isolation:** All operations validated at database level
✅ **Audit Trail:** All changes logged in database
✅ **Approval Workflows:** Can enforce business rules
✅ **Consistency:** Atomic transactions prevent partial updates
✅ **Cross-Platform:** Same backend works for web, mobile, desktop
✅ **No RLS Bypass Issues:** SECURITY DEFINER handles permissions properly

---

## Testing Strategy

For each RPC:
1. Create test data (company, related records)
2. Call RPC with valid data → should succeed
3. Call RPC with invalid company → should fail
4. Call RPC with missing required fields → should fail
5. Verify database state after operation
6. Verify audit logs created

---

## Files to Update

1. `src/pages/Expenses.js` - 4 operations
2. `src/services/PurchaseOrdersService.js` - 2 operations
3. `src/services/VendorsService.js` - 1 operation
4. `src/services/InvoicesService.js` - ✅ ALREADY DONE

---

## Next Steps

1. ✅ Invoice creation RPC - COMPLETE
2. ⏳ Expenses RPC - PENDING
3. ⏳ Purchase Orders RPC - PENDING
4. ⏳ Vendors RPC - PENDING
5. ⏳ Comprehensive audit of remaining operations - PENDING

---

## Notes

- This audit was performed using automated scanning of frontend code
- Only POST operations were found (no PATCH/PUT/DELETE in business tables)
- All findings are in service files or page components
- No direct fetch() calls found (all using supaFetch wrapper)

