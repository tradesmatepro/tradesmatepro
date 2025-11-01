import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const CustomerStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [addAnother, setAddAnother] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    if (!formData.name.trim()) newErrors.push('Customer name is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (formData.email && !formData.email.includes('@')) newErrors.push('Email must be valid');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      onValidationChange?.({ valid: false, errors, warnings: [] });
      return;
    }

    try {
      setLoading(true);

      if (!user?.company_id) {
        setErrors(['No company ID found']);
        return;
      }

      // Create customer
      const { data, error } = await supabase
        .from('customers')
        .insert({
          company_id: user.company_id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        setErrors(['Failed to create customer']);
        return;
      }

      // If adding another, reset form
      if (addAnother) {
        setFormData({ name: '', email: '', phone: '', address: '' });
        setErrors([]);
        return;
      }

      // Otherwise complete step
      onValidationChange?.({ valid: true, errors: [], warnings: [] });
      onComplete?.(data);

    } catch (error) {
      console.error('Error in customer step:', error);
      setErrors(['An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add Your First Customer</h2>
        <p className="text-gray-600 mt-2">
          Let's add your first customer so you can create a quote right away.
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Please fix these issues:</h3>
              <ul className="mt-2 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., John Smith"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Main St, City, State 12345"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Another Checkbox */}
        <label className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={addAnother}
            onChange={(e) => setAddAnother(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">Add another customer after this</span>
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 You can add more customers anytime in the Customers page.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Saving...' : addAnother ? 'Add Another' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default CustomerStep;

