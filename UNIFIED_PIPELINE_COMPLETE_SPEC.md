# UNIFIED PIPELINE - COMPLETE SPECIFICATION
## TradeMate Pro - Industry Standard Workflow

**Goal:** One-click progression through entire pipeline with automatic status changes where appropriate.

---

## 📊 COMPLETE STATUS FLOW

```
QUOTE STAGE → JOB STAGE → INVOICE STAGE → CLOSED
```

### **Detailed Flow:**

```
draft → sent → presented → approved → scheduled → in_progress → completed → invoiced → paid → closed
         ↓         ↓           ↓           ↓           ↓             ↓
    rejected  changes_req  rejected   on_hold   needs_resched   cancelled
                 ↓
            follow_up
```

---

## 🔄 EVERY STATUS CHANGE - WHAT SHOULD HAPPEN

### **1. DRAFT → SENT**
- **Trigger:** User clicks "Send Quote" button
- **What Happens:**
  - ✅ Status changes to 'sent'
  - ✅ Email sent to customer with quote PDF
  - ✅ sent_at timestamp set
  - ❌ MISSING: Email tracking (opened, clicked)
  - ❌ MISSING: Automatic follow-up reminder after X days

### **2. SENT → PRESENTED**
- **Trigger:** User manually marks as presented (after in-person meeting)
- **What Happens:**
  - ✅ Status changes to 'presented'
  - ✅ presented_at timestamp set
  - ❌ MISSING: Prompt to schedule follow-up call

### **3. PRESENTED → APPROVED**
- **Trigger:** Customer accepts quote (customer portal or manual)
- **What Happens:**
  - ✅ Status changes to 'approved'
  - ✅ approved_at timestamp set
  - ❌ MISSING: Automatic prompt "Schedule this job now?"
  - ❌ MISSING: If not scheduled, appears in "Unscheduled Jobs" queue
  - ❌ MISSING: Notification to assigned technician

### **4. APPROVED → SCHEDULED**
- **Trigger:** User schedules job via Smart Scheduling Assistant or Calendar
- **What Happens:**
  - ✅ Status changes to 'scheduled'
  - ✅ schedule_events created with start_time/end_time
  - ✅ scheduled_start and scheduled_end set on work_order
  - ✅ Technician calendar blocked
  - ❌ MISSING: Automatic customer confirmation email
  - ❌ MISSING: Automatic reminder email 24 hours before
  - ❌ MISSING: Automatic reminder to technician

### **5. SCHEDULED → IN_PROGRESS (Manual)**
- **Trigger:** User manually changes status to 'in_progress'
- **What Happens:**
  - ✅ Status changes to 'in_progress'
  - ❌ MISSING: actual_start timestamp should be set
  - ❌ MISSING: Prompt "Start timer for this job?"
  - ❌ MISSING: Notification to office staff "Job started"

### **6. SCHEDULED → IN_PROGRESS (Automatic - Date Arrives)**
- **Trigger:** scheduled_start time arrives
- **What Happens:**
  - ❌ MISSING: Automatic status change to 'in_progress'
  - ❌ MISSING: actual_start timestamp set
  - ❌ MISSING: Notification to technician "Job starting soon"
  - ❌ MISSING: Timer auto-starts (optional setting)

### **7. IN_PROGRESS → COMPLETED (Manual)**
- **Trigger:** User manually changes status to 'completed'
- **What Happens:**
  - ✅ Status changes to 'completed'
  - ❌ MISSING: actual_end timestamp should be set
  - ❌ MISSING: Prompt "What do you want to do next?"
    - Option A: Create Invoice Now
    - Option B: Mark as Complete (invoice later)
    - Option C: Extend Job (needs more time)
  - ❌ MISSING: If timer running, stop timer and calculate actual_duration

### **8. IN_PROGRESS → COMPLETED (Automatic - End Time Arrives)**
- **Trigger:** scheduled_end time arrives
- **What Happens:**
  - ❌ MISSING: Prompt to technician "Job scheduled to end. Complete now or extend?"
    - Option A: Mark Complete
    - Option B: Extend by X hours
    - Option C: Leave Open (will prompt again tomorrow)
  - ❌ MISSING: If no response after 1 hour, send notification to office
  - ❌ MISSING: If no response after 24 hours, auto-mark as completed

### **9. COMPLETED → INVOICED (Manual)**
- **Trigger:** User clicks "Create Invoice" button
- **What Happens:**
  - ✅ Status changes to 'invoiced'
  - ✅ Invoice created in invoices table
  - ✅ work_order.invoice_id linked
  - ❌ MISSING: Automatic email to customer with invoice PDF
  - ❌ MISSING: Payment link included in email
  - ❌ MISSING: Due date set based on settings (default 30 days)

