# Quote Approval Pipeline - Big Picture Design

**Date:** 2025-10-13  
**Status:** Research & Design Phase

---

## 🔍 INDUSTRY RESEARCH: PAIN POINTS & COMPLAINTS

### **ServiceTitan Pain Points (from Reddit/Forums):**
1. **No per-quote scheduling overrides** - Can't override business hours for emergency/weekend work without changing global settings
2. **Forced customer scheduling** - No way to disable customer self-scheduling for specific quotes
3. **Deposit confusion** - Customers don't understand if deposit is required before OR after scheduling
4. **Weekend/emergency limitations** - Business hours are global, can't offer weekend slots for urgent jobs without changing settings for everyone
5. **Auto-schedule too aggressive** - Automatically schedules without asking, customers complain about lack of control

### **Jobber Pain Points:**
1. **No deposit before scheduling** - Customers can schedule without paying deposit, then no-show
2. **Limited payment options** - Online payment only, no cash/check tracking
3. **Can't skip scheduling** - Customer MUST pick a time to approve quote
4. **No emergency override** - Can't send quote with custom availability (e.g., "available this Saturday only")

### **Housecall Pro Pain Points:**
1. **Deposit required blocks approval** - If Stripe fails, customer can't approve quote at all
2. **No flexible scheduling** - Either customer schedules OR company schedules, no hybrid
3. **Payment method inflexible** - Must use Stripe, can't indicate "will pay cash"

---

## 🎯 OUR SOLUTION: QUOTE-LEVEL OVERRIDES

### **Core Principle:**
**Company settings are DEFAULTS, but each quote can have OVERRIDES for special cases.**

### **Settings Hierarchy:**
```
1. Company Settings (Global Defaults)
   ↓
2. Quote-Level Overrides (Per-Quote Customization)
   ↓
3. Customer Experience (What customer sees)
```

---

## 📋 PROPOSED QUOTE OVERRIDE SYSTEM

### **When Sending a Quote (SendQuoteModal):**

Contractor sees:

```
┌─────────────────────────────────────────────────┐
│ Send Quote to Customer                          │
├─────────────────────────────────────────────────┤
│                                                 │
│ Send Via: [Email] [SMS] [Copy Link]            │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📅 SCHEDULING OPTIONS                       │ │
│ │                                             │ │
│ │ ○ Use Default Settings                     │ │
│ │   Mon-Fri, 7:00 AM - 6:00 PM               │ │
│ │                                             │ │
│ │ ○ Custom Schedule for This Quote           │ │
│ │   [✓] Monday  [✓] Tuesday  [✓] Wednesday   │ │
│ │   [✓] Thursday  [✓] Friday                 │ │
│ │   [✓] Saturday  [✓] Sunday  ← OVERRIDE     │ │
│ │                                             │ │
│ │   Hours: [7:00 AM] to [8:00 PM]            │ │
│ │                                             │ │
│ │ ○ Company Will Schedule (No Customer Choice)│ │
│ │   Customer approves, we call to schedule   │ │
│ │                                             │ │
│ │ ○ Auto-Schedule ASAP                       │ │
│ │   Automatically book next available slot   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 💳 DEPOSIT OPTIONS                          │ │
│ │                                             │ │
│ │ [✓] Require Deposit ($500.00)              │ │
│ │                                             │ │
│ │ Payment Methods Allowed:                   │ │
│ │ [✓] Online (Credit/Debit Card)             │ │
│ │ [✓] Cash (on arrival)                      │ │
│ │ [✓] Check (on arrival)                     │ │
│ │ [ ] Already Paid (hide option)             │ │
│ │                                             │ │
│ │ [ ] Deposit Required BEFORE Scheduling     │ │
│ │     (Customer must pay before picking time)│ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Cancel]                          [Send Quote] │
└─────────────────────────────────────────────────┘
```

### **What Gets Saved to Database:**

