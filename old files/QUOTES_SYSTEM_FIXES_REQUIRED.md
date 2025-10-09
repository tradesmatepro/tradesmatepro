# 🔧 QUOTES SYSTEM - INDUSTRY STANDARD FIXES

## ✅ WHAT'S CORRECT (Keep These)

1. **Unified Work Orders Table** ✅
   - Using `work_orders` table for quotes, jobs, and invoices
   - This IS industry standard (ServiceTitan/Jobber/Housecall Pro)
   - Status-based pipeline: `draft` → `quote` → `approved` → `scheduled` → `in_progress` → `completed` → `invoiced`

2. **Status Enum** ✅
   - Has proper values: `'draft', 'quote', 'approved', 'scheduled', 'parts_ordered', 'on_hold', 'in_progress', 'requires_approval', 'rework_needed', 'completed', 'invoiced', 'cancelled'`
   - Lowercase values (industry standard)

3. **Line Items** ✅
   - Separate `work_order_line_items` table
   - Proper structure for itemized quotes

---

## 🚨 CRITICAL FIXES NEEDED

### **Fix 1: Remove `customers_with_tags` Reference**

**Error in Logs**:
```
GET /rest/v1/customers_with_tags 404 (Not Found)
Could not find the table 'public.customers_with_tags'
```

**Location**: `src/components/QuotesDatabasePanel.js` Line 97

**Current Code (WRONG)**:
```javascript
const response = await supaFetch('customers_with_tags?order=created_at.desc', {
  method: 'GET'
}, user.company_id);
```

**Fixed Code (INDUSTRY STANDARD)**:
```javascript
// Option 1: Simple query (if you don't need tags immediately)
const response = await supaFetch(
  'customers?select=*&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);

// Option 2: With tags (if you need them)
const response = await supaFetch(
  'customers?select=*,customer_tag_assignments(customer_tags(*))&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);
```

**Why**: The view `customers_with_tags` doesn't exist. Use proper PostgREST joins instead.

---

### **Fix 2: Add Missing Quote Lifecycle Fields**

**What's Missing**: Quote-specific tracking fields

**Industry Standard Fields Needed**:
- `quote_sent_at` - When quote was emailed to customer
- `quote_viewed_at` - When customer opened the quote
- `quote_expires_at` - When quote expires (typically 30 days)
- `quote_accepted_at` - When customer accepted
- `quote_rejected_at` - When customer rejected
- `quote_rejection_reason` - Why customer rejected
- `quote_terms` - Payment terms ("Net 30", "50% deposit")
- `quote_notes` - Customer-facing notes
- `internal_notes` - Staff-only notes (already exists)

**SQL to Add Fields**:
```sql
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS quote_terms TEXT DEFAULT 'Net 30',
ADD COLUMN IF NOT EXISTS quote_notes TEXT;
```

---

### **Fix 3: Add Quote Versioning**

**Industry Standard**: Track quote revisions (v1, v2, v3)

**Fields Needed**:
- `quote_version` - Version number (1, 2, 3)
- `quote_parent_id` - Link to original quote

**SQL**:
```sql
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS quote_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quote_parent_id UUID REFERENCES work_orders(id);

CREATE INDEX IF NOT EXISTS idx_work_orders_quote_parent ON work_orders(quote_parent_id);
```

---

### **Fix 4: Add Quote Number Generation**

**Current**: May not have consistent quote numbering

**Industry Standard**: `QT-YYYYMM-XXXX` format

**Example**: `QT-202509-0001`, `QT-202509-0002`

**SQL Function**:
```sql
CREATE OR REPLACE FUNCTION generate_quote_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_month TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_number FROM 12) AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders
    WHERE company_id = company_uuid
    AND work_order_number LIKE 'QT-' || year_month || '-%';
    
    RETURN 'QT-' || year_month || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

---

### **Fix 5: Create `customers_with_tags` View (Optional)**

**If you want to keep the view approach**:

```sql
CREATE OR REPLACE VIEW customers_with_tags AS
SELECT 
    c.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', ct.id,
                'name', ct.name,
                'color', ct.color,
                'description', ct.description
            )
        ) FILTER (WHERE ct.id IS NOT NULL),
        '[]'::json
    ) as tags
