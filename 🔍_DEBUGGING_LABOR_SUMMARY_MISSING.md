# 🔍 DEBUGGING - Labor Summary & Settings Missing

**Date:** 2025-10-13  
**Issue:** Quote doesn't have labor_summary, company doesn't have settings  
**Status:** 🔍 INVESTIGATING  

---

## 🚨 ISSUES FOUND IN LOGS

### **Issue #1: No Company Settings**
```
⚠️ Could not load company settings: Error: No settings found
```

**What this means:**
- quote.html tries to load from `settings` table
- No row exists for this company
- Falls back to hardcoded defaults

**Impact:**
- ✅ Wizard still works (uses defaults)
- ⚠️ Company-specific settings not applied
- ⚠️ Terms text is generic

---

### **Issue #2: No Labor Summary**
```
⚠️ No labor_summary found in quote, using default 8 hours
```

**What this means:**
- Quote doesn't have `labor_summary` JSONB field populated
- Can't calculate crew size or hours per employee
- Falls back to 8-hour default

**Impact:**
- ❌ Job info header won't show ("2 Technicians for 8 Hours")
- ❌ Duration calculation wrong
- ❌ Customer doesn't know what to expect

---

## 🔍 INVESTIGATION STEPS

### **Step 1: Check Database for Labor Summary**

**Query sent to AIDevTools:**
```sql
SELECT id, work_order_number, status, total_amount, labor_summary 
FROM work_orders 
WHERE id = 'eeaa326b-0feb-464a-9bb3-1e63ad96e285'
```

**What we're checking:**
- Does this quote have `labor_summary` column?
- Is it NULL or empty?
- What's the structure if it exists?

---

### **Step 2: Check Database for Settings**

**Query sent to AIDevTools:**
```sql
SELECT * 
FROM settings 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e' 
LIMIT 1
```

**What we're checking:**
- Does this company have a row in `settings` table?
- Is the table empty?
- Does the table exist?

---

## 🔧 DEBUGGING ADDED

### **Debug Log #1: Quote Fields**
```javascript
console.log('🔍 DEBUG - Quote fields:', {
  id: quote.id,
  status: quote.status,
  total_amount: quote.total_amount,
  labor_summary: quote.labor_summary,
  has_labor_summary: !!quote.labor_summary,
  labor_summary_type: typeof quote.labor_summary,
  all_keys: Object.keys(quote)
});
```

**What this shows:**
- All fields in the quote object
- Whether labor_summary exists
- Type of labor_summary (null, object, etc.)

---

### **Debug Log #2: Labor Summary Check**
```javascript
console.log('🔍 DEBUG - Checking labor_summary:', {
  has_labor_summary: !!quoteData.labor_summary,
  labor_summary_value: quoteData.labor_summary,
  labor_summary_type: typeof quoteData.labor_summary,
  quote_keys: Object.keys(quoteData)
});
```

**What this shows:**
- Detailed labor_summary inspection
- All keys in quoteData
- Helps identify if field is missing vs null vs wrong type

---

## 🤔 POSSIBLE ROOT CAUSES

### **Cause #1: Quote Created Before Labor Summary Feature**
- This quote might be old
- Created before labor_summary was added to schema
- Column exists but value is NULL

**Fix:** Manually update quote with labor_summary

---

### **Cause #2: Quote Created Without Labor Details**
- Quote was created without line items
- No labor calculation performed
- labor_summary never populated

**Fix:** Add labor line items and recalculate

---

### **Cause #3: Settings Table Not Initialized**
- Company was created before settings table existed
- No default row inserted
- quote.html expects settings to exist

**Fix:** Insert default settings row for company

---

## 📋 NEXT STEPS

### **After Database Query Results:**

**If labor_summary is NULL:**
1. Check how quotes are created in QuoteBuilder
2. Verify labor_summary calculation logic
3. Add migration to populate existing quotes
4. Or: Add fallback to calculate from line items

**If labor_summary exists but wrong format:**
1. Check expected structure vs actual
2. Update parsing logic in quote.html
3. Add validation when saving quotes

