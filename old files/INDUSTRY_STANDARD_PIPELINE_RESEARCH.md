# 🔍 Industry Standard Pipeline Research - Field Service Management

## 📊 Market Research Summary

### **Competitors Analyzed:**
- ServiceTitan (Enterprise, $300-500/mo per user)
- Jobber (Mid-market, $69-349/mo)
- Housecall Pro (Small business, $69-299/mo)
- FieldEdge, simPRO, mHelpDesk, Workiz

### **Research Sources:**
- G2 Reviews (4.3-4.7/5 ratings)
- Capterra Reviews
- Reddit (r/HVAC, r/smallbusiness, r/Contractor)
- Industry blogs and comparisons

---

## 🎯 Industry Standard Pipeline (Quote-to-Cash)

### **Phase 1: Lead/Request**
**Status:** `draft` or `lead`
**Tables:** `work_orders`, `customers`, `service_addresses`

**Actions:**
- Customer requests service (phone, web form, portal, marketplace)
- Office creates draft quote/estimate
- Captures customer info, service address, problem description

**Pain Points Found:**
- ❌ Lost leads due to slow response time
- ❌ No automated lead assignment
- ❌ Can't track lead source/conversion

---

### **Phase 2: Quote/Estimate Creation**
**Status:** `quote` or `draft`
**Tables:** `work_orders`, `work_order_items`, `quote_templates`

**Actions:**
- Create line items (labor, materials, services)
- Apply pricing (flat rate, T&M, unit-based, percentage, recurring)
- Calculate taxes, discounts
- Add photos, diagrams, scope of work
- Use templates for common jobs

**Pain Points Found:**
- ❌ **Slow quote creation** - Takes too long to build quotes
- ❌ **No templates** - Have to rebuild same quotes repeatedly
- ❌ **Poor mobile experience** - Can't create quotes in field easily
- ❌ **No optional line items** - Can't let customer choose add-ons
- ❌ **Pricing errors** - Manual calculation mistakes

**Industry Best Practices:**
- ✅ Quote templates by job type
- ✅ Optional line items (customer can select)
- ✅ Multiple pricing models in one quote
- ✅ Photo/video attachments
- ✅ Digital signature capture
- ✅ Expiration dates (30/60/90 days)

---

### **Phase 3: Quote Delivery**
**Status:** `sent` or `pending`
**Tables:** `work_orders`, `quote_deliveries`, `documents`, `messages`

**Actions:**
- Generate PDF
- Send via email + portal link
- Optional SMS notification
- Track delivery (sent, viewed, opened)

**Pain Points Found:**
- ❌ **No delivery tracking** - Don't know if customer viewed quote
- ❌ **Email gets lost** - Customers say they never received it
- ❌ **No follow-up reminders** - Quotes go stale
- ❌ **Can't resend easily** - Have to regenerate and resend manually
- ❌ **No portal access** - Customer has to dig through email

**Industry Best Practices:**
- ✅ Multi-channel delivery (email, SMS, portal)
- ✅ Track quote views (timestamp when customer opens)
- ✅ Automated follow-up reminders (3 days, 7 days, before expiration)
- ✅ Customer portal with all quotes/invoices
- ✅ One-click resend
- ✅ Mobile-friendly quote view

**NEW TABLE NEEDED:** `quote_deliveries`
```sql
CREATE TABLE quote_deliveries (
  id UUID PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id),
  delivery_method TEXT, -- 'email', 'sms', 'portal', 'download'
  recipient_email TEXT,
  recipient_phone TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  pdf_url TEXT,
  portal_link TEXT,
  delivery_status TEXT, -- 'sent', 'delivered', 'viewed', 'failed'
  error_message TEXT
);
```

---

### **Phase 4: Customer Response**
**Status:** `approved`, `rejected`, or `requires_changes`
**Tables:** `work_orders`, `quote_responses`, `signatures`, `work_order_status_history`

**Actions:**
- Customer accepts (with optional signature)
- Customer rejects (with reason)
- Customer requests changes
- Optional deposit payment

**Pain Points Found:**
- ❌ **No rejection tracking** - Don't know WHY customer rejected
- ❌ **No change request workflow** - Customer calls/emails changes
- ❌ **Deposit confusion** - Not clear how much deposit is required
- ❌ **No signature capture** - Have to print, sign, scan
- ❌ **Lost quotes** - Customer accepted verbally but no record

**Industry Best Practices:**
- ✅ One-click accept/reject from portal
- ✅ Required rejection reason (dropdown + notes)
- ✅ Change request form (customer can specify what to change)
- ✅ Digital signature capture (mobile-friendly)
- ✅ Deposit payment at acceptance (optional)
- ✅ Automated notification to contractor

**NEW TABLE NEEDED:** `quote_responses`
```sql
CREATE TABLE quote_responses (
  id UUID PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id),
  response_type TEXT, -- 'accepted', 'rejected', 'changes_requested'
  rejection_reason TEXT,
  change_request_notes TEXT,
  signature_id UUID REFERENCES signatures(id),
  responded_at TIMESTAMPTZ,
  responded_by TEXT -- customer name/email
);
```

