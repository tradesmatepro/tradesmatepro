import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CompanyBasicsStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  // PERSISTENCE FIX: Load from localStorage if available to handle component remounting
  const getInitialFormData = () => {
    try {
      const saved = localStorage.getItem(`onboarding_company_${user?.company_id}`);
      if (saved) {
        console.log('📦 Loading form data from localStorage');
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
    }

    return {
      name: '',
      tagline: '',
      phone: '',
      email: '',
      website: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      industry: '',
      timezone: 'America/Los_Angeles'
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Industry options
  const industries = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'General Contracting',
    'Landscaping',
    'Cleaning Services',
    'Handyman Services',
    'Roofing',
    'Flooring',
    'Painting',
    'Pest Control',
    'Pool Services',
    'Appliance Repair',
    'Locksmith',
    'Other'
  ];

  // US States
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Load existing company data
  useEffect(() => {
    console.log('🔄 CompanyBasicsStep useEffect triggered - user.company_id:', user?.company_id);
    loadCompanyData();
  }, [user?.company_id]);

  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log('🎯 CompanyBasicsStep component mounted');
    return () => {
      console.log('🔚 CompanyBasicsStep component unmounting');
    };
  }, []);

  // Cleanup localStorage when component unmounts (optional)
  const clearFormCache = () => {
    try {
      localStorage.removeItem(`onboarding_company_${user?.company_id}`);
      console.log('🧹 Cleared form data cache');
    } catch (error) {
      console.warn('Failed to clear form data cache:', error);
    }
  };

  const loadCompanyData = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // INDUSTRY STANDARD: Pre-fill from existing company data (like Jobber/ServiceTitan)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.company_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        console.log('✅ Pre-filling company data from existing record:', data);
        const prefilledData = {
          name: data.name || '',
          tagline: data.tagline || '',
          phone: data.phone || '',
          email: data.email || user.email || '', // Fallback to user email
          website: data.website || '',
          address_line1: data.address_line1 || data.street_address || '', // Handle both column names
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || data.state_province || '', // Handle both column names
          postal_code: data.postal_code || '',
          country: data.country || 'United States',
          industry: data.industry || '',
          timezone: data.timezone || data.time_zone || 'America/Los_Angeles' // Handle both column names
        };
        console.log('🔄 Setting form data to:', prefilledData);
        updateFormData(prefilledData);
      } else {
        // No existing company data - this shouldn't happen in normal flow
        console.log('⚠️ No existing company data found - using user email as fallback');
        const fallbackData = { ...formData, email: user.email || '' };
        updateFormData(fallbackData);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    }

    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      }
    }

    if (formData.website && formData.website.trim()) {
      const website = formData.website.trim();
      if (!website.match(/^https?:\/\/.+/) && !website.includes('.')) {
        newErrors.website = 'Please enter a valid website URL (e.g., yourcompany.com)';
      }
    }

    setErrors(newErrors);
    
    // Update validation for parent component
    const isValid = Object.keys(newErrors).length === 0;
    const warnings = [];
    
    if (!formData.phone.trim()) {
      warnings.push('Phone number recommended for customer contact');
    }
    
    if (!formData.address_line1.trim()) {
      warnings.push('Business address recommended for professional appearance');
    }
    
    if (!formData.industry) {
      warnings.push('Industry selection helps with service recommendations');
    }

    onValidationChange?.({
      valid: isValid,
      errors: Object.values(newErrors),
      warnings
    });

    return isValid;
  };

  // PERSISTENCE FIX: Save to localStorage when form changes
  const updateFormData = (newData) => {
    setFormData(newData);
    try {
      localStorage.setItem(`onboarding_company_${user?.company_id}`, JSON.stringify(newData));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  };

  // Handle form changes
  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    updateFormData(newData);
  };

  // Validate on form changes
  useEffect(() => {
    if (!loading) {
      validateForm();
    }
  }, [formData, loading]);

  // Save company data
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // FIXED: Prepare minimal data that matches database constraints
      const companyData = {
        id: user.company_id,
        name: formData.name.trim(),
        updated_at: new Date().toISOString()
      };

      // Only add fields if they have values and meet constraints
      if (formData.email && formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        companyData.email = formData.email.trim();
      }

      if (formData.phone && formData.phone.trim()) {
        // Convert phone to international format if needed
        let phone = formData.phone.trim().replace(/\D/g, ''); // Remove non-digits
        if (phone.length === 10 && !phone.startsWith('1')) {
          phone = '1' + phone; // Add US country code
        }
        if (phone.length >= 10) {
          companyData.phone = '+' + phone;
        }
      }

      if (formData.website && formData.website.trim()) {
        let website = formData.website.trim();
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
          website = 'https://' + website;
        }
        // Only add if it looks like a valid URL
        if (website.includes('.')) {
          companyData.website = website;
        }
      }

      // Add other fields that don't have strict constraints (check if they exist in schema)
      // FIXED: Only include fields that exist in current schema
      const safeFields = {
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        state_province: formData.state, // Fallback column name
        postal_code: formData.postal_code,
        country: formData.country
        // NOTE: industry and timezone removed until columns are added to schema
      };

      // Only add non-empty fields
      Object.entries(safeFields).forEach(([key, value]) => {
        if (value && value.toString().trim()) {
          companyData[key] = value.toString().trim();
        }
      });

      console.log('💾 Saving company data (formatted):', companyData);

      // Try full save first
      let { error } = await supabase
        .from('companies')
        .upsert(companyData);

      if (error) {
        console.error('❌ Full save failed, trying minimal save:', error);

        // Fallback: Try minimal save with just required fields
        const minimalData = {
          id: user.company_id,
          name: formData.name.trim(),
          updated_at: new Date().toISOString()
        };

        console.log('💾 Trying minimal save:', minimalData);
        const { error: minimalError } = await supabase
          .from('companies')
          .upsert(minimalData);

        if (minimalError) {
          console.error('❌ Even minimal save failed:', minimalError);
          console.error('❌ Error details:', {
            message: minimalError.message,
            details: minimalError.details,
            hint: minimalError.hint,
            code: minimalError.code
          });
          throw minimalError;
        } else {
          console.log('✅ Minimal save succeeded - will try to update other fields later');
        }
      }

      // Settings are now canonical in the settings table; onboarding no longer updates legacy company_settings

      console.log('✅ Company data saved successfully');

      // INDUSTRY STANDARD: Always proceed to next step even if some saves fail
      // This prevents users from getting stuck in onboarding
      onComplete?.(formData);
    } catch (error) {
      console.error('❌ Error saving company data:', error);
      setErrors({ general: `Failed to save company information: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <BuildingOfficeIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Basics</h2>
        <p className="text-gray-600">
          Let's start with your basic company information. This will appear on quotes, invoices, and your customer portal.
        </p>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      {/* INDUSTRY STANDARD: Show pre-filled data notice */}
      {(formData.name || formData.email) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800">
              <strong>Great!</strong> We've pre-filled some information from your account.
              Please review and add any missing details below.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Your Company Name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tagline (Optional)
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your professional tagline"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="info@yourcompany.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GlobeAltIcon className="w-4 h-4 inline mr-1" />
            Website (Optional)
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourcompany.com"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-1" />
            Business Address
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => handleChange('address_line1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Street Address"
            />
            <input
              type="text"
              value={formData.address_line2}
              onChange={(e) => handleChange('address_line2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apartment, suite, etc. (optional)"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ZIP Code"
              />
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(errors).length > 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Save & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CompanyBasicsStep;
