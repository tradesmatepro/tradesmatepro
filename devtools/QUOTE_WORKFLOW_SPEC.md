# Quote Workflow Specification - Industry Standard

## Goal
Beat ServiceTitan, Jobber, and Housecall Pro by implementing a complete, automated quote workflow that eliminates pain points contractors complain about.

## Status Flow Pipeline
```
draft → sent → presented → [approved/rejected/changes_requested/follow_up/expired] → scheduled → in_progress → completed → invoiced → paid → closed
```

## Status Definitions & Required Actions

### 1. **DRAFT** (Initial State)
**What it means:** Quote is being created, not yet sent to customer
**Required Actions:**
- ✅ Allow editing all fields
- ✅ Save button saves as draft
- ✅ "Send Quote" button → changes status to `sent`
- ✅ Can delete draft quotes

**Database Updates:**
- `status = 'draft'`
- No timestamps set yet

---

### 2. **SENT** (Quote Delivered to Customer)
**What it means:** Quote has been emailed/texted to customer, awaiting response
**Required Actions:**
- ✅ Mark as `sent` with timestamp
- ✅ Send email/SMS to customer with quote link
- ✅ Start tracking customer views (analytics)
- ✅ Enable "Mark as Presented" button (for in-person presentations)
- ✅ Enable "Follow Up" button to schedule reminder
- ✅ Auto-schedule follow-up reminder (3 days default, configurable)
- ⚠️ Lock editing (create new version if changes needed)

**Database Updates:**
- `status = 'sent'`
- `sent_at = NOW()`
- `sent_by = user_id`
- Auto-create follow-up reminder in `quote_follow_ups` table

**Pain Point Solved:** ServiceTitan users complain quotes get lost - we auto-schedule follow-ups

---

### 3. **PRESENTED** (In-Person Presentation)
**What it means:** Quote was presented to customer face-to-face
**Required Actions:**
- ✅ Mark as `presented` with timestamp
- ✅ Enable "Customer Approved" button
- ✅ Enable "Customer Rejected" button
- ✅ Enable "Customer Requested Changes" button
- ✅ Enable "Schedule Follow-Up" button
- ⚠️ Lock editing (create new version if changes needed)

**Database Updates:**
- `status = 'presented'`
- `presented_at = NOW()`
- `presented_by = user_id`

---

### 4. **APPROVED** (Customer Accepted Quote) ⭐ CRITICAL
**What it means:** Customer said YES - ready to schedule work
**Required Actions:**
- ✅ **IMMEDIATELY show "Schedule Job" modal** (this is what you said is broken!)
- ✅ Modal should have:
  - Date/time picker
  - Technician assignment dropdown
  - Duration estimate
  - "Schedule Now" button → changes status to `scheduled`
  - "Schedule Later" button → keeps status as `approved` but adds to scheduling queue
- ✅ Send confirmation email to customer
- ✅ Send notification to assigned technician
- ✅ Add to "Jobs to Schedule" dashboard widget
- ✅ Convert quote to job (create job record)
- ⚠️ Lock editing completely (approved quotes are contracts)

**Database Updates:**
- `status = 'approved'`
- `customer_approved_at = NOW()`
- `approval_method = 'online' | 'in_person' | 'phone' | 'email'`
- `approval_notes = customer_notes`

**Pain Point Solved:** Jobber users complain approved quotes sit in limbo - we force immediate scheduling action

---

### 5. **REJECTED** (Customer Declined Quote)
**What it means:** Customer said NO
**Required Actions:**
- ✅ **Show "Rejection Details" modal** with:
  - Rejection reason dropdown (price too high, chose competitor, timing, scope, other)
  - Competitor name field (if applicable)
  - Competitor price field (if applicable)
  - Notes field
  - "Save & Close" button
- ✅ Ask "Would you like to schedule a follow-up?" (Yes/No)
  - If Yes → show follow-up scheduler
- ✅ Move to "Lost Quotes" view
- ✅ Track rejection analytics (reasons, competitors, price gaps)
- ✅ Send internal notification to sales manager

**Database Updates:**
- `status = 'rejected'`
- `rejected_at = NOW()`
- `rejection_reason = selected_reason`
- `rejection_notes = notes`
- `competitor_name = competitor` (if provided)
- `competitor_price = price` (if provided)

**Pain Point Solved:** Housecall Pro users complain they don't know WHY quotes are rejected - we capture detailed analytics

---