**If settings table is empty:**
1. Create default settings for this company
2. Add migration to create settings for all companies
3. Or: Keep using defaults in quote.html

---

## 🛠️ TEMPORARY WORKAROUNDS

### **Workaround #1: Manual Database Update**

**Add labor_summary to quote:**
```sql
UPDATE work_orders 
SET labor_summary = '{
  "crew_size": 2,
  "hours_per_day": 8,
  "regular_hours": 16,
  "overtime_hours": 0,
  "labor_subtotal": 800
}'::jsonb
WHERE id = 'eeaa326b-0feb-464a-9bb3-1e63ad96e285';
```

---

### **Workaround #2: Create Settings Row**

**Add settings for company:**
```sql
INSERT INTO settings (
  company_id,
  require_signature_on_approval,
  require_terms_acceptance,
  require_deposit_on_approval,
  allow_customer_scheduling,
  terms_and_conditions_text,
  deposit_type,
  default_deposit_percentage
) VALUES (
  'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e',
  true,
  true,
  true,
  true,
  'TERMS AND CONDITIONS\n\n1. Payment: Full payment is due upon completion.\n2. Warranty: All work guaranteed for 90 days.\n3. Cancellation: 48 hours notice required.',
  'percentage',
  25
);
```

---

### **Workaround #3: Calculate from Line Items**

**Add fallback logic in quote.html:**
```javascript
if (!quoteData.labor_summary) {
  // Try to calculate from work_order_items
  const laborItems = await fetchLaborItems(quoteData.id);
  if (laborItems && laborItems.length > 0) {
    const totalHours = laborItems.reduce((sum, item) => 
      sum + (item.quantity || 0), 0
    );
    const crewSize = Math.ceil(totalHours / 8); // Assume 8-hour days
    quoteData.labor_summary = {
      crew_size: crewSize,
      hours_per_day: 8,
      regular_hours: totalHours,
      overtime_hours: 0
    };
  }
}
```

---

## 🎯 EXPECTED OUTCOMES

### **After Fixes:**

**Customer sees:**
```
┌─────────────────────────────────────────────┐
│ 👥 2 Technicians for 8 Hours                │
│ Total project time: 16 hours                │
│ Select a time when our team can arrive...   │
└─────────────────────────────────────────────┘
```

**Console shows:**
```
✅ Labor calculation: {
  crewSize: 2,
  hoursPerDay: 8,
  totalHours: 16,
  hoursPerEmployee: 8,
  durationMinutes: 480
}
```

**Settings loaded:**
```
✅ Company settings loaded: {
  require_signature_on_approval: true,
  require_terms_acceptance: true,
  ...
}
```

---

## 📊 TESTING PLAN

### **Test 1: With Labor Summary**
1. Update quote with labor_summary
2. Reload quote.html
3. Verify job info header shows
4. Verify duration calculated correctly

### **Test 2: Without Labor Summary (Fallback)**
1. Remove labor_summary from quote
2. Reload quote.html
3. Verify defaults to 8 hours
4. Verify no errors in console

### **Test 3: With Settings**
1. Insert settings row for company
2. Reload quote.html
3. Verify settings loaded
4. Verify custom terms text shows

### **Test 4: Without Settings (Fallback)**
1. Delete settings row
2. Reload quote.html
3. Verify defaults used
4. Verify wizard still works

---

## 🚀 DEPLOYMENT STATUS

**Debugging deployed:** ✅  
**Pushed to GitHub:** ✅  
**Vercel auto-deploy:** ✅ (in progress)  

**Next:** Wait for user to refresh quote.html and update logs.md with new debug output

---

## 📝 QUESTIONS FOR USER

1. **Is this an old quote?** (Created before labor_summary feature)
2. **How was this quote created?** (QuoteBuilder, manual, import)
3. **Should we add migration?** (Populate labor_summary for all existing quotes)
4. **Should we add settings migration?** (Create default settings for all companies)

---

**Status:** 🔍 WAITING FOR DATABASE QUERY RESULTS  
**Next Action:** User refreshes quote.html and updates logs.md with new debug output

