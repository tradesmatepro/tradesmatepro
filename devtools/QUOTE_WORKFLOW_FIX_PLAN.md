# Quote Workflow Fix Plan

## Problem Statement
User tested quote status changes and found:
1. ❌ **"Approved" does nothing** - used to ask to schedule, now just changes status
2. ❌ **"Rejected" does nothing** - no modal to capture rejection reason
3. ❌ **"Follow Up" does nothing** - no modal to schedule follow-up
4. ❌ **"Changes Requested" does nothing** - no modal to capture change details
5. ❌ **Other statuses also broken** - no proper workflow handling

## Root Cause
**QuotesPro.js line 467-484:** The `setActiveQuoteStatus` function just does a simple PATCH:
```javascript
const setActiveQuoteStatus = async (newStatus) => {
  if (!activeQuote || !user) return;
  try {
    const res = await supaFetch(`work_orders?id=eq.${activeQuote.id}`, {
      method: 'PATCH',
      body: { status: newStatus }  // ❌ Just changes status, no workflow!
    }, user.company_id);
    // ...
  }
};
```

**This is wrong!** It should:
1. Show appropriate modal for the status
2. Capture required data (rejection reason, follow-up date, etc.)
3. Update multiple database columns (timestamps, notes, etc.)
4. Trigger follow-up actions (schedule job, create follow-up task, etc.)

## Solution

### Step 1: Add Modal State Management to QuotesPro.js
```javascript
// Add these state variables
const [showApprovalModal, setShowApprovalModal] = useState(false);
const [showRejectionModal, setShowRejectionModal] = useState(false);
const [showChangesRequestedModal, setShowChangesRequestedModal] = useState(false);
const [showFollowUpModal, setShowFollowUpModal] = useState(false);
const [showExpiredModal, setShowExpiredModal] = useState(false);
const [showPresentedModal, setShowPresentedModal] = useState(false);
const [showSendModal, setShowSendModal] = useState(false);
const [quoteForAction, setQuoteForAction] = useState(null);
```

### Step 2: Replace `setActiveQuoteStatus` with Proper Workflow Handler
```javascript
const handleQuoteStatusChange = async (quote, newStatus) => {
  setQuoteForAction(quote);
  
  // Intercept status changes to show appropriate modals
  switch(newStatus) {
    case 'sent':
      setShowSendModal(true);
      break;
    case 'presented':
      setShowPresentedModal(true);
      break;
    case 'approved':
      setShowApprovalModal(true);  // ⭐ THIS IS THE KEY ONE!
      break;
    case 'rejected':
      setShowRejectionModal(true);
      break;
    case 'changes_requested':
      setShowChangesRequestedModal(true);
      break;
    case 'follow_up':
      setShowFollowUpModal(true);
      break;
    case 'expired':
      setShowExpiredModal(true);
      break;
    default:
      // For other statuses, just update directly
      await updateQuoteStatus(quote.id, newStatus);
  }
};
```

