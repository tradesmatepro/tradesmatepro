# Work Orders Schema Cleanup Plan

## Current State
- **205 columns** in work_orders table (bloated!)
- Multiple redundant fields for same concepts
- Inconsistent naming conventions
- Scattered state tracking across many fields
- Frontend/backend enum mismatches

## Redundancy Analysis

### 1. Quote-Related (7 redundant fields)
**Problem:** Multiple fields tracking same events
- `quote_sent_at` + `sent_at` (same thing)
- `quote_accepted_at` + `customer_approved_at` + `approved_at` (all mean customer approved)
- `quote_viewed_at` + `viewed_at` (same thing)

**Solution:** Keep ONE field per event
- `sent_at` (when quote was sent)
- `approved_at` (when customer approved)
- `viewed_at` (when customer viewed)

### 2. Scheduling (8 redundant fields)
**Problem:** Multiple fields for same timeline
- `scheduled_start` + `preferred_start_date` (when should it start?)
- `scheduled_end` + `estimated_completion_date` (when should it end?)
- `actual_start` + `started_at` (when did it actually start?)
- `actual_end` + `completed_at` (when did it actually end?)

**Solution:** Keep ONE field per timeline point
- `scheduled_start` (planned start)
- `scheduled_end` (planned end)
- `started_at` (actual start)
- `completed_at` (actual end)

### 3. Status/Approval (5 redundant fields)
**Problem:** Status enum + individual date fields
- `status` (enum: draft, sent, approved, scheduled, in_progress, completed, invoiced, paid, closed)
- `invoiced_at`, `completed_at`, `presented_at`, `presented_time` (redundant with status)

**Solution:** Use status enum + ONE timestamp per status
- `status` (single source of truth)
- `status_changed_at` (when status last changed)
- Create `work_order_timeline` table for full audit trail

### 4. Follow-up (4 messy fields)
**Problem:** 3 different fields for same thing
- `follow_up_date` + `follow_up_scheduled_at` + `follow_up_reminder_time`
- `follow_up_time` (duplicate?)

**Solution:** Consolidate to ONE field
- `follow_up_scheduled_at` (when follow-up is scheduled)
- `follow_up_reminder_sent_at` (when reminder was sent)

### 5. Payment/Invoice (4 overlapping fields)
**Problem:** Unclear which is source of truth
- `paid_at` vs invoice tracking
- `invoice_sent_at` + `invoice_date` (different purposes?)
- `invoice_viewed_at`

**Solution:** Clear separation
- `invoice_sent_at` (when invoice was sent to customer)
- `invoice_viewed_at` (when customer viewed invoice)
- `paid_at` (when payment received)

## Recommended Approach

### Option A: Aggressive Cleanup (RECOMMENDED)
1. **Consolidate work_orders table** to ~80 essential columns
2. **Create work_order_timeline table** for audit trail
   - Tracks all status changes with timestamps
   - Replaces scattered date fields
   - Single source of truth for history

3. **Create work_order_events table** for notifications
   - Tracks when emails sent, viewed, etc.
   - Replaces email_sent_at, email_opened_at, etc.

### Option B: Gradual Migration
1. Keep existing columns for backward compatibility
2. Add new consolidated fields
3. Migrate data gradually
4. Deprecate old fields

## Implementation Steps

1. **Create migration script** to:
   - Create timeline/events tables
   - Migrate existing data
   - Validate data integrity

2. **Update backend RPC functions** to:
   - Use consolidated fields
   - Populate timeline table on status changes
   - Maintain audit trail

3. **Update frontend** to:
   - Use new field names
   - Query timeline table for history
   - Remove scattered date field logic

4. **Update services** (InvoicesService, etc.) to:
   - Use consolidated enum values
   - Populate timeline on changes
   - Maintain consistency

## Benefits
✅ Cleaner schema (205 → ~80 columns)
✅ Single source of truth for status
✅ Full audit trail via timeline table
✅ Easier to maintain and debug
✅ Consistent across web/mobile/API
✅ Better performance (fewer columns to query)
✅ Fixes enum mismatch issues

## Timeline
- Phase 1: Create new tables + migration (1-2 hours)
- Phase 2: Update backend RPC functions (2-3 hours)
- Phase 3: Update frontend to use new fields (2-3 hours)
- Phase 4: Deprecate old fields (optional, later)

