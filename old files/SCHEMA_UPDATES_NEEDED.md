# 🔧 Schema Updates Needed - Industry Standard Pipeline

## 📊 Current State vs Industry Standard

### **Current work_order_status_enum:**
```
draft, quote, approved, scheduled, parts_ordered, on_hold, 
in_progress, requires_approval, rework_needed, completed, 
invoiced, cancelled
```

### **Missing Status Values:**
- ❌ `sent` - Quote has been sent to customer
- ❌ `rejected` - Customer rejected quote
- ❌ `paid` - Invoice has been paid
- ❌ `closed` - Job is fully closed

### **Recommended Status Enum:**
```sql
CREATE TYPE work_order_status_enum AS ENUM (
  'draft',           -- Initial creation
  'quote',           -- Quote created but not sent
  'sent',            -- Quote sent to customer (NEW)
  'approved',        -- Customer accepted quote
  'rejected',        -- Customer rejected quote (NEW)
  'scheduled',       -- Job scheduled
  'parts_ordered',   -- Waiting for parts
  'on_hold',         -- Temporarily paused
  'in_progress',     -- Work in progress
  'requires_approval', -- Needs approval
  'rework_needed',   -- Needs rework
  'completed',       -- Work completed
  'invoiced',        -- Invoice generated
  'paid',            -- Invoice paid (NEW)
  'closed',          -- Job fully closed (NEW)
  'cancelled'        -- Cancelled
);
```

---

## 🆕 New Tables Needed

### **1. quote_deliveries** (CRITICAL)
**Purpose:** Track how quotes are delivered and if customer viewed them

```sql
CREATE TABLE quote_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_method TEXT NOT NULL, -- 'email', 'sms', 'portal', 'download'
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Tracking
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ, -- Email/SMS delivered
  viewed_at TIMESTAMPTZ,    -- Customer opened quote
  opened_at TIMESTAMPTZ,    -- Customer clicked link
  
  -- Content
  pdf_url TEXT,
  portal_link TEXT,
  email_subject TEXT,
  email_body TEXT,
  sms_body TEXT,
  
  -- Status
  delivery_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'viewed', 'failed'
  error_message TEXT,
  
  -- Metadata
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_deliveries_work_order ON quote_deliveries(work_order_id);
CREATE INDEX idx_quote_deliveries_company ON quote_deliveries(company_id);
CREATE INDEX idx_quote_deliveries_status ON quote_deliveries(delivery_status);
```

---

### **2. quote_responses** (HIGH PRIORITY)
**Purpose:** Track customer acceptance/rejection with reasons

```sql
CREATE TABLE quote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Response details
  response_type TEXT NOT NULL, -- 'accepted', 'rejected', 'changes_requested'
  rejection_reason TEXT,       -- Why customer rejected
  rejection_category TEXT,     -- 'price_too_high', 'timeline_too_long', 'went_with_competitor', 'other'
  change_request_notes TEXT,   -- What customer wants changed
  
  -- Signature (if accepted)
  signature_id UUID REFERENCES signatures(id),
  signature_data TEXT,         -- Base64 signature image
  
  -- Customer info
  responded_by_name TEXT,
  responded_by_email TEXT,
  responded_by_phone TEXT,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- IP/Device tracking
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_responses_work_order ON quote_responses(work_order_id);
CREATE INDEX idx_quote_responses_company ON quote_responses(company_id);
CREATE INDEX idx_quote_responses_type ON quote_responses(response_type);
```

---

### **3. change_orders** (CRITICAL - BIGGEST PAIN POINT)
**Purpose:** Proper change order management

```sql
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Change order details
  change_order_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT, -- 'customer_request', 'scope_change', 'unforeseen_work', 'code_requirement', 'other'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'rejected', 'cancelled'
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Approval
  requested_by UUID REFERENCES profiles(id),
  approved_by_name TEXT,
  approved_by_email TEXT,
  signature_id UUID REFERENCES signatures(id),
  signature_data TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_change_orders_work_order ON change_orders(work_order_id);
CREATE INDEX idx_change_orders_company ON change_orders(company_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_change_orders_number ON change_orders(change_order_number);
```

---

### **4. change_order_items**
**Purpose:** Line items for change orders