### Step 3: Add Modal Confirmation Handlers
```javascript
const handleApprovalConfirm = async (approvalData) => {
  try {
    // Update quote status + approval fields
    await supaFetch(`work_orders?id=eq.${quoteForAction.id}`, {
      method: 'PATCH',
      body: {
        status: 'approved',
        customer_approved_at: new Date().toISOString(),
        approval_method: approvalData.method,
        approval_notes: approvalData.notes
      }
    }, user.company_id);
    
    // If "Schedule Now" was clicked, show scheduling modal
    if (approvalData.scheduleNow) {
      setShowSchedulingModal(true);
    }
    
    setShowApprovalModal(false);
    await loadQuotes(); // Refresh list
    toast.success('Quote approved!');
  } catch (error) {
    console.error('Error approving quote:', error);
    toast.error('Failed to approve quote');
  }
};

const handleRejectionConfirm = async (rejectionData) => {
  try {
    await supaFetch(`work_orders?id=eq.${quoteForAction.id}`, {
      method: 'PATCH',
      body: {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionData.reason,
        rejection_notes: rejectionData.notes,
        competitor_name: rejectionData.competitor,
        competitor_price: rejectionData.competitorPrice
      }
    }, user.company_id);
    
    // If user wants to schedule follow-up
    if (rejectionData.scheduleFollowUp) {
      setShowFollowUpModal(true);
    } else {
      setShowRejectionModal(false);
    }
    
    await loadQuotes();
    toast.success('Quote rejection recorded');
  } catch (error) {
    console.error('Error rejecting quote:', error);
    toast.error('Failed to record rejection');
  }
};

const handleChangesRequestedConfirm = async (changesData) => {
  try {
    await supaFetch(`work_orders?id=eq.${quoteForAction.id}`, {
      method: 'PATCH',
      body: {
        status: 'changes_requested',
        changes_requested_at: new Date().toISOString(),
        change_types: changesData.changeTypes,
        change_details: changesData.details,
        change_urgency: changesData.urgency
      }
    }, user.company_id);
    
    // Create new quote version if requested
    if (changesData.createNewVersion) {
      await createQuoteVersion(quoteForAction.id);
    }
    
    setShowChangesRequestedModal(false);
    await loadQuotes();
    toast.success('Changes requested recorded');
  } catch (error) {
    console.error('Error recording changes:', error);
    toast.error('Failed to record changes');
  }
};

const handleFollowUpConfirm = async (followUpData) => {
  try {
    // Update quote status
    await supaFetch(`work_orders?id=eq.${quoteForAction.id}`, {
      method: 'PATCH',
      body: {
        status: 'follow_up',
        follow_up_scheduled_at: new Date().toISOString(),
        follow_up_date: followUpData.date,
        follow_up_time: followUpData.time,
        follow_up_method: followUpData.method,
        follow_up_notes: followUpData.notes
      }
    }, user.company_id);
    
    // Create follow-up task
    await supaFetch('quote_follow_ups', {
      method: 'POST',
      body: {
        work_order_id: quoteForAction.id,
        company_id: user.company_id,
        scheduled_date: followUpData.date,
        follow_up_type: followUpData.method,
        assigned_to: followUpData.assignedTo,
        status: 'SCHEDULED',
        notes: followUpData.notes
      }
    }, user.company_id);
    
    setShowFollowUpModal(false);
    await loadQuotes();
    toast.success('Follow-up scheduled');
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    toast.error('Failed to schedule follow-up');
  }
};
```

### Step 4: Add Modal Components to JSX
```jsx
{/* Approval Modal */}
{showApprovalModal && quoteForAction && (
  <ApprovalModal
    isOpen={showApprovalModal}
    onClose={() => setShowApprovalModal(false)}
    quote={quoteForAction}
    onConfirm={handleApprovalConfirm}
  />
)}

{/* Rejection Modal */}
{showRejectionModal && quoteForAction && (
  <RejectionModal
    isOpen={showRejectionModal}
    onClose={() => setShowRejectionModal(false)}
    quote={quoteForAction}
    onConfirm={handleRejectionConfirm}
  />
)}

{/* Changes Requested Modal */}
{showChangesRequestedModal && quoteForAction && (
  <ChangesRequestedModal
    isOpen={showChangesRequestedModal}
    onClose={() => setShowChangesRequestedModal(false)}
    quote={quoteForAction}
    onConfirm={handleChangesRequestedConfirm}
  />
)}

{/* Follow Up Modal */}
{showFollowUpModal && quoteForAction && (
  <FollowUpModal
    isOpen={showFollowUpModal}
    onClose={() => setShowFollowUpModal(false)}
    quote={quoteForAction}
    onConfirm={handleFollowUpConfirm}
  />
)}
```

### Step 5: Update Button Click Handlers
Find where buttons call `setActiveQuoteStatus` and replace with `handleQuoteStatusChange`:

**Before:**
```jsx
<button onClick={() => setActiveQuoteStatus('approved')}>
  Approve
</button>
```

**After:**
```jsx
<button onClick={() => handleQuoteStatusChange(activeQuote, 'approved')}>
  Approve
</button>
```

## Files to Modify
1. ✅ `src/pages/QuotesPro.js` - Add modal state, handlers, and JSX
2. ✅ Check modal components exist and have correct props
3. ✅ Test each status change end-to-end

## Testing Checklist
- [ ] Draft → Sent (shows send modal)
- [ ] Sent → Presented (shows presented modal)
- [ ] Presented → Approved (shows approval modal with "Schedule Now" button)
- [ ] Approved → Scheduled (shows scheduling modal)
- [ ] Presented → Rejected (shows rejection modal with reason capture)
- [ ] Presented → Changes Requested (shows changes modal, creates new version)
- [ ] Sent → Follow Up (shows follow-up modal, creates task)
- [ ] Sent → Expired (shows expired modal with extend/recreate options)

