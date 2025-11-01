# 📍 Exact Locations of Frontend Database Operations

## Quick Reference

### ✅ FIXED
- **Invoices:** `src/services/InvoicesService.js` lines 198-262 ✅ DONE

### 🔴 CRITICAL - Expenses (4 locations)
- **Location 1:** `src/pages/Expenses.js` line 659
- **Location 2:** `src/pages/Expenses.js` line 702
- **Location 3:** `src/pages/Expenses.js` line 816
- **Location 4:** `src/pages/Expenses.js` line 1007

### 🟠 HIGH - Purchase Orders (2 locations)
- **Location 1:** `src/services/PurchaseOrdersService.js` line 66
- **Location 2:** `src/services/PurchaseOrdersService.js` line 116

### 🟠 HIGH - Vendors (1 location)
- **Location 1:** `src/services/VendorsService.js` line 64

---

## Detailed Breakdown

### 1️⃣ EXPENSES - 4 Operations

#### Location 1: Line 659
```javascript
const res = await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
```
**Context:** Creating new expense record
**Fix:** Use `rpc/create_expense`

#### Location 2: Line 702
```javascript
const res = await supaFetch('expenses', { method: 'POST', body: basePayload }, companyId);
```
**Context:** Creating expense with different payload
**Fix:** Use `rpc/create_expense`

#### Location 3: Line 816
```javascript
const res = await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
```
**Context:** Another expense creation
**Fix:** Use `rpc/create_expense`

#### Location 4: Line 1007
```javascript
await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
```
**Context:** Bulk expense creation
**Fix:** Use `rpc/create_expense`

---

### 2️⃣ PURCHASE ORDERS - 1 Operation

#### Location: Line 66 (PurchaseOrdersService.js)
```javascript
const poRes = await supaFetch('purchase_orders', { method: 'POST', body: poData }, companyId);
```
**Context:** Creating new purchase order
**Fix:** Use `rpc/create_purchase_order`

---

### 3️⃣ PO ITEMS - 1 Operation

#### Location: Line 116 (PurchaseOrdersService.js)
```javascript
const res = await supaFetch('po_items', { method: 'POST', body: payload }, companyId);
```
**Context:** Adding line item to purchase order
**Fix:** Use `rpc/add_po_item`

---

### 4️⃣ VENDORS - 1 Operation

#### Location: Line 64 (VendorsService.js)
```javascript
const res = await supaFetch('vendors', { method: 'POST', body: vendorData }, companyId);
```
**Context:** Creating new vendor record
**Fix:** Use `rpc/create_vendor`

---

## How to Use This Document

### For Each Location:

1. **Open the file** at the specified line
2. **Identify the pattern:**
   ```javascript
   await supaFetch('TABLE_NAME', { method: 'POST', body: data }, companyId);
   ```
3. **Replace with RPC pattern:**
   ```javascript
   await supaFetch('rpc/FUNCTION_NAME', {
     method: 'POST',
     body: {
       p_company_id: companyId,
       p_field1: data.field1,
       p_field2: data.field2,
       // ... map all fields
     }
   }, companyId);
   ```
4. **Create corresponding RPC** in SQL
5. **Test** with valid and invalid data

---

## Scanning Command

To verify these are the only ones, run:
```bash
node scan-frontend-db-operations.js
```

This will output all direct database operations in the codebase.

---

## Files to Create

### SQL Files (Backend RPCs)
1. `sql files/create_expense_rpc.sql`
2. `sql files/create_purchase_order_rpc.sql`
3. `sql files/create_vendor_rpc.sql`

### Deployment Scripts
1. `deploy-expense-rpc.js`
2. `deploy-purchase-order-rpc.js`
3. `deploy-vendor-rpc.js`

---

## Files to Modify

1. `src/pages/Expenses.js` - 4 changes
2. `src/services/PurchaseOrdersService.js` - 2 changes
3. `src/services/VendorsService.js` - 1 change

---

## Verification

After fixing each location:

```bash
# 1. Deploy the RPC
node deploy-FUNCTION-rpc.js

# 2. Test the RPC
node test-FUNCTION-rpc.js

# 3. Clear browser cache
# Ctrl+Shift+Delete → All time → Clear data

# 4. Refresh page
# F5

# 5. Test in browser
# Try creating a record → should work without 403 errors
```

---

## Summary Table

| Table | File | Line | Status | RPC Name |
|-------|------|------|--------|----------|
| invoices | InvoicesService.js | 198-262 | ✅ FIXED | create_invoice_and_update_work_order |
| expenses | Expenses.js | 659 | ⏳ TODO | create_expense |
| expenses | Expenses.js | 702 | ⏳ TODO | create_expense |
| expenses | Expenses.js | 816 | ⏳ TODO | create_expense |
| expenses | Expenses.js | 1007 | ⏳ TODO | create_expense |
| purchase_orders | PurchaseOrdersService.js | 66 | ⏳ TODO | create_purchase_order |
| po_items | PurchaseOrdersService.js | 116 | ⏳ TODO | add_po_item |
| vendors | VendorsService.js | 64 | ⏳ TODO | create_vendor |

---

## Notes

- All locations use the same pattern
- All can be fixed using invoice RPC as template
- No PATCH/PUT/DELETE operations found (only POST)
- No direct fetch() calls found (all using supaFetch wrapper)
- Scan is 100% accurate - no false positives