FROM customers c
LEFT JOIN customer_tag_assignments cta ON cta.customer_id = c.id
LEFT JOIN customer_tags ct ON ct.id = cta.tag_id
GROUP BY c.id;
```

---

## 📋 ADDITIONAL INDUSTRY STANDARD FEATURES

### **Feature 1: Quote Templates**

**What**: Pre-built quote templates for common services

**Tables Needed**:
```sql
CREATE TABLE quote_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "HVAC Installation", "Electrical Repair"
    description TEXT,
    category TEXT, -- "HVAC", "Electrical", "Plumbing"
    default_pricing_model TEXT DEFAULT 'TIME_MATERIALS',
    default_terms TEXT DEFAULT 'Net 30',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quote_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES quote_templates(id) ON DELETE CASCADE,
    line_type TEXT NOT NULL, -- 'labor', 'material', 'equipment'
    description TEXT NOT NULL,
    quantity NUMERIC(10,3) DEFAULT 1.000,
    unit_price NUMERIC(10,2) NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Feature 2: Quote Approval Workflow**

**What**: Internal approval before sending to customer

**Table**:
```sql
CREATE TABLE quote_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    decision_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Feature 3: Quote Follow-ups**

**What**: Automated follow-up reminders

**Table**:
```sql
CREATE TABLE quote_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    follow_up_type TEXT CHECK (follow_up_type IN ('email', 'sms', 'call', 'task')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    outcome TEXT, -- 'NO_RESPONSE', 'INTERESTED', 'NOT_INTERESTED', 'ACCEPTED', 'REJECTED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Feature 4: Quote Analytics**

**What**: Track quote performance metrics

**Table**:
```sql
CREATE TABLE quote_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    quote_sent_at TIMESTAMPTZ,
    quote_viewed_at TIMESTAMPTZ,
    quote_accepted_at TIMESTAMPTZ,
    quote_rejected_at TIMESTAMPTZ,
    time_to_view_hours NUMERIC, -- Hours between sent and viewed
    time_to_decision_hours NUMERIC, -- Hours between sent and accepted/rejected
    conversion_rate NUMERIC, -- 1.0 if accepted, 0.0 if rejected
    quote_value NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 IMPLEMENTATION PRIORITY

### **Phase 1: Fix Critical Errors (Today)** 🚨
1. ✅ Fix `customers_with_tags` error in QuotesDatabasePanel.js
2. ✅ Test quote creation end-to-end
3. ✅ Verify customer loading works

### **Phase 2: Add Missing Fields (This Week)**
1. Add quote lifecycle fields to `work_orders` table
2. Update QuoteBuilder form to use new fields
3. Add quote expiration date picker
4. Add quote terms field
5. Test quote lifecycle tracking

### **Phase 3: Add Quote Versioning (Next Week)**
1. Add version fields to database
2. Add "Create New Version" button
3. Show version history in UI
4. Test version tracking

### **Phase 4: Add Advanced Features (Future)**
1. Quote templates
2. Quote approval workflow
3. Quote follow-ups
4. Quote analytics dashboard

---

## 📝 FILES TO UPDATE

### **Immediate Fixes**:
1. `src/components/QuotesDatabasePanel.js` - Fix customer loading
2. `sql_fixes/ADD_QUOTE_LIFECYCLE_FIELDS.sql` - Add missing fields
3. `src/components/QuoteBuilder.js` - Add new form fields

### **Future Updates**:
1. `src/pages/Quotes.js` - Add version history display
2. `src/components/QuoteTemplates.js` - New component for templates
3. `src/components/QuoteApproval.js` - New component for approvals
4. `src/components/QuoteFollowUps.js` - New component for follow-ups

---

## ✅ READY TO FIX

**Want me to**:
1. **Fix the immediate error** (customers_with_tags) - 5 minutes
2. **Add missing quote fields** to database - 10 minutes
3. **Update the form** to use new fields - 20 minutes
4. **Full industry standard implementation** - 2-3 days

**Which approach do you want?**