**New columns in `work_orders` table:**
```sql
-- Scheduling overrides
scheduling_mode TEXT DEFAULT 'customer_choice',  
  -- 'customer_choice', 'company_schedules', 'auto_schedule'
  
custom_availability_days TEXT[],  
  -- ['monday', 'tuesday', 'saturday'] or NULL for default
  
custom_availability_hours_start TIME,  
  -- '07:00' or NULL for default
  
custom_availability_hours_end TIME,  
  -- '20:00' or NULL for default

-- Deposit overrides
deposit_required_before_scheduling BOOLEAN DEFAULT FALSE,
  -- If TRUE, customer must pay deposit before seeing scheduling options
  
allowed_payment_methods TEXT[],  
  -- ['online', 'cash', 'check'] or NULL for all methods
  
deposit_payment_method TEXT,  
  -- What customer selected: 'online', 'cash', 'check', 'prepaid'
  
deposit_paid_at TIMESTAMPTZ,  
  -- When deposit was actually paid (NULL if not paid yet)
```

---

## 🔄 CUSTOMER APPROVAL FLOW (REVISED)

### **Scenario 1: Standard Flow (Default Settings)**
```
1. Review Quote
   ↓
2. Consent + Terms
   ↓
3. Deposit Selection (if required)
   - Select payment method: Online/Cash/Check/Prepaid
   - If "deposit_required_before_scheduling" = TRUE:
     → Must pay online NOW or select "Already Paid"
     → Cannot proceed until deposit confirmed
   ↓
4. Schedule Service
   - See available slots (Mon-Fri, 7 AM - 6 PM)
   - OR click "Skip - Let Company Schedule"
   ↓
5. Confirmation
   - Review selections
   - Click "Confirm & Finish"
```

### **Scenario 2: Emergency/Weekend Override**
```
Contractor sends quote with:
- Custom days: Sat, Sun only
- Custom hours: 8 AM - 8 PM
- Deposit required BEFORE scheduling
- Online payment only

Customer sees:
1. Review Quote
2. Consent + Terms
3. PAY DEPOSIT NOW
   - Only "Pay Online" option shown
   - Stripe payment element
   - Must complete payment to proceed
4. Schedule Service
   - Only Saturday/Sunday slots shown
   - 8 AM - 8 PM time range
   - Cannot skip (emergency job)
5. Confirmation
```

### **Scenario 3: Company Schedules (No Customer Choice)**
```
Contractor sends quote with:
- scheduling_mode = 'company_schedules'

Customer sees:
1. Review Quote
2. Consent + Terms
3. Deposit Selection
   - Select payment method
   - No payment required yet
4. SKIP SCHEDULING STEP ENTIRELY
5. Confirmation
   - "We'll contact you within 1 business day to schedule"
```

### **Scenario 4: Auto-Schedule ASAP**
```
Contractor sends quote with:
- scheduling_mode = 'auto_schedule'

Customer sees:
1. Review Quote
2. Consent + Terms
3. Deposit Selection
4. AUTO-SCHEDULED CONFIRMATION
   - "Your service is automatically scheduled for:"
   - Shows next available slot
   - "Can't make it? Call us to reschedule"
5. Confirmation
```

---

## 🛠️ IMPLEMENTATION PLAN

### **Phase 1: Database Schema (30 min)**
```sql
-- Add columns to work_orders table
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS scheduling_mode TEXT DEFAULT 'customer_choice';
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS custom_availability_days TEXT[];
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS custom_availability_hours_start TIME;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS custom_availability_hours_end TIME;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS deposit_required_before_scheduling BOOLEAN DEFAULT FALSE;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS allowed_payment_methods TEXT[];
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS deposit_payment_method TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;

-- Add columns to schedule_events table (MISSING COLUMNS)
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS created_by_customer BOOLEAN DEFAULT FALSE;
ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS auto_scheduled BOOLEAN DEFAULT FALSE;
```

### **Phase 2: SendQuoteModal Enhancement (2-3 hours)**
- Add "Scheduling Options" section with radio buttons
- Add "Deposit Options" section with checkboxes
- Save overrides to work_orders when sending quote
- Pass overrides in quote link URL (or load from DB in quote.html)

### **Phase 3: quote.html Logic Update (2-3 hours)**
- Load quote overrides from work_orders
- Apply overrides to wizard flow:
  - If `scheduling_mode = 'company_schedules'` → Skip scheduling step
  - If `scheduling_mode = 'auto_schedule'` → Auto-select earliest slot, show confirmation
  - If `custom_availability_days` exists → Filter slots to those days only
  - If `custom_availability_hours` exists → Override business hours
  - If `deposit_required_before_scheduling = TRUE` → Block scheduling until deposit paid
  - If `allowed_payment_methods` exists → Show only those payment options

