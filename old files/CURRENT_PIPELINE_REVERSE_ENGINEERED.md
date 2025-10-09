# 🔍 Current Pipeline - Reverse Engineered

## 📊 How TradeMate Pro Actually Works (Current State)

### **Phase 1: Quote Creation**

**User Action:** Go to Quotes → Create Quote → Fill form → Click "Save Draft" or "Create & Send to Customer"

**Code Flow:**
1. `QuoteBuilder.js` → `handleSaveAndAction()` → `onSubmit()`
2. `QuotesDatabasePanel.js` → `createQuote()`
3. Calculates totals via `calculateTotals()` or `calculateModelTotals()`
4. Generates quote number via `generateQuoteNumber()`
5. Creates work order record

**Tables Used:**
- `work_orders` - Main quote record
- `work_order_items` - Line items (labor, materials)

**Payload Sent:**
```javascript
{
  quote_number: "Q20250930-123456",
  title: "HVAC Installation",
  description: "Install new HVAC system",
  customer_id: "uuid",
  stage: "QUOTE",  // ❌ COLUMN DOESN'T EXIST!
  status: "quote", // ✅ Correct
  notes: "Internal notes",
  subtotal: 1000.00,
  tax_rate: 0.08,
  tax_amount: 80.00,
  total_amount: 1080.00,
  pricing_model: "TIME_MATERIALS",
  service_address_line_1: "123 Main St",
  service_city: "Austin",
  service_state: "TX",
  service_zip_code: "78701"
}
```

**Status After Creation:** `status = 'quote'`

