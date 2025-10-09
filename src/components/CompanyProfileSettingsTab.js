import React, { useState, useEffect, useRef } from 'react';

import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { supabase } from '../utils/supabaseClient';
import CompanyAvatar from './CompanyProfile/CompanyAvatar';
import ContactInfoCard from './CompanyProfile/ContactInfoCard';
import AddressCard from './CompanyProfile/AddressCard';
import LicensesCard from './CompanyProfile/LicensesCard';
import TaxIdCard from './CompanyProfile/TaxIdCard';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  SparklesIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Helper function to parse license data
const parseLicenseData = (licenseField) => {


  if (!licenseField) return [];

  // If it's already an array, return it
  if (Array.isArray(licenseField)) {

    return licenseField;
  }

  // If it's a JSON string, try to parse it
  if (typeof licenseField === 'string') {
    // Check if it looks like JSON
    if (licenseField.trim().startsWith('{') || licenseField.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(licenseField);


        // Ensure we return an array
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (typeof parsed === 'object' && parsed.number) {
          // Single license object
          return [parsed];
        } else {
          console.warn('Parsed license data is not in expected format');
          return [];
        }
      } catch (e) {
        console.error('Failed to parse license JSON:', e, 'Raw data:', licenseField);
        // If parsing fails, treat as simple license number
        return [{
          id: 'license_0',
          number: licenseField,
          state: '',
          expiry_date: ''
        }];
      }
    } else {
      // Simple string license number

      return [{
        id: 'license_0',
        number: licenseField,
        state: '',
        expiry_date: ''
      }];
    }
  }

  // If it's an object, wrap in array
  if (typeof licenseField === 'object') {
    return [licenseField];
  }
  return [];
};

// Helper function to serialize license data for storage
const serializeLicenseData = (licenses) => {
  if (!licenses || licenses.length === 0) return '';

  // If only one license and it's simple, store just the number
  if (licenses.length === 1 && licenses[0].number && !licenses[0].state && !licenses[0].expiry_date) {
    return licenses[0].number;
  }

  // Otherwise store as JSON
  return JSON.stringify(licenses);
};

const CompanyProfileSettingsTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const fileInputRef = useRef(null);

  // Company data state
  const [companyData, setCompanyData] = useState({
    name: '',
    tagline: '',
    email: '',
    phone_number: '',
    website: '',
    tax_id: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    license_numbers: [],
    logo_url: '',
    banner_url: '',
    // Branding colors
    theme_color: '',
    secondary_color: '',
    social_links: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: ''
    },
    registration_numbers: {
      ein: '',
      duns: '',
      business_license: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [completionData, setCompletionData] = useState({
    percentage: 0,
    completedSections: [],
    missingSections: []
  });

  const isLoadedRef = useRef(false);
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (user?.company_id) {
      loadCompanyData();
    }
  }, [user?.company_id]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const calculateProfileCompletion = (data) => {
    const sections = [
      { name: 'Company Name', completed: !!data.name },
      { name: 'Contact Info', completed: !!(data.email && data.phone_number) },
      { name: 'Address', completed: !!(data.street_address && data.city && data.state) },
      { name: 'Logo', completed: !!data.logo_url },
      { name: 'Tax ID', completed: !!data.tax_id },
      { name: 'Licenses', completed: data.license_numbers && data.license_numbers.length > 0 }
    ];

    const completedSections = sections.filter(s => s.completed);
    const missingSections = sections.filter(s => !s.completed);
    const percentage = Math.round((completedSections.length / sections.length) * 100);

    return {
      percentage,
      completedSections: completedSections.map(s => s.name),
      missingSections: missingSections.map(s => s.name)
    };
  };

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      console.log('🏷️ loadCompanyData: fetching company profile', { company_id: user.company_id });
      const response = await supaFetch(
        `companies?id=eq.${user.company_id}&select=*`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const profile = data[0];
          const parsedLicenses = parseLicenseData(profile.license_number);

          console.log('🏷️ loadCompanyData: raw DB row', profile);
          const companyInfo = {
            name: profile.name || '',
            tagline: profile.tagline || '',
            email: profile.email || '',
            phone_number: profile.phone || '',
            website: profile.website || '',
            tax_id: profile.tax_id || '',
            street_address: profile.street_address || '',
            city: profile.city || '',
            state: profile.state || '',
            postal_code: profile.postal_code || '',
            country: profile.country || 'United States',
            license_numbers: parsedLicenses,
            // Map DB columns to UI fields
            logo_url: profile.company_logo_url || profile.logo_url || '',
            banner_url: profile.company_banner_url || profile.banner_url || '',
            theme_color: profile.theme_color || '#3B82F6',
            secondary_color: profile.secondary_color || '#6B7280',
            social_links: {
              facebook: '',
              instagram: '',
              linkedin: '',
              twitter: ''
            },
            registration_numbers: {
              ein: profile.tax_id || '',
              duns: '',
              business_license: profile.license_number || ''
            }
          };

          setCompanyData(companyInfo);
          console.log('🏷️ loadCompanyData: mapped companyData', { theme_color: companyInfo.theme_color, secondary_color: companyInfo.secondary_color });
          const completion = calculateProfileCompletion(companyInfo);
          setCompletionData(completion);
          isLoadedRef.current = true;
        }
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      showAlert('error', 'Failed to load company data');
    } finally {
      setLoading(false);
      console.log('🏷️ loadCompanyData: finished');
    }
  };

  const saveCompanyData = async (updatedData) => {
    try {
      setSaving(true);
      console.log('💾 saveCompanyData: invoked with', { theme_color: updatedData.theme_color, secondary_color: updatedData.secondary_color });

      const profileData = {
        company_name: updatedData.name,
        tagline: updatedData.tagline,
        email: updatedData.email,
        phone: updatedData.phone_number,
        website: updatedData.website,
        tax_id: updatedData.tax_id,
        street_address: updatedData.street_address,
        city: updatedData.city,
        state: updatedData.state,
        zip_code: updatedData.postal_code,
        country: updatedData.country,
        license_numbers: updatedData.license_numbers,
        company_logo_url: updatedData.logo_url,
        social_media_links: updatedData.social_links,
        ein: updatedData.registration_numbers.ein,
        duns: updatedData.registration_numbers.duns,
        business_license: updatedData.registration_numbers.business_license
      };

      // Map UI data to schema fields using mapping function
      const companyData = {
        name: updatedData.name,
        phone: updatedData.phone_number,
        email: updatedData.email,
        street_address: updatedData.street_address,
        city: updatedData.city,
        state: updatedData.state,
        postal_code: updatedData.postal_code,
        license_number: (() => {
          const serialized = serializeLicenseData(updatedData.license_numbers);
          return serialized;
        })(),
        tax_id: updatedData.tax_id,
        website: updatedData.website,
        // Persist asset URL in schema columns (banner column not present in schema.csv)
        company_logo_url: updatedData.logo_url,
        // Branding colors
        theme_color: updatedData.theme_color || null,
        secondary_color: updatedData.secondary_color || null
      };

      // Update company record (companies table always exists for logged-in users)
      console.log('💾 saveCompanyData: PATCH -> companies', { company_id: user.company_id, body: companyData });
      let response = await supaFetch(
        `companies?id=eq.${user.company_id}`,
        {
          method: 'PATCH',
          body: companyData,
          headers: { 'Prefer': 'return=minimal' }
        },
        user.company_id
      );

      console.log('💾 saveCompanyData: response', { ok: response.ok, status: response.status });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('💥 saveCompanyData: error body', errorText);
        throw new Error(`Failed to update company profile: ${errorText}`);
      }

      showAlert('success', 'Company profile saved successfully');
      console.log('✅ saveCompanyData: success');

      // Recalculate completion
      const completion = calculateProfileCompletion(updatedData);
      setCompletionData(completion);

    } catch (error) {
      console.error('💥 Error saving company data:', error);
      showAlert('error', 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file, fileType) => {
    try {
      setUploading(true);

      // Validate file
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select an image file (PNG, JPG, GIF)');
        return null;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'File size must be less than 5MB');
        return null;
      }

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const filePath = `company-${user.company_id}/branding/${fileType}/${timestamp}-${randomId}.${ext}`;



      // Upload to Supabase Storage bucket 'company-assets'
      const { data, error } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;


      showAlert('success', `${fileType === 'company_logo' ? 'Logo' : 'Banner'} uploaded successfully!`);
      return publicUrl;

    } catch (error) {
      console.error('🖼️ Error uploading file:', error);
      showAlert('error', `Failed to upload ${fileType === 'company_logo' ? 'logo' : 'banner'}: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    // Skip auto-save until initial load has populated state
    if (!isLoadedRef.current) {
      return;
    }
    if (!user?.company_id) {
      console.warn('💾 Auto-save skipped: missing company_id');
      return;
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    console.log('⏱️ Scheduling auto-save for company profile in 1s', { theme_color: companyData.theme_color, secondary_color: companyData.secondary_color });
    saveTimerRef.current = setTimeout(() => {
      saveCompanyData(companyData);
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [companyData, user?.company_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading company profile...</span>
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

      {/* Profile Completion Progress */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <p className="text-sm text-gray-600">Complete your profile to improve customer trust</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionData.percentage}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionData.percentage}%` }}
          ></div>
        </div>
        {completionData.missingSections.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            Missing: {completionData.missingSections.join(', ')}
          </div>
        )}
      </div>

      {/* Company Branding Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PhotoIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Company Branding</h3>
              <p className="text-sm text-gray-600">Your visual identity and online presence</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <CompanyAvatar
            data={companyData}
            setData={setCompanyData}
            onFileUpload={handleFileUpload}
            uploading={uploading}
            errors={errors}
          />
          {/* Branding Colors */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Brand Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={companyData.theme_color || '#3B82F6'}
                  onChange={(e) => { console.log('🎨 Primary color changed', { from: companyData.theme_color, to: e.target.value }); setCompanyData({ ...companyData, theme_color: e.target.value }); }}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={companyData.theme_color || '#3B82F6'}
                  onChange={(e) => { console.log('🎨 Primary color (text) changed', { from: companyData.theme_color, to: e.target.value }); setCompanyData({ ...companyData, theme_color: e.target.value }); }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={companyData.secondary_color || '#6B7280'}
                  onChange={(e) => { console.log('🎨 Secondary color changed', { from: companyData.secondary_color, to: e.target.value }); setCompanyData({ ...companyData, secondary_color: e.target.value }); }}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={companyData.secondary_color || '#6B7280'}
                  onChange={(e) => { console.log('🎨 Secondary color (text) changed', { from: companyData.secondary_color, to: e.target.value }); setCompanyData({ ...companyData, secondary_color: e.target.value }); }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="#6B7280"
                />
              </div>
            </div>
          </div>
          {/* Debug info for Branding Colors */}
          <div className="mt-3 text-xs text-gray-500 p-2 bg-gray-50 border rounded">
            <div><strong>Debug:</strong> company_id: {user?.company_id || 'N/A'}</div>
            <div>theme_color: {companyData.theme_color || 'unset'} | secondary_color: {companyData.secondary_color || 'unset'}</div>
            <div>loaded: {String(isLoadedRef.current)} | saving: {String(saving)} | loading: {String(loading)}</div>
          </div>

        </div>
      </div>

      {/* Contact Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PhoneIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <p className="text-sm text-gray-600">How customers can reach you</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ContactInfoCard
            data={companyData}
            setData={setCompanyData}
            errors={errors}
            formatPhoneNumber={formatPhoneNumber}
          />
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Business Location</h3>
              <p className="text-sm text-gray-600">Your service area and address</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <AddressCard
            data={companyData}
            setData={setCompanyData}
            errors={errors}
          />
        </div>
      </div>

      {/* Legal & Compliance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Legal & Compliance</h3>
              <p className="text-sm text-gray-600">Licenses, certifications, and tax information</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <LicensesCard
            data={companyData}
            setData={setCompanyData}
            errors={errors}
          />
          <TaxIdCard
            data={companyData}
            setData={setCompanyData}
            errors={errors}
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

export default CompanyProfileSettingsTab;
