# 🔍 REVERSE ENGINEERING: Create & Send Quote Flow

## 📋 USER ACTION: "Create & Send to Customer"

### **Step 1: User fills out quote form**
**Location:** QuoteBuilder.js

**User enters:**
1. ✅ Quote Title (required)
2. ✅ Customer (select existing or add new)
3. ✅ Service Address (residential/commercial/photo estimate)
4. ✅ Line Items (materials/labor)
5. ✅ Internal Notes (private)
6. ✅ Customer Notes (visible on PDF)
7. ✅ Pricing Model (TIME_MATERIALS, FLAT_RATE, etc.)

**User clicks:** "Create & Send to Customer" button (line 1494)

---

### **Step 2: handleSaveAndAction triggered**
**Location:** QuoteBuilder.js line 114

```javascript
const handleSaveAndAction = async (e, action) => {
  e.preventDefault();
  setActionAfterSave('send'); // Set action to 'send'
  
  await onSubmit(e); // Call createQuote
  
  // After save, call handleSendToCustomer
  if (action === 'send' && handleSendToCustomer && formData.id) {
    setTimeout(() => handleSendToCustomer(formData), 500);
  }
}
```

---

### **Step 3: createQuote called**
**Location:** QuotesDatabasePanel.js line 267

**What it does:**
1. ✅ Validates customer_id and title
2. ✅ Calculates totals (subtotal, tax, total_amount)
3. ✅ Prepares service address data
4. ✅ Creates workOrderCreate payload
5. ✅ POSTs to `/work_orders` endpoint
6. ✅ Saves quote_items to work_order_items table

---

## 🔴 PROBLEM: Payload vs Database Mismatch

### **What Frontend SENDS (workOrderCreate):**

```javascript
{
  quote_number: "Q-2024-001",
  title: "HVAC Installation",
  description: "...",
  customer_id: "uuid",
  status: "quote",
  notes: "internal notes",
  labor_summary: {...},
  subtotal: 1000.00,
  tax_rate: 0.08,
  tax_amount: 80.00,
  total_amount: 1080.00,
  pricing_model: "TIME_MATERIALS",
  
  // ❌ THESE DON'T EXIST IN work_orders TABLE:
  service_address_line_1: "123 Main St",  // ❌
  service_city: "Springfield",             // ❌
  service_state: "IL",                     // ❌
  service_zip_code: "62701",               // ❌
  
  // ❌ ALSO BEING SENT (from dataToUse spread):
  invoice_number: undefined,               // ❌ Doesn't exist
  street_address: undefined,               // ❌ Wrong column name
  city: undefined,                         // ❌ Wrong column name
  state: undefined,                        // ❌ Wrong column name
  zip_code: undefined,                     // ❌ Wrong column name
  
  created_at: "2024-01-15T10:30:00Z"
}
```

---

### **What Database EXPECTS (work_orders columns):**

**From schema_dump.json lines 6287-7000:**