**Problems:**
- ❌ Tries to set `stage: 'QUOTE'` (column doesn't exist)
- ❌ No `quote_sent_at` timestamp
- ❌ No `quote_expires_at` date
- ❌ No delivery tracking
- ❌ Totals sometimes show $0 (calculation issue)

---

### **Phase 2: Quote Delivery**

**User Action:** Click "Create & Send to Customer" or "Send to Customer"

**Code Flow:**
1. `QuoteBuilder.js` → `handleSaveAndAction(e, 'send')`
2. Calls `handleSendToCustomer(quote)`
3. `QuotesPro.js` → Opens `SendQuoteModal`
4. User clicks "Send" in modal
5. `SendQuoteModal.js` → `handleSend()`

**What Actually Happens:**
```javascript
// SendQuoteModal.js line 50
await supaFetch(`work_orders?id=eq.${quote.id}`, { 
  method:'PATCH', 
  body:{ status:'SENT' }  // ❌ 'SENT' not in enum!
}, companyId);

// Opens PDF in new tab
QuotePDFService.openPrintable(companyId, quote.id);

// Shows success message
window?.toast?.success?.('Quote sent');
```

**Tables Used:**
- `work_orders` - Updates status to 'SENT' (❌ not valid enum value)

**Status After Send:** `status = 'SENT'` (❌ INVALID - not in enum!)

**Problems:**
- ❌ Sets status to 'SENT' but enum doesn't have 'SENT'
- ❌ No actual email sent (just opens PDF)
- ❌ No delivery tracking (no record of when sent)
- ❌ No `quote_deliveries` table
- ❌ No tracking if customer viewed quote
- ❌ No follow-up reminders

---

### **Phase 3: Customer Response**

**Current State:** NO WORKFLOW EXISTS

**What Should Happen:**
- Customer views quote in portal
- Customer accepts or rejects
- If rejected, customer provides reason
- System notifies contractor

**What Actually Happens:**
- ❌ No customer portal quote acceptance
- ❌ No rejection tracking
- ❌ No `quote_responses` table
- ❌ Customer has to call/email to accept
- ❌ No digital signature capture

**Status After Accept:** Manual update to `status = 'approved'`

---

### **Phase 4: Change Orders**

**Current State:** NO WORKFLOW EXISTS

**What Should Happen:**
- Customer or contractor requests changes
- Create change order with new line items
- Customer approves change order
- Update work order total

**What Actually Happens:**
- ❌ No `change_orders` table
- ❌ No `change_order_items` table
- ❌ Have to create entirely new quote
- ❌ No audit trail
- ❌ Disputes over what was agreed to

**This is the #1 pain point in the industry!**

---

### **Phase 5: Convert to Job**

**User Action:** Click "Convert to Job" on quote

**Code Flow:**
1. `Quotes.js` → `handleConvertToJob(quoteId)`
2. Finds quote in quotes array
3. Creates NEW work order record

**What Happens:**
```javascript
const response = await supaFetch('work_orders', {
  method: 'POST',
  body: {
    ...quote,
    id: undefined,  // Generate new ID
    stage: 'JOB',   // ❌ Column doesn't exist!
    job_status: 'SCHEDULED',
    quote_status: undefined,
    created_at: undefined,
    updated_at: undefined
  }
});
```

**Tables Used:**
- `work_orders` - Creates NEW record (duplicates data!)

**Status After Convert:** NEW record with `status = 'scheduled'`

**Problems:**
- ❌ Creates duplicate work order (should update existing)
- ❌ Tries to set `stage: 'JOB'` (column doesn't exist)
- ❌ Original quote record remains unchanged
- ❌ No link between quote and job
- ❌ Data duplication

**Industry Standard:** Should UPDATE existing work order, not create new one!

---

### **Phase 6: Job Scheduling**

**Tables Used:**
- `work_orders` - Job record
- `schedule_events` - Calendar events
- `employees` - Assigned technicians

**Status:** `status = 'scheduled'`

**This part seems to work correctly.**

---

### **Phase 7: Job In Progress**

**Tables Used:**
- `work_orders` - Updates status
- `timesheets` - Tech time tracking
- `inventory_usage` - Materials used
- `job_notes` - Notes and photos

**Status:** `status = 'in_progress'`

**This part seems to work correctly.**

---

### **Phase 8: Job Completion**

**Tables Used:**
- `work_orders` - Updates status
- `signatures` - Customer signature
- `documents` - Completion photos

**Status:** `status = 'completed'`

**This part seems to work correctly.**

---

### **Phase 9: Create Invoice**

**User Action:** Click "Create Invoice" from job

**Code Flow:**
1. `JobsDatabasePanel.js` → `handleCreateInvoice(job)`
2. `InvoicesService.js` → `createInvoice()`

**What Happens:**
```javascript
const invoiceData = {
  job_id: job.id,
  customer_id: job.customer_id,
  invoice_number: generateInvoiceNumber(),
  total_amount: job.total_cost || job.total_amount || 0,
  status: 'UNPAID',
  issued_at: new Date().toISOString(),
  due_date: calculateDueDate(),
  notes: `Work Performed: ${job.description}`
};

await supaFetch('invoices', {
  method: 'POST',
  body: invoiceData
});
```

**Tables Used:**
- `invoices` - New invoice record
- `invoice_items` - Line items copied from work_order_items

**Status After Invoice:** 
- work_orders: `status = 'invoiced'`
- invoices: `status = 'UNPAID'`

**Problems:**
- ❌ No `invoice_deliveries` table
- ❌ No delivery tracking
- ❌ No tracking if customer viewed invoice
- ❌ No automated reminders

---

### **Phase 10: Payment**

**Tables Used:**
- `payments` - Payment records
- `invoices` - Updates status

**Status After Payment:**
- invoices: `status = 'PAID'`
- work_orders: No status change (should be 'paid')

**Problems:**
- ❌ No `payment_deliveries` table
- ❌ No receipt delivery tracking
- ❌ work_orders status not updated to 'paid'

---

### **Phase 11: Close Job**

**Current State:** NO WORKFLOW EXISTS

**What Should Happen:**
- Mark job closed
- Request customer review
- Archive records

**What Actually Happens:**
- ❌ No 'closed' status in enum
- ❌ No `closed_at` timestamp
- ❌ No review request automation
- ❌ No `customer_feedback` table

---

## 🔴 Critical Problems Found

### **1. Status Enum Mismatch**
**Current Enum:**
```
draft, quote, approved, scheduled, parts_ordered, on_hold, 
in_progress, requires_approval, rework_needed, completed, 
invoiced, cancelled
```

**Code Tries to Use:**
- `'SENT'` - ❌ Not in enum
- `'REJECTED'` - ❌ Not in enum
- `'PAID'` - ❌ Not in enum
- `'CLOSED'` - ❌ Not in enum

### **2. Stage Column Doesn't Exist**
**Code tries to set:**
- `stage: 'QUOTE'` - ❌ Column doesn't exist
- `stage: 'JOB'` - ❌ Column doesn't exist

**Should use:** `status` column only

### **3. Duplicate Work Orders**
**Problem:** Converting quote to job creates NEW work order instead of updating existing

**Should be:** Update existing work order status from 'quote' → 'approved' → 'scheduled'

### **4. Missing Tables**
- ❌ `quote_deliveries` - No delivery tracking
- ❌ `quote_responses` - No acceptance/rejection tracking
- ❌ `change_orders` - No change order workflow
- ❌ `change_order_items` - No change order line items
- ❌ `invoice_deliveries` - No invoice delivery tracking
- ❌ `payment_deliveries` - No receipt tracking
- ❌ `customer_feedback` - No review tracking

### **5. Missing Columns in work_orders**
- ❌ `quote_sent_at` - When quote was sent
- ❌ `quote_viewed_at` - When customer viewed
- ❌ `quote_expires_at` - When quote expires
- ❌ `quote_accepted_at` - When customer accepted
- ❌ `quote_rejected_at` - When customer rejected
- ❌ `quote_rejection_reason` - Why rejected
- ❌ `has_change_orders` - Flag for change orders
- ❌ `change_orders_total` - Total of change orders
- ❌ `invoice_sent_at` - When invoice was sent
- ❌ `invoice_viewed_at` - When customer viewed invoice
- ❌ `paid_at` - When invoice was paid
- ❌ `closed_at` - When job was closed

---

## 📊 Current vs Industry Standard

| Feature | Current | Industry Standard | Gap |
|---------|---------|-------------------|-----|
| Quote Creation | ✅ Works | ✅ Works | None |
| Quote Delivery | ⚠️ Opens PDF | ✅ Email + Portal + SMS | Missing delivery tracking |
| Delivery Tracking | ❌ None | ✅ Track views/opens | Critical |
| Customer Acceptance | ❌ Manual | ✅ Portal workflow | Critical |
| Rejection Tracking | ❌ None | ✅ Track reasons | High |
| Change Orders | ❌ None | ✅ Full workflow | CRITICAL |
| Quote → Job | ⚠️ Duplicates | ✅ Updates status | High |
| Invoice Delivery | ⚠️ Manual | ✅ Email + Portal + SMS | High |
| Invoice Tracking | ❌ None | ✅ Track views/opens | High |
| Payment Tracking | ⚠️ Basic | ✅ Full tracking | Medium |
| Job Closure | ❌ None | ✅ Automated | Medium |
| Review Requests | ❌ None | ✅ Automated | Low |

---

## ✅ What to Fix

### **Immediate (Phase 1):**
1. Add status enum values: `sent`, `rejected`, `paid`, `closed`
2. Remove all `stage` column references
3. Fix quote → job conversion (update instead of duplicate)
4. Create `quote_deliveries` table
5. Create `quote_responses` table
6. Create `change_orders` + `change_order_items` tables
7. Add timestamp columns to `work_orders`

### **Next (Phase 2):**
8. Build quote delivery tracking UI
9. Build customer portal acceptance workflow
10. Build change order workflow
11. Create `invoice_deliveries` table
12. Build invoice delivery tracking

### **Later (Phase 3):**
13. Add automated follow-ups
14. Add review automation
15. Add payment plans
16. Add warranty tracking

---

## 🎯 Summary

**Current Pipeline:**
```
Quote (status='quote') → Send (tries status='SENT' ❌) → 
Manual Accept → Convert (creates NEW work order ❌) → 
Job (status='scheduled') → In Progress → Complete → 
Invoice (separate table) → Payment → (no close workflow)
```

**Should Be:**
```
Quote (status='quote') → Send (status='sent' + tracking) → 
Accept/Reject (status='approved'/'rejected' + reason) → 
Schedule (status='scheduled') → In Progress → Complete → 
Invoice (status='invoiced' + tracking) → Payment (status='paid') → 
Close (status='closed' + review request)
```

**Biggest Issues:**
1. 🔥 No change order workflow (CRITICAL)
2. 🔥 Quote → Job creates duplicate (HIGH)
3. 🔥 No delivery tracking (HIGH)
4. 🔥 Invalid status values used (HIGH)
5. 🔥 Stage column doesn't exist (HIGH)

