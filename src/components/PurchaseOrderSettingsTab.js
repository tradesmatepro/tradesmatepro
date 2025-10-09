import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  EnvelopeIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

const PurchaseOrderSettingsTab = () => {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    po_number_prefix: 'PO-',
    next_po_number: 1001,
    po_auto_numbering: true,
    po_require_approval: false,
    po_approval_threshold: 1000.00,
    po_default_terms: 'NET_30',
    po_auto_send_to_vendor: false,
    po_require_receipt_confirmation: true,
    po_allow_partial_receiving: true,
    po_default_shipping_method: 'STANDARD',
    po_tax_calculation_method: 'AUTOMATIC',
    po_currency: 'USD',
    po_payment_terms_options: ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT', '2_10_NET_30'],
    po_default_notes: '',
    po_footer_text: '',
    po_email_template: 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
    po_reminder_days: 7,
    po_overdue_notification_days: 14
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const paymentTermsOptions = [
    { value: 'NET_15', label: 'Net 15 Days' },
    { value: 'NET_30', label: 'Net 30 Days' },
    { value: 'NET_45', label: 'Net 45 Days' },
    { value: 'NET_60', label: 'Net 60 Days' },
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
    { value: '2_10_NET_30', label: '2/10 Net 30' }
  ];

  const shippingMethods = [
    { value: 'STANDARD', label: 'Standard Shipping' },
    { value: 'EXPRESS', label: 'Express Shipping' },
    { value: 'OVERNIGHT', label: 'Overnight' },
    { value: 'PICKUP', label: 'Vendor Pickup' },
    { value: 'DELIVERY', label: 'Vendor Delivery' }
  ];

  const taxCalculationMethods = [
    { value: 'AUTOMATIC', label: 'Automatic (Use Default Tax Rate)' },
    { value: 'MANUAL', label: 'Manual Entry Per Item' },
    { value: 'NONE', label: 'No Tax Calculation' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  useEffect(() => {
    loadSettings();
  }, [user?.company_id]);

  const loadSettings = async () => {
    if (!user?.company_id) return;
    
    try {
      setLoading(true);
      
      // Try to get PO settings from business_settings first
      const businessRes = await supaFetch(
        `business_settings?company_id=eq.${user.company_id}&select=*`,
        { method: 'GET' },
        user.company_id
      );
      
      if (businessRes.ok) {
        const [businessSettings] = await businessRes.json();
        if (businessSettings) {
          setSettings(prev => ({
            ...prev,
            po_number_prefix: businessSettings.po_number_prefix || 'PO-',
            next_po_number: businessSettings.next_po_number || 1001,
            po_auto_numbering: businessSettings.po_auto_numbering ?? true,
            po_require_approval: businessSettings.po_require_approval ?? false,
            po_approval_threshold: businessSettings.po_approval_threshold || 1000.00,
            po_default_terms: businessSettings.po_default_terms || 'NET_30',
            po_auto_send_to_vendor: businessSettings.po_auto_send_to_vendor ?? false,
            po_require_receipt_confirmation: businessSettings.po_require_receipt_confirmation ?? true,
            po_allow_partial_receiving: businessSettings.po_allow_partial_receiving ?? true,
            po_default_shipping_method: businessSettings.po_default_shipping_method || 'STANDARD',
            po_tax_calculation_method: businessSettings.po_tax_calculation_method || 'AUTOMATIC',
            po_currency: businessSettings.po_currency || 'USD',
            po_payment_terms_options: businessSettings.po_payment_terms_options || ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT', '2_10_NET_30'],
            po_default_notes: businessSettings.po_default_notes || '',
            po_footer_text: businessSettings.po_footer_text || '',
            po_email_template: businessSettings.po_email_template || 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            po_reminder_days: businessSettings.po_reminder_days || 7,
            po_overdue_notification_days: businessSettings.po_overdue_notification_days || 14
          }));
        }
      }
    } catch (error) {
      console.error('Error loading PO settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.company_id) return;
    
    try {
      setSaving(true);
      
      // Update business_settings table
      const updateData = {
        po_number_prefix: settings.po_number_prefix,
        next_po_number: settings.next_po_number,
        po_auto_numbering: settings.po_auto_numbering,
        po_require_approval: settings.po_require_approval,
        po_approval_threshold: settings.po_approval_threshold,
        po_default_terms: settings.po_default_terms,
        po_auto_send_to_vendor: settings.po_auto_send_to_vendor,
        po_require_receipt_confirmation: settings.po_require_receipt_confirmation,
        po_allow_partial_receiving: settings.po_allow_partial_receiving,
        po_default_shipping_method: settings.po_default_shipping_method,
        po_tax_calculation_method: settings.po_tax_calculation_method,
        po_currency: settings.po_currency,
        po_payment_terms_options: settings.po_payment_terms_options,
        po_default_notes: settings.po_default_notes,
        po_footer_text: settings.po_footer_text,
        po_email_template: settings.po_email_template,
        po_reminder_days: settings.po_reminder_days,
        po_overdue_notification_days: settings.po_overdue_notification_days,
        updated_at: new Date().toISOString()
      };

      const response = await supaFetch(
        `business_settings?company_id=eq.${user.company_id}`,
        {
          method: 'PATCH',
          body: updateData
        },
        user.company_id
      );

      if (response.ok) {
        setMessage('Purchase Order settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving PO settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Purchase Order Settings</h3>
        </div>
        <p className="text-sm text-gray-600">
          Configure purchase order numbering, approval workflows, and default settings.
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-md p-4 ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex">
            {message.includes('success') ? (
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            )}
            <div className="ml-3">
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* PO Numbering Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CogIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">PO Numbering</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PO Number Prefix
            </label>
            <input
              type="text"
              value={settings.po_number_prefix}
              onChange={(e) => handleInputChange('po_number_prefix', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="PO-"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "PO-" will generate PO-2024-0001
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next PO Number
            </label>
            <input
              type="number"
              value={settings.next_po_number}
              onChange={(e) => handleInputChange('next_po_number', parseInt(e.target.value) || 1001)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              The next sequential number to use
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.po_auto_numbering}
              onChange={(e) => handleInputChange('po_auto_numbering', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Enable automatic PO numbering
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            When enabled, PO numbers will be generated automatically
          </p>
        </div>
      </div>

      {/* Approval Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Approval Workflow</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.po_require_approval}
                onChange={(e) => handleInputChange('po_require_approval', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Require approval for purchase orders
              </span>
            </label>
          </div>
          
          {settings.po_require_approval && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Threshold Amount
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={settings.po_approval_threshold}
                  onChange={(e) => handleInputChange('po_approval_threshold', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                POs above this amount require approval
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Default Terms & Options */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Default Terms & Settings</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Payment Terms
            </label>
            <select
              value={settings.po_default_terms}
              onChange={(e) => handleInputChange('po_default_terms', e.target.value)}
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
              Default Shipping Method
            </label>
            <select
              value={settings.po_default_shipping_method}
              onChange={(e) => handleInputChange('po_default_shipping_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {shippingMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Calculation Method
            </label>
            <select
              value={settings.po_tax_calculation_method}
              onChange={(e) => handleInputChange('po_tax_calculation_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {taxCalculationMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.po_currency}
              onChange={(e) => handleInputChange('po_currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workflow Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TruckIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Workflow Settings</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.po_auto_send_to_vendor}
                onChange={(e) => handleInputChange('po_auto_send_to_vendor', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Automatically send PO to vendor when approved
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.po_require_receipt_confirmation}
                onChange={(e) => handleInputChange('po_require_receipt_confirmation', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Require receipt confirmation from vendor
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.po_allow_partial_receiving}
                onChange={(e) => handleInputChange('po_allow_partial_receiving', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Allow partial receiving of items
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ClockIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Notification Settings</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Days
            </label>
            <input
              type="number"
              value={settings.po_reminder_days}
              onChange={(e) => handleInputChange('po_reminder_days', parseInt(e.target.value) || 7)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
              max="30"
            />
            <p className="text-xs text-gray-500 mt-1">
              Days before expected delivery to send reminder
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overdue Notification Days
            </label>
            <input
              type="number"
              value={settings.po_overdue_notification_days}
              onChange={(e) => handleInputChange('po_overdue_notification_days', parseInt(e.target.value) || 14)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
              max="60"
            />
            <p className="text-xs text-gray-500 mt-1">
              Days after expected delivery to send overdue notification
            </p>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <EnvelopeIcon className="w-5 h-5 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Email Templates & Notes</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Email Template
            </label>
            <textarea
              value={settings.po_email_template}
              onChange={(e) => handleInputChange('po_email_template', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email template for sending POs to vendors..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use #{po_number} to insert the PO number
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default PO Notes
            </label>
            <textarea
              value={settings.po_default_notes}
              onChange={(e) => handleInputChange('po_default_notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Default notes to include on all POs..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PO Footer Text
            </label>
            <textarea
              value={settings.po_footer_text}
              onChange={(e) => handleInputChange('po_footer_text', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Footer text to appear on printed POs..."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrderSettingsTab;
