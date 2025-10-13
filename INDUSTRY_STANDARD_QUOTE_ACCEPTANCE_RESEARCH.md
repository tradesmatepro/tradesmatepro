# 🔍 INDUSTRY STANDARD QUOTE ACCEPTANCE RESEARCH

**Date:** 2025-10-10  
**Competitors Analyzed:** ServiceTitan, Jobber, Housecall Pro  
**Purpose:** Build industry-standard quote acceptance flow that matches/exceeds competitors  

---

## 📊 JOBBER QUOTE ACCEPTANCE FLOW (INDUSTRY LEADER)

### **APPROVAL PATH:**

1. **Customer Receives Email/SMS**
   - "View Quote" button in email
   - Secure link (no password needed)

2. **Customer Views Quote in Client Hub**
   - See quote details, line items, total
   - Two buttons: "Approve & Pay Deposit" or "Request Changes"

3. **Signature Capture (Optional - Company Setting)**
   - Toggle: "Require client signatures"
   - Customer can draw or type signature
   - Signature saved as internal note on quote

4. **Deposit Payment (If Required)**
   - Button changes based on payment integration:
     - **With Jobber Payments:** "Approve & Pay Deposit"
     - **Without:** "Approve" (no online payment)
   - Customer enters payment info
   - Option to save card for future use
   - **Cannot make partial payments**
   - Deposit automatically applied to first invoice

5. **Confirmation**
   - "Transaction successful" message
   - Contractor receives email notification
   - Deposit appears in client billing history

### **REJECTION/CHANGES PATH:**

1. **Customer Clicks "Request Changes"**
   - Text box to describe requested changes
   - Quote becomes invisible in client hub
   - Contractor receives notification

2. **Contractor Updates Quote**
   - Amend quote based on feedback
   - Email updated quote OR mark as "Awaiting Response"
   - Quote becomes visible again in client hub

---

## 📊 SERVICETITAN QUOTE ACCEPTANCE FLOW

### **APPROVAL PATH:**

1. **Customer Portal Access**
   - Secure link from email
   - View quote details

2. **Approval Actions**
   - Approve quote
   - Pay deposit
   - Provide signature

3. **Payment Options**
   - Google Pay™ integration
   - Credit card
   - Save payment method

---

## 📊 HOUSECALL PRO QUOTE ACCEPTANCE FLOW

### **APPROVAL PATH:**

1. **E-Signatures on Estimates** (New 2025 Feature)
   - Built-in signature capture
   - Required for approval

2. **Payment Integration**
   - Immediate deposit collection
   - Convert estimates to invoices

---

## 🎯 COMPANY SETTINGS (JOBBER STANDARD)

### **Quote Approval Settings:**
- ✅ **Require client signatures** (Toggle ON/OFF)
- ✅ **Clients can request changes** (Toggle ON/OFF)
- ✅ **Required deposit amount** ($ or %)
- ✅ **Show scheduled time** (Toggle ON/OFF)

### **Menu Visibility:**
- ✅ **Show quotes** (Toggle ON/OFF)
- ✅ **Show invoices** (Toggle ON/OFF)

### **Referrals:**
- ✅ **Clients can refer a friend** (Toggle ON/OFF)
- ✅ **Custom banner message**

---

## 🚨 PAIN POINTS & COMPLAINTS (FROM RESEARCH)

### **Jobber Users Complain About:**
1. ❌ **Cannot make partial deposit payments** - All or nothing
2. ❌ **Quote becomes invisible when changes requested** - Confusing for customers
3. ❌ **No automatic scheduling after approval** - Manual step required
4. ❌ **Signature only saved as internal note** - Not visible on quote PDF

### **ServiceTitan Users Complain About:**
1. ❌ **Complex setup** - Too many settings
2. ❌ **Expensive** - High monthly cost
3. ❌ **Slow customer portal** - Performance issues

