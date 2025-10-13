// TwilioService.js - Frontend service for sending SMS via Twilio
// Security: All Twilio API calls go through Supabase Edge Function (backend)
// Credentials are NEVER exposed to the frontend

import { supabase } from '../utils/supabaseClient';

class TwilioService {
  constructor() {
    this.edgeFunctionUrl = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-sms`;
  }

  /**
   * Send SMS via Twilio (through secure Edge Function)
   * @param {string} to - Phone number in E.164 format (e.g., +15551234567)
   * @param {string} message - SMS message content
   * @param {string} companyId - Company ID for logging and rate limiting
   * @param {object} options - Optional parameters
   * @returns {Promise<object>} - Response with success status and message SID
   */
  async sendSMS(to, message, companyId, options = {}) {
    try {
      // Validate inputs
      if (!to || !message || !companyId) {
        throw new Error('Missing required parameters: to, message, companyId');
      }

      // Format phone number to E.164 if needed
      const formattedPhone = this.formatPhoneNumber(to);

      // Get current user session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: formattedPhone,
          message: message,
          companyId: companyId,
          userId: options.userId || session.user.id,
          relatedType: options.relatedType, // 'quote', 'job', 'invoice', 'custom'
          relatedId: options.relatedId
        }
      });

      if (error) {
        console.error('❌ Twilio Edge Function error:', error);
        throw new Error(error.message || 'Failed to send SMS');
      }

      if (!data.success) {
        console.error('❌ Twilio API error:', data.error);
        throw new Error(data.error || 'Failed to send SMS');
      }

      console.log('✅ SMS sent successfully:', data.messageSid);
      return {
        success: true,
        messageSid: data.messageSid,
        status: data.status,
        cost: data.cost
      };

    } catch (error) {
      console.error('❌ TwilioService.sendSMS error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send job reminder SMS to customer
   * @param {object} job - Job object with customer phone and details
   * @param {string} companyId - Company ID
   * @returns {Promise<object>} - Response with success status
   */
  async sendJobReminder(job, companyId) {
    try {
      const customerPhone = job.customer_phone || job.customers?.phone;
      if (!customerPhone) {
        throw new Error('Customer phone number not found');
      }

      const message = this.generateJobReminderMessage(job);
      
      return await this.sendSMS(customerPhone, message, companyId, {
        relatedType: 'job',
        relatedId: job.id
      });
    } catch (error) {
      console.error('❌ sendJobReminder error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send quote notification SMS to customer
   * @param {object} quote - Quote object with customer phone and details
   * @param {string} companyId - Company ID
   * @returns {Promise<object>} - Response with success status
   */
  async sendQuoteNotification(quote, companyId) {
    try {
      const customerPhone = quote.customer_phone || quote.customers?.phone;
      if (!customerPhone) {
        throw new Error('Customer phone number not found');
      }

      const message = this.generateQuoteNotificationMessage(quote);
      
      return await this.sendSMS(customerPhone, message, companyId, {
        relatedType: 'quote',
        relatedId: quote.id
      });
    } catch (error) {
      console.error('❌ sendQuoteNotification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send invoice reminder SMS to customer
   * @param {object} invoice - Invoice object with customer phone and details
   * @param {string} companyId - Company ID
   * @returns {Promise<object>} - Response with success status
   */
  async sendInvoiceReminder(invoice, companyId) {
    try {
      const customerPhone = invoice.customer_phone || invoice.customers?.phone;
      if (!customerPhone) {
        throw new Error('Customer phone number not found');
      }

      const message = this.generateInvoiceReminderMessage(invoice);
      
      return await this.sendSMS(customerPhone, message, companyId, {
        relatedType: 'invoice',
        relatedId: invoice.id
      });
    } catch (error) {
      console.error('❌ sendInvoiceReminder error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send custom SMS
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Custom message
   * @param {string} companyId - Company ID
   * @returns {Promise<object>} - Response with success status
   */
  async sendCustomSMS(phoneNumber, message, companyId) {
    return await this.sendSMS(phoneNumber, message, companyId, {
      relatedType: 'custom'
    });
  }

  // ========================================
  // MESSAGE TEMPLATES
  // ========================================

  generateJobReminderMessage(job) {
    const jobDate = new Date(job.start_time || job.scheduled_date).toLocaleDateString();
    const jobTime = new Date(job.start_time || job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `Hi! This is a reminder about your upcoming service appointment on ${jobDate} at ${jobTime}. ${job.title || 'Service call'}. We'll see you soon! Reply STOP to opt out.`;
  }

  generateQuoteNotificationMessage(quote) {
    const quoteNumber = quote.work_order_number || quote.quote_number || 'N/A';
    const amount = quote.total_amount ? `$${parseFloat(quote.total_amount).toFixed(2)}` : 'TBD';

    // Generate portal link - UPDATED to use standalone quote.html page
    const baseUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
    const portalLink = `${baseUrl}/quote.html?id=${quote.id}`;

    return `Your quote #${quoteNumber} is ready! Total: ${amount}. View and approve online: ${portalLink} Reply STOP to opt out.`;
  }

  generateInvoiceReminderMessage(invoice) {
    const invoiceNumber = invoice.invoice_number || 'N/A';
    const amount = invoice.total_amount ? `$${parseFloat(invoice.total_amount).toFixed(2)}` : 'TBD';
    const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'ASAP';
    
    return `Invoice #${invoiceNumber} is due on ${dueDate}. Amount: ${amount}. Thank you for your business! Reply STOP to opt out.`;
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Format phone number to E.164 format
   * @param {string} phone - Phone number in any format
   * @returns {string} - Phone number in E.164 format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it's a US number without country code, add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already has country code, add +
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it already starts with +, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Otherwise, assume it's already in correct format
    return `+${digits}`;
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number
   * @returns {boolean} - True if valid E.164 format
   */
  isValidPhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const formatted = this.formatPhoneNumber(phone);
    return phoneRegex.test(formatted);
  }

  /**
   * Get SMS usage statistics for a company
   * @param {string} companyId - Company ID
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<object>} - Usage statistics
   */
  async getSMSUsage(companyId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .eq('company_id', companyId)
        .eq('integration_type', 'twilio')
        .eq('action', 'send_sms')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const totalSent = data.length;
      const successful = data.filter(log => log.status === 'success').length;
      const failed = data.filter(log => log.status === 'failed').length;
      
      // Calculate total cost (if available in response_data)
      const totalCost = data.reduce((sum, log) => {
        const price = log.response_data?.price;
        return sum + (price ? parseFloat(price) : 0);
      }, 0);

      return {
        totalSent,
        successful,
        failed,
        totalCost: totalCost.toFixed(4),
        successRate: totalSent > 0 ? ((successful / totalSent) * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('❌ getSMSUsage error:', error);
      return null;
    }
  }
}

// Export singleton instance
const twilioService = new TwilioService();
export default twilioService;

