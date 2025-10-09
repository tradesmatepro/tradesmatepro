# 🎨 Frontend Implementation Guide - Industry Standard Pipeline

## 📋 Overview

After running the database migration, you need to update the frontend code to use the new schema. This guide shows what to fix and what to build.

---

## 🔥 CRITICAL FIXES (Do First)

### **Fix 1: Remove `stage` Column References**

**Problem:** Code tries to set `stage: 'QUOTE'` and `stage: 'JOB'` but column doesn't exist.

**Files to Fix:**
- `src/pages/Quotes.js` (lines 579, 734)
- `src/pages/Quotes_clean.js` (lines 346, 480)
- `src/components/QuotesDatabasePanel.js` (line 390)
- `src/services/QuotePDFService.js` (line 240)

**Change:**
```javascript
// ❌ REMOVE THIS:
body: {
  ...quote,
  stage: 'QUOTE',  // Column doesn't exist!
  status: 'quote'
}

// ✅ USE THIS:
body: {
  ...quote,
  status: 'quote'  // Only use status column
}
```

---

### **Fix 2: Use New Status Enum Values**

**Problem:** Code tries to use `'SENT'` but enum expects lowercase `'sent'`.

**Files to Fix:**
- `src/components/quotes/SendQuoteModal.js` (line 50)

**Change:**
```javascript
// ❌ REMOVE THIS:
await supaFetch(`work_orders?id=eq.${quote.id}`, { 
  method:'PATCH', 
  body:{ status:'SENT' }  // Not in enum!
}, companyId);

// ✅ USE THIS:
await supaFetch(`work_orders?id=eq.${quote.id}`, { 
  method:'PATCH', 
  body:{ 
    status: 'sent',
    quote_sent_at: new Date().toISOString()
  }
}, companyId);
```

**New Status Values Available:**
- `'sent'` - Quote/invoice sent to customer
- `'rejected'` - Customer rejected quote
- `'paid'` - Invoice paid
- `'closed'` - Job closed and archived

---

### **Fix 3: Fix Quote → Job Conversion (CRITICAL)**

**Problem:** Creates duplicate work order instead of updating existing one.

**Files to Fix:**
- `src/pages/Quotes.js` (lines 722-739)
- `src/pages/Quotes_clean.js` (lines 469-486)

**Change:**
```javascript
// ❌ REMOVE THIS (creates duplicate):
const handleConvertToJob = async (quoteId) => {
  const quote = quotes.find(q => q.id === quoteId);
  const response = await supaFetch('work_orders', {
    method: 'POST',  // Creates NEW work order!
    body: {
      ...quote,
      id: undefined,
      stage: 'JOB',
      job_status: 'SCHEDULED'
    }
  });
};

// ✅ USE THIS (updates existing):
const handleConvertToJob = async (quoteId) => {
  const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
    method: 'PATCH',  // Updates existing work order
    body: {
      status: 'approved',
      quote_accepted_at: new Date().toISOString()
    }
  }, user.company_id);
  
  if (response.ok) {
    showAlert('success', 'Quote converted to job!');
    await loadQuotes();
  }
};
```

---

## 📊 NEW FEATURES TO BUILD

### **Feature 1: Quote Delivery Tracking**

**What:** Track when quotes are sent and viewed by customers.

**New Component:** `src/components/quotes/QuoteDeliveryHistory.js`

```javascript
import React, { useState, useEffect } from 'react';
import { supaFetch } from '../../utils/supabaseFetch';

export default function QuoteDeliveryHistory({ workOrderId, companyId }) {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    loadDeliveries();
  }, [workOrderId]);

  const loadDeliveries = async () => {
    const response = await supaFetch(
      `quote_deliveries?work_order_id=eq.${workOrderId}&order=sent_at.desc`,
      { method: 'GET' },
      companyId
    );
    if (response.ok) {
      setDeliveries(await response.json());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Delivery History</h3>
      {deliveries.length === 0 ? (
        <p className="text-gray-500">No deliveries yet</p>
      ) : (
        <div className="space-y-3">
          {deliveries.map(delivery => (
            <div key={delivery.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between">
                <span className="font-medium capitalize">{delivery.delivery_method}</span>
                <span className="text-sm text-gray-500">
                  {new Date(delivery.sent_at).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                To: {delivery.recipient_email || delivery.recipient_phone}
              </div>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  delivery.delivery_status === 'viewed' ? 'bg-green-100 text-green-800' :
                  delivery.delivery_status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                  delivery.delivery_status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {delivery.delivery_status}
                </span>
                {delivery.viewed_at && (
                  <span className="text-xs text-green-600">
                    ✓ Viewed {new Date(delivery.viewed_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Usage:** Add to quote detail page:
```javascript
<QuoteDeliveryHistory workOrderId={quote.id} companyId={user.company_id} />
```

---

### **Feature 2: Send Quote with Delivery Tracking**

**Update:** `src/components/quotes/SendQuoteModal.js`

```javascript
const handleSend = async () => {
  if (!quote || !companyId) return;
  try {
    setSending(true);
    
    // 1. Update work order status
    await supaFetch(`work_orders?id=eq.${quote.id}`, { 
      method: 'PATCH', 
      body: { 
        status: 'sent',
        quote_sent_at: new Date().toISOString()
      }
    }, companyId);

    // 2. Create delivery record
    const deliveryData = {
      company_id: companyId,
      work_order_id: quote.id,
      delivery_method: 'email',  // TODO: Add SMS option
      recipient_email: customerEmail,
      email_subject: emailSubject,
      email_body: emailMessage,
      delivery_status: 'sent',
      sent_at: new Date().toISOString()
    };

    await supaFetch('quote_deliveries', {
      method: 'POST',
      body: deliveryData
    }, companyId);

    // 3. Open PDF if requested
    if (includePdf) {
      try { 
        await QuotePDFService.openPrintable(companyId, quote.id); 
      } catch (e) {
        console.error('PDF generation failed:', e);
      }
    }

    // 4. TODO: Actually send email via SendGrid/Mailgun
    // await EmailService.sendQuote(deliveryData);

    window?.toast?.success?.('Quote sent successfully!');
    onSent && onSent();
    onClose();
  } catch (e) {
    console.error('Send quote error:', e);
    window?.toast?.error?.('Failed to send quote');
  } finally {
    setSending(false);
  }
};
```

---

### **Feature 3: Change Order Management**

**New Component:** `src/components/changeOrders/ChangeOrderForm.js`

```javascript
import React, { useState } from 'react';
import { supaFetch } from '../../utils/supabaseFetch';