---

### **Phase 5: Change Orders**
**Status:** Still `approved` but with change order flag
**Tables:** `work_orders`, `change_orders`, `change_order_items`

**Actions:**
- Customer or contractor requests changes
- Create change order with new line items
- Customer approves change order
- Update total amount

**Pain Points Found:**
- ❌ **BIGGEST COMPLAINT** - Change orders are a nightmare
- ❌ **No change order workflow** - Have to create new quote
- ❌ **Disputes over scope** - Customer says "that was included"
- ❌ **Payment confusion** - Not clear what's owed for changes
- ❌ **No audit trail** - Can't prove what was agreed to

**Industry Best Practices:**
- ✅ Separate change order entity (linked to original quote)
- ✅ Change order approval workflow
- ✅ Clear pricing for additions/deletions
- ✅ Customer signature required
- ✅ Audit trail of all changes
- ✅ Original quote remains unchanged (for reference)

**NEW TABLE NEEDED:** `change_orders`
```sql
CREATE TABLE change_orders (
  id UUID PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id),
  change_order_number TEXT UNIQUE,
  description TEXT,
  reason TEXT, -- 'customer_request', 'scope_change', 'unforeseen_work'
  status TEXT, -- 'draft', 'pending_approval', 'approved', 'rejected'
  subtotal DECIMAL,
  tax_amount DECIMAL,
  total_amount DECIMAL,
  requested_by UUID REFERENCES profiles(id),
  approved_by TEXT, -- customer name
  signature_id UUID REFERENCES signatures(id),
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

CREATE TABLE change_order_items (
  id UUID PRIMARY KEY,
  change_order_id UUID REFERENCES change_orders(id),
  item_type TEXT, -- 'addition', 'deletion', 'modification'
  description TEXT,
  quantity DECIMAL,
  unit_price DECIMAL,
  total DECIMAL
);
```

---

### **Phase 6: Scheduling**
**Status:** `scheduled`
**Tables:** `work_orders`, `schedule_events`, `employees`

**Actions:**
- Assign technician(s)
- Set date/time
- Send confirmation to customer
- Send dispatch to technician

**Pain Points Found:**
- ❌ **Double booking** - Techs get overbooked
- ❌ **No skill matching** - Wrong tech assigned to job
- ❌ **No customer confirmation** - Customer forgets appointment
- ❌ **No ETA updates** - Customer doesn't know when tech will arrive
- ❌ **No route optimization** - Techs waste time driving

**Industry Best Practices:**
- ✅ Drag-and-drop calendar
- ✅ Skill-based assignment
- ✅ Automated customer confirmation (email + SMS)
- ✅ Automated tech dispatch
- ✅ Real-time ETA updates
- ✅ Route optimization

---

### **Phase 7: Job In Progress**
**Status:** `in_progress`
**Tables:** `work_orders`, `timesheets`, `inventory_usage`, `job_notes`, `documents`

**Actions:**
- Tech checks in (GPS + timestamp)
- Logs labor hours
- Logs materials used
- Uploads photos
- Adds notes

**Pain Points Found:**
- ❌ **No real-time updates** - Office doesn't know job status
- ❌ **Inventory not tracked** - Don't know what was used
- ❌ **No photo proof** - Customer disputes work done
- ❌ **Time tracking errors** - Manual timesheets are wrong
- ❌ **No customer visibility** - Customer doesn't know progress

**Industry Best Practices:**
- ✅ GPS check-in/out
- ✅ Automatic time tracking
- ✅ Barcode/QR inventory scanning
- ✅ Before/after photos required
- ✅ Optional customer portal updates ("Your tech has arrived")

---

### **Phase 8: Job Completion**
**Status:** `completed`
**Tables:** `work_orders`, `signatures`, `documents`, `job_completion_checklist`

**Actions:**
- Tech marks job complete
- Customer signs off
- Upload completion photos
- Complete checklist

**Pain Points Found:**
- ❌ **No completion checklist** - Techs forget steps
- ❌ **No customer signature** - Disputes later
- ❌ **Incomplete documentation** - Missing photos/notes
- ❌ **Delayed invoicing** - Office doesn't know job is done

**Industry Best Practices:**
- ✅ Required completion checklist
- ✅ Digital signature capture
- ✅ Required before/after photos
- ✅ Automated notification to office
- ✅ Customer satisfaction survey

---

### **Phase 9: Invoicing**
**Status:** `invoiced`
**Tables:** `invoices`, `invoice_items`, `invoice_deliveries`, `documents`

**Actions:**
- Auto-generate invoice from work order
- Apply deposits/payments
- Send to customer
- Track delivery

**Pain Points Found:**
- ❌ **Manual invoice creation** - Have to rebuild from quote
- ❌ **Deposit not applied** - Customer charged twice
- ❌ **Change orders not included** - Invoice doesn't match work done
- ❌ **No delivery tracking** - Don't know if customer received
- ❌ **Payment delays** - Customer "didn't get invoice"

