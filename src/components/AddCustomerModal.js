import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';

export default function AddCustomerModal({ open, onClose, onCreated }) {
  const { user } = useUser();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        billing_address_line_1: form.address || null,
        billing_city: form.city || null,
        billing_state: form.state || null,
        billing_zip_code: form.zip_code || null,
        company_id: user?.company_id,
        status: 'active'
      };

      const res = await supaFetch('customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, user?.company_id);

      if (res.ok) {
        const data = await res.json().catch(() => []);
        const created = Array.isArray(data) ? data[0] : data;
        if (created && onCreated) onCreated(created);
        onClose();
      } else {
        const text = await res.text().catch(() => '');
        console.error('Create customer failed:', text);
        alert('Failed to create customer');
      }
    } catch (err) {
      console.error('Create customer error', err);
      alert('Error creating customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Customer</h3>
          <button className="text-gray-500" onClick={onClose} disabled={submitting}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name *</label>
            <input
              className="w-full border rounded px-3 py-2"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Address</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">City</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">State</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">ZIP Code</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.zip_code}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

