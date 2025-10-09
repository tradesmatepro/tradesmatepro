import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import TagSelector from '../Common/TagSelector';
import {
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const MarketplaceCompanySettings = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Company Tags
  const [companyTags, setCompanyTags] = useState([]);
  
  // Auto-Accept Rules
  const [autoAcceptRules, setAutoAcceptRules] = useState([]);
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({
    trade_tag: null,
    min_internal_rating: 0,
    require_verified: false,
    max_hourly_rate: '',
    max_eta_hours: '',
    max_distance_km: '',
    enabled: true
  });
  
  // Approval Settings
  const [approvalSettings, setApprovalSettings] = useState({
    auto_approve_limit: 500,
    manager_approval_limit: 5000,
    owner_approval_required: true,
    email_notifications: true,
    mobile_notifications: true,
    require_budget_check: true,
    allow_over_budget: false,
    over_budget_approval_required: true
  });

  useEffect(() => {
    loadSettings();
  }, [user?.company_id]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCompanyTags(),
        loadAutoAcceptRules(),
        loadApprovalSettings()
      ]);
    } catch (error) {
      console.error('Error loading marketplace settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyTags = async () => {
    try {
      const response = await supaFetch(
        `company_tags?select=tags(id,name)&company_id=eq.${user.company_id}`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        const tags = data.map(item => item.tags).filter(Boolean);
        setCompanyTags(tags);
      }
    } catch (error) {
      console.error('Error loading company tags:', error);
    }
  };

  const loadAutoAcceptRules = async () => {
    try {
      const response = await supaFetch(
        `auto_accept_rules?select=*,tags(id,name)&company_id=eq.${user.company_id}`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setAutoAcceptRules(data || []);
      }
    } catch (error) {
      console.error('Error loading auto-accept rules:', error);
    }
  };

  const loadApprovalSettings = async () => {
    try {
      const response = await supaFetch(
        `company_approval_settings?company_id=eq.${user.company_id}`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setApprovalSettings(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading approval settings:', error);
    }
  };

  const handleTagsChange = async (selectedTags) => {
    try {
      setSaving(true);
      
      // First, remove all existing company tags
      await supaFetch(
        `company_tags?company_id=eq.${user.company_id}`,
        { method: 'DELETE' },
        user.company_id
      );

      // Then add the new tags
      if (selectedTags.length > 0) {
        const tagLinks = selectedTags.map(tag => ({
          company_id: user.company_id,
          tag_id: tag.id
        }));

        await supaFetch('company_tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tagLinks)
        }, user.company_id);
      }

      setCompanyTags(selectedTags);
    } catch (error) {
      console.error('Error updating company tags:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAutoAcceptRule = async () => {
    if (!newRule.trade_tag) {
      alert('Please select a service tag for the rule');
      return;
    }

    try {
      setSaving(true);
      
      const ruleData = {
        company_id: user.company_id,
        trade_tag: newRule.trade_tag.id,
        min_internal_rating: parseFloat(newRule.min_internal_rating) || 0,
        require_verified: newRule.require_verified,
        max_hourly_rate: newRule.max_hourly_rate ? parseFloat(newRule.max_hourly_rate) : null,
        max_eta_hours: newRule.max_eta_hours ? parseInt(newRule.max_eta_hours) : null,
        max_distance_km: newRule.max_distance_km ? parseFloat(newRule.max_distance_km) : null,
        enabled: newRule.enabled
      };

      const response = await supaFetch('auto_accept_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      }, user.company_id);

      if (response.ok) {
        await loadAutoAcceptRules();
        setShowAddRuleForm(false);
        setNewRule({
          trade_tag: null,
          min_internal_rating: 0,
          require_verified: false,
          max_hourly_rate: '',
          max_eta_hours: '',
          max_distance_km: '',
          enabled: true
        });
      }
    } catch (error) {
      console.error('Error adding auto-accept rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteAutoAcceptRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this auto-accept rule?')) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await supaFetch(
        `auto_accept_rules?id=eq.${ruleId}`,
        { method: 'DELETE' },
        user.company_id
      );

      if (response.ok) {
        await loadAutoAcceptRules();
      }
    } catch (error) {
      console.error('Error deleting auto-accept rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveApprovalSettings = async () => {
    try {
      setSaving(true);
      
      const response = await supaFetch('company_approval_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...approvalSettings,
          company_id: user.company_id
        })
      }, user.company_id);

      if (response.ok) {
        console.log('Approval settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving approval settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading marketplace settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marketplace Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your company's marketplace presence and automation rules
        </p>
      </div>

      {/* Company Services Tags */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cog6ToothIcon className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Services Offered</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Select the services your company offers. This helps customers find you when posting requests.
        </p>
        
        <TagSelector
          selectedTags={companyTags}
          onTagsChange={handleTagsChange}
          placeholder="Search and select services you offer..."
          disabled={saving}
        />
        
        {saving && (
          <div className="mt-2 text-sm text-gray-500">
            Saving changes...
          </div>
        )}
      </div>

      {/* Auto-Accept Rules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Auto-Accept Rules</h3>
          </div>
          <button
            onClick={() => setShowAddRuleForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Rule
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Set up rules to automatically accept requests that meet your criteria.
        </p>

        {/* Existing Rules */}
        <div className="space-y-4">
          {autoAcceptRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">
                      {rule.tags?.name || 'Unknown Service'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {rule.min_internal_rating > 0 && (
                      <div>Min Rating: {rule.min_internal_rating}</div>
                    )}
                    {rule.require_verified && (
                      <div>Requires Verification</div>
                    )}
                    {rule.max_hourly_rate && (
                      <div>Max Rate: ${rule.max_hourly_rate}/hr</div>
                    )}
                    {rule.max_eta_hours && (
                      <div>Max ETA: {rule.max_eta_hours} hours</div>
                    )}
                    {rule.max_distance_km && (
                      <div>Max Distance: {rule.max_distance_km} km</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteAutoAcceptRule(rule.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  disabled={saving}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Rule Form */}
        {showAddRuleForm && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Auto-Accept Rule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Tag *
                </label>
                <TagSelector
                  selectedTags={newRule.trade_tag ? [newRule.trade_tag] : []}
                  onTagsChange={(tags) => setNewRule({...newRule, trade_tag: tags[0] || null})}
                  placeholder="Select a service..."
                  maxTags={1}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Internal Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newRule.min_internal_rating}
                  onChange={(e) => setNewRule({...newRule, min_internal_rating: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Hourly Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRule.max_hourly_rate}
                  onChange={(e) => setNewRule({...newRule, max_hourly_rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max ETA (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newRule.max_eta_hours}
                  onChange={(e) => setNewRule({...newRule, max_eta_hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Distance (km)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={newRule.max_distance_km}
                  onChange={(e) => setNewRule({...newRule, max_distance_km: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="require_verified"
                checked={newRule.require_verified}
                onChange={(e) => setNewRule({...newRule, require_verified: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="require_verified" className="ml-2 text-sm text-gray-700">
                Require verified contractors only
              </label>
            </div>
            
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="rule_enabled"
                checked={newRule.enabled}
                onChange={(e) => setNewRule({...newRule, enabled: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="rule_enabled" className="ml-2 text-sm text-gray-700">
                Enable this rule
              </label>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={addAutoAcceptRule}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Rule'}
              </button>
              <button
                onClick={() => setShowAddRuleForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approval Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Approval Settings</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Configure budget limits and approval workflows for your company.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Approve Limit ($)
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={approvalSettings.auto_approve_limit}
                onChange={(e) => setApprovalSettings({...approvalSettings, auto_approve_limit: parseFloat(e.target.value) || 0})}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Requests under this amount are automatically approved
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager Approval Limit ($)
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={approvalSettings.manager_approval_limit}
                onChange={(e) => setApprovalSettings({...approvalSettings, manager_approval_limit: parseFloat(e.target.value) || 0})}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Requests under this amount require manager approval
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="owner_approval_required"
              checked={approvalSettings.owner_approval_required}
              onChange={(e) => setApprovalSettings({...approvalSettings, owner_approval_required: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="owner_approval_required" className="ml-2 text-sm text-gray-700">
              Owner approval required for amounts above manager limit
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="require_budget_check"
              checked={approvalSettings.require_budget_check}
              onChange={(e) => setApprovalSettings({...approvalSettings, require_budget_check: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="require_budget_check" className="ml-2 text-sm text-gray-700">
              Always check budget before approval
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allow_over_budget"
              checked={approvalSettings.allow_over_budget}
              onChange={(e) => setApprovalSettings({...approvalSettings, allow_over_budget: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="allow_over_budget" className="ml-2 text-sm text-gray-700">
              Allow over-budget requests
            </label>
          </div>

          {approvalSettings.allow_over_budget && (
            <div className="ml-6 flex items-center">
              <input
                type="checkbox"
                id="over_budget_approval_required"
                checked={approvalSettings.over_budget_approval_required}
                onChange={(e) => setApprovalSettings({...approvalSettings, over_budget_approval_required: e.target.checked})}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="over_budget_approval_required" className="ml-2 text-sm text-gray-700">
                Require approval for over-budget requests
              </label>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="email_notifications"
              checked={approvalSettings.email_notifications}
              onChange={(e) => setApprovalSettings({...approvalSettings, email_notifications: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="email_notifications" className="ml-2 text-sm text-gray-700">
              Send email notifications for approvals
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="mobile_notifications"
              checked={approvalSettings.mobile_notifications}
              onChange={(e) => setApprovalSettings({...approvalSettings, mobile_notifications: e.target.checked})}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="mobile_notifications" className="ml-2 text-sm text-gray-700">
              Send mobile notifications for approvals
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={saveApprovalSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Approval Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCompanySettings;
