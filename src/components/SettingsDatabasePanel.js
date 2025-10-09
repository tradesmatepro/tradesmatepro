import { useState, useEffect } from 'react';
import databaseSetupService from '../services/DatabaseSetupService';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';


// Supabase configuration
// Using supaFetch for REST calls; constants kept only if needed elsewhere in this file

const SettingsDatabasePanel = () => {
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const { user } = useUser();

  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    licenseNumber: '',
    website: '',
    taxId: ''
  });

  const [rateSettings, setRateSettings] = useState({
    defaultHourlyRate: null,
    defaultOvertimeRate: null,
    defaultTaxRate: null,
    partsMarkupPercent: null,
    laborMarkupPercentage: null,
    travelFee: null
  });

  const [businessSettings, setBusinessSettings] = useState({
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    allowTechNotes: true,
    sendAutoReminders: false,
    sendQuoteNotifications: true,
    preferredContactMethod: 'email',
    offlineModeEnabled: true,
    autoSyncEnabled: true,
    darkMode: false
  });

  const [documentSettings, setDocumentSettings] = useState({
    quoteTerms: 'Payment due within 30 days. Work to be completed as scheduled.',
    invoiceFooter: 'Thank you for your business!',
  });

  // Invoicing Settings (separate tab)
  const [invoicingSettings, setInvoicingSettings] = useState({
    defaultInvoiceTerms: 'NET_15',
    defaultInvoiceDueDays: 14
  });

  useEffect(() => {
    if (user?.company_id) {
      loadSettings();
    }
  }, [user?.company_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Use unified SettingsService to get all settings
      const companyId = user?.company_id;
      if (!companyId) {
        console.error('No company ID available for settings');
        return;
      }

      const unifiedSettings = await settingsService.getSettings(companyId);
      const businessSettings = await settingsService.getBusinessSettings(companyId);
      const invoiceConfig = await settingsService.getInvoiceConfig(companyId);

      if (unifiedSettings) {
        // Map to rate settings
        setRateSettings({
          defaultHourlyRate: unifiedSettings.default_hourly_rate || 75.0,
          defaultOvertimeRate: unifiedSettings.default_overtime_rate || 112.5,
          defaultTaxRate: unifiedSettings.default_tax_rate || 8.25,
          partsMarkupPercent: unifiedSettings.parts_markup_percent || 30.0,
          laborMarkupPercentage: unifiedSettings.labor_markup_percentage || 0,
          travelFee: unifiedSettings.travel_fee || 0
        });

        // Map to document settings
        setDocumentSettings({
          quoteTerms: unifiedSettings.quote_terms || 'Payment due within 30 days. Work to be completed as scheduled.',
          invoiceFooter: unifiedSettings.invoice_footer || 'Thank you for your business!'
        });

        // Map to invoicing settings
        setInvoicingSettings({
          defaultInvoiceTerms: invoiceConfig?.default_invoice_terms || 'NET_15',
          defaultInvoiceDueDays: typeof invoiceConfig?.default_invoice_due_days === 'number' ? invoiceConfig.default_invoice_due_days : 14
        });
      }

      if (businessSettings) {
        // Map to business settings
        setBusinessSettings({
          timezone: businessSettings.timezone || 'America/Los_Angeles',
          currency: businessSettings.currency || 'USD',
          dateFormat: businessSettings.date_format || 'MM/DD/YYYY',
          allowTechNotes: businessSettings.allow_tech_notes !== false,
          sendAutoReminders: businessSettings.send_auto_reminders || false,
          sendQuoteNotifications: businessSettings.send_quote_notifications !== false,
          preferredContactMethod: businessSettings.preferred_contact_method || 'email',
          offlineModeEnabled: businessSettings.offline_mode_enabled !== false,
          autoSyncEnabled: businessSettings.auto_sync_enabled !== false,
          darkMode: businessSettings.dark_mode || false
        });
      }

      // Load company info using unified service
      try {
        const companyProfile = await settingsService.getCompanyProfile(user?.company_id);

        if (companyProfile) {
          console.log('🏢 Company profile from unified service:', JSON.stringify(companyProfile, null, 2));

          const addressParts = [companyProfile.street_address, companyProfile.city, companyProfile.state, companyProfile.postal_code]
            .filter(part => part && part.trim());
          const fullAddress = addressParts.join(' ');

          setCompanySettings({
            companyName: companyProfile.name || '',
            companyAddress: fullAddress,
            // Individual address fields for the form
            street: companyProfile.street_address || '',
            city: companyProfile.city || '',
            state: companyProfile.state || '',
            zipCode: companyProfile.postal_code || '',
            companyPhone: companyProfile.phone || '',
            companyEmail: companyProfile.email || '',
            licenseNumber: companyProfile.license_number || '',
            website: companyProfile.website || '',
            taxId: companyProfile.tax_id || '',
            // Branding
            themeColor: companyProfile.theme_color || '#3B82F6',
            secondaryColor: companyProfile.secondary_color || '#6B7280',
            companyLogoUrl: companyProfile.logo_url || companyProfile.company_logo_url || '',
            companyBannerUrl: companyProfile.banner_url || companyProfile.company_banner_url || ''
          });
        }
      } catch (companyError) {
        console.warn('Could not load company profile:', companyError);
      }

      if (!unifiedSettings && !businessSettings) {
        console.log('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showAlert('error', 'Failed to load settings. Using defaults.');
    } finally {
      setLoading(false);
    }
  };



  const saveSettings = async () => {
    try {
      setLoading(true);
      console.log('🔧 Starting settings save...');
      console.log('Company settings:', companySettings);

      // Save settings data
      const settingsData = {
        // Rate settings
        default_hourly_rate: rateSettings.defaultHourlyRate,
        default_overtime_rate: rateSettings.defaultOvertimeRate,
        default_tax_rate: rateSettings.defaultTaxRate,
        parts_markup_percent: rateSettings.partsMarkupPercent,
        labor_markup_percentage: rateSettings.laborMarkupPercentage,
        travel_fee: rateSettings.travelFee,

        // Business settings
        timezone: businessSettings.timezone,
        currency: businessSettings.currency,
        date_format: businessSettings.dateFormat,
        allow_tech_notes: businessSettings.allowTechNotes,
        send_auto_reminders: businessSettings.sendAutoReminders,
        send_quote_notifications: businessSettings.sendQuoteNotifications,
        preferred_contact_method: businessSettings.preferredContactMethod,
        offline_mode_enabled: businessSettings.offlineModeEnabled,
        auto_sync_enabled: businessSettings.autoSyncEnabled,
        dark_mode: businessSettings.darkMode,

        // Document settings
        quote_terms: documentSettings.quoteTerms,
        invoice_footer: documentSettings.invoiceFooter,

        // Invoicing settings
        default_invoice_terms: invoicingSettings.defaultInvoiceTerms,
        default_invoice_due_days: invoicingSettings.defaultInvoiceDueDays,

        updated_at: new Date().toISOString()
      };

      // Save company data separately
      const companyData = {
        name: companySettings.companyName || '',
        phone: companySettings.companyPhone || '',
        email: companySettings.companyEmail || '',
        website: companySettings.website || '',
        license_number: companySettings.licenseNumber || '',
        tax_id: companySettings.taxId || '',
        // Branding (persist only known, safe columns)
        theme_color: companySettings.themeColor || null,
        logo_url: companySettings.companyLogoUrl || null
      };

      // Use individual address fields from the form
      companyData.street_address = companySettings.street || '';
      companyData.city = companySettings.city || '';
      companyData.state = companySettings.state || '';
      companyData.postal_code = companySettings.zipCode || '';

      console.log('🏠 Address being saved:', {
        input: companySettings.companyAddress,
        street_address: companyData.street_address,
        city: companyData.city,
        state: companyData.state,
        postal_code: companyData.postal_code
      });


      // Save settings
      const companyId = user?.company_id;
      if (!companyId) {
        console.error('No company ID available for saving settings');
        return;
      }

      const checkSettingsResponse = await supaFetch(`settings?select=id&limit=1`, { method: 'GET' }, companyId);

      let settingsResponse;
      if (checkSettingsResponse.ok) {
        const existing = await checkSettingsResponse.json();
        if (existing.length > 0) {
          // Update existing settings
          settingsResponse = await supaFetch(`settings?id=eq.${existing[0].id}`, {
            method: 'PATCH',
            body: settingsData
          }, companyId);
        } else {
          // Create new settings
          settingsResponse = await supaFetch(`settings`, {
            method: 'POST',
            body: {
              ...settingsData,
              created_at: new Date().toISOString()
            }
          }, companyId);
        }
      }

      // Save company info
      const checkCompanyResponse = await supaFetch(`companies?select=id&limit=1`, { method: 'GET' }, companyId);


      let companyResponse;
      if (checkCompanyResponse.ok) {
        const existingCompany = await checkCompanyResponse.json();
        console.log('🏢 Existing company:', existingCompany);
        if (existingCompany.length > 0) {
          // Update existing company
          console.log('📝 Updating company with ID:', existingCompany[0].id);
          companyResponse = await supaFetch(`companies?id=eq.${existingCompany[0].id}`, {
            method: 'PATCH',
            body: companyData
          }, companyId);

          if (!companyResponse.ok) {
            const errorText = await companyResponse.text();
            console.error('❌ Company update failed:', companyResponse.status, errorText);
          }
        } else {
          // Create new company
          companyResponse = await supaFetch(`companies`, {
            method: 'POST',
            body: {
              ...companyData,
              created_at: new Date().toISOString()
            }
          }, companyId);
        }
      }

      // Check results and show appropriate message
      const settingsOk = settingsResponse?.ok;
      const companyOk = companyResponse?.ok;

      if (settingsOk && companyOk) {
        showAlert('success', 'Settings saved successfully!');
      } else if (settingsOk && !companyOk) {
        showAlert('warning', 'Settings saved, but company info failed to save. Please try again.');
      } else if (!settingsOk && companyOk) {
        showAlert('warning', 'Company info saved, but settings failed to save. Please try again.');
      } else {
        throw new Error('Failed to save settings and company info');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Get current settings for use in quotes
  const getCurrentSettings = () => ({
    ...companySettings,
    ...rateSettings,
    ...businessSettings,
    ...documentSettings
  });

  return {
    loading,
    alert,
    companySettings,
    rateSettings,
    businessSettings,
    documentSettings,
    invoicingSettings,
    setCompanySettings,
    setRateSettings,
    setBusinessSettings,
    setDocumentSettings,
    setInvoicingSettings,
    saveSettings,
    getCurrentSettings
  };
};

export default SettingsDatabasePanel;
