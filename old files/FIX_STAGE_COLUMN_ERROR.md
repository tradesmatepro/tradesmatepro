# ✅ Fixed: "Could not find the 'stage' column" Error

## 🔍 Root Cause

**Error Message:**
```
POST /rest/v1/work_orders 400 (Bad Request)
{"code":"PGRST204","details":null,"hint":null,"message":"Could not find the 'stage' column of 'work_orders' in the schema cache"}
```

**Problem:**
- Frontend was trying to save `stage: 'QUOTE'` to work_orders table
- Database has NO `stage` column
- Database uses `status` column with `work_order_status_enum`

**Enum values (lowercase):**
```
draft, quote, approved, scheduled, parts_ordered, on_hold, 
in_progress, requires_approval, rework_needed, completed, 
invoiced, cancelled
```

---

## ✅ Fixes Applied

### **1. Removed `stage` column from create payload**

**File:** `src/components/QuotesDatabasePanel.js`

**Before (line 396):**
```javascript
const workOrderCreate = {
  quote_number: generateQuoteNumber(),
  title: dataToUse.title,
  description: dataToUse.description,
  customer_id: dataToUse.customer_id,
  stage: 'QUOTE',  // ❌ Column doesn't exist!
  status: dataToUse.status || 'QUOTE',  // ❌ Wrong case!
  ...
};
```

**After:**
```javascript
const workOrderCreate = {
  quote_number: generateQuoteNumber(),
  title: dataToUse.title,
  description: dataToUse.description,
  customer_id: dataToUse.customer_id,
  // NO stage column - only status (work_order_status_enum)
  status: (dataToUse.status || 'quote').toLowerCase(), // ✅ Lowercase for enum
  ...
};
```

---

### **2. Fixed status initialization**

**Before (line 28):**
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  customer_id: '',
  status: 'QUOTE',  // ❌ Wrong case!
  ...
});
```

**After:**
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  customer_id: '',
  status: 'quote',  // ✅ Lowercase for enum
  ...
});
```

---

### **3. Fixed update payload**

**Before (line 576):**
```javascript
const workOrderUpdate = {
  title: dataToUse.title,
  description: dataToUse.description,
  customer_id: dataToUse.customer_id,
  status: dataToUse.status || 'QUOTE',  // ❌ Wrong case!
  ...
};
```

**After:**
```javascript
const workOrderUpdate = {
  title: dataToUse.title,
  description: dataToUse.description,
  customer_id: dataToUse.customer_id,
  status: (dataToUse.status || 'quote').toLowerCase(),  // ✅ Lowercase for enum
  ...
};
```

---

### **4. Fixed navigation logic**

**Before (lines 700-720):**
```javascript
const newStage = updated?.stage || selectedQuote.stage;  // ❌ stage doesn't exist!
const newStatus = updated?.status || dataToUse.status;

// Navigate based on status change (trigger should handle stage automatically)
if (dataToUse.status === 'ACCEPTED') {  // ❌ Wrong case!
  // ...
} else {
  // For other status changes, stay on quotes or navigate based on returned stage
  if (newStage === 'JOB') {  // ❌ stage doesn't exist!
    navigate(`/jobs`);
  } else if (newStage === 'WORK_ORDER') {  // ❌ stage doesn't exist!
    navigate(`/calendar`);
  }
}
```

**After:**
```javascript
const newStatus = updated?.status || dataToUse.status;

// Navigate based on status change (work_orders uses status enum, not stage)
if (dataToUse.status === 'approved' || dataToUse.status === 'ACCEPTED') {  // ✅ Handle both cases
  // Show scheduling prompt, then navigate to jobs
  const shouldSchedule = window.confirm('Quote accepted! Would you like to schedule this job now?');
  if (shouldSchedule) {
    navigate(`/jobs?edit=${selectedQuote.id}&schedule=new`);
  } else {
    navigate(`/jobs`);
  }
} else if (newStatus === 'scheduled' || newStatus === 'in_progress') {  // ✅ Use status enum
  navigate(`/jobs`);
} else {
  // Remain on quotes list
  resetForm();
  setShowEditForm(false);
  setSelectedQuote(null);
  loadQuotes();
}
```

---

### **5. Fixed edit form initialization**

**Before (line 1048):**
```javascript
setFormData({
  title: wo.title || '',
  description: wo.description || '',
  customer_id: wo.customer_id || '',
  status: wo.status || 'QUOTE',  // ❌ Wrong case!
  ...
});
```

**After:**
```javascript
setFormData({
  title: wo.title || '',
  description: wo.description || '',
  customer_id: wo.customer_id || '',
  status: wo.status || 'quote',  // ✅ Lowercase for enum
  ...
});
```

---

## 📊 Database Schema (Verified)

**work_orders table:**
- ✅ `status` column (work_order_status_enum)
- ❌ NO `stage` column

**work_order_status_enum values:**
```
draft          - Initial state
quote          - Quote created (not sent yet)
approved       - Quote approved by customer
scheduled      - Job scheduled
parts_ordered  - Waiting for parts
on_hold        - Temporarily paused
in_progress    - Work in progress
requires_approval - Needs approval
rework_needed  - Needs rework
completed      - Work completed
invoiced       - Invoice sent
cancelled      - Cancelled
```

---

## 🧪 Testing

### **Test 1: Create Quote**
1. **Go to Quotes → Create Quote**
2. **Fill in:**
   - Title: "Test Quote"
   - Customer: "arlie smith"
   - Add a line item
3. **Click "Save Quote"**
4. **Expected:**
   - ✅ Quote saves successfully (no 400 error)
   - ✅ No "Could not find the 'stage' column" error
   - ✅ Status = 'quote' in database

### **Test 2: Check Console**
1. **Open browser console**
2. **Create a quote**
3. **Expected:**
   - ✅ No 400 errors
   - ✅ No "stage" column errors
   - ✅ POST request succeeds

---

## 📝 Files Modified

1. **src/components/QuotesDatabasePanel.js** - Fixed all `stage` references and status casing

---

## ✅ Summary

**Fixed:**
1. ✅ Removed `stage: 'QUOTE'` from create payload (column doesn't exist)
2. ✅ Changed all `status: 'QUOTE'` → `status: 'quote'` (lowercase for enum)
3. ✅ Fixed navigation logic to use `status` instead of `stage`
4. ✅ Added `.toLowerCase()` to ensure enum compatibility

**Result:**
- ✅ Quotes can now be created without 400 errors
- ✅ No more "Could not find the 'stage' column" errors
- ✅ Status values match database enum (lowercase)

