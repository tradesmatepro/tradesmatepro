import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { XMarkIcon, PlusIcon, TrashIcon, PaperClipIcon, PhotoIcon } from '@heroicons/react/24/outline';
import DocumentsService from '../services/DocumentsService';
import { useUser } from '../contexts/UserContext';
// Avoid relying on persisted line_total; recompute UI totals from normalized fields
const computeTotalsUI = (items = [], invoiceTaxRate = 0, invoiceDiscountAmount = 0) => {
  const lineItemsTotal = items.reduce((sum, item) => {
    const qty = Number(item?.qty ?? item?.quantity ?? 1);
    const unitPrice = Number(item?.unit_price ?? 0);
    const taxRate = Number(item?.tax_rate ?? 0);
    const rawDiscount = Number(item?.discount_value ?? item?.discount ?? 0);
    const rawType = item?.discount_type;

    const discount_type = rawType === 'PERCENT' ? 'PERCENT' : rawDiscount > 0 ? 'FLAT' : 'NONE';

    const preDiscount = (Number.isFinite(qty) ? qty : 1) * (Number.isFinite(unitPrice) ? unitPrice : 0);
    const discountAmount =
      discount_type === 'PERCENT' ? preDiscount * (rawDiscount / 100)
      : discount_type === 'FLAT' ? rawDiscount
      : 0;

    const taxableBase = Math.max(preDiscount - discountAmount, 0);
    const tax_amount = Math.round(taxableBase * (taxRate / 100) * 100) / 100;
    const line_total = Math.round((taxableBase + tax_amount) * 100) / 100;
    return sum + line_total;
  }, 0);

  const subtotal = Math.max(0, lineItemsTotal - Number(invoiceDiscountAmount || 0));
  const invoice_tax_amount = +(subtotal * (Number(invoiceTaxRate || 0)/100)).toFixed(2);
  const total = +(subtotal + invoice_tax_amount).toFixed(2);
  return { subtotal: +lineItemsTotal.toFixed(2), discount_amount: Number(invoiceDiscountAmount || 0), tax_amount: invoice_tax_amount, total_amount: total };
};


