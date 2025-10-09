import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';
import {
  DocumentTextIcon,
  CreditCardIcon,
  CalculatorIcon,
  BoltIcon,
  BanknotesIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label, description, disabled = false }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {description}
          </div>
        </div>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// Dropdown Component
const Dropdown = ({ value, onChange, options, label, description }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Text Input Component
const TextInput = ({ value, onChange, label, description, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// Number Input Component
const NumberInput = ({ value, onChange, label, description, min, max, suffix }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// Textarea Component
const TextArea = ({ value, onChange, label, description, placeholder, rows = 3 }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  </div>
);

const InvoicingSettingsTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [supportsTextFields, setSupportsTextFields] = useState(false);

  // Default invoicing settings based on schema
  const [settings, setSettings] = useState({
    invoice_number_prefix: 'INV-',
    invoice_number_format: '{prefix}{year}{month}{sequence}',
    next_invoice_number: 1,
    default_payment_terms: 'NET_30',
    default_due_days: 30,
    late_fee_enabled: false,
    late_fee_percentage: 0.00,
    late_fee_flat_amount: 0.00,
    grace_period_days: 0,
    default_tax_rate: 0.00,
    tax_inclusive_pricing: false,
    multiple_tax_rates_enabled: false,
    default_invoice_terms: '',
    invoice_footer: '',
    payment_instructions: '',
    show_item_descriptions: true,
    show_labor_breakdown: true,
    show_material_costs: true,
    auto_send_invoices: false,
    auto_send_reminders: false,
    auto_apply_late_fees: false,
    accepted_payment_methods: ['cash', 'check', 'credit_card'],
    online_payments_enabled: false,
    recurring_invoices_enabled: false,
    multi_currency_enabled: false,
    invoice_approval_required: false,
    // Deposit policy (quotes/jobs)
    deposit_enabled: false,
    deposit_type: 'PERCENTAGE', // 'PERCENTAGE' | 'FIXED'
    deposit_percent: 0,
    deposit_fixed_amount: 0,
    require_deposit_before_scheduling: false,
    // Automation
    auto_invoice_on_completion: false
  });

  const paymentTermsOptions = [
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
    { value: 'NET_15', label: 'Net 15 Days' },
    { value: 'NET_30', label: 'Net 30 Days' },
    { value: 'NET_45', label: 'Net 45 Days' },
    { value: 'NET_60', label: 'Net 60 Days' },
    { value: 'CUSTOM', label: 'Custom Terms' }
  ];

  useEffect(() => {
    loadSettings();
  }, [user?.company_id]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  // Helper: map older human text to enum codes used by UI and invoice service
  const mapDbTermsToEnum = (val) => {
    if (!val) return 'NET_30';
    const v = String(val).toUpperCase().replace(/\s+/g, '_');
    // Handle common legacy phrases
    if (v.includes('DUE') && v.includes('RECEIPT')) return 'DUE_ON_RECEIPT';
    if (v.includes('NET_7')) return 'NET_7';
    if (v.includes('NET_15')) return 'NET_15';
    if (v.includes('NET_30')) return 'NET_30';
    if (v.includes('NET_45')) return 'NET_45';
    if (v.includes('NET_60')) return 'NET_60';
    if (v.includes('CUSTOM')) return 'CUSTOM';
    // Handle exact phrases like 'Net 15 days'
    if (val === 'Net 7 days') return 'NET_7';
    if (val === 'Net 15 days') return 'NET_15';
    if (val === 'Net 30 days') return 'NET_30';
    if (val === 'Net 45 days') return 'NET_45';
    if (val === 'Net 60 days') return 'NET_60';
    if (val === 'Due on Receipt') return 'DUE_ON_RECEIPT';
    return 'NET_30';
  };

  const loadSettings = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Use unified SettingsService to get invoice configuration
      const invoiceConfig = await settingsService.getInvoiceConfig(user.company_id);

      // Also get unified settings for additional fields
      const unifiedSettings = await settingsService.getSettings(user.company_id);
      const business = unifiedSettings?.businessSettings || {};

      // Track schema support for optional text fields (assume supported for now)
      setSupportsTextFields(true);

      // Map unified settings to frontend format
      const mappedSettings = {
        ...settings,
        default_payment_terms: mapDbTermsToEnum(invoiceConfig.default_invoice_terms),
        default_due_days: (invoiceConfig.default_invoice_due_days ?? 30),
        default_tax_rate: (invoiceConfig.default_tax_rate ?? 0),
        auto_send_reminders: (unifiedSettings.send_auto_reminders ?? false),
        invoice_footer: (invoiceConfig.invoice_footer ?? ''),
        // Text fields
        default_invoice_terms: (invoiceConfig.default_invoice_terms ?? settings.default_invoice_terms ?? ''),
        payment_instructions: (invoiceConfig.payment_instructions ?? settings.payment_instructions ?? ''),
        // Deposit policy
        deposit_enabled: !!business.deposit_enabled,
        deposit_type: business.deposit_type || 'PERCENTAGE',
        deposit_percent: Number(business.deposit_percent || 0),
        deposit_fixed_amount: Number(business.deposit_fixed_amount || 0),
        require_deposit_before_scheduling: !!business.require_deposit_before_scheduling,
        // Automation
        auto_invoice_on_completion: !!business.auto_invoice_on_completion
      };

      console.log('📥 Loaded unified invoice settings:', mappedSettings);
      setSettings(prev => ({ ...prev, ...mappedSettings }));
    } catch (error) {
      console.error('Error loading invoicing settings:', error);
      showAlert('error', 'Failed to load invoicing settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings) => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      // Map frontend settings to the format expected by SettingsService
      const settingsToUpdate = {
        // Invoice-specific settings
        default_invoice_terms: updatedSettings.default_payment_terms || 'NET_30',
        default_invoice_due_days: updatedSettings.default_due_days || 30,
        default_tax_rate: Number(updatedSettings.default_tax_rate || 0),
        send_auto_reminders: !!updatedSettings.auto_send_reminders,
        invoice_footer: updatedSettings.invoice_footer || '',
        // Text content fields
        invoice_terms: updatedSettings.default_invoice_terms || '',
        payment_instructions: updatedSettings.payment_instructions || ''
      };

      console.log('💾 Saving unified invoice settings:', settingsToUpdate);

      // Use SettingsService to update settings (handles multiple tables internally)
      const success = await settingsService.updateSettings(user.company_id, settingsToUpdate);

      if (!success) {
        throw new Error('Failed to save settings via SettingsService');
      }

      showAlert('success', 'Invoicing settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save invoicing settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    // Debounced save - save after 1 second of no changes
    clearTimeout(window.invoicingSettingsSaveTimeout);
    window.invoicingSettingsSaveTimeout = setTimeout(() => {
      saveSettings(updatedSettings);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading invoicing settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-lg border ${
          alert.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <CheckIcon className="w-5 h-5 mr-2" />
            ) : (
              <XMarkIcon className="w-5 h-5 mr-2" />
            )}
            {alert.message}
          </div>
        </div>
      )}

      {/* Invoice Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invoice Configuration</h3>
              <p className="text-sm text-gray-600">Configure invoice formatting and numbering</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              value={settings.invoice_number_prefix}
              onChange={(value) => updateSetting('invoice_number_prefix', value)}
              label="Invoice Number Prefix"
              description="Prefix for all invoice numbers"
              placeholder="INV-"
            />
            <NumberInput
              value={settings.next_invoice_number}
              onChange={(value) => updateSetting('next_invoice_number', value)}
              label="Next Invoice Number"
              description="Next sequential number to use"
              min={1}
            />
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={settings.show_item_descriptions}
              onChange={(value) => updateSetting('show_item_descriptions', value)}
              label="Show Item Descriptions"
              description="Include detailed descriptions for line items"
            />
            <ToggleSwitch
              enabled={settings.show_labor_breakdown}
              onChange={(value) => updateSetting('show_labor_breakdown', value)}
              label="Show Labor Breakdown"
              description="Show detailed labor time and rates"
            />
            <ToggleSwitch
              enabled={settings.show_material_costs}
              onChange={(value) => updateSetting('show_material_costs', value)}
              label="Show Material Costs"
              description="Display material and parts costs separately"
            />
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCardIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
              <p className="text-sm text-gray-600">Configure payment terms and late fees</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              value={settings.default_payment_terms}
              onChange={(value) => updateSetting('default_payment_terms', value)}
              options={paymentTermsOptions}
              label="Default Payment Terms"
              description="Standard payment terms for invoices"
            />
            <NumberInput
              value={settings.default_due_days}
              onChange={(value) => updateSetting('default_due_days', value)}
              label="Default Due Days"
              description="Days until payment is due"
              min={1}
              max={365}
              suffix="days"
            />
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={settings.late_fee_enabled}
              onChange={(value) => updateSetting('late_fee_enabled', value)}
              label="Enable Late Fees"
              description="Charge fees for overdue payments"
            />
            {settings.late_fee_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                <NumberInput
                  value={settings.late_fee_percentage}
                  onChange={(value) => updateSetting('late_fee_percentage', value)}
                  label="Late Fee Percentage"
                  description="Percentage fee for late payments"
                  min={0}
                  max={100}
                  suffix="%"
                />
                <NumberInput
                  value={settings.grace_period_days}
                  onChange={(value) => updateSetting('grace_period_days', value)}
                  label="Grace Period"
                  description="Days after due date before late fees apply"
                  min={0}
                  max={30}
                  suffix="days"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CalculatorIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tax Configuration</h3>
              <p className="text-sm text-gray-600">Configure tax rates and tax handling</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput
              value={settings.default_tax_rate}
              onChange={(value) => updateSetting('default_tax_rate', value)}
              label="Default Tax Rate"
              description="Standard tax rate for invoices"
              min={0}
              max={100}
              suffix="%"
            />
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={settings.tax_inclusive_pricing}
              onChange={(value) => updateSetting('tax_inclusive_pricing', value)}
              label="Tax-Inclusive Pricing"
              description="Prices already include tax"
            />
            <ToggleSwitch
              enabled={settings.multiple_tax_rates_enabled}
              onChange={(value) => updateSetting('multiple_tax_rates_enabled', value)}
              label="Multiple Tax Rates"
              description="Support different tax rates for different items"
            />
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BoltIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Automation</h3>
              <p className="text-sm text-gray-600">Configure automated invoice processes</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <ToggleSwitch
            enabled={settings.auto_send_invoices}
            onChange={(value) => updateSetting('auto_send_invoices', value)}
            label="Auto-Send Invoices"
            description="Automatically email invoices when created"
          />
          <ToggleSwitch
            enabled={settings.auto_send_reminders}
            onChange={(value) => updateSetting('auto_send_reminders', value)}
            label="Auto-Send Reminders"
            description="Send automatic payment reminders"
          />

          <ToggleSwitch
            enabled={settings.auto_apply_late_fees}
            onChange={(value) => updateSetting('auto_apply_late_fees', value)}
            label="Auto-Apply Late Fees"
            description="Automatically add late fees to overdue invoices"
          />
          <ToggleSwitch
            enabled={settings.invoice_approval_required}
            onChange={(value) => updateSetting('invoice_approval_required', value)}
            label="Invoice Approval Required"
            description="Require manager approval before sending invoices"
          />

          {/* Company-level automation (saved to company_settings) */}
          <div className="pt-2 border-t border-gray-100 mt-2 space-y-3">
            <ToggleSwitch
              enabled={settings.auto_invoice_on_completion}
              onChange={(v) => setSettings(prev => ({ ...prev, auto_invoice_on_completion: v }))}
              label="Auto-create invoice when a job is completed"
              description="When enabled, completed jobs will automatically get an invoice created and linked"
            />
            <div>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                onClick={async ()=>{
                  try {
                    setSaving(true);
                    const ok = await settingsService.updateBusinessSettings(user.company_id, {
                      auto_invoice_on_completion: !!settings.auto_invoice_on_completion
                    });
                    if (!ok) throw new Error('Save failed');
                    showAlert('success', 'Automation setting saved');
                  } catch (e) {
                    console.error(e);
                    showAlert('error', 'Failed to save automation setting. If the column is missing, I can add it to the database.');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Save Automation Settings
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Deposits (Quotes/Jobs) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BanknotesIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Deposits</h3>
              <p className="text-sm text-gray-600">Default deposit policy for approved quotes/jobs</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <ToggleSwitch
            enabled={settings.deposit_enabled}
            onChange={(v) => setSettings(prev => ({ ...prev, deposit_enabled: v }))}
            label="Enable default deposit"
            description="Pre-fill a deposit in the approval modal; can be overridden per quote"
          />

          {settings.deposit_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-900">Deposit Type</label>
                <select
                  value={settings.deposit_type}
                  onChange={(e)=> setSettings(prev => ({ ...prev, deposit_type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              {settings.deposit_type === 'PERCENTAGE' ? (
                <NumberInput
                  value={settings.deposit_percent}
                  onChange={(v)=> setSettings(prev => ({ ...prev, deposit_percent: v }))}
                  label="Default Deposit Percentage"
                  description="Percentage of quote total to request as deposit"
                  min={0}
                  max={100}
                  suffix="%"
                />
              ) : (
                <NumberInput
                  value={settings.deposit_fixed_amount}
                  onChange={(v)=> setSettings(prev => ({ ...prev, deposit_fixed_amount: v }))}
                  label="Default Deposit Amount"
                  description="Fixed amount to request as deposit"
                  min={0}
                  suffix="$"
                />
              )}
              <div className="flex items-end">
                <ToggleSwitch
                  enabled={settings.require_deposit_before_scheduling}
                  onChange={(v) => setSettings(prev => ({ ...prev, require_deposit_before_scheduling: v }))}
                  label="Require deposit before scheduling"
                  description="Block scheduling until a deposit is recorded"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={async ()=> {
                try {
                  setSaving(true);
                  const ok = await settingsService.updateBusinessSettings(user.company_id, {
                    deposit_enabled: !!settings.deposit_enabled,
                    deposit_type: settings.deposit_type,
                    deposit_percent: Number(settings.deposit_percent || 0),
                    deposit_fixed_amount: Number(settings.deposit_fixed_amount || 0),
                    require_deposit_before_scheduling: !!settings.require_deposit_before_scheduling
                  });
                  if (!ok) throw new Error('Save failed');
                  showAlert('success', 'Deposit policy saved');
                } catch (e) {
                  console.error(e);
                  showAlert('error', 'Failed to save deposit policy. If columns are missing, I can add them to the database.');
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save Deposit Policy
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BanknotesIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-600">Configure accepted payment methods</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <ToggleSwitch
            enabled={settings.online_payments_enabled}
            onChange={(value) => updateSetting('online_payments_enabled', value)}
            label="Enable Online Payments"
            description="Allow customers to pay invoices online"
          />
          <ToggleSwitch
            enabled={settings.recurring_invoices_enabled}
            onChange={(value) => updateSetting('recurring_invoices_enabled', value)}
            label="Recurring Invoices"
            description="Enable recurring invoice functionality"
          />
          <ToggleSwitch
            enabled={settings.multi_currency_enabled}
            onChange={(value) => updateSetting('multi_currency_enabled', value)}
            label="Multi-Currency Support"
            description="Support multiple currencies"
          />
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invoice Content</h3>
              <p className="text-sm text-gray-600">Customize invoice text and content</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <TextArea
            value={settings.default_invoice_terms}
            onChange={(value) => updateSetting('default_invoice_terms', value)}
            label="Default Invoice Terms"
            description="Standard terms and conditions for invoices"
            placeholder="Payment due within 30 days. Late fees may apply."
            rows={3}
          />
          <TextArea
            value={settings.invoice_footer}
            onChange={(value) => updateSetting('invoice_footer', value)}
            label="Invoice Footer"
            description="Text that appears at the bottom of all invoices"
            placeholder="Thank you for your business!"
            rows={2}
          />
          <TextArea
            value={settings.payment_instructions}
            onChange={(value) => updateSetting('payment_instructions', value)}
            label="Payment Instructions"
            description="Instructions for how customers should submit payment"
            placeholder="Please remit payment to the address above or pay online at..."
            rows={3}
          />
        </div>
      </div>

      {/* Save Status */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
};

export default InvoicingSettingsTab;
