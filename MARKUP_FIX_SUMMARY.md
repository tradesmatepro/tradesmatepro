# Markup Calculation Fix Summary

## Problem
Quote shows correct subtotal with 30% markup in the quote builder ($60.96), but customer portal shows incorrect total ($54.97) without markup applied.

**Example:**
- Labor: 1 × $35.00 = $35.00 (no markup)
- Part: 1 × $19.97 = $19.97 base cost
- With 30% markup: $19.97 × 1.30 = $25.96
- **Expected Total: $35.00 + $25.96 = $60.96**
- **Actual Total in Portal: $35.00 + $19.97 = $54.97** ❌

## Root Cause
The `saveQuoteItems` function in `QuotesDatabasePanel.js` was saving line items with:
- ✅ `unit_price` = base cost ($19.97)
- ❌ `total_price` = NOT SET (should be $25.96 with markup)

The customer portal displays `total_price` from the database, but since it wasn't being saved, it defaulted to 0 or calculated incorrectly.

## Fix Applied

### 1. QuoteBuilder.js - Add `total` field to items
Updated `prepareQuoteDataWithLabor` function (lines 141-158) to add `total` field with markup:

```javascript
// Get non-labor items and add calculated total with markup
const nonLaborItems = formData.quote_items
  .filter(item => item.item_type !== 'labor')
  .map(item => ({
    ...item,
    total: calculateItemTotal(item) // Add total field with markup applied
  }));

// Add total field to labor items
const laborItemsWithTotal = laborQuoteItems.map(item => ({
  ...item,
  total: (item.quantity || 0) * (item.rate || 0) // Labor doesn't get markup
}));
```

### 2. QuotesDatabasePanel.js - Save `total_price` to database
Updated `saveQuoteItems` function (lines 1265-1293) to use the `total` field:

```javascript
const quantity = parseFloat(item.quantity) || 1;
const unitPrice = parseFloat(item.rate || item.unit_price) || 0;
const lineType = (item.item_type || item.line_type || 'material').toLowerCase();

// Calculate total_price with markup for parts/materials
let totalPrice = quantity * unitPrice;
if (lineType === 'part' || lineType === 'material') {
  const markupPct = parseFloat(rates?.markup || 30);
  totalPrice = totalPrice * (1 + markupPct / 100);
}

const lineItem = {
  work_order_id: workOrderId,
  line_type: lineType,
  description: item.item_name || item.description,
  quantity: quantity,
  unit_price: unitPrice,      // Base cost
  total_price: totalPrice,    // ✅ NOW INCLUDES MARKUP
  sort_order: index
};
```

### 2. Database Helper Function (COMPLETE_FIX_ATTACHMENTS_AND_PORTAL.sql)
Added `calculate_work_order_totals()` RPC function to recalculate totals from line items:

```sql
CREATE OR REPLACE FUNCTION public.calculate_work_order_totals(p_work_order_id UUID)
RETURNS JSON AS $$
DECLARE
  v_subtotal NUMERIC;
  v_tax_amount NUMERIC;
  v_total_amount NUMERIC;
BEGIN
  -- Calculate subtotal from line items using total_price (which includes markup)
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM work_order_line_items
  WHERE work_order_id = p_work_order_id;
  
  -- Get tax amount from work_orders table
  SELECT tax_amount, total_amount
  INTO v_tax_amount, v_total_amount
  FROM work_orders
  WHERE id = p_work_order_id;
  
  -- Calculate total
  IF v_total_amount IS NULL OR v_total_amount = 0 THEN
    v_total_amount := v_subtotal + COALESCE(v_tax_amount, 0);
  END IF;
  
  RETURN json_build_object(
    'subtotal', v_subtotal,
    'tax_amount', COALESCE(v_tax_amount, 0),
    'total_amount', v_total_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Steps

1. **Create a new quote with parts:**
   - Add labor: 1 × $35.00
   - Add part: 1 × $19.97
   - Verify quote builder shows: $60.96 total

2. **Send quote to customer:**
   - Send quote via email
   - Open customer portal link

3. **Verify customer portal:**
   - Line items should show:
     - Labor: $35.00
     - Part: $25.96 (with 30% markup)
   - Total should show: $60.96 ✅

## Files Changed

1. `src/components/QuotesDatabasePanel.js` - Fixed `saveQuoteItems` to save `total_price` with markup
2. `database/migrations/COMPLETE_FIX_ATTACHMENTS_AND_PORTAL.sql` - Added helper function for totals calculation

## SQL to Run

Run this file in Supabase SQL Editor:
`database/migrations/COMPLETE_FIX_ATTACHMENTS_AND_PORTAL.sql`

This single file fixes:
- ✅ RLS policies on attachments
- ✅ Portal token column errors
- ✅ Messages table errors
- ✅ Attachments in customer portal
- ✅ Helper function for totals calculation

