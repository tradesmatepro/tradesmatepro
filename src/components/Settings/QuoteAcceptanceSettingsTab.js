import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const QuoteAcceptanceSettingsTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [settings, setSettings] = useState({
    // Signature Settings
    require_signature_on_approval: false,
    signature_type: 'basic', // 'basic' or 'docusign'
    
    // Terms & Conditions
    require_terms_acceptance: false,
    terms_and_conditions_text: '',
    terms_version: '1.0',
    
    // Deposit Settings
    require_deposit_on_approval: false,
    deposit_type: 'percentage', // 'percentage' or 'fixed'
    default_deposit_percentage: 25,
    default_deposit_amount: 0,
    allow_partial_deposits: true,
    
    // Scheduling Settings
    allow_customer_scheduling: false,
    auto_schedule_after_approval: false,
    show_technician_names: false, // Privacy: hide tech names from customers
    scheduling_buffer_hours: 24, // Minimum hours before appointment
    
    // Rejection Settings
    rejection_follow_up_enabled: true,
    auto_send_rejection_email: true,
    
    // Payment Integration
    stripe_enabled: false,
    stripe_public_key: '',
    stripe_secret_key: ''
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await supaFetch(
        `settings?company_id=eq.${user.company_id}`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const dbSettings = data[0];
          setSettings({
            require_signature_on_approval: dbSettings.require_signature_on_approval || false,
            signature_type: dbSettings.signature_type || 'basic',
            require_terms_acceptance: dbSettings.require_terms_acceptance || false,
            terms_and_conditions_text: dbSettings.terms_and_conditions_text || '',
            terms_version: dbSettings.terms_version || '1.0',
            require_deposit_on_approval: dbSettings.require_deposit_on_approval || false,
            deposit_type: dbSettings.deposit_type || 'percentage',
            default_deposit_percentage: dbSettings.default_deposit_percentage || 25,
            default_deposit_amount: dbSettings.default_deposit_amount || 0,
            allow_partial_deposits: dbSettings.allow_partial_deposits !== false,
            allow_customer_scheduling: dbSettings.allow_customer_scheduling || false,
            auto_schedule_after_approval: dbSettings.auto_schedule_after_approval || false,
            show_technician_names: dbSettings.show_technician_names || false,
            scheduling_buffer_hours: dbSettings.scheduling_buffer_hours || 24,
            rejection_follow_up_enabled: dbSettings.rejection_follow_up_enabled !== false,
            auto_send_rejection_email: dbSettings.auto_send_rejection_email !== false,
            stripe_enabled: dbSettings.stripe_enabled || false,
            stripe_public_key: dbSettings.stripe_public_key || '',
            stripe_secret_key: dbSettings.stripe_secret_key || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading quote acceptance settings:', error);
      showAlert('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await supaFetch(
        `settings?company_id=eq.${user.company_id}`,
        {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: settings
        },
        user.company_id
      );

      if (response.ok) {
        showAlert('success', 'Quote acceptance settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Acceptance Workflow</h3>
        <p className="text-sm text-gray-600">
          Configure how customers approve quotes: signatures, deposits, scheduling, and more.
        </p>
      </div>

      {/* Signature Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <PencilSquareIcon className="w-6 h-6 text-blue-600" />
          <h4 className="text-md font-semibold text-gray-900">Digital Signature</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Require Signature on Approval</label>
              <p className="text-xs text-gray-500">Customer must sign before approving quote</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_signature_on_approval}
                onChange={(e) => setSettings({ ...settings, require_signature_on_approval: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.require_signature_on_approval && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Signature Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSettings({ ...settings, signature_type: 'basic' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    settings.signature_type === 'basic'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">Basic Digital Signature</div>
                  <div className="text-xs text-gray-500 mt-1">Free canvas-based signature</div>
                  <div className="text-xs text-green-600 mt-2 font-medium">✓ FREE</div>
                </button>
                <button
                  onClick={() => setSettings({ ...settings, signature_type: 'docusign' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    settings.signature_type === 'docusign'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">DocuSign Integration</div>
                  <div className="text-xs text-gray-500 mt-1">Legally binding e-signature</div>
                  <div className="text-xs text-orange-600 mt-2 font-medium">Coming Soon</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <DocumentTextIcon className="w-6 h-6 text-purple-600" />
          <h4 className="text-md font-semibold text-gray-900">Terms & Conditions</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Require Terms Acceptance</label>
              <p className="text-xs text-gray-500">Customer must accept terms before approving</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_terms_acceptance}
                onChange={(e) => setSettings({ ...settings, require_terms_acceptance: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.require_terms_acceptance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions Text</label>
              <textarea
                value={settings.terms_and_conditions_text}
                onChange={(e) => setSettings({ ...settings, terms_and_conditions_text: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your terms and conditions here..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Deposit Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
          <h4 className="text-md font-semibold text-gray-900">Deposit Requirements</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Require Deposit on Approval</label>
              <p className="text-xs text-gray-500">Customer must pay deposit before approval</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_deposit_on_approval}
                onChange={(e) => setSettings({ ...settings, require_deposit_on_approval: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.require_deposit_on_approval && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettings({ ...settings, deposit_type: 'percentage' })}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      settings.deposit_type === 'percentage'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">Percentage</div>
                    <div className="text-xs text-gray-500 mt-1">% of total</div>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, deposit_type: 'fixed' })}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      settings.deposit_type === 'fixed'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">Fixed Amount</div>
                    <div className="text-xs text-gray-500 mt-1">$ amount</div>
                  </button>
                </div>
              </div>

              {settings.deposit_type === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Deposit Percentage
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.default_deposit_percentage}
                      onChange={(e) => setSettings({ ...settings, default_deposit_percentage: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Deposit Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.default_deposit_amount}
                      onChange={(e) => setSettings({ ...settings, default_deposit_amount: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow Partial Deposits</label>
                  <p className="text-xs text-gray-500">Let customers pay less than full deposit</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allow_partial_deposits}
                    onChange={(e) => setSettings({ ...settings, allow_partial_deposits: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Scheduling Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
          <h4 className="text-md font-semibold text-gray-900">Customer Self-Scheduling</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Customer Scheduling</label>
              <p className="text-xs text-gray-500">Let customers pick their own appointment time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_customer_scheduling}
                onChange={(e) => setSettings({ ...settings, allow_customer_scheduling: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.allow_customer_scheduling && (
            <>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-Schedule After Approval</label>
                  <p className="text-xs text-gray-500">Automatically confirm customer-selected time</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_schedule_after_approval}
                    onChange={(e) => setSettings({ ...settings, auto_schedule_after_approval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">Show Technician Names</label>
                  <p className="text-xs text-gray-500">Display tech names to customers (privacy setting)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_technician_names}
                    onChange={(e) => setSettings({ ...settings, show_technician_names: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduling Buffer (Hours)
                </label>
                <p className="text-xs text-gray-500 mb-2">Minimum hours before appointment can be scheduled</p>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settings.scheduling_buffer_hours}
                  onChange={(e) => setSettings({ ...settings, scheduling_buffer_hours: parseInt(e.target.value) || 0 })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-600">hours</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rejection Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <XCircleIcon className="w-6 h-6 text-red-600" />
          <h4 className="text-md font-semibold text-gray-900">Quote Rejection Handling</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Follow-Up on Rejection</label>
              <p className="text-xs text-gray-500">Track and follow up on declined quotes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.rejection_follow_up_enabled}
                onChange={(e) => setSettings({ ...settings, rejection_follow_up_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-Send Rejection Email</label>
              <p className="text-xs text-gray-500">Automatically email when quote is declined</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_send_rejection_email}
                onChange={(e) => setSettings({ ...settings, auto_send_rejection_email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Payment Integration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BanknotesIcon className="w-6 h-6 text-emerald-600" />
          <h4 className="text-md font-semibold text-gray-900">Payment Integration</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Stripe Payments</label>
              <p className="text-xs text-gray-500">Accept credit card payments for deposits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripe_enabled}
                onChange={(e) => setSettings({ ...settings, stripe_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.stripe_enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  value={settings.stripe_public_key}
                  onChange={(e) => setSettings({ ...settings, stripe_public_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Secret Key
                </label>
                <input
                  type="password"
                  value={settings.stripe_secret_key}
                  onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk_test_..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Dashboard</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuoteAcceptanceSettingsTab;

