import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import ModernPageHeader from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import { PurchaseOrdersService } from '../services/PurchaseOrdersService';
import { VendorsService, getVendorStatusBadge, getPaymentTermsLabel } from '../services/VendorsService';
import PoPDFService from '../services/PoPDFService';
import ReceivingInterface from '../components/ReceivingInterface';
import InventoryItemsModal from '../components/InventoryItemsModal';
import POApprovalWidget from '../components/POApprovalWidget';
import { supaFetch } from '../utils/supaFetch';
import {
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';


const emptyForm = {
  vendor_id: null, vendor_name: '', vendor_contact: '', vendor_email: '', vendor_phone: '',
  ship_to_name: '', ship_to_address_line_1: '', ship_to_address_line_2: '', ship_to_city: '', ship_to_state: '', ship_to_zip_code: '',
  expected_date: '', currency: 'USD', tax_rate: 0, shipping_amount: 0, budget_amount: null, notes: '', terms: '', related_work_order_id: null,
  items: []
};

// Lightweight searchable vendor selector (client-side filter)
const VendorSearchSelect = ({ vendors = [], value, onChange }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) return vendors;
    const q = query.toLowerCase();
    return vendors.filter(v => (v.name||'').toLowerCase().includes(q) || (v.email||'').toLowerCase().includes(q));
  }, [vendors, query]);
  return (
    <div className="space-y-2">
      <input className="input w-full" placeholder="Search vendors..." value={query} onChange={(e)=>setQuery(e.target.value)} />
      <select className="input w-full" value={value} onChange={(e)=>onChange(e.target.value || null)}>
        <option value="">Select Vendor...</option>
        {filtered.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
    </div>
  );
};

const ItemRow = ({ idx, item, updateItem, removeItem, onSkuLookup }) => (
  <div className="grid grid-cols-12 gap-2 items-center">
    <div className="col-span-2 flex gap-1">
      <input className="input flex-1" placeholder="SKU" value={item.item_sku||''}
             onChange={e=>updateItem(idx,{ item_sku:e.target.value })}
             onBlur={() => onSkuLookup?.(idx, item.item_sku)} />
      <button type="button" className="btn-secondary btn-xs" title="Lookup" onClick={()=>onSkuLookup?.(idx, item.item_sku)}>🔎</button>
    </div>
    <input className="col-span-3 input" placeholder="Item name" value={item.item_name||''} onChange={e=>updateItem(idx,{ item_name:e.target.value })} />
    <input className="col-span-3 input" placeholder="Description" value={item.description||''} onChange={e=>updateItem(idx,{ description:e.target.value })} />
    <input className="col-span-1 input" type="number" min="0" step="1" placeholder="Qty" value={(item.quantity ?? '')}
           onChange={e=>{
             const raw = e.target.value;
             // Keep empty string while typing to avoid leading zeros UX issues
             if (raw === '') return updateItem(idx, { quantity: '' });
             // integers only
             const n = Math.max(0, parseInt(raw, 10) || 0);
             updateItem(idx, { quantity: n });
           }} />
    <input className="col-span-1 input" type="number" min="0" step="0.01" placeholder="Unit Cost" value={(item.unit_cost ?? '')}
           onChange={e=>{
             const raw = e.target.value;
             updateItem(idx,{ unit_cost: raw === '' ? '' : Number(raw) });
           }} />
    <button onClick={()=>removeItem(idx)} className="col-span-1 btn-secondary">Remove</button>
  </div>
);

const PoFormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, vendors = [] }) => {
  const [showInvModal, setShowInvModal] = useState(false);

  const items = formData.items || [];
  const updateItem = (i, patch) => {
    const next = items.map((it, idx)=> idx===i? { ...it, ...patch }: it);
    setFormData({ ...formData, items: next });
  };
  const addItem = () => setFormData({ ...formData, items: [...items, { quantity:'', unit_cost:'' }] });
  const removeItem = (i) => setFormData({ ...formData, items: items.filter((_,idx)=> idx!==i) });

  const handleAddFromInventory = (invItem) => {
    const next = [...(formData.items||[]), {
      item_sku: invItem.sku || '',
      item_name: invItem.name || '',
      description: invItem.description || '',
      quantity: 1,
      unit_cost: invItem.cost ?? '',
      inventory_item_id: invItem.id,
    }];
    setFormData({ ...formData, items: next });
    setShowInvModal(false);
  };

  const onSkuLookup = async (i, sku) => {
    if (!sku) return;
    try {
      // Lookup inventory by internal SKU OR vendor supplier part number
      const [invRes, vendorMapRes] = await Promise.all([
        supaFetch(`inventory_items?sku=eq.${encodeURIComponent(sku)}`, { method: 'GET' }, null),
        supaFetch(`vendor_items?or=(supplier_part_number.eq.${encodeURIComponent(sku)},sku.eq.${encodeURIComponent(sku)})`, { method: 'GET' }, null)
      ]);
      let invItem = null;
      if (invRes.ok) {
        const data = await invRes.json();
        invItem = data?.[0] || null;
      }
      let supplierPart = null;
      if (vendorMapRes.ok) {
        const data = await vendorMapRes.json();
        const row = data?.[0];
        if (row) {
          // If vendor mapping leads to an inventory item, prefer that
          if (!invItem && row.inventory_item_id) {
            const byId = await supaFetch(`inventory_items?id=eq.${row.inventory_item_id}`, { method: 'GET' }, null);
            if (byId.ok) {
              const arr = await byId.json();
              invItem = arr?.[0] || null;
            }
          }
          supplierPart = row.supplier_part_number || row.sku || null;
        }
      }
      if (invItem) {
        const patch = {
          item_name: invItem.name,
          description: invItem.description || '',


          unit_cost: invItem.cost ?? '',
          inventory_item_id: invItem.id,
        };
        if (supplierPart && supplierPart !== invItem.sku) {
          patch.item_sku = invItem.sku || sku; // internal
          patch.supplier_part_number = supplierPart; // vendor code
        } else {
          patch.item_sku = invItem.sku || sku;
        }
        updateItem(i, patch);
      }
    } catch (e) {
      console.warn('SKU lookup failed', e);
    }
  };

  const totals = PurchaseOrdersService.computeTotals(
    items.map(it => ({
      ...it,
      quantity: Number(it.quantity || 0),
      unit_cost: Number(it.unit_cost || 0)
    })),
    formData.tax_rate,
    formData.shipping_amount
  );

  // Handle vendor selection
  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setFormData({
        ...formData,
        vendor_id: vendorId,
        vendor_name: vendor.name,
        vendor_contact: vendor.primary_contact_name || vendor.name,
        vendor_email: vendor.primary_contact_email || vendor.email,
        vendor_phone: vendor.primary_contact_phone || vendor.phone,
        payment_terms: vendor.payment_terms
      });
    } else {
      setFormData({
        ...formData,
        vendor_id: null,
        vendor_name: '',
        vendor_contact: '',
        vendor_email: '',
        vendor_phone: ''
      });
    }
  };

  // Smart Budget Analysis
  const budgetAnalysis = useMemo(() => {
    const total = totals.total_amount || 0;
    const budget = formData.budget_amount || 0;
    if (!budget) return { status: 'none', message: '', color: 'gray' };

    const remaining = budget - total;
    const percentUsed = (total / budget) * 100;

    if (percentUsed <= 75) return { status: 'good', message: `$${remaining.toFixed(2)} remaining`, color: 'green' };
    if (percentUsed <= 90) return { status: 'warning', message: `$${remaining.toFixed(2)} remaining`, color: 'yellow' };
    return { status: 'over', message: `$${Math.abs(remaining).toFixed(2)} over budget`, color: 'red' };
  }, [totals.total_amount, formData.budget_amount]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">Create Purchase Order</h3>
              <p className="text-sm text-gray-600">Add vendor, ship-to, and line items</p>
            </div>
            {budgetAnalysis.status !== 'none' && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                budgetAnalysis.color === 'green' ? 'bg-green-100 text-green-800' :
                budgetAnalysis.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {budgetAnalysis.color === 'green' ? <CheckCircleIcon className="w-4 h-4" /> :
                 budgetAnalysis.color === 'yellow' ? <ExclamationTriangleIcon className="w-4 h-4" /> :
                 <ExclamationTriangleIcon className="w-4 h-4" />}
                {budgetAnalysis.message}
              </div>
            )}
          </div>
          <button onClick={onClose} className="btn-secondary"><XMarkIcon className="w-4 h-4"/> Close</button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
          {/* Vendor & Ship-to cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-3">Vendor</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  {/* Vendor search + select */}
                  <VendorSearchSelect vendors={vendors} value={formData.vendor_id || ''} onChange={(id)=>handleVendorChange(id||null)} />
                </div>
                <input className="input" placeholder="Contact" value={formData.vendor_contact} onChange={e=>setFormData({ ...formData, vendor_contact:e.target.value })} />
                <input className="input" placeholder="Email" value={formData.vendor_email} onChange={e=>setFormData({ ...formData, vendor_email:e.target.value })} />
                <input className="input" placeholder="Phone" value={formData.vendor_phone} onChange={e=>setFormData({ ...formData, vendor_phone:e.target.value })} />
                <input className="input" placeholder="Budget Amount" type="number" min="0" step="0.01"
                       value={formData.budget_amount || ''}
                       onChange={e=>setFormData({...formData, budget_amount: e.target.value ? Number(e.target.value) : null})} />
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-3 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
                Ship To
                <select className="input text-sm ml-auto" onChange={e => {
                  const locationType = e.target.value;
                  if (locationType === 'warehouse') {
                    setFormData({...formData,
                      location_type: 'warehouse',
                      ship_to_name: 'Main Warehouse',
                      ship_to_address_line_1: '123 Warehouse St',
                      ship_to_city: 'City',
                      ship_to_state: 'ST',
                      ship_to_zip_code: '12345'
                    });
                  } else if (locationType === 'office') {
                    setFormData({...formData,
                      location_type: 'office',
                      ship_to_name: 'Company Office',
                      ship_to_address_line_1: '456 Office Ave',
                      ship_to_city: 'City',
                      ship_to_state: 'ST',
                      ship_to_zip_code: '12345'
                    });
                  } else if (locationType === 'jobsite') {
                    setFormData({...formData, location_type: 'jobsite'});
                  } else {
                    setFormData({...formData, location_type: 'custom'});
                  }
                }}>
                  <option value="">Quick select...</option>
                  <option value="warehouse">Main Warehouse</option>
                  <option value="office">Company Office</option>
                  <option value="jobsite">Job Site</option>
                  <option value="custom">Custom Address</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input col-span-2" placeholder="Recipient/Department" value={formData.ship_to_name||''} onChange={e=>setFormData({ ...formData, ship_to_name:e.target.value })} />
                <input className="input col-span-2" placeholder="Address line 1" value={formData.ship_to_address_line_1||''} onChange={e=>setFormData({ ...formData, ship_to_address_line_1:e.target.value })} />
                <input className="input col-span-2" placeholder="Address line 2" value={formData.ship_to_address_line_2||''} onChange={e=>setFormData({ ...formData, ship_to_address_line_2:e.target.value })} />
                <input className="input" placeholder="City" value={formData.ship_to_city} onChange={e=>setFormData({ ...formData, ship_to_city:e.target.value })} />

                <input className="input" placeholder="State" value={formData.ship_to_state} onChange={e=>setFormData({ ...formData, ship_to_state:e.target.value })} />
                <input className="input" placeholder="ZIP" value={formData.ship_to_zip_code} onChange={e=>setFormData({ ...formData, ship_to_zip_code:e.target.value })} />
                <input className="input" type="date" placeholder="Expected Date" value={formData.expected_date} onChange={e=>setFormData({ ...formData, expected_date:e.target.value })} />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Items</div>
              <button onClick={addItem} className="btn-secondary"><PlusIcon className="w-4 h-4"/> Add Item</button>
              {/* Add from Inventory */}
              <div className="mt-3">
                <button type="button" className="btn-secondary btn-sm" onClick={()=>setShowInvModal(true)}>Add from Inventory</button>
              </div>
            </div>
            <div className="space-y-3">
              {items.map((it, idx)=> (
                <ItemRow key={idx} idx={idx} item={it} updateItem={updateItem} removeItem={removeItem} onSkuLookup={onSkuLookup} />
              ))}
              {items.length===0 && (
                <div className="text-sm text-gray-500">No items yet. Click "Add Item" to begin.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">Notes & Terms</div>
              <textarea className="textarea mb-2" rows={3} placeholder="Notes" value={formData.notes} onChange={e=>setFormData({ ...formData, notes:e.target.value })} />
              <textarea className="textarea mb-2" rows={2} placeholder="Terms" value={formData.terms} onChange={e=>setFormData({ ...formData, terms:e.target.value })} />

              {/* Budget/Amount Field */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Budget Amount (Optional)
                </label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.budget_amount || ''}
                  onChange={e=>setFormData({ ...formData, budget_amount: Number(e.target.value) || null })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set a budget limit for this purchase order
                </p>
                {formData.budget_amount && totals.total_amount > formData.budget_amount && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    Total exceeds budget by ${(totals.total_amount - formData.budget_amount).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">Totals</div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <label className="text-gray-600">Currency</label>
                <input className="input" value={formData.currency || 'USD'} onChange={e=>setFormData({ ...formData, currency:e.target.value })} />
                <label className="text-gray-600">Tax Rate %</label>
                <input className="input" type="number" step="0.01" value={formData.tax_rate || 0} onChange={e=>setFormData({ ...formData, tax_rate: Number(e.target.value) })} />
                <label className="text-gray-600">Shipping</label>
                <input className="input" type="number" step="0.01" value={formData.shipping_amount || 0} onChange={e=>setFormData({ ...formData, shipping_amount: Number(e.target.value) })} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${totals.tax_amount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>${(formData.shipping_amount || 0).toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Total</span><span>${totals.total_amount.toFixed(2)}</span></div>
                {formData.budget_amount && (
                  <div className={`flex justify-between text-xs mt-1 ${totals.total_amount > formData.budget_amount ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Budget</span><span>${formData.budget_amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
        {/* Inventory Picker Modal */}
        <InventoryItemsModal
          open={showInvModal}
          onClose={() => setShowInvModal(false)}
          onAdd={handleAddFromInventory}
        />
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={()=>onSubmit('draft')} className="btn-secondary"><DocumentTextIcon className="w-4 h-4"/> Save Draft</button>
          <button onClick={()=>onSubmit('send')} className="btn-primary"><CheckCircleIcon className="w-4 h-4"/> Create & Print</button>
        </div>
      </div>
    </div>
  );
};

const PurchaseOrders = () => {
  const { user } = useUser();
  const [rows, setRows] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showReceiving, setShowReceiving] = useState(false);
  const [receivingPoId, setReceivingPoId] = useState(null);
  const [showVendorDrawer, setShowVendorDrawer] = useState(false);

  const [vendorStats, setVendorStats] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(false);

  const openVendorQuickView = useCallback(async (vendorId) => {
    if (!vendorId) return;
    setVendorLoading(true);
    setShowVendorDrawer(true);

    try {
      const stats = await VendorsService.getVendorStats(user.company_id, vendorId);
      const start = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const analytics = await PurchaseOrdersService.getSpendAnalytics(user.company_id, { start });
      const ytdSpend = (analytics?.byVendor && analytics.byVendor[vendorId]) ? Number(analytics.byVendor[vendorId] || 0) : 0;
      setVendorStats({ ...(stats || {}), ytdSpend });
    } catch (e) {
      console.error('Failed to load vendor quick view', e);
      setVendorStats(null);
      window?.toast?.error?.('Failed to load vendor details');
    } finally {
      setVendorLoading(false);
    }
  }, [user?.company_id]);

  const closeVendorQuickView = useCallback(() => {
    setShowVendorDrawer(false);

    setVendorStats(null);
  }, []);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [posData, vendorsData] = await Promise.all([
        PurchaseOrdersService.list(user.company_id),
        VendorsService.list(user.company_id, 'status=eq.ACTIVE')
      ]);
      setRows(Array.isArray(posData) ? posData : []);
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
    } finally { setLoading(false); }
  }, [user?.company_id]);

  useEffect(()=>{ load(); }, [load]);

  const filtered = useMemo(()=>{
    return rows.filter(r => (statusFilter==='all' || r.status===statusFilter) &&
      (!search || (r.po_number||'').toLowerCase().includes(search.toLowerCase()) || (r.vendor_name||'').toLowerCase().includes(search.toLowerCase()))
    );
  }, [rows, statusFilter, search]);

  const columns = [
    { header:'PO Number', accessor:'po_number', width:'16%' },
    { header:'Status', accessor:'status', width:'12%', cell:(r)=> (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{r.status}</span>
    )},
    { header:'Vendor', accessor:'vendor_name', width:'26%', cell:(r)=> {
      const initials = ((r.vendor_name||'').trim().split(/\s+/).map(s=>s[0]).slice(0,2).join('')||'V').toUpperCase();
      const tooltip = [r.vendor_contact, r.vendor_email, r.vendor_phone].filter(Boolean).join(' • ');
      return (
        <div className="flex items-center gap-2" title={tooltip}>
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <div className="truncate max-w-[220px]">{r.vendor_name || '—'}</div>
          {r.vendor_id && (
            <button
              onClick={(e)=>{ e.stopPropagation(); openVendorQuickView(r.vendor_id); }}
              className="ml-1 text-indigo-600 hover:text-indigo-800"
              title="Quick view"
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }},
    { header:'Expected', accessor:'expected_date', width:'12%', cell:(r)=> r.expected_date? new Date(r.expected_date).toLocaleDateString():'' },
    { header:'Total', accessor:'total_amount', width:'16%', cell:(r)=> {
      const total = Number(r.total_amount||0);
      const budget = Number(r.budget_amount||0);
      const over = budget>0 && total>budget;
      const pct = budget>0 ? Math.min(999, Math.round((total/budget)*100)) : null;
      return (
        <div>
          <div className="flex items-center gap-2">
            <span>${total.toFixed(2)}</span>
            {budget>0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${over?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>
                {pct}% {over?'over':'of'} budget
              </span>
            )}
          </div>
          {budget>0 && (
            <div className="mt-1 w-28">
              <div className="h-1.5 bg-gray-200 rounded">
                <div className={`${over? 'bg-red-500':'bg-green-500'} h-1.5`} style={{ width: `${Math.min(100, Math.round((total/budget)*100))}%` }} />
              </div>
            </div>
          )}
        </div>
      );
    }},
    { header:'Created', accessor:'created_at', width:'18%', cell:(r)=> new Date(r.created_at).toLocaleString() },
    { header:'Actions', accessor:'actions', width:'8%', cell:(r)=> (
      ['APPROVED','PARTIAL','SENT','DRAFT'].includes(r.status)
        ? <button onClick={(e)=>{ e.stopPropagation(); handleReceive(r.id); }} className="btn-secondary btn-xs">Receive</button>
        : null
    ) }
  ];

  const openCreate = () => { setFormData(emptyForm); setShowForm(true); };

  const handleReceive = (poId) => {
    setReceivingPoId(poId);
    setShowReceiving(true);
  };

  const handleReceivingComplete = async (newStatus) => {
    setShowReceiving(false);
    setReceivingPoId(null);
    await load();
    window?.toast?.success?.(`Items received successfully. Status: ${newStatus}`);
  };
  const handleSubmit = async (action) => {
    try {
      const { subtotal, tax_amount, total_amount } = PurchaseOrdersService.computeTotals(formData.items, formData.tax_rate, formData.shipping_amount);

      // Check if approval is required
      const approvalRule = await PurchaseOrdersService.checkApprovalRequired(user.company_id, total_amount, formData.vendor_id);

      let created;
      if (formData.vendor_id) {
        created = await PurchaseOrdersService.createFromVendor(user.company_id, formData.vendor_id, { ...formData, subtotal, tax_amount, total_amount }, formData.items);
      } else {
        created = await PurchaseOrdersService.create(user.company_id, { ...formData, subtotal, tax_amount, total_amount }, formData.items);
      }

      // Submit for approval if required
      if (approvalRule && action === 'send') {
        await PurchaseOrdersService.submitForApproval(user.company_id, created.id, approvalRule.id, user.id);
        window?.toast?.success?.('PO created and submitted for approval');
      } else {
        window?.toast?.success?.('PO created successfully');
      }

      setShowForm(false);
      await load();

      if (action === 'send' && !approvalRule) {
        try {
          await PoPDFService.openPrintable(user.company_id, created.id);
          await PurchaseOrdersService.sendToVendor(user.company_id, created.id);
        } catch {}
      }
    } catch (e) {
      window?.toast?.error?.(e.message || 'Failed to create PO');
    }
  };

  const openPOs = rows.filter(r=> ['DRAFT','SENT','APPROVED','PARTIAL'].includes(r.status)).length;
  const awaitingReceipt = rows.filter(r=> ['APPROVED','PARTIAL','SENT'].includes(r.status)).length;
  const thisMonthSpend = Number(rows.filter(r=> r.created_at && new Date(r.created_at).getMonth()===new Date().getMonth()).reduce((s,r)=> s + Number(r.total_amount||0), 0));
  const vendorCount = new Set(rows.filter(r=> r.vendor_name).map(r=> r.vendor_name)).size;

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Purchase Orders"
        subtitle="Create, track, and manage purchase orders with vendors"
        icon={DocumentTextIcon}
        gradient="orange"
        stats={[
          { label: 'Open POs', value: openPOs },
          { label: 'Awaiting', value: awaitingReceipt },
          { label: 'This Month', value: `$${(thisMonthSpend/1000).toFixed(0)}K` }
        ]}
        actions={[
          {
            label: 'New PO',
            icon: PlusIcon,
            onClick: openCreate
          }
        ]}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Approval Widget - Priority Position */}
        <div className="lg:col-span-1 order-first">
          <POApprovalWidget />
        </div>

        {/* Purchase Order Analytics Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard className="card-gradient-orange text-white hover-lift">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Open Orders</p>
                  <p className="text-3xl font-bold text-white">{openPOs}</p>
                  <p className="text-orange-200 text-xs mt-1">Active POs</p>
              </div>
              <DocumentTextIcon className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-blue text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Awaiting Receipt</p>
                <p className="text-3xl font-bold text-white">{awaitingReceipt}</p>
                <p className="text-blue-200 text-xs mt-1">Pending delivery</p>
              </div>
              <ClockIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-green text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">This Month Spend</p>
                <p className="text-3xl font-bold text-white">${(thisMonthSpend/1000).toFixed(0)}K</p>
                <p className="text-green-200 text-xs mt-1">Current spending</p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-purple text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Vendors</p>
                <p className="text-3xl font-bold text-white">{vendorCount}</p>
                <p className="text-purple-200 text-xs mt-1">Supplier network</p>
              </div>
              <BuildingOfficeIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            className="input"
            value={statusFilter}
            onChange={(e)=>setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="SENT">Sent</option>
            <option value="APPROVED">Approved</option>
            <option value="PARTIAL">Partial</option>
            <option value="RECEIVED">Received</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input
            className="input w-64"
            placeholder="Search POs or vendors..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-500">{filtered.length} results</div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: col.width}}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Loading purchase orders...' : 'No purchase orders found'}
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => PoPDFService.openPrintable(user.company_id, row.id)}>
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 text-sm text-gray-900">
                        {col.cell ? col.cell(row) : row[col.accessor] || ''}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <PoFormModal
        isOpen={showForm}
        onClose={()=> setShowForm(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        vendors={vendors}
      />

      {/* Receiving Interface */}
      <ReceivingInterface
        poId={receivingPoId}
        isOpen={showReceiving}
        onClose={() => setShowReceiving(false)}
        onReceived={handleReceivingComplete}
      />

      {/* Vendor Quick-View Drawer */}
      {showVendorDrawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeVendorQuickView}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{vendorStats?.name || 'Vendor'}</div>
                {vendorStats && (() => { const b = getVendorStatusBadge(vendorStats); return (<span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${b.bg} ${b.text}`}>{b.label}</span>); })()}
              </div>
              <button className="btn-secondary btn-xs" onClick={closeVendorQuickView}><XMarkIcon className="w-4 h-4"/> Close</button>
            </div>
            <div className="p-4 space-y-4 overflow-auto">
              {vendorLoading ? (
                <div className="text-gray-500 text-sm">Loading…</div>
              ) : vendorStats ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-500">Spend YTD</div>
                      <div className="text-lg font-semibold">${Number(vendorStats.ytdSpend||0).toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-500">Avg Order</div>
                      <div className="text-lg font-semibold">${Number(vendorStats.avgOrderValue||0).toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-500">Active Orders</div>
                      <div className="text-lg font-semibold">{vendorStats.activeOrdersCount||0}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-gray-500">Completed</div>
                      <div className="text-lg font-semibold">{vendorStats.completedOrdersCount||0}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-gray-500">Primary Contact</div>
                    <div className="text-sm">{vendorStats.primary_contact_name || vendorStats.vendor_contact || '—'}</div>
                    <div className="text-xs text-gray-500">{[vendorStats.primary_contact_email || vendorStats.email, vendorStats.primary_contact_phone || vendorStats.phone].filter(Boolean).join('   ')}</div>
                    {vendorStats.payment_terms && <div className="mt-2 text-xs"><span className="text-gray-500 mr-1">Terms:</span>{getPaymentTermsLabel(vendorStats.payment_terms)}</div>}
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">No vendor data</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchaseOrders;

