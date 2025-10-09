# 🔧 Quote Sending Fixes - Analysis & Implementation

**Date:** 2025-10-09  
**Issues:** 4 critical bugs in quote sending flow  
**Status:** FIXING AUTONOMOUSLY

---

## 🐛 Issues Identified

### Issue 1: Quote Status Not Updating from "draft" to "sent"
**Problem:** After sending, quote status remains "draft"  
**Root Cause:** Edge Function tries to update status but may have incorrect Supabase credentials (DATABASE_URL/SERVICE_ROLE_KEY)  
**Location:** `supabase/functions/send-quote-email/index.ts` lines 77-95

### Issue 2: Email Preview Shows $0.00
**Problem:** Preview shows "Quote Amount: $0.00" even though quote has amount  
**Root Cause:** `quoteAmount` prop not being passed correctly from QuotesPro to SendQuoteModalNew  
**Location:** `src/pages/QuotesPro.js` line 814 (missing quoteAmount prop)

### Issue 3: PDF Attachment Missing from Email
**Problem:** Even when "Include PDF" is checked, no PDF is attached to email  
**Root Cause:** Email service only sends HTML, doesn't generate or attach PDF  
**Location:** `src/services/QuoteSendingService.js` - PDF generation exists but not attached

### Issue 4: Custom Message Missing from Email
**Problem:** Custom message from send modal doesn't appear in email body  
**Root Cause:** Custom message not passed from modal → service → Edge Function  
**Location:** Multiple files - data flow broken

---

## 🔍 Data Flow Analysis

### Current Flow (Broken)
```
SendQuoteModalNew (customMessage in formData)
  ↓ onConfirm(sendData) - includes customMessage
QuotesPro.handleSendModalConfirm(sendData)
  ↓ quoteSendingService.sendQuoteEmail(companyId, quoteId)
  ❌ sendData.customMessage LOST HERE!
QuoteSendingService.sendQuoteEmail(companyId, quoteId, options)
  ↓ buildEmailTemplate(data) - no customMessage
Edge Function send-quote-email
  ↓ Resend API
Email sent WITHOUT custom message
```

### Fixed Flow (Needed)
```
SendQuoteModalNew (customMessage + includeAttachment)
  ↓ onConfirm(sendData)
QuotesPro.handleSendModalConfirm(sendData)
  ↓ quoteSendingService.sendQuoteEmail(companyId, quoteId, {
      customMessage: sendData.customMessage,
      includePDF: sendData.includeAttachment
    })
QuoteSendingService.sendQuoteEmail(companyId, quoteId, options)
  ↓ buildEmailTemplate({ ...data, customMessage: options.customMessage })
  ↓ Generate PDF if options.includePDF
Edge Function send-quote-email (with PDF attachment)
  ↓ Resend API
Email sent WITH custom message AND PDF
```

---

## 🛠️ Fixes to Implement

### Fix 1: Update Supabase Secrets for Edge Function ✅
**Action:** Verify DATABASE_URL and SERVICE_ROLE_KEY are set correctly

```bash
# Check current secrets
node AIDevTools/supabaseManagementAPI.js secrets

# Update if needed
node AIDevTools/supabaseManagementAPI.js update-secret DATABASE_URL <value>
node AIDevTools/supabaseManagementAPI.js update-secret SERVICE_ROLE_KEY <value>
```

### Fix 2: Pass quoteAmount to SendQuoteModalNew ✅
**File:** `src/pages/QuotesPro.js` line ~814

**Before:**
```javascript
<SendQuoteModalNew
  isOpen={showSendModal}
  onClose={() => setShowSendModal(false)}
  onConfirm={handleSendModalConfirm}
  quoteTitle={activeQuote?.title || `Quote ${activeQuote?.quote_number || activeQuote?.id}`}
  customerName={...}
  customerEmail={...}
  customerPhone={...}
  portalLink={...}
  // ❌ Missing quoteAmount!
/>
```

**After:**
```javascript
<SendQuoteModalNew
  isOpen={showSendModal}
  onClose={() => setShowSendModal(false)}
  onConfirm={handleSendModalConfirm}
  quoteTitle={activeQuote?.title || `Quote ${activeQuote?.quote_number || activeQuote?.id}`}
  customerName={...}
  customerEmail={...}
  customerPhone={...}
  quoteAmount={activeQuote?.total_amount || activeQuote?.grand_total || 0}  // ✅ Added!
  portalLink={...}
/>
```

### Fix 3: Pass Custom Message Through Data Flow ✅
**Files:** 
- `src/pages/QuotesPro.js` - handleSendModalConfirm
- `src/services/QuoteSendingService.js` - sendQuoteEmail, buildEmailTemplate