### 6. **CHANGES_REQUESTED** (Customer Wants Modifications)
**What it means:** Customer likes the quote but wants changes
**Required Actions:**
- ✅ **Show "Changes Requested" modal** with:
  - Change types checkboxes (price, scope, timeline, payment terms, materials, other)
  - Change details text area
  - Urgency dropdown (low, medium, high, urgent)
  - Customer contact preference (email, phone, in-person)
  - "Save & Create New Version" button
- ✅ Create new quote version (copy original, increment version number)
  - Original quote stays as `changes_requested`
  - New version starts as `draft`
- ✅ Link versions together (parent_quote_id)
- ✅ Send notification to estimator/salesperson
- ✅ Add to "Quotes Needing Revision" dashboard widget

**Database Updates:**
- `status = 'changes_requested'`
- `changes_requested_at = NOW()`
- `change_types = ARRAY['price', 'scope', ...]`
- `change_details = details_text`
- `change_urgency = urgency_level`
- Create new work_order record with `parent_quote_id = original_id`

**Pain Point Solved:** ServiceTitan users complain change requests create chaos - we version control everything

---

### 7. **FOLLOW_UP** (Needs Follow-Up Call/Email)
**What it means:** Customer hasn't responded, needs reminder
**Required Actions:**
- ✅ **Show "Schedule Follow-Up" modal** with:
  - Follow-up date picker
  - Follow-up time picker
  - Follow-up method (email, phone, text, in-person)
  - Assigned to dropdown (user picker)
  - Reminder type (one-time, recurring)
  - Notes field
  - "Schedule Follow-Up" button
- ✅ Create follow-up task in `quote_follow_ups` table
- ✅ Send reminder notification on scheduled date/time
- ✅ Add to "Follow-Ups Due Today" dashboard widget
- ✅ Track follow-up history (how many attempts, responses)

**Database Updates:**
- `status = 'follow_up'`
- `follow_up_scheduled_at = NOW()`
- `follow_up_date = selected_date`
- `follow_up_time = selected_time`
- `follow_up_method = method`
- `follow_up_reason = reason`
- `follow_up_notes = notes`
- Insert into `quote_follow_ups` table

**Pain Point Solved:** Jobber users complain follow-ups fall through cracks - we automate reminders

---

### 8. **EXPIRED** (Quote Expiration Date Passed)
**What it means:** Quote validity period ended
**Required Actions:**
- ✅ **Auto-detect expired quotes** (daily cron job)
- ✅ **Show "Quote Expired" modal** with:
  - "Extend Expiration" button → updates expiration date, keeps status as `sent`
  - "Create New Quote" button → creates new version with updated pricing
  - "Mark as Lost" button → changes status to `rejected`
  - Notes field
- ✅ Send notification to customer (quote expired, can request extension)
- ✅ Send notification to salesperson
- ✅ Add to "Expired Quotes" dashboard widget

**Database Updates:**
- `status = 'expired'`
- `expired_at = NOW()`
- `expired_notes = notes`

**Pain Point Solved:** Housecall Pro users complain expired quotes cause confusion - we proactively manage expirations

---

## Modal Components Needed

### 1. `ScheduleJobModal.js` (for APPROVED status)
- Date/time picker
- Technician dropdown
- Duration input
- Notes field
- "Schedule Now" / "Schedule Later" buttons

### 2. `RejectionModal.js` (for REJECTED status)
- Rejection reason dropdown
- Competitor fields
- Notes field
- Follow-up scheduler option

### 3. `ChangesRequestedModal.js` (for CHANGES_REQUESTED status)
- Change types checkboxes
- Change details textarea
- Urgency dropdown
- Contact preference
- "Create New Version" button

### 4. `FollowUpModal.js` (for FOLLOW_UP status)
- Date/time pickers
- Method dropdown
- Assigned to dropdown
- Reminder type
- Notes field

### 5. `ExpiredQuoteModal.js` (for EXPIRED status)
- Extend expiration option
- Create new version option
- Mark as lost option
- Notes field

---

## Next Steps

1. ✅ Create all 5 modal components
2. ✅ Add status change handlers to QuotesPro.js
3. ✅ Wire up modals to status buttons
4. ✅ Implement RPC functions for complex workflows (schedule job, create version, etc.)
5. ✅ Add dashboard widgets for each queue
6. ✅ Test entire pipeline end-to-end
7. ✅ Add analytics tracking for all status changes