### **Housecall Pro Users Complain About:**
1. ❌ **Limited customization** - Can't customize approval flow
2. ❌ **No rejection reason tracking** - Don't know why customers decline
3. ❌ **No follow-up automation** - Manual follow-up required

---

## ✅ TRADEMATE PRO COMPETITIVE ADVANTAGES

### **What We'll Build Better:**

1. **✅ Flexible Deposit Payments**
   - Allow partial deposits (not just all-or-nothing)
   - Multiple payment methods
   - Automatic deposit tracking

2. **✅ Smart Rejection Tracking**
   - Required rejection reasons
   - Feedback collection
   - Automatic follow-up tasks
   - Analytics on rejection reasons

3. **✅ Automatic Scheduling**
   - Customer selects time slot after approval
   - Auto-confirms or pending approval (company setting)
   - Syncs with technician calendar

4. **✅ Signature Visibility**
   - Signature appears on quote PDF
   - Signature appears on invoice
   - Signature stored in Supabase Storage

5. **✅ Quote Stays Visible**
   - When changes requested, quote stays visible
   - Shows "Changes Requested" badge
   - Customer can still see original quote

6. **✅ Progressive Workflow**
   - Each step is optional (company settings)
   - Skip steps that aren't needed
   - Fast approval for simple quotes

---

## 🎯 TRADEMATE PRO QUOTE ACCEPTANCE FLOW

### **APPROVAL PATH:**

```
Step 1: Review Quote
├─ View quote details
├─ View line items (with correct math!)
├─ View subtotal, tax, discounts, total
└─ Buttons: "Approve Quote" | "Decline Quote" | "Request Changes"

Step 2: Signature (If Required)
├─ Company Setting: require_signature_on_approval
├─ Draw or type signature
├─ Signature saved to Supabase Storage
└─ Signature appears on quote PDF & invoice

Step 3: Terms & Conditions (If Required)
├─ Company Setting: require_terms_acceptance
├─ Display company terms
├─ Checkbox: "I agree to the terms and conditions"
└─ Timestamp acceptance

Step 4: Deposit Payment (If Required)
├─ Company Setting: require_deposit_on_approval
├─ Amount: Fixed $ or % of total
├─ Stripe payment form
├─ Option to save card
├─ Option for partial payment (if enabled)
└─ Receipt emailed automatically

Step 5: Schedule Selection (If Enabled)
├─ Company Setting: allow_customer_scheduling
├─ Show available time slots
├─ Customer picks date/time
├─ Auto-confirm or pending approval
└─ Calendar invite sent

Step 6: Confirmation
├─ "You're all set!" message
├─ Summary of next steps
├─ Contact information
├─ Download quote PDF
└─ Email confirmation sent
```

### **REJECTION PATH:**

```
Step 1: Decline Reason (Required)
├─ Radio buttons:
│  ├─ Too expensive
│  ├─ Going with another contractor
│  ├─ Timeline doesn't work
│  ├─ Changed my mind / No longer needed
│  └─ Other (text field required)
└─ Cannot proceed without selection

Step 2: Feedback (Optional)
├─ Text area: "Help us improve - what could we do better?"
└─ Optional but encouraged

Step 3: Alternative Options
├─ Checkbox: "I'd like a revised quote with different options"
├─ Checkbox: "I'd like to discuss payment plans"
├─ Checkbox: "I'd like to schedule a follow-up call"
└─ Date/time picker for follow-up (if requested)

Step 4: Confirmation
├─ "We've received your response"
├─ "We'll follow up within 24 hours" (if requested)
├─ Contact information
└─ Email confirmation sent to customer & contractor
```

### **REQUEST CHANGES PATH:**

```
Step 1: Describe Changes
├─ Text area: "What changes would you like?"
├─ Required field
└─ Character limit: 1000

Step 2: Urgency (Optional)
├─ Radio buttons:
│  ├─ Not urgent - respond when you can
│  ├─ Moderate - would like response within 2-3 days
│  └─ Urgent - need response within 24 hours
└─ Default: Moderate

Step 3: Confirmation
├─ "We've received your change request"
├─ "We'll send you an updated quote within [timeframe]"
├─ Quote stays visible with "Changes Requested" badge
└─ Email confirmation sent
```