### **10. COMPLETED → INVOICED (Automatic)**
- **Trigger:** Setting "Auto-invoice completed jobs" enabled
- **What Happens:**
  - ❌ MISSING: Automatic invoice creation when job marked complete
  - ❌ MISSING: Automatic email to customer
  - ❌ MISSING: Notification to office "Invoice created for Job #123"

### **11. INVOICED → PAID**
- **Trigger:** Payment received (manual entry or payment gateway)
- **What Happens:**
  - ✅ Status changes to 'paid'
  - ✅ paid_at timestamp set
  - ❌ MISSING: Automatic thank you email to customer
  - ❌ MISSING: Prompt "Request review from customer?"
  - ❌ MISSING: Automatic move to 'closed' after X days

### **12. PAID → CLOSED**
- **Trigger:** Manual or automatic after X days
- **What Happens:**
  - ✅ Status changes to 'closed'
  - ✅ closed_at timestamp set
  - ❌ MISSING: Archive job (remove from active views)
  - ❌ MISSING: Final notification to all parties

---

## 🚨 SPECIAL STATUS CHANGES

### **13. ANY → ON_HOLD**
- **Trigger:** User manually changes to 'on_hold'
- **What Happens:**
  - ✅ Status changes to 'on_hold'
  - ✅ schedule_events cancelled (calendar freed)
  - ❌ MISSING: Prompt "Why is this on hold?" (reason + notes)
  - ❌ MISSING: Prompt "When should we follow up?" (reminder date)
  - ❌ MISSING: Automatic reminder when follow-up date arrives

### **14. ON_HOLD → SCHEDULED**
- **Trigger:** User resumes job
- **What Happens:**
  - ✅ Status changes to 'scheduled'
  - ❌ MISSING: Prompt "Reschedule this job now?"
  - ❌ MISSING: If yes, open Smart Scheduling Assistant
  - ❌ MISSING: If no, move to "Unscheduled Jobs" queue

### **15. ANY → NEEDS_RESCHEDULING**
- **Trigger:** User manually changes to 'needs_rescheduling'
- **What Happens:**
  - ✅ Status changes to 'needs_rescheduling'
  - ✅ ReschedulingModal appears
  - ✅ schedule_events cancelled (calendar freed)
  - ✅ Rescheduling reason + notes captured
  - ✅ Option to reschedule now or later
  - ✅ If now, Smart Scheduling Assistant opens

### **16. ANY → CANCELLED**
- **Trigger:** User manually changes to 'cancelled'
- **What Happens:**
  - ✅ Status changes to 'cancelled'
  - ✅ CancellationModal appears
  - ✅ schedule_events cancelled (calendar freed)
  - ✅ Cancellation reason + notes captured
  - ✅ cancelled_at timestamp set
  - ✅ Job moves to Closed Jobs
  - ❌ MISSING: Automatic email to customer (optional)
  - ❌ MISSING: Notification to technician

---

## ❌ MISSING FEATURES - CRITICAL GAPS

### **A. Automatic Status Changes**
1. ❌ scheduled → in_progress (when scheduled_start arrives)
2. ❌ in_progress → completed (prompt when scheduled_end arrives)
3. ❌ completed → invoiced (if auto-invoice setting enabled)
4. ❌ paid → closed (after X days)

### **B. Timestamp Tracking**
1. ❌ actual_start (when job actually starts)
2. ❌ actual_end (when job actually ends)
3. ❌ actual_duration (calculated from actual_start/end)
4. ❌ sent_at (when quote sent)
5. ❌ presented_at (when quote presented)
6. ❌ approved_at (when quote approved)
7. ❌ paid_at (when invoice paid)
8. ❌ closed_at (when job closed)

### **C. Completion Prompts**
1. ❌ "Job scheduled to end. Complete now or extend?"
2. ❌ "Job completed. Create invoice now?"
3. ❌ "Invoice paid. Request review?"
4. ❌ "Quote approved. Schedule now?"

### **D. Automatic Notifications**
1. ❌ Customer: Quote sent
2. ❌ Customer: Job scheduled (confirmation)
3. ❌ Customer: Job starting soon (24hr reminder)
4. ❌ Customer: Job completed
5. ❌ Customer: Invoice sent
6. ❌ Customer: Payment received (thank you)
7. ❌ Technician: Job assigned
8. ❌ Technician: Job starting soon
9. ❌ Office: Job started
10. ❌ Office: Job completed
11. ❌ Office: Payment received

### **E. Timer Integration**
1. ❌ Start timer when job starts
2. ❌ Stop timer when job completes
3. ❌ Calculate actual_duration from timer
4. ❌ Show timer on mobile app for technicians

### **F. Job Extension**
1. ❌ "Extend job by X hours" option
2. ❌ Update scheduled_end time
3. ❌ Update schedule_events
4. ❌ Notify customer of delay (optional)

