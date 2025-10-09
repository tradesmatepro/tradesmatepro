import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import { RateCardService } from '../../services/RateCardService';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PricingSetupStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState({
    hourly_rate: 75,
    overtime_rate: 112.5,
    emergency_rate: 150,
    material_markup: 25,
    tax_rate: 8.25,
    payment_terms: 'Net 30'
  });

  // Load existing pricing data
  useEffect(() => {
    loadPricingData();
  }, [user?.company_id]);

  const loadPricingData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Load from canonical settings table
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('company_id', user.company_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading pricing data:', error);
      } else if (settings) {
        // Extract pricing from canonical settings
        const baseRate = settings.labor_rate || 75;
        setPricingData({
          hourly_rate: baseRate,
          overtime_rate: baseRate * (settings.overtime_multiplier || 1.5),
          emergency_rate: baseRate * (settings.emergency_rate_multiplier || 2.0),
          material_markup: settings.parts_markup || 25,
          tax_rate: settings.default_tax_rate || 8.25,
          payment_terms: settings.default_invoice_terms || 'Net 30'
        });
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate pricing data
  const validatePricing = () => {
    const errors = [];
    const warnings = [];

    if (pricingData.hourly_rate <= 0) {
      errors.push('Hourly rate must be greater than $0');
    }

    if (pricingData.hourly_rate < 50) {
      warnings.push('Hourly rate seems low for professional services');
    }

    if (pricingData.material_markup < 0) {
      errors.push('Material markup cannot be negative');
    }

    if (pricingData.tax_rate < 0 || pricingData.tax_rate > 15) {
      warnings.push('Tax rate should typically be between 0% and 15%');
    }

    const isValid = errors.length === 0;

    onValidationChange?.({
      valid: isValid,
      errors,
      warnings
    });

    return isValid;
  };

  // Validate on data change
  useEffect(() => {
    if (!loading) {
      validatePricing();
    }
  }, [pricingData, loading]);

  const handleInputChange = (field, value) => {
    setPricingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleComplete = async () => {
    if (!validatePricing()) return;

    try {
      setSaving(true);

      // Save pricing data to canonical settings table
      const settingsUpdate = {
        default_tax_rate: parseFloat(pricingData.tax_rate),
        labor_rate: parseFloat(pricingData.hourly_rate),
        overtime_multiplier: parseFloat(pricingData.overtime_rate) / Math.max(parseFloat(pricingData.hourly_rate) || 1, 1),
        parts_markup: parseFloat(pricingData.material_markup),
        default_invoice_terms: pricingData.payment_terms,
        // Derive emergency multiplier if possible
        emergency_rate_multiplier: Math.max(parseFloat(pricingData.emergency_rate) / Math.max(parseFloat(pricingData.hourly_rate) || 1, 1), 0) || 2.0,
        updated_at: new Date().toISOString()
      };

      // Ensure settings row exists
      const { data: existingSettings, error: selErr } = await supabase
        .from('settings')
        .select('company_id')
        .eq('company_id', user.company_id)
        .limit(1);

      if (!existingSettings || existingSettings.length === 0) {
        const { error: insErr } = await supabase
          .from('settings')
          .insert({ company_id: user.company_id, created_at: new Date().toISOString() });
        if (insErr) throw insErr;
      }

      const { error } = await supabase
        .from('settings')
        .update(settingsUpdate)
        .eq('company_id', user.company_id);

      if (error) throw error;

      console.log('✅ Pricing data saved successfully');

      // Create default rate card structure (zero prices for user to fill)
      try {
        console.log('🚀 Creating default rate card structure...');
        await RateCardService.createDefaultRateCards(user.company_id);
        console.log('✅ Default rate card structure created successfully');
      } catch (rateCardError) {
        console.error('⚠️ Warning: Could not create default rate cards:', rateCardError);
        // Don't fail the whole process if rate cards fail
      }

      onComplete?.(pricingData);

    } catch (error) {
      console.error('Error saving pricing data:', error);
      alert('Failed to save pricing data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Pricing</h2>
        <p className="text-gray-600">
          Configure your rates so you can start creating quotes immediately
        </p>
      </div>

      {/* Pricing Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Labor Rates */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Labor Rates
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Hourly Rate *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={pricingData.hourly_rate}
                  onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="75.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingData.overtime_rate}
                  onChange={(e) => handleInputChange('overtime_rate', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="112.50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Usually 1.5x standard rate</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingData.emergency_rate}
                  onChange={(e) => handleInputChange('emergency_rate', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="150.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">After hours/weekends</p>
            </div>
          </div>
        </div>

        {/* Material Markup & Tax */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Markup
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={pricingData.material_markup}
                onChange={(e) => handleInputChange('material_markup', e.target.value)}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="25"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Markup on parts/materials</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                value={pricingData.tax_rate}
                onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="8.25"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Local sales tax rate</p>
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Payment Terms
          </label>
          <select
            value={pricingData.payment_terms}
            onChange={(e) => handleInputChange('payment_terms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Due on completion">Due on completion</option>
            <option value="Net 15">Net 15 days</option>
            <option value="Net 30">Net 30 days</option>
            <option value="50% upfront, 50% on completion">50% upfront, 50% on completion</option>
          </select>
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Continue - Ready to Quote!
            </>
          )}
        </button>
        
        <div className="text-sm text-gray-500 mt-2">
          You can adjust these rates anytime in Settings
        </div>
      </div>
    </div>
  );
};

export default PricingSetupStep;
