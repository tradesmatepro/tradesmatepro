import React, { useState } from 'react';
import { supaFetch } from '../../utils/supaFetch';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ChangeOrderForm({ workOrder, companyId, onSaved, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reason: 'customer_request',
    items: []
  });
  const [saving, setSaving] = useState(false);

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

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Recalculate total
    if (field === 'quantity' || field === 'unit_price') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].unit_price) || 0;
      newItems[index].total = qty * price;
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

  const generateChangeOrderNumber = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `CO-${year}-${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      window?.toast?.error?.('Please add at least one line item');
      return;
    }

    try {
      setSaving(true);
      const totals = calculateTotals();
      
      // 1. Create change order
      const changeOrderData = {
        company_id: companyId,
        work_order_id: workOrder.id,
        change_order_number: generateChangeOrderNumber(),
        title: formData.title,
        description: formData.description,
        reason: formData.reason,
        status: 'pending_approval',
        subtotal: totals.subtotal,
        tax_rate: totals.taxRate,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount,
        created_at: new Date().toISOString()
      };

      const coResponse = await supaFetch('change_orders', {
        method: 'POST',
        body: changeOrderData,
        headers: { Prefer: 'return=representation' }
      }, companyId);

      if (!coResponse.ok) {
        throw new Error('Failed to create change order');
      }
      
      const [changeOrder] = await coResponse.json();

      // 2. Create change order items
      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];
        await supaFetch('change_order_items', {
          method: 'POST',
          body: {
            company_id: companyId,
            change_order_id: changeOrder.id,
            item_type: item.item_type,
            description: item.description,
            category: item.category,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price),
            total: parseFloat(item.total),
            sort_order: i
          }
        }, companyId);
      }

      window?.toast?.success?.('Change order created successfully!');
      onSaved && onSaved(changeOrder);
    } catch (error) {
      console.error('Error creating change order:', error);
      window?.toast?.error?.('Failed to create change order');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">Create Change Order</h2>
        <p className="text-sm text-gray-500 mt-1">
          For work order: {workOrder.quote_number || workOrder.work_order_number}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Additional HVAC Unit Installation"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Describe the changes being made..."
        />
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="customer_request">Customer Request</option>
          <option value="scope_change">Scope Change</option>
          <option value="unforeseen_work">Unforeseen Work</option>
          <option value="code_requirement">Code Requirement</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Line Items <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {formData.items.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">No items added yet</p>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select
                      value={item.item_type}
                      onChange={(e) => updateItem(index, 'item_type', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="addition">Addition (+)</option>
                      <option value="deletion">Deletion (-)</option>
                      <option value="modification">Modification (±)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="labor">Labor</option>
                      <option value="material">Material</option>
                      <option value="equipment">Equipment</option>
                      <option value="service">Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    placeholder="Describe this item..."
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
                    <input
                      type="text"
                      value={`$${parseFloat(item.total || 0).toFixed(2)}`}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      {formData.items.length > 0 && (
        <div className="border-t pt-4 bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({totals.taxRate}%):</span>
              <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-600">${totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={saving || formData.items.length === 0}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {saving ? 'Creating...' : 'Create Change Order'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