```sql
CREATE TABLE change_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  
  -- Item details
  item_type TEXT NOT NULL, -- 'addition', 'deletion', 'modification'
  description TEXT NOT NULL,
  category TEXT, -- 'labor', 'material', 'equipment', 'service'
  
  -- Pricing
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_change_order_items_change_order ON change_order_items(change_order_id);
CREATE INDEX idx_change_order_items_company ON change_order_items(company_id);
```

---

### **5. invoice_deliveries** (HIGH PRIORITY)
**Purpose:** Track invoice delivery and views

```sql
CREATE TABLE invoice_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_method TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Tracking
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  
  -- Content
  pdf_url TEXT,
  portal_link TEXT,
  payment_link TEXT,
  
  -- Status
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Metadata
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_deliveries_invoice ON invoice_deliveries(invoice_id);
CREATE INDEX idx_invoice_deliveries_company ON invoice_deliveries(company_id);
```

---

### **6. payment_deliveries** (MEDIUM PRIORITY)
**Purpose:** Track receipt delivery

```sql
CREATE TABLE payment_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_method TEXT NOT NULL,
  recipient_email TEXT,
  
  -- Tracking
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  -- Content
  receipt_pdf_url TEXT,
  
  -- Status
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_deliveries_payment ON payment_deliveries(payment_id);
CREATE INDEX idx_payment_deliveries_company ON payment_deliveries(company_id);
```

---

### **7. job_completion_checklist** (MEDIUM PRIORITY)
**Purpose:** Required completion steps

```sql
CREATE TABLE job_completion_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Checklist item
  item_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  
  -- Completion details
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_completion_checklist_work_order ON job_completion_checklist(work_order_id);
CREATE INDEX idx_job_completion_checklist_company ON job_completion_checklist(company_id);
```

---

### **8. customer_feedback** (LOW PRIORITY)
**Purpose:** Customer satisfaction surveys

```sql
CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Ratings
  overall_rating INTEGER, -- 1-5 stars
  quality_rating INTEGER,
  timeliness_rating INTEGER,
  professionalism_rating INTEGER,
  value_rating INTEGER,
  
  -- Feedback
  comments TEXT,
  would_recommend BOOLEAN,
  
  -- Review
  review_posted BOOLEAN DEFAULT false,
  review_platform TEXT, -- 'google', 'yelp', 'facebook', 'internal'
  review_url TEXT,
  
  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_feedback_work_order ON customer_feedback(work_order_id);
CREATE INDEX idx_customer_feedback_company ON customer_feedback(company_id);
CREATE INDEX idx_customer_feedback_customer ON customer_feedback(customer_id);
```

---

## 🔄 Columns to Add to Existing Tables

### **work_orders table:**
```sql
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_viewed_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_expires_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_rejected_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_rejection_reason TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS has_change_orders BOOLEAN DEFAULT false;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS change_orders_total DECIMAL(10,2) DEFAULT 0;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS invoice_viewed_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
```

---

## 🎯 Implementation Priority

### **Phase 1: Critical (Do Now)**
1. ✅ Add status enum values (`sent`, `rejected`, `paid`, `closed`)
2. ✅ Create `quote_deliveries` table
3. ✅ Create `quote_responses` table
4. ✅ Create `change_orders` + `change_order_items` tables
5. ✅ Add timestamp columns to `work_orders`

### **Phase 2: High Priority (Next Sprint)**
6. ✅ Create `invoice_deliveries` table
7. ✅ Build quote delivery tracking UI
8. ✅ Build change order workflow UI

### **Phase 3: Medium Priority (Later)**
9. ✅ Create `payment_deliveries` table
10. ✅ Create `job_completion_checklist` table
11. ✅ Build customer portal quote acceptance

### **Phase 4: Low Priority (Future)**
12. ✅ Create `customer_feedback` table
13. ✅ Build review automation

---

## ✅ Summary

**New Tables:** 8
**Modified Tables:** 1 (work_orders)
**New Enum Values:** 4 (sent, rejected, paid, closed)

**Biggest Impact:**
1. 🔥 Change orders - Solves #1 pain point
2. 🔥 Delivery tracking - Know if customer viewed quote/invoice
3. 🔥 Rejection tracking - Know WHY customers reject

**Ready to implement?** Let me know and I'll create the migration SQL!