```sql
CREATE TABLE work_orders (
  -- ✅ Identity
  id UUID PRIMARY KEY,
  company_id UUID,
  work_order_number TEXT NOT NULL,  -- ⚠️ NOT quote_number!
  
  -- ✅ Customer
  customer_id UUID,
  customer_address_id UUID,  -- ⚠️ FK to customer_addresses table
  
  -- ✅ Status
  status work_order_status_enum DEFAULT 'draft',
  priority work_order_priority_enum DEFAULT 'normal',
  
  -- ✅ Basic Info
  title TEXT NOT NULL,
  description TEXT,
  
  -- ✅ Scheduling
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  assigned_to UUID,
  
  -- ✅ Financial
  subtotal NUMERIC DEFAULT 0.00,
  tax_amount NUMERIC DEFAULT 0.00,
  total_amount NUMERIC DEFAULT 0.00,
  
  -- ✅ Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- ❌ NO service_address_* columns
  -- ❌ NO quote_number column
  -- ❌ NO street_address, city, state, zip_code columns
  -- ❌ NO invoice_number column
  
  -- ✅ Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔍 WHAT'S MISSING / MISALIGNED

### **Issue 1: Address columns don't exist**
**Frontend sends:**
- `service_address_line_1`
- `service_city`
- `service_state`
- `service_zip_code`

**Database has:**
- `customer_address_id` (FK to customer_addresses table)
- NO individual address columns

**Industry Standard (Jobber/ServiceTitan):**
- work_orders has `service_location_id` FK
- Separate `service_locations` table with address details
- OR embedded address columns in work_orders

---

### **Issue 2: quote_number doesn't exist**
**Frontend sends:**
- `quote_number: "Q-2024-001"`

**Database has:**
- `work_order_number` (required, NOT NULL)

**Industry Standard:**
- Unified pipeline uses single `work_order_number`
- OR separate `quote_number` column for quote stage

---

### **Issue 3: Undefined fields being sent**
**Frontend logs show:**
```javascript
{
  street_address: undefined,
  city: undefined,
  state: undefined,
  zip_code: undefined,
  invoice_number: undefined
}
```

**Why?**
- `dataToUse` (formData) contains these undefined fields
- Spread operator `...serviceAddressData` includes them
- PostgREST rejects columns that don't exist

---

## ✅ WHAT NEEDS TO HAPPEN

### **Option A: Add address columns to work_orders (Simple)**
```sql
ALTER TABLE work_orders 
ADD COLUMN service_address_line_1 TEXT,
ADD COLUMN service_address_line_2 TEXT,
ADD COLUMN service_city TEXT,
ADD COLUMN service_state TEXT,
ADD COLUMN service_zip_code TEXT,
ADD COLUMN access_instructions TEXT;
```

**Pros:**
- ✅ Quick fix
- ✅ Matches what frontend already sends
- ✅ Industry standard (Jobber does this)

**Cons:**
- ❌ Denormalized (address data duplicated)

---

### **Option B: Use customer_address_id FK (Normalized)**
```sql
-- work_orders already has customer_address_id column
-- Just need to:
1. Create customer_addresses table (if not exists)
2. Frontend sends customer_address_id instead of individual fields
3. Join to get address when needed
```

**Pros:**
- ✅ Normalized (no duplication)
- ✅ Supports multiple addresses per customer

**Cons:**
- ❌ Requires frontend refactor
- ❌ More complex queries (joins)

---

### **Option C: Hybrid (Industry Standard)**
```sql
-- Add both:
1. customer_address_id FK (for linking)
2. service_address_* columns (for denormalized access)

-- Trigger to sync address data when customer_address_id changes
```

**Pros:**
- ✅ Best of both worlds
- ✅ Fast queries (no joins needed)
- ✅ Maintains relationships

**Cons:**
- ❌ More complex schema

---

## 🎯 RECOMMENDED FIX (Option A - Quick Win)

### **1. Add address columns to work_orders**
```sql
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS service_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS service_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS service_city TEXT,
ADD COLUMN IF NOT EXISTS service_state TEXT,
ADD COLUMN IF NOT EXISTS service_zip_code TEXT,
ADD COLUMN IF NOT EXISTS access_instructions TEXT;
```

### **2. Add quote_number column**
```sql
-- quote_number already exists! (line 6878 in schema_dump.json)
-- ✅ No change needed
```

### **3. Fix frontend to NOT send undefined fields**
**Location:** QuotesDatabasePanel.js line 391

**Before:**
```javascript
const workOrderCreate = {
  ...dataToUse,  // ❌ Includes undefined fields
  ...serviceAddressData,
  ...
};
```

**After:**
```javascript
const workOrderCreate = {
  // ✅ Only send defined fields
  quote_number: generateQuoteNumber(),
  title: dataToUse.title,
  description: dataToUse.description,
  customer_id: dataToUse.customer_id,
  status: (dataToUse.status || 'quote').toLowerCase(),
  notes: dataToUse.notes,
  // ... only fields that exist in work_orders table
};
```

---

## 📝 NEXT STEPS

1. ✅ Pull actual schema (already have schema_dump.json)
2. ✅ Identify missing columns
3. ⏳ Add missing columns to work_orders
4. ⏳ Fix frontend to only send valid columns
5. ⏳ Test quote creation
6. ⏳ Test "Send to Customer" flow

