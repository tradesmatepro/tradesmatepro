# 🔧 UNIT-BASED PRICING MATERIALS FIX

## 📊 ISSUE DESCRIPTION

**User Report:** "Unit based quote doesn't apply a parts markup like normal"

**Problem:** 
- Unit-based pricing model (e.g., "Price per outlet installed") had NO way to add materials
- Materials section was ONLY shown for Time & Materials pricing
- No markup was applied to materials in unit-based quotes

---

## 🔍 ROOT CAUSE

### **The Problem:**

**1. Materials Section Hidden:**
```jsx
{/* Materials, Parts & Services - only for Time & Materials */}
{formData.pricing_model === 'TIME_MATERIALS' && (formData.quote_items.filter...
```
- Materials section only shown when `pricing_model === 'TIME_MATERIALS'`
- Unit-based quotes had NO way to add materials

**2. No Materials in Calculation:**
```javascript
case 'UNIT':
  return (Number(formData.unit_count) || 0) * ((Number(formData.unit_price) || 0));
```
- Unit pricing just multiplied `unit_count * unit_price`
- Didn't include materials at all
- No markup applied

---

## ✅ FIX APPLIED

### **Modified File:** `src/components/QuoteBuilder.js`

### **Change 1: Enable Materials Section for Unit Pricing**

**Lines 1378-1379:**

**Before:**
```jsx
{/* Materials, Parts & Services - only for Time & Materials */}
{formData.pricing_model === 'TIME_MATERIALS' && (formData.quote_items.filter(item => item.item_type !== 'labor').length > 0 ? (
```

**After:**
```jsx
{/* Materials, Parts & Services - for Time & Materials and Unit-Based */}
{(formData.pricing_model === 'TIME_MATERIALS' || formData.pricing_model === 'UNIT') && (formData.quote_items.filter(item => item.item_type !== 'labor').length > 0 ? (
```

**Impact:** Materials section now shows for both TIME_MATERIALS and UNIT pricing models

---

### **Change 2: Include Materials with Markup in Unit Pricing Calculation**

**Lines 704-711:**

**Before:**
```javascript
case 'UNIT':
  return (Number(formData.unit_count) || 0) * ((Number(formData.unit_price) || 0));
```

**After:**
```javascript
case 'UNIT': {
  // ✅ FIX: Unit pricing should include materials with markup
  const unitTotal = (Number(formData.unit_count) || 0) * ((Number(formData.unit_price) || 0));
  const materialsTotal = formData.quote_items
    .filter(item => item.item_type !== 'labor')
    .reduce((sum, item) => sum + calculateItemTotal(item), 0);
  return unitTotal + materialsTotal;
}
```

**Impact:** 
- Unit pricing now includes materials
- Materials get markup applied via `calculateItemTotal(item)`
- Total = (unit_count × unit_price) + (materials with markup)

---

## 🎯 HOW IT WORKS NOW

### **Unit-Based Pricing Calculation:**

**Example: Electrical Outlet Installation**

**Unit Pricing:**
- Unit Count: 10 outlets
- Unit Price: $150 per outlet
- Unit Total: $1,500

**Materials (with 25% markup):**
- Wire: 100 ft × $0.50 = $50 → $62.50 (with markup)
- Outlet boxes: 10 × $2 = $20 → $25.00 (with markup)
- Outlets: 10 × $3 = $30 → $37.50 (with markup)
- Materials Total: $125.00 (with markup)

**Subtotal:** $1,500 + $125 = $1,625

**Tax (8.25%):** $134.06

**Grand Total:** $1,759.06

---

## 📋 WHAT'S INCLUDED NOW

### **For Unit-Based Quotes:**

✅ **Unit Pricing Section:**
- Unit Count (e.g., 10 outlets)
- Unit Price (e.g., $150 per outlet)
- Unit Total (e.g., $1,500)

✅ **Materials Section (NEW!):**
- Add materials/parts/services
- Automatic markup applied (e.g., 25%)
- Same as Time & Materials pricing

✅ **Buttons Available:**
- "Add Item" - Manual entry
- "Add from Library" - Pre-configured items
- "Add from Inventory" - Stock items
- "Configure Package" - CPQ builder

✅ **Markup Applied:**
- Materials: 25% markup (or configured rate)
- Equipment: 25% markup (or configured rate)
- Services: No markup (labor-based)

---

## 🎨 USER EXPERIENCE

### **Before:**

**Creating Unit-Based Quote:**
1. Select "Unit-Based" pricing model
2. Enter unit count and price
3. ❌ **NO way to add materials**
4. ❌ **Can't track actual costs**
5. ❌ **No markup applied**

**Result:** Had to manually inflate unit price to cover materials

### **After:**

**Creating Unit-Based Quote:**
1. Select "Unit-Based" pricing model
2. Enter unit count and price
3. ✅ **Add materials section appears**
4. ✅ **Add materials with automatic markup**
5. ✅ **Total = unit price + materials**

**Result:** Accurate pricing with proper cost tracking and markup

---

## 💡 INDUSTRY STANDARD COMPARISON

### **How Competitors Handle This:**

