import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const PaymentMethodsStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    accepted_methods: ['cash', 'check', 'credit_card'],
    deposit_required: false,
    deposit_type: 'percentage',
    deposit_amount: 50
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Load existing settings if any
  useEffect(() => {
    loadSettings();
  }, [user?.company_id]);

  const loadSettings = async () => {
    if (!user?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('company_id', user.company_id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          accepted_methods: data.accepted_payment_methods || prev.accepted_methods,
          deposit_required: data.deposit_enabled || false,
          deposit_type: data.deposit_type || 'percentage',
          deposit_amount: data.deposit_percent || data.deposit_fixed_amount || 50
        }));
      }
    } catch (error) {
      console.log('⚠️ No existing settings found, using defaults');
    }
  };

  const handleMethodToggle = (method) => {
    setFormData(prev => ({
      ...prev,
      accepted_methods: prev.accepted_methods.includes(method)
        ? prev.accepted_methods.filter(m => m !== method)
        : [...prev.accepted_methods, method]
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    if (formData.accepted_methods.length === 0) {
      newErrors.push('Select at least one payment method');
    }
    if (formData.deposit_required && formData.deposit_amount <= 0) {
      newErrors.push('Deposit amount must be greater than 0');
    }
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

      // Update company settings
      const { error } = await supabase
        .from('company_settings')
        .update({
          accepted_payment_methods: formData.accepted_methods,
          deposit_required: formData.deposit_required,
          deposit_type: formData.deposit_type,
          deposit_amount: formData.deposit_amount,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', user.company_id);

      if (error) {
        console.error('Error saving payment settings:', error);
        setErrors(['Failed to save payment settings']);
        return;
      }

      onValidationChange?.({ valid: true, errors: [], warnings: [] });
      onComplete?.(formData);

    } catch (error) {
      console.error('Error in payment methods step:', error);
      setErrors(['An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        <p className="text-gray-600 mt-2">
          Tell us which payment methods you accept and if you require deposits.
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

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Which payment methods do you accept?</h3>
        <div className="space-y-3">
          {[
            { id: 'cash', label: 'Cash' },
            { id: 'check', label: 'Check' },
            { id: 'credit_card', label: 'Credit Card (via Stripe)' },
            { id: 'bank_transfer', label: 'Bank Transfer' },
            { id: 'paypal', label: 'PayPal' }
          ].map(method => (
            <label key={method.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={formData.accepted_methods.includes(method.id)}
                onChange={() => handleMethodToggle(method.id)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-gray-900">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Deposit Settings */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Deposit Requirements</h3>
        
        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={formData.deposit_required}
            onChange={(e) => handleChange('deposit_required', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-900">Require deposit before scheduling</span>
        </label>

        {formData.deposit_required && (
          <div className="space-y-4 pl-7 border-l-2 border-blue-200">
            {/* Deposit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Deposit Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deposit_type"
                    value="percentage"
                    checked={formData.deposit_type === 'percentage'}
                    onChange={(e) => handleChange('deposit_type', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Percentage of total</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deposit_type"
                    value="fixed"
                    checked={formData.deposit_type === 'fixed'}
                    onChange={(e) => handleChange('deposit_type', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Fixed amount</span>
                </label>
              </div>
            </div>

            {/* Deposit Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Deposit Amount
              </label>
              <div className="flex items-center gap-2">
                {formData.deposit_type === 'percentage' ? (
                  <>
                    <input
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => handleChange('deposit_amount', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-600">%</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">$</span>
                    <input
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => handleChange('deposit_amount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 You can change these anytime in Settings &gt; Payments.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodsStep;

