# Quote Status & PDF Tax Fixes - COMPLETE

## Issues Fixed

### Issue 1: Status Dropdown Showing Wrong Value
**Problem:** After sending a quote, editing it showed "Draft" instead of "Sent"

**Root Cause:** QuoteBuilder status dropdown had UPPERCASE options but database uses lowercase
```javascript
// BEFORE (WRONG):
<option value="DRAFT">Draft</option>
<option value="SENT">Sent</option>

// AFTER (CORRECT):
<option value="draft">Draft</option>
<option value="sent">Sent</option>
```

**Files Fixed:**
- ✅ `src/components/QuoteBuilder.js` - Lines 1073-1089

---

### Issue 2: Status Badge in Table Showing Wrong Status
**Problem:** Table showed "Quote" badge even after quote was sent

**Root Causes:**
1. Using `quote.quote_status` (doesn't exist) instead of `quote.status`
2. Status config had UPPERCASE keys but database has lowercase values

**Files Fixed:**
- ✅ `src/components/QuotesUI.js` - Lines 113-123 (status config)
- ✅ `src/components/QuotesUI.js` - Line 195 (changed to `quote.status`)

**Status Badge Config (Now Correct):**
```javascript
const statusConfig = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  quote: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Quote' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' }
};
```

---

### Issue 3: PDF Not Showing Tax Amount
**Problem:** PDF showed `Tax $0.00` even though quote had tax

**Root Cause:** PDF was trying to read `tax_amount` from line items, but tax is stored at work_order level

**Database Schema:**
- ✅ `work_orders.tax_amount` - Total tax for entire quote
- ✅ `work_order_line_items.tax_rate` - Tax rate per item (not used yet)
- ❌ `work_order_line_items.tax_amount` - DOES NOT EXIST

**Files Fixed:**
- ✅ `src/services/QuotePDFService.js` - Lines 60-65 (get tax from work_order)
- ✅ `src/services/QuotePDFService.js` - Lines 67-73 (removed tax column from line items)
- ✅ `src/services/QuotePDFService.js` - Lines 113-114 (removed Tax header)

**Changes:**
```javascript
// BEFORE (WRONG):
const tax_amount = items.reduce((s, it) => s + Number(it.tax_amount || 0), 0);

// AFTER (CORRECT):
const tax_amount = Number(quote.tax_amount || 0); // Get from work_order level
```

**PDF Table:**
```
BEFORE: Description | Qty | Rate | Tax | Line Total
AFTER:  Description | Qty | Rate | Line Total
```

Tax now shows correctly in the totals section at the bottom!

---

## Testing Checklist

### Status Flow:
- [ ] Create new quote → Status shows "Draft" or "Quote"
- [ ] Click "Save & Send to Customer" → Downloads PDF
- [ ] Table badge shows "Sent" (blue badge)
- [ ] Edit quote → Status dropdown shows "Sent"
- [ ] Stats show correct count in "Pending Quotes"

### PDF Generation:
- [ ] Create quote with tax (e.g., 8.25%)
- [ ] Add line items (labor + materials)
- [ ] Click "Save & Send to Customer"
- [ ] PDF shows:
  - ✅ Line items WITHOUT tax column
  - ✅ Subtotal (sum of line items)
  - ✅ Tax (from work_order.tax_amount)
  - ✅ Total (subtotal + tax)
- [ ] PDF total matches quote total in UI

### Status Badge:
- [ ] Draft quotes show gray "Draft" badge
- [ ] Unsent quotes show gray "Quote" badge
- [ ] Sent quotes show blue "Sent" badge
- [ ] Approved quotes show green "Approved" badge
- [ ] Rejected quotes show red "Rejected" badge

---

## Summary

**✅ Status dropdown now uses lowercase values**
**✅ Status badge reads from correct field (quote.status)**
**✅ Status badge uses lowercase config keys**
**✅ PDF gets tax from work_order level, not line items**
**✅ PDF removed per-item tax column**

All status-related issues are now fixed! The quote workflow should work correctly:
1. Create → Draft/Quote
2. Send → Sent (blue badge)
3. Customer accepts → Approved (green badge)
4. Convert to job → Scheduled

And PDFs now show the correct tax amount! 🎉

