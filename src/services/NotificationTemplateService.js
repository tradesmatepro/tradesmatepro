// Notification Template Service for TradeMate Pro
// Handles email and SMS templates with feature flags

import settingsService from './SettingsService';

class NotificationTemplateService {
  constructor() {
    this.templateCache = new Map();
  }

  // Check if email notifications are enabled
  async isEmailEnabled(companyId) {
    try {
      const settings = await settingsService.getSettings(companyId);
      return settings?.email_notifications_enabled !== false && 
             settings?.send_quote_notifications !== false;
    } catch (error) {
      console.warn('Failed to check email settings:', error);
      return false;
    }
  }

  // Check if SMS notifications are enabled
  async isSmsEnabled(companyId) {
    try {
      const settings = await settingsService.getSettings(companyId);
      return settings?.sms_notifications_enabled === true;
    } catch (error) {
      console.warn('Failed to check SMS settings:', error);
      return false;
    }
  }

  // Get company branding info for templates
  async getCompanyBranding(companyId) {
    try {
      const settings = await settingsService.getSettings(companyId);
      return {
        name: settings?.company_name || 'TradeMate Pro',
        logo: settings?.company_logo || null,
        phone: settings?.phone || null,
        email: settings?.email || null,
        website: settings?.website || null,
        address: settings?.address || null
      };
    } catch (error) {
      console.warn('Failed to get company branding:', error);
      return { name: 'TradeMate Pro' };
    }
  }

  // Email Templates
  async generateEmailTemplate(companyId, templateType, data) {
    if (!(await this.isEmailEnabled(companyId))) {
      return null;
    }

    const branding = await this.getCompanyBranding(companyId);
    
    switch (templateType) {
      case 'QUOTE_SENT':
        return this.generateQuoteSentEmail(branding, data);
      case 'QUOTE_APPROVED':
        return this.generateQuoteApprovedEmail(branding, data);
      case 'APPOINTMENT_REMINDER':
        return this.generateAppointmentReminderEmail(branding, data);
      case 'INVOICE_OVERDUE':
        return this.generateInvoiceOverdueEmail(branding, data);
      case 'PAYMENT_RECEIVED':
        return this.generatePaymentReceivedEmail(branding, data);
      case 'WORK_COMPLETED':
        return this.generateWorkCompletedEmail(branding, data);
      default:
        return null;
    }
  }

  // SMS Templates
  async generateSmsTemplate(companyId, templateType, data) {
    if (!(await this.isSmsEnabled(companyId))) {
      return null;
    }

    const branding = await this.getCompanyBranding(companyId);
    
    switch (templateType) {
      case 'APPOINTMENT_REMINDER':
        return this.generateAppointmentReminderSms(branding, data);
      case 'QUOTE_APPROVED':
        return this.generateQuoteApprovedSms(branding, data);
      case 'URGENT_UPDATE':
        return this.generateUrgentUpdateSms(branding, data);
      default:
        return null;
    }
  }

  // Email Template Generators
  generateQuoteSentEmail(branding, { quote, customer }) {
    return {
      subject: `Quote #${quote.quote_number} from ${branding.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>${branding.name}</h1>
            <h2>Your Quote is Ready!</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${customer.name || 'Valued Customer'},</p>
            <p>We've prepared a quote for your project. Please review the details below:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>Quote #${quote.quote_number}</h3>
              <p><strong>Total Amount:</strong> $${quote.total_amount}</p>
              <p><strong>Valid Until:</strong> ${quote.expires_date}</p>
            </div>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>${branding.name}</p>
            ${branding.phone ? `<p>Phone: ${branding.phone}</p>` : ''}
            ${branding.email ? `<p>Email: ${branding.email}</p>` : ''}
          </div>
        </div>
      `,
      text: `Quote #${quote.quote_number} from ${branding.name}\n\nDear ${customer.name},\n\nYour quote is ready for $${quote.total_amount}. Valid until ${quote.expires_date}.\n\nContact us with any questions.\n\nBest regards,\n${branding.name}`
    };
  }

  generateQuoteApprovedEmail(branding, { quote, customer }) {
    return {
      subject: `Quote Approved - Thank You! - ${branding.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center;">
            <h1>${branding.name}</h1>
            <h2>🎉 Quote Approved!</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${customer.name || 'Valued Customer'},</p>
            <p>Thank you for approving quote #${quote.quote_number}! We're excited to work with you.</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>Next Steps:</h3>
              <ul>
                <li>We'll schedule your project within 2 business days</li>
                <li>You'll receive a confirmation with appointment details</li>
                <li>Our team will contact you to coordinate timing</li>
              </ul>
            </div>
            <p>We appreciate your business and look forward to exceeding your expectations!</p>
            <p>Best regards,<br>${branding.name}</p>
          </div>
        </div>
      `,
      text: `Quote Approved - Thank You!\n\nDear ${customer.name},\n\nThank you for approving quote #${quote.quote_number}! We'll schedule your project within 2 business days.\n\nBest regards,\n${branding.name}`
    };
  }

  generateAppointmentReminderEmail(branding, { appointment, customer }) {
    return {
      subject: `Appointment Reminder - ${branding.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 20px; text-align: center;">
            <h1>${branding.name}</h1>
            <h2>⏰ Appointment Reminder</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${customer.name || 'Valued Customer'},</p>
            <p>This is a friendly reminder about your upcoming appointment:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>Appointment Details</h3>
              <p><strong>Date:</strong> ${appointment.scheduled_date}</p>
              <p><strong>Time:</strong> ${appointment.scheduled_time}</p>
              <p><strong>Service:</strong> ${appointment.service_description}</p>
              ${appointment.address ? `<p><strong>Location:</strong> ${appointment.address}</p>` : ''}
            </div>
            <p>Please ensure someone is available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
            <p>Best regards,<br>${branding.name}</p>
            ${branding.phone ? `<p>Phone: ${branding.phone}</p>` : ''}
          </div>
        </div>
      `,
      text: `Appointment Reminder from ${branding.name}\n\nDear ${customer.name},\n\nReminder: ${appointment.scheduled_date} at ${appointment.scheduled_time}\nService: ${appointment.service_description}\n\nContact us to reschedule if needed.\n\nBest regards,\n${branding.name}`
    };
  }