### **G. Settings/Configuration**
1. ❌ Auto-invoice completed jobs (yes/no)
2. ❌ Auto-close paid jobs after X days
3. ❌ Auto-start timer when job starts
4. ❌ Send customer notifications (yes/no per type)
5. ❌ Default invoice due date (days)
6. ❌ Follow-up reminder days (quotes)

---

## 🎯 RECOMMENDED IMPLEMENTATION PLAN

### **Phase 1: Critical Timestamps (1 day)**
- Add missing timestamp columns
- Create triggers to auto-set timestamps
- Update all status change handlers

### **Phase 2: Automatic Status Changes (2 days)**
- Scheduled job monitor (cron job)
- Auto-change scheduled → in_progress
- Prompt for in_progress → completed
- Auto-invoice if setting enabled

### **Phase 3: Completion Prompts (2 days)**
- CompletionPromptModal component
- ExtendJobModal component
- Wire into status change handlers

### **Phase 4: Notifications System (3 days)**
- Email templates for all notification types
- Notification settings table
- Notification queue/scheduler
- Email sending service integration

### **Phase 5: Timer Integration (2 days)**
- Timer component
- Timer state management
- Auto-start/stop based on status
- Calculate actual_duration

### **Phase 6: Settings UI (1 day)**
- Pipeline settings page
- Toggle auto-invoice
- Toggle auto-notifications
- Set default due dates

---

## 📋 DECISION MATRIX - EVERY STATUS CHANGE

| From Status | To Status | Trigger | Automatic? | Prompt? | What Happens |
|-------------|-----------|---------|------------|---------|--------------|
| draft | sent | User clicks "Send" | No | No | Email sent, timestamp |
| sent | presented | User marks | No | No | Timestamp only |
| presented | approved | Customer accepts | No | Yes | "Schedule now?" |
| approved | scheduled | User schedules | No | No | Calendar blocked |
| scheduled | in_progress | Date arrives | **YES** | No | Auto-change + notify |
| scheduled | in_progress | User manual | No | Yes | "Start timer?" |
| in_progress | completed | End time arrives | No | **YES** | "Complete/Extend?" |
| in_progress | completed | User manual | No | **YES** | "Create invoice?" |
| completed | invoiced | User clicks | No | No | Invoice created |
| completed | invoiced | Auto-setting | **YES** | No | Auto-invoice |
| invoiced | paid | Payment received | No | Yes | "Request review?" |
| paid | closed | After X days | **YES** | No | Auto-archive |
| any | on_hold | User manual | No | **YES** | "Why? When resume?" |
| any | needs_rescheduling | User manual | No | **YES** | ReschedulingModal |
| any | cancelled | User manual | No | **YES** | CancellationModal |

---

## 🚀 ONE-CLICK PROGRESSION

**Goal:** User should only need ONE CLICK to move to next stage.

**Current State:**
- ❌ Multiple clicks required
- ❌ Manual status changes
- ❌ No automatic progression
- ❌ No prompts for next action

**Target State:**
- ✅ One-click buttons: "Send Quote", "Schedule Job", "Start Job", "Complete Job", "Create Invoice", "Mark Paid"
- ✅ Automatic status changes where appropriate
- ✅ Smart prompts for next action
- ✅ Automatic notifications
- ✅ Timer integration

---

## 💡 MARKETING MESSAGE

**Current (Broken):**
> "Unified pipeline from quote to payment"

**Target (After Implementation):**
> "One-click pipeline automation: Send quote → Schedule → Start → Complete → Invoice → Paid. 
> Automatic status changes, smart notifications, and zero manual tracking. 
> Your team focuses on the work, TradeMate handles the workflow."

---

## ⚠️ WHY IT'S TAKING SO LONG

**Root Cause:** We've been fixing individual status changes reactively instead of designing the complete pipeline proactively.

**Solution:** 
1. Map out EVERY status change (this document)
2. Identify ALL missing pieces
3. Implement systematically in phases
4. Test complete pipeline end-to-end
5. THEN market as "unified pipeline"

**Estimated Total Time:** 10-12 days for complete implementation
**Current Approach:** Infinite days (piecemeal fixes forever)

---

## 🎯 NEXT STEPS

1. **Review this spec** - Confirm this matches your vision
2. **Prioritize phases** - Which features are must-have vs nice-to-have?
3. **Implement Phase 1** - Critical timestamps (foundation)
4. **Implement Phase 2** - Automatic status changes (core value)
5. **Test end-to-end** - Walk through complete pipeline
6. **Implement remaining phases** - Notifications, timer, settings
7. **Market as complete** - Only after full pipeline works

---

**Do you want me to start implementing Phase 1 (Critical Timestamps) right now?**

