import { supaFetch } from '../utils/supaFetch';

/**
 * Purchase Order Settings Service
 * Handles PO-specific settings including numbering, approval workflows, and defaults
 */
class POSettingsService {
  
  /**
   * Get PO settings for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} PO settings object
   */
  async getPOSettings(companyId) {
    try {
      // Load from canonical settings table
      const businessRes = await supaFetch(
        `settings?company_id=eq.${companyId}&select=*`,
        { method: 'GET' },
        companyId
      );

      if (businessRes.ok) {
        const [settings] = await businessRes.json();
        if (settings) {
          return this.formatPOSettings(settings);
        }
      }

      // Return defaults if no settings found
      console.log('⚠️ No company_settings found, using defaults');
      return this.getDefaultPOSettings();
    } catch (error) {
      console.error('Error getting PO settings:', error);
      return this.getDefaultPOSettings();
    }
  }

  /**
   * Update PO settings for a company
   * @param {string} companyId - Company ID
   * @param {Object} settings - Settings to update
   * @returns {Promise<boolean>} Success status
   */
  async updatePOSettings(companyId, settings) {
    try {
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

      // Ensure settings row exists
      const existsRes = await supaFetch(
        `settings?company_id=eq.${companyId}&select=company_id`,
        { method: 'GET' },
        companyId
      );
      if (existsRes.ok) {
        const arr = await existsRes.json();
        if (!arr || arr.length === 0) {
          await supaFetch(
            `settings`,
            { method: 'POST', body: { company_id: companyId, created_at: new Date().toISOString() } },
            companyId
          );
        }
      }

      // Update canonical settings
      const businessRes = await supaFetch(
        `settings?company_id=eq.${companyId}`,
        {
          method: 'PATCH',
          body: updateData
        },
        companyId
      );

      return businessRes.ok;
    } catch (error) {
      console.error('Error updating PO settings:', error);
      return false;
    }
  }

  /**
   * Generate next PO number
   * @param {string} companyId - Company ID
   * @returns {Promise<string>} Generated PO number
   */
  async generatePONumber(companyId) {
    try {
      const settings = await this.getPOSettings(companyId);
      
      if (!settings.po_auto_numbering) {
        return `${settings.po_number_prefix}MANUAL`;
      }

      const year = new Date().getFullYear();
      const paddedNumber = String(settings.next_po_number).padStart(4, '0');
      const poNumber = `${settings.po_number_prefix}${year}-${paddedNumber}`;

      // Increment the next PO number
      await this.updatePOSettings(companyId, {
        ...settings,
        next_po_number: settings.next_po_number + 1
      });

      return poNumber;
    } catch (error) {
      console.error('Error generating PO number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-6);
      return `PO-${new Date().getFullYear()}-${timestamp}`;
    }
  }

  /**
   * Check if PO requires approval
   * @param {string} companyId - Company ID
   * @param {number} amount - PO total amount
   * @returns {Promise<boolean>} Whether approval is required
   */
  async requiresApproval(companyId, amount) {
    try {
      const settings = await this.getPOSettings(companyId);
      return settings.po_require_approval && amount >= settings.po_approval_threshold;
    } catch (error) {
      console.error('Error checking approval requirement:', error);
      return false;
    }
  }

  /**
   * Get available payment terms
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} Array of payment terms
   */
  async getPaymentTermsOptions(companyId) {
    try {
      const settings = await this.getPOSettings(companyId);
      return settings.po_payment_terms_options || this.getDefaultPaymentTerms();
    } catch (error) {
      console.error('Error getting payment terms:', error);
      return this.getDefaultPaymentTerms();
    }
  }

  /**
   * Format PO settings from database record
   * @param {Object} settings - Raw settings from database
   * @param {boolean} isLegacy - Whether this is from legacy settings table
   * @returns {Object} Formatted PO settings
   */
  formatPOSettings(settings, isLegacy = false) {
    if (isLegacy) {
      // Legacy settings table has limited PO fields
      return {
        po_number_prefix: settings.po_number_prefix || 'PO-',
        next_po_number: settings.next_po_number || 1001,
        po_auto_numbering: true,
        po_require_approval: settings.po_require_approval || false,
        po_approval_threshold: settings.po_approval_threshold || 1000.00,
        po_default_terms: settings.po_default_terms || 'NET_30',
        ...this.getDefaultPOSettings()
      };
    }

    return {
      po_number_prefix: settings.po_number_prefix || 'PO-',
      next_po_number: settings.next_po_number || 1001,
      po_auto_numbering: settings.po_auto_numbering ?? true,
      po_require_approval: settings.po_require_approval ?? false,
      po_approval_threshold: settings.po_approval_threshold || 1000.00,
      po_default_terms: settings.po_default_terms || 'NET_30',
      po_auto_send_to_vendor: settings.po_auto_send_to_vendor ?? false,
      po_require_receipt_confirmation: settings.po_require_receipt_confirmation ?? true,
      po_allow_partial_receiving: settings.po_allow_partial_receiving ?? true,
      po_default_shipping_method: settings.po_default_shipping_method || 'STANDARD',
      po_tax_calculation_method: settings.po_tax_calculation_method || 'AUTOMATIC',
      po_currency: settings.po_currency || 'USD',
      po_payment_terms_options: settings.po_payment_terms_options || this.getDefaultPaymentTerms(),
      po_default_notes: settings.po_default_notes || '',
      po_footer_text: settings.po_footer_text || '',
      po_email_template: settings.po_email_template || 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
      po_reminder_days: settings.po_reminder_days || 7,
      po_overdue_notification_days: settings.po_overdue_notification_days || 14
    };
  }

  /**
   * Get default PO settings
   * @returns {Object} Default PO settings
   */
  getDefaultPOSettings() {
    return {
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
      po_payment_terms_options: this.getDefaultPaymentTerms(),
      po_default_notes: '',
      po_footer_text: '',
      po_email_template: 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
      po_reminder_days: 7,
      po_overdue_notification_days: 14
    };
  }

  /**
   * Get default payment terms
   * @returns {Array} Default payment terms
   */
  getDefaultPaymentTerms() {
    return ['NET_15', 'NET_30', 'NET_45', 'NET_60', 'DUE_ON_RECEIPT', '2_10_NET_30'];
  }
}

// Export singleton instance
const poSettingsService = new POSettingsService();
export default poSettingsService;