---

## 🗄️ DATABASE SCHEMA REQUIREMENTS

### **New Tables:**

1. **quote_signatures**
   - id, quote_id, customer_id, signature_image_url, signature_type (drawn/typed), signed_at, ip_address

2. **quote_rejections**
   - id, quote_id, customer_id, rejection_reason, rejection_reason_other, feedback, wants_revised_quote, wants_payment_plan, wants_follow_up, follow_up_date, rejected_at

3. **quote_change_requests**
   - id, quote_id, customer_id, requested_changes, urgency, requested_at, responded_at, response_notes

4. **quote_deposits**
   - id, quote_id, customer_id, amount, payment_method, stripe_payment_intent_id, paid_at, refunded_at, refund_reason

5. **quote_approvals**
   - id, quote_id, customer_id, approved_at, signature_id, deposit_id, terms_accepted_at, scheduled_date, ip_address

### **Settings Table Updates:**

Add to `settings` table:
- require_signature_on_approval (boolean)
- require_terms_acceptance (boolean)
- require_deposit_on_approval (boolean)
- default_deposit_percentage (numeric)
- default_deposit_amount (numeric)
- allow_customer_scheduling (boolean)
- auto_schedule_after_approval (boolean)
- allow_partial_deposits (boolean)
- rejection_follow_up_enabled (boolean)
- terms_and_conditions_text (text)

---

## 🎨 UI/UX REQUIREMENTS

### **Design Principles:**
1. ✅ **Mobile-first** - Most customers view on phone
2. ✅ **Progressive disclosure** - Show one step at a time
3. ✅ **Clear CTAs** - Big, obvious buttons
4. ✅ **Visual feedback** - Loading states, success messages
5. ✅ **Error handling** - Clear error messages, retry options

### **Color Scheme:**
- **Approve:** Green (#10b981)
- **Decline:** Red (#ef4444)
- **Request Changes:** Yellow/Orange (#f59e0b)
- **Primary:** Purple gradient (#667eea → #764ba2)

---

## 📧 EMAIL NOTIFICATIONS REQUIRED

### **Customer Emails:**
1. Quote sent (existing)
2. Quote approved - confirmation
3. Deposit received - receipt
4. Scheduled - calendar invite
5. Quote rejected - confirmation
6. Changes requested - confirmation
7. Updated quote - notification

### **Contractor Emails:**
1. Quote approved - notification
2. Deposit received - notification
3. Customer scheduled - notification
4. Quote rejected - notification with reason
5. Changes requested - notification with details

---

## 🔌 INTEGRATIONS REQUIRED

1. **Stripe** - Deposit payments
2. **Supabase Storage** - Signature images
3. **Email (Resend)** - Notifications (existing)
4. **Calendar** - Scheduling (existing Google Calendar integration)

---

## 🎯 SUCCESS METRICS

### **What We'll Track:**
- Quote approval rate
- Average time to approval
- Rejection reasons (analytics)
- Deposit collection rate
- Customer scheduling adoption
- Change request frequency

---

## 🚀 IMPLEMENTATION PRIORITY

### **Phase 1: Core Approval Flow** (CRITICAL)
1. Fix quote line items math
2. Multi-step approval UI
3. Signature capture
4. Basic deposit payment (Stripe)

### **Phase 2: Rejection & Changes** (HIGH)
5. Rejection reason tracking
6. Change request workflow
7. Email notifications

### **Phase 3: Advanced Features** (MEDIUM)
8. Customer scheduling
9. Terms acceptance
10. Contractor dashboard updates

### **Phase 4: Analytics & Optimization** (LOW)
11. Rejection analytics
12. A/B testing
13. Performance optimization

---

**NEXT STEP:** Start Phase 1 - Database Schema Design