  generateInvoiceOverdueEmail(branding, { invoice, customer }) {
    return {
      subject: `Payment Reminder - Invoice #${invoice.invoice_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 20px; text-align: center;">
            <h1>${branding.name}</h1>
            <h2>Payment Reminder</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${customer.name || 'Valued Customer'},</p>
            <p>We hope you're satisfied with our recent work. This is a friendly reminder that payment for the following invoice is now overdue:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f44336;">
              <h3>Invoice #${invoice.invoice_number}</h3>
              <p><strong>Amount Due:</strong> $${invoice.total_amount}</p>
              <p><strong>Due Date:</strong> ${invoice.due_date}</p>
              <p><strong>Days Overdue:</strong> ${Math.ceil((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))}</p>
            </div>
            <p>Please remit payment at your earliest convenience. If you have any questions or concerns, please contact us immediately.</p>
            <p>Thank you for your prompt attention to this matter.</p>
            <p>Best regards,<br>${branding.name}</p>
          </div>
        </div>
      `,
      text: `Payment Reminder - Invoice #${invoice.invoice_number}\n\nDear ${customer.name},\n\nYour payment of $${invoice.total_amount} is now overdue (due ${invoice.due_date}).\n\nPlease remit payment or contact us with any questions.\n\nBest regards,\n${branding.name}`
    };
  }

  generatePaymentReceivedEmail(branding, { payment, invoice, customer }) {
    return {
      subject: `Payment Received - Thank You! - ${branding.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center;">
            <h1>${branding.name}</h1>
            <h2>✅ Payment Received</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${customer.name || 'Valued Customer'},</p>
            <p>Thank you! We've received your payment for invoice #${invoice.invoice_number}.</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>Payment Details</h3>
              <p><strong>Amount:</strong> $${payment.amount}</p>
              <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Transaction ID:</strong> ${payment.transaction_id || 'N/A'}</p>
            </div>
            <p>Your account is now current. We appreciate your business and look forward to serving you again!</p>
            <p>Best regards,<br>${branding.name}</p>
          </div>
        </div>
      `,
      text: `Payment Received - Thank You!\n\nDear ${customer.name},\n\nWe've received your payment of $${payment.amount} for invoice #${invoice.invoice_number}.\n\nThank you for your business!\n\nBest regards,\n${branding.name}`
    };
  }

  generateWorkCompletedEmail(branding, { workOrder, customer }) {
    return {
      subject: `Work Completed - ${branding.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 20px; text-align: center;">
            <h1>${branding.name}</h1>
            <h2>🔧 Work Completed</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p>Dear ${customer.name || 'Valued Customer'},</p>
            <p>We're pleased to inform you that your work order has been completed!</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>Work Order #${workOrder.id}</h3>
              <p><strong>Service:</strong> ${workOrder.title || workOrder.description}</p>
              <p><strong>Completed:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>We hope you're satisfied with our work. If you have any questions or concerns, please don't hesitate to contact us.</p>
            <p>Thank you for choosing ${branding.name}!</p>
            <p>Best regards,<br>${branding.name}</p>
          </div>
        </div>
      `,
      text: `Work Completed - ${branding.name}\n\nDear ${customer.name},\n\nYour work order #${workOrder.id} has been completed.\n\nThank you for choosing ${branding.name}!\n\nBest regards,\n${branding.name}`
    };
  }

  // SMS Template Generators
  generateAppointmentReminderSms(branding, { appointment, customer }) {
    return {
      message: `${branding.name}: Reminder - Your appointment is ${appointment.scheduled_date} at ${appointment.scheduled_time}. ${appointment.service_description}. Call ${branding.phone || 'us'} to reschedule if needed.`
    };
  }

  generateQuoteApprovedSms(branding, { quote, customer }) {
    return {
      message: `${branding.name}: Thank you for approving quote #${quote.quote_number}! We'll schedule your project within 2 business days. Questions? Call ${branding.phone || 'us'}.`
    };
  }

  generateUrgentUpdateSms(branding, { message, customer }) {
    return {
      message: `${branding.name} URGENT: ${message}. Please call ${branding.phone || 'us'} immediately.`
    };
  }

  // Send email (integration point)
  async sendEmail(companyId, templateType, data, recipient) {
    const template = await this.generateEmailTemplate(companyId, templateType, data);
    if (!template) return null;

    // TODO: Integrate with actual email service (SendGrid, Mailgun, etc.)
    console.log('📧 Email would be sent:', {
      to: recipient,
      subject: template.subject,
      html: template.html
    });

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      template: templateType
    };
  }

  // Send SMS (integration point)
  async sendSms(companyId, templateType, data, recipient) {
    const template = await this.generateSmsTemplate(companyId, templateType, data);
    if (!template) return null;

    // TODO: Integrate with actual SMS service (Twilio, etc.)
    console.log('📱 SMS would be sent:', {
      to: recipient,
      message: template.message
    });

    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      template: templateType
    };
  }
}

const notificationTemplateService = new NotificationTemplateService();
export default notificationTemplateService;
