import { supaFetch } from '../utils/supaFetch';
import PoPDFService from './PoPDFService';
import settingsService from './SettingsService';

export const EmailService = {
  // Send PO to vendor via email
  async sendPOToVendor(companyId, poId, options = {}) {
    try {
      // Get PO and company details
      const { po, items } = await PoPDFService.get(companyId, poId);
      const company = await settingsService.getCompanyProfile(companyId);
      const business = await settingsService.getBusinessSettings(companyId);
      const merged = { ...(business || {}), ...(company || {}) };

      if (!po.vendor_email) {
        throw new Error('Vendor email not found');
      }

      // Generate HTML content for email
      const htmlContent = PoPDFService.exportHtml(merged, po, items);

      // Email content
      const emailData = {
        to: po.vendor_email,
        cc: options.cc || [],
        bcc: options.bcc || [],
        subject: options.subject || `Purchase Order #${po.po_number} from ${merged.name || 'TradeMate Pro'}`,
        html: this.generateEmailTemplate(po, merged, options.message),
        attachments: [
          {
            filename: `PO-${po.po_number}.html`,
            content: htmlContent,
            contentType: 'text/html'
          }
        ]
      };

      // In a real implementation, you would integrate with:
      // - SendGrid, Mailgun, AWS SES, etc.
      // - Your email service provider's API

      // For now, we'll simulate the email send and log it
      await this.logEmailActivity(companyId, {
        type: 'PO_SENT',
        recipient: po.vendor_email,
        subject: emailData.subject,
        purchase_order_id: poId,
        status: 'SENT',
        sent_at: new Date().toISOString()
      });

      return {
        success: true,
        message: `PO sent to ${po.vendor_email}`,
        emailId: `email_${Date.now()}`
      };

    } catch (error) {
      console.error('Error sending PO email:', error);
      throw error;
    }
  },

  // Generate email template for PO
  generateEmailTemplate(po, company, customMessage = '') {
    const companyName = company?.name || company?.company_name || 'TradeMate Pro';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Purchase Order #${po.po_number}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 0 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .po-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Purchase Order #${po.po_number}</h2>
          <p>From: <strong>${companyName}</strong></p>
          <p>Date: ${new Date(po.created_at).toLocaleDateString()}</p>
        </div>

        <div class="content">
          <p>Dear ${po.vendor_contact || po.vendor_name},</p>

          ${customMessage ? `<p>${customMessage}</p>` : `
            <p>Please find attached our purchase order #${po.po_number} for your review and processing.</p>
          `}

          <div class="po-details">
            <h3>Order Summary</h3>
            <p><strong>PO Number:</strong> ${po.po_number}</p>
            <p><strong>Expected Date:</strong> ${po.expected_date ? new Date(po.expected_date).toLocaleDateString() : 'Not specified'}</p>
            <p><strong>Total Amount:</strong> $${Number(po.total_amount || 0).toLocaleString()}</p>
            ${po.terms ? `<p><strong>Terms:</strong> ${po.terms}</p>` : ''}
          </div>

          <p>Please confirm receipt of this purchase order and provide an estimated delivery date.</p>

          <p>If you have any questions regarding this order, please contact us at:</p>
          <ul>
            <li>Email: ${company?.email || 'info@company.com'}</li>
            <li>Phone: ${company?.phone || company?.phone_number || 'N/A'}</li>
          </ul>

          <p>Thank you for your business!</p>

          <p>Best regards,<br>
          ${companyName}<br>
          Purchasing Department</p>
        </div>

        <div class="footer">
          <p>This is an automated message from ${companyName}. Please do not reply to this email directly.</p>
        </div>
      </body>
      </html>
    `;
  },

  // Log email activity
  async logEmailActivity(companyId, activityData) {
    try {
      const logData = {
        ...activityData,
        company_id: companyId,
        created_at: new Date().toISOString()
      };

      // In a real implementation, you might have an email_logs table
      // For now, we'll use the po_status_history table to track email sends
      if (activityData.purchase_order_id) {
        await supaFetch('po_status_history', {
          method: 'POST',
          body: {
            company_id: companyId,
            purchase_order_id: activityData.purchase_order_id,
            new_status: 'SENT',
            note: `Email sent to ${activityData.recipient}`
          }
        }, companyId);
      }

      return logData;
    } catch (error) {
      console.error('Error logging email activity:', error);
      // Don't throw here - email logging failure shouldn't break the main flow
      return null;
    }
  },

  // Send approval request email
  async sendApprovalRequest(companyId, poId, approverEmail, approverName) {
    try {
      const { po } = await PoPDFService.get(companyId, poId);
      const company = await settingsService.getCompanyProfile(companyId);
      const companyName = company?.name || company?.company_name || 'TradeMate Pro';

      const emailData = {
        to: approverEmail,
        subject: `Approval Required: Purchase Order #${po.po_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>PO Approval Required</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107; }
              .content { padding: 0 20px; }
              .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 10px 5px 10px 0; }
              .button.reject { background: #dc3545; }
              .po-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>⚠️ Purchase Order Approval Required</h2>
              <p>PO #${po.po_number} requires your approval</p>
            </div>

            <div class="content">
              <p>Dear ${approverName},</p>

              <p>A purchase order requires your approval:</p>

              <div class="po-details">
                <h3>Purchase Order Details</h3>
                <p><strong>PO Number:</strong> ${po.po_number}</p>
                <p><strong>Vendor:</strong> ${po.vendor_name}</p>
                <p><strong>Total Amount:</strong> $${Number(po.total_amount || 0).toLocaleString()}</p>
                <p><strong>Expected Date:</strong> ${po.expected_date ? new Date(po.expected_date).toLocaleDateString() : 'Not specified'}</p>
                ${po.notes ? `<p><strong>Notes:</strong> ${po.notes}</p>` : ''}
              </div>

              <p>Please review and approve or reject this purchase order:</p>

              <a href="#" class="button">✅ Approve</a>
              <a href="#" class="button reject">❌ Reject</a>

              <p><small>Note: In a full implementation, these would be links to your approval system.</small></p>

              <p>Best regards,<br>
              ${companyName} System</p>
            </div>
          </body>
          </html>
        `
      };

      // Log the approval request
      await this.logEmailActivity(companyId, {
        type: 'APPROVAL_REQUEST',
        recipient: approverEmail,
        subject: emailData.subject,
        purchase_order_id: poId,
        status: 'SENT'
      });

      return {
        success: true,
        message: `Approval request sent to ${approverEmail}`
      };

    } catch (error) {
      console.error('Error sending approval request:', error);
      throw error;
    }
  },

  // Send approval notification (approved/rejected)
  async sendApprovalNotification(companyId, poId, requesterEmail, approved, comments = '') {
    try {
      const { po } = await PoPDFService.get(companyId, poId);
      const company = await settingsService.getCompanyProfile(companyId);
      const companyName = company?.name || company?.company_name || 'TradeMate Pro';

      const status = approved ? 'Approved' : 'Rejected';
      const statusColor = approved ? '#28a745' : '#dc3545';
      const statusIcon = approved ? '✅' : '❌';

      const emailData = {
        to: requesterEmail,
        subject: `PO #${po.po_number} ${status}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>PO ${status}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background: ${approved ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${statusColor}; }
              .content { padding: 0 20px; }
              .po-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${statusIcon} Purchase Order ${status}</h2>
              <p>PO #${po.po_number} has been ${status.toLowerCase()}</p>
            </div>

            <div class="content">
              <p>Your purchase order has been ${status.toLowerCase()}:</p>

              <div class="po-details">
                <h3>Purchase Order Details</h3>
                <p><strong>PO Number:</strong> ${po.po_number}</p>
                <p><strong>Vendor:</strong> ${po.vendor_name}</p>
                <p><strong>Total Amount:</strong> $${Number(po.total_amount || 0).toLocaleString()}</p>
                <p><strong>Status:</strong> ${status}</p>
                ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
              </div>

              ${approved ?
                '<p>You may now proceed with sending this purchase order to the vendor.</p>' :
                '<p>Please review the comments and make necessary adjustments before resubmitting.</p>'
              }

              <p>Best regards,<br>
              ${companyName} System</p>
            </div>
          </body>
          </html>
        `
      };

      await this.logEmailActivity(companyId, {
        type: 'APPROVAL_NOTIFICATION',
        recipient: requesterEmail,
        subject: emailData.subject,
        purchase_order_id: poId,
        status: 'SENT'
      });

      return {
        success: true,
        message: `${status} notification sent`
      };

    } catch (error) {
      console.error('Error sending approval notification:', error);
      throw error;
    }
  }
,

  // ===== Invoices =====
  async sendInvoiceEmail(companyId, invoiceId, options = {}) {
    try {
      console.log('[EmailService] sendInvoiceEmail (stub)', { companyId, invoiceId, options });
      // TODO: integrate with real provider
      window?.toast?.info?.('Invoice email queued (stub)');
      return { success: true };
    } catch (e) {
      console.warn('EmailService.sendInvoiceEmail failed (stub)', e);
      return { success: false };
    }
  },

  async sendPaymentReceipt(companyId, invoiceId, paymentId, options = {}) {
    try {
      console.log('[EmailService] sendPaymentReceipt (stub)', { companyId, invoiceId, paymentId, options });
      window?.toast?.info?.('Payment receipt email queued (stub)');
      return { success: true };
    } catch (e) {
      console.warn('EmailService.sendPaymentReceipt failed (stub)', e);
      return { success: false };
    }
  }

};