**Industry Best Practices:**
- ✅ Auto-generate from work order + change orders
- ✅ Automatically apply deposits
- ✅ Multi-channel delivery (email, SMS, portal)
- ✅ Track views/opens
- ✅ One-click payment link
- ✅ Automated payment reminders

**NEW TABLE NEEDED:** `invoice_deliveries`
```sql
CREATE TABLE invoice_deliveries (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  delivery_method TEXT,
  recipient_email TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  pdf_url TEXT,
  portal_link TEXT,
  delivery_status TEXT
);
```

---

### **Phase 10: Payment**
**Status:** `paid` or `partially_paid`
**Tables:** `payments`, `invoices`, `payment_deliveries`

**Actions:**
- Customer pays (card, ACH, cash, check)
- System logs payment
- Send receipt
- Update invoice status

**Pain Points Found:**
- ❌ **No online payment** - Customer has to mail check
- ❌ **Partial payment confusion** - Not clear what's owed
- ❌ **No payment plan** - Customer can't pay in installments
- ❌ **No receipt** - Customer loses proof of payment
- ❌ **Manual reconciliation** - Have to match payments to invoices

**Industry Best Practices:**
- ✅ Online payment (credit card, ACH)
- ✅ Payment plans/installments
- ✅ Partial payment tracking
- ✅ Automated receipt delivery
- ✅ Auto-reconciliation with accounting software

---

### **Phase 11: Job Closed**
**Status:** `closed`
**Tables:** `work_orders`, `customer_feedback`, `reviews`

**Actions:**
- Mark job closed
- Request review
- Archive records

**Pain Points Found:**
- ❌ **Lost reviews** - Forget to ask for reviews
- ❌ **No feedback loop** - Don't know customer satisfaction
- ❌ **No warranty tracking** - Customer calls about warranty, no record

**Industry Best Practices:**
- ✅ Automated review request (Google, Yelp, Facebook)
- ✅ Customer satisfaction survey
- ✅ Warranty tracking
- ✅ Follow-up reminders (6 months, 1 year)

---

## 🏆 TradeMate Pro Competitive Advantages

### **What We'll Do Better:**

1. **✅ Delivery Tracking** - Track every quote/invoice delivery (viewed, opened)
2. **✅ Change Order Workflow** - Proper change order management (biggest pain point)
3. **✅ Multi-Channel Delivery** - Email, SMS, portal, download (no extra charge)
4. **✅ Customer Portal** - Free customer portal (competitors charge extra)
5. **✅ Optional Line Items** - Let customers choose add-ons in quote
6. **✅ Rejection Tracking** - Know WHY customers reject quotes
7. **✅ Automated Follow-Ups** - Quote reminders, payment reminders, review requests
8. **✅ Unified Pipeline** - One table (work_orders) for entire lifecycle
9. **✅ Better Pricing** - $49-149/mo vs $300-500/mo for ServiceTitan

---

## 📋 New Tables Needed

1. **`quote_deliveries`** - Track quote delivery/views
2. **`quote_responses`** - Track customer accept/reject/changes
3. **`change_orders`** - Proper change order management
4. **`change_order_items`** - Change order line items
5. **`invoice_deliveries`** - Track invoice delivery/views
6. **`payment_deliveries`** - Track receipt delivery
7. **`job_completion_checklist`** - Required completion steps
8. **`customer_feedback`** - Satisfaction surveys

---

## 🎯 Recommended Implementation Priority

### **Phase 1: Core Pipeline (Now)**
1. ✅ Quote creation/delivery
2. ✅ Customer acceptance/rejection
3. ✅ Job scheduling
4. ✅ Invoicing
5. ✅ Payment tracking

### **Phase 2: Delivery Tracking (Next)**
1. `quote_deliveries` table
2. `invoice_deliveries` table
3. Track views/opens
4. Automated follow-ups

### **Phase 3: Change Orders (Critical)**
1. `change_orders` table
2. `change_order_items` table
3. Approval workflow
4. Audit trail

### **Phase 4: Customer Portal (Differentiator)**
1. View quotes/invoices
2. Accept/reject quotes
3. Make payments
4. View job history

### **Phase 5: Advanced Features (Later)**
1. Optional line items
2. Payment plans
3. Warranty tracking
4. Review automation

---

## ✅ Summary

**Industry Standard Pipeline:**
```
Lead → Quote → Send → Accept/Reject → Schedule → In Progress → 
Complete → Invoice → Payment → Closed
```

**Key Status Values:**
```
draft → quote → sent → approved/rejected → scheduled → 
in_progress → completed → invoiced → paid → closed
```

**Biggest Pain Points to Solve:**
1. ❌ Change order management (CRITICAL)
2. ❌ Delivery tracking (quotes/invoices)
3. ❌ Customer rejection reasons
4. ❌ Slow quote creation
5. ❌ Payment delays

**Our Competitive Edge:**
- ✅ Better change order workflow
- ✅ Free delivery tracking
- ✅ Free customer portal
- ✅ Better pricing
- ✅ Unified pipeline (no duplication)