const InvoiceFormModal = ({ isOpen, onClose, onSubmit, invoice = null, companyId, onStatusChange }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    customer_id: '',
    work_order_id: '',
    notes: '',
    tax_rate: 0, // default to 0; will hydrate from invoice or settings
    discount_amount: 0,
    currency: 'USD',
    status: 'UNPAID'
  });
  const [items, setItems] = useState([{ item_name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }]);
  const [customers, setCustomers] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // File attachments state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (isOpen && companyId) {
      loadCustomers();
      loadWorkOrders();
      if (invoice) {
        // ✅ Handle both invoice data (editing) and work_order data (creating)
        const isExistingInvoice = invoice.invoice_number || invoice.invoice_id;

        setFormData({
          customer_id: invoice.customer_id || '',
          work_order_id: invoice.work_order_id || invoice.id || invoice.job_id || '',
          notes: invoice.notes || invoice.description || '',
          tax_rate: typeof invoice.tax_rate === 'number' ? invoice.tax_rate : 0,
          discount_amount: typeof invoice.discount_amount === 'number' ? invoice.discount_amount : 0,
          currency: invoice.currency || 'USD',
          status: invoice.status || invoice.invoice_status || 'UNPAID'
        });

        // Normalize items shape from invoice_items or work_order_line_items
        let itemsToUse = invoice.items || invoice.invoice_items || [];

        // If this is a work_order being converted to invoice, use work_order line items
        if (!isExistingInvoice && invoice.work_order_line_items) {
          itemsToUse = invoice.work_order_line_items;
        }

        const normalizedItems = itemsToUse.map(it => {
          const quantity = Number(it.quantity ?? it.qty ?? 1);
          const unitPrice = Number(it.unit_price ?? it.rate ?? 0);
          const discountVal = Number(it.discount_value ?? it.discount ?? 0);
          const taxRate = Number(it.tax_rate ?? 0);
          const lineTotal = it.line_total != null ? Number(it.line_total) : undefined;
          // If persisted line_total is 0 but we have qty and price, drop line_total to force recompute
          const effectiveLineTotal = (Number.isFinite(lineTotal) && lineTotal > 0) ? lineTotal : undefined;
          return {
            item_name: it.item_name || '',
            description: it.description || '',
            quantity: Number.isFinite(quantity) ? quantity : 1,
            unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
            discount: Number.isFinite(discountVal) ? discountVal : 0,
            tax_rate: Number.isFinite(taxRate) ? taxRate : 0,
            line_total: effectiveLineTotal,
            discount_type: it.discount_type || (discountVal > 0 ? 'FLAT' : 'NONE')
          };
        });
        setItems(normalizedItems.length > 0 ? normalizedItems : [{ item_name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }]);
      }
    }
  }, [isOpen, invoice, companyId]);

  const loadCustomers = async () => {
    try {
      const response = await supaFetch('customers?select=id,name&order=name.asc', { method: 'GET' }, companyId);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadWorkOrders = async () => {
    try {
      const response = await supaFetch('work_orders?select=id,title,customer_id&order=created_at.desc', { method: 'GET' }, companyId);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data);
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
    }
  };

  // Load existing attachments when editing an invoice
  useEffect(() => {
    const loadAttachments = async () => {
      if (isOpen && invoice?.work_order_id && companyId) {
        try {
          const response = await supaFetch(
            `attachments?work_order_id=eq.${invoice.work_order_id}&select=*`,
            { method: 'GET' },
            companyId
          );

          if (response && Array.isArray(response)) {
            setAttachedFiles(response);
          }
        } catch (error) {
          console.error('Error loading attachments:', error);
        }
      }
    };

    loadAttachments();
  }, [isOpen, invoice?.work_order_id, companyId]);

  // File upload handlers
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const workOrderId = formData.work_order_id || invoice?.work_order_id;

      for (const file of files) {
        // Upload file using DocumentsService
        const result = await DocumentsService.uploadAttachment(
          companyId,
          workOrderId, // Can be null for new invoices
          file,
          user?.id,
          ['invoice', 'receipt'], // Auto-tag as invoice/receipt attachment
          '' // No OCR text
        );

        if (result.success) {
          setAttachedFiles(prev => [...prev, {
            id: result.attachment?.id,
            file_name: file.name,
            file_url: result.attachment?.file_url,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          }]);
        }
      }

      // Reset file input
      e.target.value = '';

      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files: ' + error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = async (fileId) => {
    try {
      // Delete from database
      await supaFetch(`attachments?id=eq.${fileId}`, {
        method: 'DELETE'
      }, companyId);

      // Remove from state
      setAttachedFiles(prev => prev.filter(f => f.id !== fileId));

      alert('File removed successfully!');
    } catch (error) {
      console.error('Error removing file:', error);
      alert('Failed to remove file: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }

    // Validate that each item has either item_name or description
    const invalidItems = items.filter(item =>
      (!item.item_name || item.item_name.trim() === '') &&
      (!item.description || item.description.trim() === '')
    );

    if (invalidItems.length > 0) {
      alert('Please provide either an item name or description for all line items');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, items);
      handleClose();
    } catch (error) {
      console.error('Error submitting invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ customer_id: '', work_order_id: '', notes: '', tax_rate: 0, discount_amount: 0, currency: 'USD', status: 'DRAFT' });
    setItems([{ item_name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }]);
    onClose();
  };

  const addItem = () => {
    setItems([...items, { item_name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // Defensive: compute with normalized numbers only
  const totals = computeTotalsUI(
    Array.isArray(items) ? items : [],
    Number.isFinite(Number(formData.tax_rate)) ? Number(formData.tax_rate) : 0,
    Number.isFinite(Number(formData.discount_amount)) ? Number(formData.discount_amount) : 0
  );

  // Debug: log items and totals whenever inputs that affect totals change
  useEffect(() => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    // Keep the log compact but informative
    console.log(`🧮 [${ts}] InvoiceFormModal totals`, {
      tax_rate: formData.tax_rate,
      discount_amount: formData.discount_amount,
      items: items.map(({ description, quantity, unit_price, discount, tax_rate, line_total }) => ({ description, quantity, unit_price, discount, tax_rate, line_total })),
      totals
    });
  }, [items, formData.tax_rate, formData.discount_amount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{invoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Order (Optional)</label>
              <select
                value={formData.work_order_id}
                onChange={(e) => setFormData({ ...formData, work_order_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Work Order</option>
                {workOrders.map(wo => (
                  <option key={wo.id} value={wo.id}>{wo.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => {
                const next = e.target.value;
                setFormData({ ...formData, status: next });
                if (typeof onStatusChange === 'function' && invoice?.id) {
                  onStatusChange(next);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="VOID">Void</option>
            </select>
          </div>

          {/* File Attachments - Photos, Receipts, etc. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <PaperClipIcon className="w-5 h-5" />
              Attachments
              <span className="text-xs text-gray-500 font-normal">(Before/after photos, receipts, proof of work)</span>
            </label>

            {/* Upload Button */}
            <div className="mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                <PhotoIcon className="w-5 h-5" />
                <span>{uploadingFiles ? 'Uploading...' : 'Upload Files'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploadingFiles}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Attach before/after photos, receipts for materials, or proof of work completed
              </p>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          // Generate signed URL for private file
                          const signedUrl = await DocumentsService.getSignedUrl(file.file_url, 3600);
                          if (signedUrl) {
                            window.open(signedUrl, '_blank');
                          } else {
                            window?.toast?.error?.('Unable to open file');
                          }
                        } catch (error) {
                          console.error('Error opening file:', error);
                          window?.toast?.error?.('Failed to open file: ' + error.message);
                        }
                      }}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <PaperClipIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-blue-600 hover:text-blue-800 underline truncate">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.file_size / 1024).toFixed(1)} KB • Click to view
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove file"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Line Items</h3>
              <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Service name"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-right space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${Number.isFinite(Number(totals.subtotal)) ? Number(totals.subtotal).toFixed(2) : '0.00'}</span>
              </div>
              {(totals.discount_amount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${(totals.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({Number(formData.tax_rate)}%):</span>
                <span>${Number.isFinite(Number(totals.tax_amount)) ? Number(totals.tax_amount).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${Number.isFinite(Number(totals.total_amount)) ? Number(totals.total_amount).toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
