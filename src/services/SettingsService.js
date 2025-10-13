// Settings Service for TradeMate Pro
// Provides centralized access to company settings, rates, and configurations
// Updated to use proper Supabase client with user authentication (industry standard)

import { supabase } from '../utils/supabaseClient';

class SettingsService {
  constructor() {
    this.cachedBusinessSettings = null;
    this.cachedCompanyProfile = null;
    this.cachedIntegrations = null;
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Unified update entrypoint used by multiple Settings tabs (Notifications, Invoicing UI, etc.)
  // Routes fields to the correct tables and creates settings rows if missing.
  async updateSettings(companyId, updates) {
    try {
      if (!companyId) throw new Error('Missing companyId');

      // 1) Split updates into companies vs settings
      const companyUpdates = {};
      const businessUpdates = { ...updates };

      // Map known company-level fields used by invoicing
      if (Object.prototype.hasOwnProperty.call(businessUpdates, 'invoice_number_prefix')) {
        companyUpdates.invoice_prefix = businessUpdates.invoice_number_prefix;
        delete businessUpdates.invoice_number_prefix;
      }
      if (Object.prototype.hasOwnProperty.call(businessUpdates, 'next_invoice_number')) {
        companyUpdates.invoice_start_number = businessUpdates.next_invoice_number;
        delete businessUpdates.next_invoice_number;
      }

      // Map timezone to companies table (needed for smart scheduling)
      if (Object.prototype.hasOwnProperty.call(businessUpdates, 'timezone')) {
        companyUpdates.timezone = businessUpdates.timezone;
        delete businessUpdates.timezone;
      }

      // 2) If any company-level fields present, update companies table
      if (Object.keys(companyUpdates).length > 0) {
        const { error: compErr } = await supabase
          .from('companies')
          .update({ ...companyUpdates, updated_at: new Date().toISOString() })
          .eq('id', companyId);
        if (compErr) {
          console.warn('⚠️ updateSettings: companies update failed', compErr);
        }
      }

      // 3) Ensure settings row exists
      let { data: existing, error: selErr } = await supabase
        .from('settings')
        .select('company_id')
        .eq('company_id', companyId)
        .limit(1);
      if (selErr) {
        console.warn('⚠️ updateSettings: settings existence check failed', selErr);
      }

      if (!existing || existing.length === 0) {
        // Insert a new row (empty) to upsert settings into
        const { error: insErr } = await supabase
          .from('settings')
          .insert({ company_id: companyId, created_at: new Date().toISOString() });
        if (insErr) {
          console.warn('⚠️ updateSettings: failed to insert settings shell row', insErr);
        }
      }

      // 4) Update settings with remaining fields
      if (Object.keys(businessUpdates).length > 0) {
        const { error: updErr } = await supabase
          .from('settings')
          .update({ ...businessUpdates, updated_at: new Date().toISOString() })
          .eq('company_id', companyId);
        if (updErr) {
          console.error('❌ updateSettings: settings update failed', updErr);
          return false;
        }
      }

      // Clear caches so subsequent loads reflect new values
      this.clearCache();
      return true;
    } catch (e) {
      console.error('❌ updateSettings failed:', e);
      return false;
    }
  }

  // Get business settings from company_settings table (following locked schema)
  async getBusinessSettings(companyId) {
    const now = Date.now();

    // Return cached settings if still valid
    if (
      this.cachedBusinessSettings &&
      this.cachedBusinessSettings.company_id === companyId &&
      this.lastFetch &&
      now - this.lastFetch < this.cacheTimeout
    ) {
      return this.cachedBusinessSettings;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('company_id', companyId)
        .limit(1);

      if (error) {
        console.error('Error fetching business settings:', error);
        return null;
      }

      if (data && data.length > 0) {
        this.cachedBusinessSettings = data[0];
        this.lastFetch = now;
        return this.cachedBusinessSettings;
      }
    } catch (error) {
      console.error('Error fetching business settings:', error);
      return null;
    }

    // No settings found
    return null;
  }

  // Get company profile from companies table
  async getCompanyProfile(companyId) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .limit(1);

      if (error) {
        console.error('Error fetching company profile:', error);
        return null;
      }

      if (data && data.length > 0) {
        return data[0];
      }

      return data;
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return null;
    }
  }

  // Get integrations - temporarily return empty array since integration_settings table doesn't exist in locked schema
  async getIntegrations(companyId) {
    try {
      // TODO: Add integrations support to company_settings table or create separate table
      console.log('⚠️ Integrations not implemented yet - returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }

  // Legacy method for backward compatibility - combines all settings
  async getSettings(companyId) {
    try {
      const businessSettings = await this.getBusinessSettings(companyId);
      const companyProfile = await this.getCompanyProfile(companyId);
      const integrations = await this.getIntegrations(companyId);

      return {
        businessSettings,
        companyProfile,
        integrations,
        // Legacy compatibility
        ...businessSettings,
        company: companyProfile
      };
    } catch (error) {
      console.error('Error getting combined settings:', error);
      return {
        businessSettings: null,
        companyProfile: null,
        integrations: [],
        company: null
      };
    }
  }

  // Update business settings (settings table, creates row if missing)
  async updateBusinessSettings(companyId, updates) {
    try {
      // Ensure a settings row exists for this company
      const { data: existing, error: selErr } = await supabase
        .from('settings')
        .select('company_id')
        .eq('company_id', companyId)
        .limit(1);
      if (selErr) {
        console.warn('⚠️ updateBusinessSettings: settings existence check failed', selErr);
      }

      if (!existing || existing.length === 0) {
        const { error: insErr } = await supabase
          .from('settings')
          .insert({ company_id: companyId, created_at: new Date().toISOString() });
        if (insErr) {
          console.warn('⚠️ updateBusinessSettings: failed to insert settings shell row', insErr);
        }
      }

      const { data, error } = await supabase
        .from('settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating business settings:', error);
        return false;
      }

      // Update cache
      this.cachedBusinessSettings = data;
      this.lastFetch = Date.now();
      return true;
    } catch (error) {
      console.error('Error updating business settings:', error);
      return false;
    }
  }

  // Update company profile
  async updateCompanyProfile(companyId, updates) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating company profile:', error);
        return false;
      }

      // Update cache
      this.cachedCompanyProfile = data;
      return true;
    } catch (error) {
      console.error('Error updating company profile:', error);
      return false;
    }
  }

  // Add or update integration setting - temporarily disabled since integration_settings table doesn't exist
  async updateIntegrationSetting(companyId, serviceName, config) {
    try {
      // TODO: Add integrations support to company_settings table or create separate table
      console.log('⚠️ Integration settings not implemented yet - returning false');
      return false;
    } catch (error) {
      console.error('Error updating integration setting:', error);
      return false;
    }
  }

  // Get invoice configuration (combines business settings and company profile for invoicing)
  async getInvoiceConfig(companyId) {
    try {
      const [businessSettings, companyProfile] = await Promise.all([
        this.getBusinessSettings(companyId),
        this.getCompanyProfile(companyId)
      ]);

      // Return invoice-specific configuration
      return {
        // Invoice numbering
        invoicePrefix: companyProfile?.invoice_prefix || 'INV',
        invoiceStartNumber: companyProfile?.invoice_start_number || 1,

        // Company details for invoice header
        companyName: companyProfile?.name || 'Your Company',
        companyAddress: companyProfile?.address || '',
        companyCity: companyProfile?.city || '',
        companyState: companyProfile?.state || '',
        companyZip: companyProfile?.zip_code || '',
        companyPhone: companyProfile?.phone || '',
        companyEmail: companyProfile?.email || '',

        // Invoice settings from business settings
        defaultPaymentTerms: businessSettings?.default_payment_terms || 'Net 30',
        taxRate: businessSettings?.tax_rate || 0,
        lateFeeRate: businessSettings?.late_fee_rate || 0,

        // Invoice template settings
        showLogo: businessSettings?.show_logo_on_invoices !== false,
        showNotes: businessSettings?.show_notes_on_invoices !== false,
        showTerms: businessSettings?.show_terms_on_invoices !== false,

        // Default invoice notes and terms
        defaultNotes: businessSettings?.default_invoice_notes || '',
        defaultTerms: businessSettings?.default_invoice_terms || 'Payment is due within 30 days of invoice date.',

        // Currency and formatting
        currency: businessSettings?.currency || 'USD',
        currencySymbol: businessSettings?.currency_symbol || '$'
      };
    } catch (error) {
      console.error('Error fetching invoice config:', error);
      // Return safe defaults
      return {
        invoicePrefix: 'INV',
        invoiceStartNumber: 1,
        companyName: 'Your Company',
        companyAddress: '',
        companyCity: '',
        companyState: '',
        companyZip: '',
        companyPhone: '',
        companyEmail: '',
        defaultPaymentTerms: 'Net 30',
        taxRate: 0,
        lateFeeRate: 0,
        showLogo: true,
        showNotes: true,
        showTerms: true,
        defaultNotes: '',
        defaultTerms: 'Payment is due within 30 days of invoice date.',
        currency: 'USD',
        currencySymbol: '$'
      };
    }
  }

  // Get rates and pricing settings (industry standard - uses rate_cards table)
  async getRatesPricingSettings(companyId) {
    try {
      console.log('🚀🚀🚀 NEW CODE RUNNING - TIMESTAMP: ' + new Date().toISOString() + ' 🚀🚀🚀');
      console.log('🔧 Loading rates from rate_cards table (industry standard like Jobber/ServiceTitan)...');

      // STEP 1: Load from rate_cards table (exists in locked schema)
      const today = new Date().toISOString().split('T')[0];
      const { data: rateCards, error: rateError } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .lte('effective_date', today)
        .or(`expiration_date.is.null,expiration_date.gte.${today}`)
        .order('effective_date', { ascending: false });

      if (rateError && rateError.code !== 'PGRST116') {
        console.warn('⚠️ Error fetching rate_cards:', rateError);
      }

      // STEP 2: If rate cards exist, use them (industry standard)
      if (rateCards && rateCards.length > 0) {
        console.log('✅ Using rate_cards table (industry standard)');
        const primaryCard = rateCards[0]; // Most recent active card

        return {
          rateCards: rateCards,
          laborRates: {
            standard: parseFloat(primaryCard.base_rate),
            overtime: parseFloat(primaryCard.base_rate) * parseFloat(primaryCard.overtime_multiplier || 1.5),
            emergency: parseFloat(primaryCard.base_rate) * parseFloat(primaryCard.emergency_multiplier || 2.0),
            weekend: parseFloat(primaryCard.base_rate) * parseFloat(primaryCard.weekend_multiplier || 1.25),
            holiday: parseFloat(primaryCard.base_rate) * parseFloat(primaryCard.holiday_multiplier || 1.5)
          },
          markupPercentages: {
            materials: 25,  // TODO: Add to company_settings or rate_cards
            subcontractor: 15
          },
          taxRate: 8.25,  // TODO: Get from company_settings
          travelChargePerMile: 0.65,
          minimumTravelCharge: 25.00,
          cancellationFee: 50.00
        };
      }

      // STEP 3: Fallback to settings (legacy compatibility)
      console.log('⚠️ No rate_cards found, falling back to settings');
      const { data: appSettings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.warn('⚠️ Error fetching settings:', settingsError);
      }

      // STEP 4: Extract rates from settings (legacy compatibility)
      const laborRate = parseFloat(appSettings?.labor_rate || 75);
      const overtimeMultiplier = parseFloat(appSettings?.overtime_multiplier || 1.5);
      const partsMarkup = parseFloat(appSettings?.parts_markup || 25);
      const emergencyMultiplier = parseFloat(appSettings?.emergency_rate_multiplier || 1.5);
      const travelCharge = parseFloat(appSettings?.travel_charge_per_mile || 0.65);
      const minTravel = parseFloat(appSettings?.minimum_travel_charge || 25.00);
      const cancelFee = parseFloat(appSettings?.cancellation_fee || 50.00);
      const taxRate = parseFloat(appSettings?.default_tax_rate || 8.25);

      console.log('✅ Loaded rates from settings:', {
        laborRate,
        overtimeMultiplier,
        partsMarkup,
        taxRate
      });

      return {
        rateCards: [],
        laborRates: {
          standard: laborRate,
          overtime: laborRate * overtimeMultiplier,
          emergency: laborRate * emergencyMultiplier,
          weekend: laborRate * 1.25,  // 25% weekend premium
          holiday: laborRate * 1.5     // 50% holiday premium
        },
        markupPercentages: {
          materials: partsMarkup,
          subcontractor: 15  // Default for subcontractor markup
        },
        taxRate: taxRate,
        travelChargePerMile: travelCharge,
        minimumTravelCharge: minTravel,
        cancellationFee: cancelFee,
        emergencyRateMultiplier: emergencyMultiplier
      };
    } catch (error) {
      console.error('❌ Error fetching rates pricing settings:', error);
      // Return safe defaults on error
      return {
        rateCards: [],
        laborRates: {
          standard: 75,
          overtime: 112.5,
          emergency: 150,
          weekend: 93.75,
          holiday: 112.5
        },
        markupPercentages: {
          materials: 25,
          subcontractor: 15
        },
        taxRate: 8.25,
        travelChargePerMile: 0.65,
        minimumTravelCharge: 25.00,
        cancellationFee: 50.00,
        emergencyRateMultiplier: 1.5
      };
    }
  }

  // Get next invoice number (from companies table)
  async getNextInvoiceNumber(companyId) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('invoice_start_number, invoice_prefix')
        .eq('id', companyId)
        .single();

      if (error) {
        console.error('Error fetching invoice number:', error);
        return { number: 1, prefix: 'INV' };
      }

      // For now, return the start number (in production, you'd track the current number)
      return {
        number: data.invoice_start_number || 1,
        prefix: data.invoice_prefix || 'INV'
      };
    } catch (error) {
      console.error('Error fetching invoice number:', error);
      return { number: 1, prefix: 'INV' };
    }
  }

  // Clear cache (useful after settings updates)
  clearCache() {
    this.cachedBusinessSettings = null;
    this.cachedCompanyProfile = null;
    this.cachedIntegrations = null;
    this.lastFetch = null;
  }

  // Refresh settings from database
  async refreshSettings(companyId) {
    this.clearCache();
    return await this.getSettings(companyId);
  }
}

// Export singleton instance
const settingsService = new SettingsService();
export default settingsService;
