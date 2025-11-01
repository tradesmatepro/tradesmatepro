import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ServiceStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_price: 75,
    service_type: 'labor'
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
    if (!formData.name.trim()) newErrors.push('Service name is required');
    if (formData.default_price <= 0) newErrors.push('Price must be greater than 0');
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

      // Create rate card (service)
      const { data, error } = await supabase
        .from('rate_cards')
        .insert({
          company_id: user.company_id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          base_price: parseFloat(formData.default_price),
          service_type: formData.service_type,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        setErrors(['Failed to create service']);
        return;
      }

      // If adding another, reset form
      if (addAnother) {
        setFormData({ name: '', description: '', default_price: 75, service_type: 'labor' });
        setErrors([]);
        return;
      }

      // Otherwise complete step
      onValidationChange?.({ valid: true, errors: [], warnings: [] });
      onComplete?.(data);

    } catch (error) {
      console.error('Error in service step:', error);
      setErrors(['An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add Your First Service</h2>
        <p className="text-gray-600 mt-2">
          Define a service you offer so you can add it to quotes.
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
        {/* Service Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Plumbing Repair"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Service Type
          </label>
          <select
            value={formData.service_type}
            onChange={(e) => handleChange('service_type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="labor">Labor (Hourly)</option>
            <option value="material">Material</option>
            <option value="equipment">Equipment</option>
            <option value="service">Service (Fixed)</option>
            <option value="fee">Fee</option>
          </select>
        </div>

        {/* Default Price */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Default Price *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">$</span>
            <input
              type="number"
              value={formData.default_price}
              onChange={(e) => handleChange('default_price', parseFloat(e.target.value) || 0)}
              placeholder="75.00"
              step="0.01"
              min="0"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-600">
              {formData.service_type === 'labor' ? 'per hour' : 'per unit'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Optional description of this service"
            rows="3"
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
          <span className="text-sm text-gray-700">Add another service after this</span>
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 You can add more services anytime in Settings &gt; Rates and Pricing.
        </p>
      </div>

      {/* Note: Buttons are handled by OnboardingWizard parent component */}
    </div>
  );
};

export default ServiceStep;

