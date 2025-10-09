import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const FinancialSetupStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [financialSettings, setFinancialSettings] = useState({
    // Tax Settings
    default_tax_rate: 8.25,
    tax_name: 'Sales Tax',
    tax_number: '',
    // Payment Settings
    payment_terms: 'net_30',
    late_fee_percentage: 1.5,
    late_fee_days: 30,
    // Invoice Settings
    invoice_prefix: 'INV',
    quote_prefix: 'QUO',
    next_invoice_number: 1001,
    next_quote_number: 1001,
    // Payment Methods
    accept_cash: true,
    accept_check: true,
    accept_credit_card: false,
    accept_ach: false,
    // Pricing
    default_markup_percentage: 20,
    labor_rate: 75.00
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const paymentTermsOptions = [
    { value: 'due_on_receipt', label: 'Due on Receipt' },
    { value: 'net_15', label: 'Net 15 Days' },
    { value: 'net_30', label: 'Net 30 Days' },
    { value: 'net_60', label: 'Net 60 Days' }
  ];

  // Load existing financial settings
  useEffect(() => {
    loadFinancialSettings();
  }, [user?.company_id]);

  const loadFinancialSettings = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', user.company_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFinancialSettings(prev => ({
          ...prev,
          default_tax_rate: data.default_tax_rate || prev.default_tax_rate,
          tax_name: data.tax_name || prev.tax_name,
          tax_number: data.tax_number || prev.tax_number,
          payment_terms: data.payment_terms || prev.payment_terms,
          late_fee_percentage: data.late_fee_percentage || prev.late_fee_percentage,
          late_fee_days: data.late_fee_days || prev.late_fee_days,
          invoice_prefix: data.invoice_prefix || prev.invoice_prefix,
          quote_prefix: data.quote_prefix || prev.quote_prefix,
          next_invoice_number: data.next_invoice_number || prev.next_invoice_number,
          next_quote_number: data.next_quote_number || prev.next_quote_number,
          accept_cash: data.accept_cash ?? prev.accept_cash,
          accept_check: data.accept_check ?? prev.accept_check,
          accept_credit_card: data.accept_credit_card ?? prev.accept_credit_card,
          accept_ach: data.accept_ach ?? prev.accept_ach,
          default_markup_percentage: data.default_markup_percentage || prev.default_markup_percentage,
          labor_rate: data.labor_rate || prev.labor_rate
        }));
      }
    } catch (error) {
      console.error('Error loading financial settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate financial settings
  const validateFinancialSettings = () => {
    const warnings = [];
    
    if (financialSettings.default_tax_rate === 0) {
      warnings.push('Consider setting a tax rate if your services are taxable');
    }

    if (!financialSettings.accept_credit_card && !financialSettings.accept_ach) {
      warnings.push('Consider accepting electronic payments for faster collection');
    }

    if (financialSettings.labor_rate < 50) {
      warnings.push('Labor rate seems low - make sure you\'re pricing competitively');
    }

    onValidationChange?.({
      valid: true, // Financial settings are optional
      errors: [],
      warnings
    });

    return true;
  };

  // Validate on settings change
  useEffect(() => {
    if (!loading) {
      validateFinancialSettings();
    }
  }, [financialSettings, loading]);

  // Update setting
  const updateSetting = (field, value) => {
    setFinancialSettings(prev => ({ ...prev, [field]: value }));
  };

  // Save financial settings
  const saveFinancialSettings = async () => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      // CRITICAL FIX: Use UPDATE instead of UPSERT to prevent duplicate records
      const { error } = await supabase
        .from('company_settings')
        .update({
          ...financialSettings,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', user.company_id);

      if (error) throw error;

      onComplete?.(financialSettings);
    } catch (error) {
      console.error('Error saving financial settings:', error);
      alert('Failed to save financial settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading financial settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <CurrencyDollarIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Setup</h2>
        <p className="text-gray-600">
          Configure your tax rates, payment terms, and pricing structure for quotes and invoices.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tax Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ReceiptPercentIcon className="w-5 h-5 text-indigo-600" />
            Tax Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                value={financialSettings.default_tax_rate}
                onChange={(e) => updateSetting('default_tax_rate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="50"
                step="0.01"
                placeholder="8.25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Name
              </label>
              <input
                type="text"
                value={financialSettings.tax_name}
                onChange={(e) => updateSetting('tax_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Sales Tax"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID Number (Optional)
              </label>
              <input
                type="text"
                value={financialSettings.tax_number}
                onChange={(e) => updateSetting('tax_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="12-3456789"
              />
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Payment Terms
              </label>
              <select
                value={financialSettings.payment_terms}
                onChange={(e) => updateSetting('payment_terms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {paymentTermsOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Fee (%)
              </label>
              <input
                type="number"
                value={financialSettings.late_fee_percentage}
                onChange={(e) => updateSetting('late_fee_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="10"
                step="0.1"
                placeholder="1.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Late Fee After (days)
              </label>
              <input
                type="number"
                value={financialSettings.late_fee_days}
                onChange={(e) => updateSetting('late_fee_days', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Invoice Numbering */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice & Quote Numbering</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={financialSettings.invoice_prefix}
                onChange={(e) => updateSetting('invoice_prefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="INV"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Invoice #
              </label>
              <input
                type="number"
                value={financialSettings.next_invoice_number}
                onChange={(e) => updateSetting('next_invoice_number', parseInt(e.target.value) || 1001)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Prefix
              </label>
              <input
                type="text"
                value={financialSettings.quote_prefix}
                onChange={(e) => updateSetting('quote_prefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="QUO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Quote #
              </label>
              <input
                type="number"
                value={financialSettings.next_quote_number}
                onChange={(e) => updateSetting('next_quote_number', parseInt(e.target.value) || 1001)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-indigo-600" />
            Accepted Payment Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={financialSettings.accept_cash}
                onChange={(e) => updateSetting('accept_cash', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Cash</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={financialSettings.accept_check}
                onChange={(e) => updateSetting('accept_check', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Check</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={financialSettings.accept_credit_card}
                onChange={(e) => updateSetting('accept_credit_card', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Credit Card</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={financialSettings.accept_ach}
                onChange={(e) => updateSetting('accept_ach', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">ACH/Bank Transfer</span>
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Labor Rate ($/hour)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={financialSettings.labor_rate}
                  onChange={(e) => updateSetting('labor_rate', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  placeholder="75.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Markup (%)
              </label>
              <input
                type="number"
                value={financialSettings.default_markup_percentage}
                onChange={(e) => updateSetting('default_markup_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                max="100"
                step="0.1"
                placeholder="20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center mt-8">
        <button
          onClick={saveFinancialSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Save Financial Settings & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FinancialSetupStep;
