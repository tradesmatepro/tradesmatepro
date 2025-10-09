# 📋 MISSING TABLES LIST + SettingsService Fix

## ✅ **SETTINGSSERVICE ERROR FIXED**

**Error:** `SettingsService.getInvoiceConfig is not a function`

**Fix Applied:** Added the missing `getInvoiceConfig` method to `src/services/SettingsService.js`

The method now returns comprehensive invoice configuration including:
- Invoice numbering (prefix, start number)
- Company details for invoice headers
- Payment terms, tax rates, late fees
- Template settings (logo, notes, terms)
- Currency and formatting options

---

## 📋 **MISSING TABLES - COMPREHENSIVE LIST**

### **🔴 CRITICAL MISSING TABLES (Causing 404 Errors)**

#### **1. notifications**
```sql
-- System notifications and alerts
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id), -- NULL for broadcast notifications
  type TEXT NOT NULL, -- 'INVENTORY', 'PAYMENT', 'SYSTEM', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- ID of related record (invoice, work_order, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. user_dashboard_settings**
```sql
-- User dashboard customization
CREATE TABLE user_dashboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  widget_layout JSONB, -- Dashboard widget positions
  preferences JSONB, -- User preferences
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);
```

#### **3. payments**
```sql
-- Payment tracking for invoices
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  invoice_id UUID REFERENCES invoices(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT, -- 'cash', 'check', 'credit_card', 'bank_transfer'
  transaction_id TEXT, -- External transaction reference
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **🟡 IMPORTANT MISSING TABLES (CRM & Sales)**

#### **4. customer_communications**
```sql
-- Customer interaction history
CREATE TABLE customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'text'
  subject TEXT,
  notes TEXT,
  duration_minutes INTEGER,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **5. customer_messages**
```sql
-- Direct messaging with customers
CREATE TABLE customer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  channel TEXT, -- 'sms', 'email', 'portal'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **6. customer_tags**
```sql
-- Customer categorization
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  color TEXT, -- Hex color for UI
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Junction table for customer-tag relationships
CREATE TABLE customer_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  tag_id UUID REFERENCES customer_tags(id),
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, tag_id)
);
```

#### **7. customer_service_agreements**
```sql
-- Service contracts and maintenance agreements
CREATE TABLE customer_service_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  customer_id UUID REFERENCES customers(id),
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT, -- 'maintenance', 'warranty', 'support'
  start_date DATE,
  end_date DATE,
  billing_frequency TEXT, -- 'monthly', 'quarterly', 'annually'
  amount NUMERIC,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **8. sales_activities**
```sql
-- Sales pipeline activities
CREATE TABLE sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  customer_id UUID REFERENCES customers(id),
  user_id UUID REFERENCES users(id),
  activity_type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'demo'
  subject TEXT,
  description TEXT,
  status TEXT DEFAULT 'planned', -- 'planned', 'completed', 'cancelled'
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  outcome TEXT, -- 'positive', 'negative', 'neutral'
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **9. leads**
```sql
-- Lead management
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT, -- 'website', 'referral', 'advertising', 'cold_call'
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  estimated_value NUMERIC,
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  converted_to_customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **10. opportunities**
```sql
-- Sales opportunities/deals
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  customer_id UUID REFERENCES customers(id),
  lead_id UUID REFERENCES leads(id),
  title TEXT NOT NULL,
  description TEXT,
  estimated_value NUMERIC,
  probability INTEGER, -- 0-100 percentage
  stage TEXT DEFAULT 'prospecting', -- 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 **NEXT STEPS**

1. **Create these tables** in your Supabase database using the SQL above
2. **Set up RLS policies** for each table (company_id scoping)
3. **Add indexes** for performance on frequently queried columns
4. **Test the SettingsService fix** - the invoice error should be resolved

The SettingsService error is now fixed, and you have the complete list of missing tables to implement with GPT for industry standards!