**ServiceTitan:**
- Flat rate pricing includes materials in the price book
- Can add additional materials with markup
- ✅ **TradeMate Pro now matches this**

**Jobber:**
- Unit pricing allows adding materials separately
- Markup applied automatically
- ✅ **TradeMate Pro now matches this**

**Housecall Pro:**
- Flat rate + materials option
- Materials tracked separately with markup
- ✅ **TradeMate Pro now matches this**

---

## 🔍 TECHNICAL DETAILS

### **Markup Calculation:**

The `calculateItemTotal()` function applies markup:

```javascript
const calculateItemTotal = (item) => {
  let baseTotal = (item.quantity || 0) * (item.rate || 0);
  
  // Apply markup for materials/equipment
  if (item.item_type === 'material' || item.item_type === 'equipment') {
    baseTotal = baseTotal * (1 + rates.markup / 100);
  }
  
  return baseTotal;
};
```

**Example:**
- Material cost: $100
- Markup: 25%
- Total: $100 × 1.25 = $125

---

## 📊 PRICING MODEL COMPARISON

### **Time & Materials:**
- Labor: Hourly rate × hours
- Materials: Cost + markup
- **Total:** Labor + Materials

### **Unit-Based (FIXED):**
- Unit Price: Fixed price per unit × count
- Materials: Cost + markup (NEW!)
- **Total:** Unit Price + Materials

### **Flat Rate:**
- Fixed Amount: One price for entire job
- Materials: Not tracked separately
- **Total:** Fixed Amount

---

## 🚀 EXPECTED RESULT

After rebuilding the app:

✅ **Unit-Based Quotes:**
- Materials section appears
- Can add materials/parts/services
- Markup applied automatically
- Total = unit price + materials with markup

✅ **Calculations:**
- Unit total calculated correctly
- Materials total includes markup
- Subtotal = unit total + materials total
- Tax applied to subtotal
- Grand total accurate

✅ **Quote Display:**
- Shows unit pricing breakdown
- Shows materials with markup
- Clear itemization
- Professional presentation

---

## 📋 TESTING CHECKLIST

After rebuild, test these scenarios:

**Create Unit-Based Quote:**
- [ ] Select "Unit-Based" pricing model
- [ ] Enter unit count (e.g., 10)
- [ ] Enter unit price (e.g., $150)
- [ ] Materials section appears
- [ ] Click "Add Item" button
- [ ] Add material (e.g., Wire, $50)
- [ ] Verify markup applied (e.g., $62.50 with 25% markup)
- [ ] Subtotal = unit total + materials total
- [ ] Tax calculated on subtotal
- [ ] Grand total correct

**Verify Markup:**
- [ ] Material cost: $100
- [ ] Markup: 25%
- [ ] Total shown: $125
- [ ] Label shows "(+25%)"

**Compare to Time & Materials:**
- [ ] Both show materials section
- [ ] Both apply markup
- [ ] Both have same buttons
- [ ] Both calculate correctly

---

## 🎯 REAL-WORLD USE CASES

### **Electrical Contractor:**

**Job:** Install 10 outlets

**Unit Pricing:**
- 10 outlets × $150/outlet = $1,500

**Materials:**
- Wire: $50 → $62.50 (with markup)
- Boxes: $20 → $25.00 (with markup)
- Outlets: $30 → $37.50 (with markup)

**Total:** $1,625 + tax

---

### **HVAC Contractor:**

**Job:** Install 5 mini-split units

**Unit Pricing:**
- 5 units × $2,000/unit = $10,000

**Materials:**
- Line sets: $500 → $625 (with markup)
- Electrical: $200 → $250 (with markup)
- Mounting: $100 → $125 (with markup)

**Total:** $11,000 + tax

---

### **Plumber:**

**Job:** Install 3 toilets

**Unit Pricing:**
- 3 toilets × $300/toilet = $900

**Materials:**
- Wax rings: $15 → $18.75 (with markup)
- Supply lines: $30 → $37.50 (with markup)
- Bolts/hardware: $10 → $12.50 (with markup)

**Total:** $968.75 + tax

---

## 💡 BENEFITS

### **For Contractors:**

✅ **Accurate Pricing:**
- Track actual material costs
- Apply proper markup
- Maintain profit margins

✅ **Better Tracking:**
- Know what materials are needed
- Track costs vs revenue
- Analyze profitability

✅ **Professional Quotes:**
- Itemized breakdown
- Clear pricing
- Customer transparency

### **For Customers:**

✅ **Transparency:**
- See what they're paying for
- Understand the breakdown
- Trust the pricing

✅ **Accuracy:**
- No hidden costs
- Clear itemization
- Professional presentation

---

## 📁 FILES MODIFIED

1. ✅ `src/components/QuoteBuilder.js` - Lines 704-711, 1378-1379

---

## 🎯 SUMMARY

**Issue:** Unit-based pricing didn't support materials or apply markup  
**Root Cause:** Materials section hidden, calculation didn't include materials  
**Fix:** Enabled materials section for UNIT pricing, added materials to calculation with markup  
**Status:** ✅ FIXED - Needs rebuild to take effect  
**Impact:** Unit-based quotes now match industry standards with proper material tracking and markup

