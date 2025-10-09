import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  BoltIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const MarketplaceSettings = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    accepts_emergency: false,
    emergency_fee: '',
    nights_weekends: false
  });
  const [autoAcceptRules, setAutoAcceptRules] = useState([]);
  const [showAddRule, setShowAddRule] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load company emergency settings
      const companyResponse = await supaFetch(
        `companies?id=eq.${user.company_id}&select=accepts_emergency,emergency_fee,nights_weekends`,
        { method: 'GET' },
        user.company_id
      );
      
      if (companyResponse.ok) {
        const companies = await companyResponse.json();
        if (companies[0]) {
          setCompanySettings({
            accepts_emergency: companies[0].accepts_emergency || false,
            emergency_fee: companies[0].emergency_fee || '',
            nights_weekends: companies[0].nights_weekends || false
          });
        }
      }

      // Load auto-accept rules
      const rulesResponse = await supaFetch(
        `auto_accept_rules?requester_company_id=eq.${user.company_id}&order=created_at.desc`,
        { method: 'GET' },
        user.company_id
      );
      
      if (rulesResponse.ok) {
        const rules = await rulesResponse.json();
        setAutoAcceptRules(rules || []);
      }
      
    } catch (error) {
      console.error('Error loading marketplace settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanySettings = async () => {
    try {
      setSaving(true);
      
      const response = await supaFetch(`companies?id=eq.${user.company_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accepts_emergency: companySettings.accepts_emergency,
          emergency_fee: companySettings.emergency_fee ? parseFloat(companySettings.emergency_fee) : null,
          nights_weekends: companySettings.nights_weekends
        })
      }, user.company_id);

      if (response.ok) {
        console.log('Company settings saved successfully');
        // TODO: Show success toast when available
      }
      
    } catch (error) {
      console.error('Error saving company settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAutoAcceptRule = async (ruleData) => {
    try {
      const response = await supaFetch('auto_accept_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ruleData,
          requester_company_id: user.company_id
        })
      }, user.company_id);

      if (response.ok) {
        loadSettings(); // Refresh rules
        setShowAddRule(false);
      }
      
    } catch (error) {
      console.error('Error adding auto-accept rule:', error);
    }
  };

  const deleteAutoAcceptRule = async (ruleId) => {
    try {
      const response = await supaFetch(`auto_accept_rules?id=eq.${ruleId}`, {
        method: 'DELETE'
      }, user.company_id);

      if (response.ok) {
        loadSettings(); // Refresh rules
      }
      
    } catch (error) {
      console.error('Error deleting auto-accept rule:', error);
    }
  };

  const handleCompanySettingChange = (field, value) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Emergency Job Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <BoltIcon className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Emergency Job Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Accept Emergency Jobs */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">Accept Emergency Jobs</label>
              <p className="text-sm text-gray-500">Receive notifications for urgent requests that need immediate attention</p>
            </div>
            <div className="ml-4">
              <input
                type="checkbox"
                checked={companySettings.accepts_emergency}
                onChange={(e) => handleCompanySettingChange('accepts_emergency', e.target.checked)}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Emergency Fee */}
          {companySettings.accepts_emergency && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Emergency Call-out Fee
              </label>
              <div className="relative rounded-md shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={companySettings.emergency_fee}
                  onChange={(e) => handleCompanySettingChange('emergency_fee', e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Additional fee charged for emergency jobs</p>
            </div>
          )}

          {/* Nights & Weekends */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900">Available Nights & Weekends</label>
              <p className="text-sm text-gray-500">Accept emergency jobs outside normal business hours</p>
            </div>
            <div className="ml-4">
              <input
                type="checkbox"
                checked={companySettings.nights_weekends}
                onChange={(e) => handleCompanySettingChange('nights_weekends', e.target.checked)}
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={saveCompanySettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Emergency Settings'}
          </button>
        </div>
      </div>

      {/* Auto-Accept Rules */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Auto-Accept Rules</h3>
          </div>
          <button
            onClick={() => setShowAddRule(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Rule
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Automatically accept responses that meet your criteria. This speeds up booking for trusted contractors.
        </p>

        {autoAcceptRules.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No auto-accept rules</h3>
            <p className="text-sm text-gray-500">Add rules to automatically book qualified responses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {autoAcceptRules.map((rule) => (
              <AutoAcceptRuleCard
                key={rule.id}
                rule={rule}
                onDelete={() => deleteAutoAcceptRule(rule.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <AddAutoAcceptRuleModal
          onSubmit={addAutoAcceptRule}
          onClose={() => setShowAddRule(false)}
        />
      )}
    </div>
  );
};

// Component for displaying individual auto-accept rules
const AutoAcceptRuleCard = ({ rule, onDelete }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {rule.trade_tag}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {rule.request_type}
            </span>
            {!rule.enabled && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Disabled
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            {rule.min_internal_rating && (
              <div>Min rating: {rule.min_internal_rating}⭐</div>
            )}
            {rule.require_verified && (
              <div>Must be verified ✓</div>
            )}
            {rule.max_hourly_rate && (
              <div>Max rate: ${rule.max_hourly_rate}/hr</div>
            )}
            {rule.max_eta_hours && (
              <div>Max ETA: {rule.max_eta_hours} hours</div>
            )}
          </div>
        </div>
        
        <button
          onClick={onDelete}
          className="ml-4 text-red-400 hover:text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Modal for adding new auto-accept rules
const AddAutoAcceptRuleModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    trade_tag: '',
    request_type: 'standard',
    min_internal_rating: '',
    require_verified: false,
    max_hourly_rate: '',
    max_eta_hours: '',
    enabled: true
  });

  const tradeOptions = [
    'plumber', 'electrician', 'hvac', 'carpenter', 'painter', 'roofer',
    'landscaper', 'cleaner', 'handyman', 'flooring', 'drywall', 'tile'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const ruleData = {
      ...formData,
      min_internal_rating: formData.min_internal_rating ? parseFloat(formData.min_internal_rating) : null,
      max_hourly_rate: formData.max_hourly_rate ? parseFloat(formData.max_hourly_rate) : null,
      max_eta_hours: formData.max_eta_hours ? parseInt(formData.max_eta_hours) : null
    };

    onSubmit(ruleData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add Auto-Accept Rule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Trade/Service Type *</label>
              <select
                name="trade_tag"
                value={formData.trade_tag}
                onChange={handleChange}
                required
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select trade...</option>
                {tradeOptions.map(trade => (
                  <option key={trade} value={trade}>
                    {trade.charAt(0).toUpperCase() + trade.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Request Type</label>
              <select
                name="request_type"
                value={formData.request_type}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              >
                <option value="standard">Standard</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Rating</label>
              <input
                type="number"
                name="min_internal_rating"
                value={formData.min_internal_rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g., 4.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Hourly Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="max_hourly_rate"
                  value={formData.max_hourly_rate}
                  onChange={handleChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max ETA (hours)</label>
            <input
              type="number"
              name="max_eta_hours"
              value={formData.max_eta_hours}
              onChange={handleChange}
              min="1"
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md max-w-xs"
              placeholder="e.g., 24"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum hours from now until contractor is available</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="require_verified"
              checked={formData.require_verified}
              onChange={handleChange}
              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <label className="ml-3 block text-sm font-medium text-gray-700">
              Require verified contractors only
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceSettings;