### **Phase 4: Smart Scheduling Widget Update (1-2 hours)**
- Accept override parameters
- Filter slots based on custom days/hours
- Show appropriate messaging ("Weekend emergency slots available")

### **Phase 5: RPC Fix (30 min)**
- Fix `approve_and_schedule_work_order` to not use missing columns
- Add fallback for when columns don't exist yet

---

## 🎯 COMPETITIVE ADVANTAGES

### **What We Do Better:**

1. **Per-Quote Flexibility** ✅
   - ServiceTitan: Global settings only
   - Us: Override per quote for emergencies/special cases

2. **Deposit Before OR After Scheduling** ✅
   - Jobber: No deposit before scheduling
   - Housecall Pro: Deposit blocks everything if Stripe fails
   - Us: Contractor chooses when deposit is required

3. **Multiple Payment Methods** ✅
   - Competitors: Online only (Stripe)
   - Us: Online, Cash, Check, Prepaid tracking

4. **Skip Scheduling Option** ✅
   - Housecall Pro: Must schedule to approve
   - Us: Customer can skip, company calls later

5. **Auto-Schedule ASAP** ✅
   - ServiceTitan: Too aggressive, no control
   - Us: Contractor opts-in per quote

6. **Weekend/Emergency Override** ✅
   - All competitors: Change global settings
   - Us: Per-quote custom availability

---

## 📝 IMMEDIATE FIXES NEEDED

### **Fix 1: RPC Column Error (CRITICAL)**
**Problem:** `created_by_customer` and `auto_scheduled` columns don't exist  
**Fix:** Remove from RPC or add columns to schedule_events table

### **Fix 2: Deposit Flow Logic**
**Problem:** Deposit step is skipped entirely if `require_deposit_on_approval = FALSE`  
**Current:** Line 1210 in quote.html checks `companySettings.require_deposit_on_approval`  
**Issue:** If FALSE, deposit step is removed from wizard, but what if contractor wants deposit for THIS quote only?

**Solution:**
```javascript
// Check quote-level override first, then company default
const depositRequired = quoteData.deposit_required || companySettings.require_deposit_on_approval;
if (depositRequired) {
  wizardSteps.push('deposit');
}
```

### **Fix 3: Scheduling Mode Logic**
**Problem:** Always shows scheduling step, no way to skip for "company schedules" mode  
**Solution:**
```javascript
const schedulingMode = quoteData.scheduling_mode || 'customer_choice';
if (schedulingMode === 'customer_choice' && companySettings.allow_customer_scheduling) {
  wizardSteps.push('schedule');
} else if (schedulingMode === 'auto_schedule') {
  // Auto-schedule in background, show confirmation
  wizardSteps.push('auto_schedule_confirmation');
}
// If 'company_schedules', skip scheduling step entirely
```

---

## 🚀 ROLLOUT STRATEGY

### **Option A: Full Implementation (Recommended)**
1. Add database columns (30 min)
2. Fix RPC to work with current schema (30 min)
3. Test current flow works (30 min)
4. Build SendQuoteModal enhancements (3 hours)
5. Update quote.html with override logic (3 hours)
6. Test all scenarios (2 hours)
**Total: ~10 hours of work**

### **Option B: Quick Fix + Defer Overrides**
1. Add missing columns to schedule_events (10 min)
2. Fix RPC (10 min)
3. Test current flow (30 min)
4. Document override system for post-beta
**Total: ~1 hour, defer advanced features**

---

## 💡 RECOMMENDATION

**For Beta Launch:**
- **Option B** (Quick fix) - Get quote approval working NOW
- Document the override system for post-beta enhancement
- Current flow is acceptable for beta (customer can schedule OR skip)

**Post-Beta (v1.1):**
- Implement full override system
- Add SendQuoteModal enhancements
- Market as "Most Flexible Quote Approval in the Industry"

---

## 🔧 NEXT STEPS (RIGHT NOW)

1. ✅ Add missing columns to `schedule_events` table
2. ✅ Fix RPC to use correct column names
3. ✅ Test quote approval end-to-end
4. ✅ Verify schedule_events are created
5. ✅ Verify events appear on Calendar
6. ⚠️ Document override system for future implementation

**Estimated time to working quote approval: 1 hour**

