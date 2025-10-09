# Quote Creation Fix - Status Enum Issue

## Problem
Quote creation was failing with error:
```
Error: Failed to create quote (400): {
  "code":"22P02",
  "details":null,
  "hint":null,
  "message":"invalid input value for enum work_order_status_enum: \"quote\""
}
```

## Root Cause
The code was trying to insert `status: 'quote'` into the work_orders table, but the database enum `work_order_status_enum` does not have 'quote' as a valid value.

According to the database schema (from `cleanup_status_enum.sql`), the valid quote-stage statuses are:
- `draft` - Creating quote (initial status)
- `sent` - Sent to customer
- `presented` - Shown in person (ServiceTitan feature)
- `changes_requested` - Customer wants changes (Jobber pain point fix)
- `follow_up` - Needs follow-up tracking (ServiceTitan feature)
- `approved` - Customer accepted (becomes unscheduled job)
- `rejected` - Customer declined
- `expired` - Quote expired (Housecall Pro feature)

## Solution
Changed all occurrences of `status: 'quote'` to `status: 'draft'` in `src/components/QuotesDatabasePanel.js`:

1. **Line 57** - Initial formData state:
   ```javascript
   // BEFORE:
   status: 'quote', // work_order_status_enum uses lowercase
   
   // AFTER:
   status: 'draft', // work_order_status_enum uses lowercase - 'draft' is the initial quote status
   ```

2. **Line 450** - createQuote function:
   ```javascript
   // BEFORE:
   status: (dataToUse.status || 'quote').toLowerCase(),
   
   // AFTER:
   status: (dataToUse.status || 'draft').toLowerCase(),
   ```

3. **Line 730-732** - updateQuote function:
   ```javascript
   // BEFORE:
   const newStatusForData = (quoteData.status || 'quote').toLowerCase();
   const currentStatusForData = (selectedQuote.status || 'quote').toLowerCase();
   
   // AFTER:
   const newStatusForData = (quoteData.status || 'draft').toLowerCase();
   const currentStatusForData = (selectedQuote.status || 'draft').toLowerCase();
   ```

4. **Line 1370** - openEditForm function:
   ```javascript
   // BEFORE:
   status: wo.status || 'quote', // work_order_status_enum uses lowercase
   
   // AFTER:
   status: wo.status || 'draft', // work_order_status_enum uses lowercase - 'draft' is the initial quote status
   ```

## Files Modified
- `src/components/QuotesDatabasePanel.js` - Changed 4 occurrences of 'quote' to 'draft'

## Testing
After the fix:
1. Build completed successfully ✅
2. Quote creation should now work with status='draft'
3. Quotes will appear in the Quotes page (which filters for quote-stage statuses including 'draft')

## Industry Standard Alignment
The 'draft' status aligns with industry standards:
- **ServiceTitan**: Uses 'Draft' for quotes being created
- **Jobber**: Uses 'Draft' for unsent quotes
- **Housecall Pro**: Uses 'Draft' for quotes in progress

The status progression is:
1. **draft** → Creating/editing quote
2. **sent** → Sent to customer
3. **presented** → Shown in person
4. **approved** → Customer accepted (moves to Jobs page)
5. **rejected** → Customer declined
6. **expired** → Quote expired

## Related Files
- `database/migrations/cleanup_status_enum.sql` - Defines the enum values
- `src/components/QuotesDatabasePanel.js` - Quote CRUD operations
- `src/pages/QuotesPro.js` - Quotes page that displays quotes

## Notes
- The database enum uses lowercase values (industry standard)
- The Quotes page filters for: `['draft', 'sent', 'presented', 'changes_requested', 'follow_up', 'rejected', 'expired', 'cancelled']`
- Approved quotes automatically move to the Jobs page as "Unscheduled" jobs