export default function ChangeOrderForm({ workOrder, companyId, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reason: 'customer_request',
    items: []
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_type: 'addition',
        description: '',
        category: 'labor',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Recalculate total
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const taxRate = workOrder.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    return { subtotal, taxRate, taxAmount, totalAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const totals = calculateTotals();
      
      // 1. Create change order
      const changeOrderData = {
        company_id: companyId,
        work_order_id: workOrder.id,
        change_order_number: `CO-${new Date().getFullYear()}-${Date.now()}`, // TODO: Use proper sequence
        title: formData.title,
        description: formData.description,
        reason: formData.reason,
        status: 'pending_approval',
        subtotal: totals.subtotal,
        tax_rate: totals.taxRate,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount
      };

      const coResponse = await supaFetch('change_orders', {
        method: 'POST',
        body: changeOrderData,
        headers: { Prefer: 'return=representation' }
      }, companyId);

      if (!coResponse.ok) throw new Error('Failed to create change order');
      
      const [changeOrder] = await coResponse.json();

      // 2. Create change order items
      for (const item of formData.items) {
        await supaFetch('change_order_items', {
          method: 'POST',
          body: {
            company_id: companyId,
            change_order_id: changeOrder.id,
            ...item
          }
        }, companyId);
      }

      window?.toast?.success?.('Change order created!');
      onSaved && onSaved();
    } catch (error) {
      console.error('Error creating change order:', error);
      window?.toast?.error?.('Failed to create change order');
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <select
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="customer_request">Customer Request</option>
          <option value="scope_change">Scope Change</option>
          <option value="unforeseen_work">Unforeseen Work</option>
          <option value="code_requirement">Code Requirement</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Line Items</label>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Item
          </button>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="border rounded p-4 mb-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1">Type</label>
                <select
                  value={item.item_type}
                  onChange={(e) => updateItem(index, 'item_type', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="addition">Addition</option>
                  <option value="deletion">Deletion</option>
                  <option value="modification">Modification</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Category</label>
                <select
                  value={item.category}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="labor">Labor</option>
                  <option value="material">Material</option>
                  <option value="equipment">Equipment</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs mb-1">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <label className="block text-xs mb-1">Qty</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Unit Price</label>
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                  className="w-full border rounded px-2 py-1 text-sm"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Total</label>
                <input
                  type="text"
                  value={`$${item.total.toFixed(2)}`}
                  className="w-full border rounded px-2 py-1 text-sm bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Subtotal:</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Tax ({totals.taxRate}%):</span>
          <span>${totals.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${totals.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Create Change Order
      </button>
    </form>
  );
}
```

---

## 🎯 Implementation Checklist

### **Phase 1: Critical Fixes (Do Now)**
- [ ] Remove all `stage` column references
- [ ] Update status values to lowercase ('sent', 'rejected', 'paid', 'closed')
- [ ] Fix quote → job conversion (update instead of duplicate)
- [ ] Update SendQuoteModal to set `quote_sent_at` timestamp

### **Phase 2: Delivery Tracking**
- [ ] Create QuoteDeliveryHistory component
- [ ] Update SendQuoteModal to create delivery records
- [ ] Add delivery history to quote detail page
- [ ] Add delivery history to invoice detail page

### **Phase 3: Change Orders**
- [ ] Create ChangeOrderForm component
- [ ] Create ChangeOrderList component
- [ ] Add "Request Change Order" button to work order detail
- [ ] Add change order approval workflow
- [ ] Show change orders on work order detail page

### **Phase 4: Customer Portal**
- [ ] Add quote acceptance/rejection form
- [ ] Add digital signature capture
- [ ] Create quote_responses record on accept/reject
- [ ] Update work_order status on acceptance

### **Phase 5: Placeholders**
- [ ] Add "Email integration coming soon" message in SendQuoteModal
- [ ] Add "SMS integration coming soon" option
- [ ] Add "Automated reminders coming soon" note
- [ ] Add "Review automation coming soon" note

---

## 📚 Reference

**New Tables:**
- `quote_deliveries` - Track quote delivery
- `invoice_deliveries` - Track invoice delivery
- `payment_deliveries` - Track receipt delivery
- `quote_responses` - Track customer responses
- `change_orders` - Change order management
- `change_order_items` - Change order line items
- `job_completion_checklist` - Completion requirements
- `customer_feedback` - Reviews and ratings

**New Status Values:**
- `sent` - Quote/invoice sent
- `rejected` - Customer rejected
- `paid` - Invoice paid
- `closed` - Job closed

**New Columns in work_orders:**
- `quote_sent_at`, `quote_viewed_at`, `quote_expires_at`
- `quote_accepted_at`, `quote_rejected_at`, `quote_rejection_reason`
- `has_change_orders`, `change_orders_total`
- `invoice_sent_at`, `invoice_viewed_at`
- `paid_at`, `closed_at`