**QuotesPro.js - handleSendModalConfirm:**
```javascript
const handleSendModalConfirm = async (sendData) => {
  try {
    if (!activeQuote) throw new Error('No active quote');
    console.log('📨 Send modal confirm:', sendData);

    if (sendData.deliveryMethod === 'email' || sendData.deliveryMethod === 'both') {
      const result = await quoteSendingService.sendQuoteEmail(
        user.company_id, 
        activeQuote.id,
        {
          customMessage: sendData.customMessage,  // ✅ Pass custom message
          includePDF: sendData.includeAttachment  // ✅ Pass PDF flag
        }
      );
      console.log('✅ Quote sent via email:', result);
      window?.toast?.success?.(`Quote sent to ${result.sentTo}!`);
    }
    // ... rest
  }
};
```

**QuoteSendingService.js - buildEmailTemplate:**
```javascript
buildEmailTemplate(data) {
  return `
    ...
    <p style="font-size: 16px; color: #333; margin: 0 0 30px 0;">
      ${data.companyName} has prepared a quote for you. We're excited to work with you!
    </p>

    ${data.customMessage ? `
    <!-- Custom Message -->
    <div style="background: #e3f2fd; border-left: 4px solid #1e88e5; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #333; white-space: pre-wrap;">${data.customMessage}</p>
    </div>
    ` : ''}

    <!-- Quote Card -->
    ...
  `;
}
```

### Fix 4: Add PDF Attachment Support ✅
**File:** `src/services/QuoteSendingService.js`

**Current:** Only sends HTML email  
**Needed:** Generate PDF and attach to email

**Implementation:**
```javascript
async sendQuoteEmail(companyId, quoteId, options = {}) {
  // ... existing code to get quote, customer, company ...

  // Generate PDF HTML for attachment (if requested)
  let pdfAttachment = null;
  if (options.includePDF !== false) {  // Default to true
    const pdfHtml = QuotePDFService.exportHtml(company, quote, [], customer);
    pdfAttachment = {
      filename: `Quote-${quote.quote_number || quoteId}.html`,
      content: pdfHtml,
      contentType: 'text/html'
    };
  }

  // Build email HTML with custom message
  const emailHtml = this.buildEmailTemplate({
    customerName: customerName,
    companyName: company.company_name || 'TradeMate Pro',
    companyLogo: company.logo_url || '',
    quoteTitle: quote.title || 'Quote',
    totalAmount: (quote.total_amount || 0).toFixed(2),
    portalLink,
    companyPhone: company.phone || '',
    companyAddress: company.address || '',
    customMessage: options.customMessage || ''  // ✅ Pass custom message
  });

  // Build payload for Edge Function
  const emailPayload = {
    from: options.fromEmail || `${company.company_name || 'TradeMate Pro'} <quotes@updates.tradesmatepro.com>`,
    to: customer.email,
    subject: options.subject || `Quote from ${company.company_name || 'TradeMate Pro'} - ${quote.title}`,
    html: emailHtml,
    attachments: pdfAttachment ? [pdfAttachment] : [],  // ✅ Add PDF attachment
    tags: [...],
    companyId,
    quoteId
  };

  // ... rest of function ...
}
```

**Edge Function Update:**
```typescript
// supabase/functions/send-quote-email/index.ts
const {
  to,
  subject,
  html,
  from,
  cc,
  bcc,
  reply_to,
  tags,
  attachments,  // ✅ Add attachments support
  companyId,
  quoteId,
} = body || {};

// Call Resend API
const resendRes = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${resendApiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: from || `TradeMate Pro <quotes@updates.tradesmatepro.com>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(cc ? { cc } : {}),
    ...(bcc ? { bcc } : {}),
    ...(reply_to ? { reply_to } : {}),
    ...(tags ? { tags } : {}),
    ...(attachments ? { attachments } : {}),  // ✅ Add attachments
  }),
});
```

---

## 📋 Implementation Order

1. ✅ Fix quoteAmount prop (QuotesPro.js)
2. ✅ Pass custom message through data flow (QuotesPro.js + QuoteSendingService.js)
3. ✅ Add custom message to email template (QuoteSendingService.js)
4. ✅ Add PDF attachment support (QuoteSendingService.js + Edge Function)
5. ✅ Verify Supabase secrets (DATABASE_URL, SERVICE_ROLE_KEY)
6. ✅ Test all fixes with autonomous test

---

## ✅ Success Criteria

- [ ] Quote status updates from "draft" to "sent" after sending
- [ ] Email preview shows correct dollar amount
- [ ] PDF is attached to email when "Include PDF" is checked
- [ ] Custom message appears in email body
- [ ] All changes tested with autonomous test runner

---

**Status:** READY TO IMPLEMENT  
**Next:** Apply fixes in order

