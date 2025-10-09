import { supaFetch } from '../utils/supaFetch';
import settingsService from './SettingsService';
import QuotePDFService from './QuotePDFService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getSupabaseClient } from '../utils/supabaseClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';


/**
 * QuoteSendingService - Handles sending quotes to customers
 * Industry Standard: Jobber, ServiceTitan, Housecall Pro
 *
 * Features:
 * - Email sending via Resend
 * - SMS sending via Twilio (placeholder)
 * - Customer portal magic links
 * - Email tracking (opens, clicks, bounces)
 * - Quote approval with e-signature
 * - Request changes functionality
 */

const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY || 're_a7hbhZUG_8hQoDfPGZsHmgDHUjmgEvt1t';
const RESEND_API_URL = 'https://api.resend.com/emails';
// Use production URL if available, otherwise fall back to localhost for development
const PORTAL_BASE_URL = process.env.REACT_APP_PUBLIC_URL
  ? `${process.env.REACT_APP_PUBLIC_URL}/portal/quote/view`
  : process.env.REACT_APP_PORTAL_URL || 'http://localhost:3000/portal/quote/view';

class QuoteSendingService {
  /**
   * Generate a secure portal token for magic link access
   */
  generatePortalToken() {
    // Generate cryptographically secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate portal link for customer to view/approve quote
   */
  async generatePortalLink(companyId, quoteId) {
    try {
      // Generate secure token
      const token = this.generatePortalToken();

      // Set expiration to 24 hours from now (Jobber standard)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Update quote with portal token
      await supaFetch(
        `work_orders?id=eq.${quoteId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portal_token: token,
            portal_link_expires_at: expiresAt.toISOString()
          })
        },
        companyId
      );

      // Return portal URL
      return `${PORTAL_BASE_URL}/${token}`;
    } catch (error) {
      console.error('Failed to generate portal link:', error);
      throw new Error('Failed to generate portal link');
    }
  }

  /**
   * Send quote via email using Resend
   */
  async sendQuoteEmail(companyId, quoteId, options = {}) {
    try {
      console.log('📧 Sending quote email:', { companyId, quoteId, options });

      // Get quote data (fetch and parse JSON; no joins)
      const quoteResponse = await supaFetch(
        `work_orders?id=eq.${quoteId}`,
        { method: 'GET' },
        companyId
      );
      console.log('📧 Quote response:', { ok: quoteResponse.ok, status: quoteResponse.status });
      if (!quoteResponse.ok) {
        throw new Error(`Failed to fetch quote: ${quoteResponse.status} ${quoteResponse.statusText}`);
      }
      const quoteRows = await quoteResponse.json();
      if (!Array.isArray(quoteRows) || quoteRows.length === 0) {
        throw new Error('Quote not found');
      }
      const quote = quoteRows[0];

      // Fetch customer separately using customer_id
      const customerResp = await supaFetch(
        `customers?id=eq.${quote.customer_id}`,
        { method: 'GET' },
        companyId
      );
      console.log('📧 Customer response:', { ok: customerResp.ok, status: customerResp.status });
      if (!customerResp.ok) {
        throw new Error(`Failed to fetch customer: ${customerResp.status} ${customerResp.statusText}`);
      }
      const customerRows = await customerResp.json();
      if (!Array.isArray(customerRows) || customerRows.length === 0) {
        throw new Error('Customer not found');
      }
      const customer = customerRows[0];
      console.log('📧 Customer data:', customer);
      if (!customer?.email) {
        throw new Error('Customer email not found');
      }
      // Build customer name (residential: first + last, commercial: company name)
      const customerName = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Valued Customer';

      // Get company settings
      const companyProfile = await settingsService.getCompanyProfile(companyId);
      const businessSettings = await settingsService.getBusinessSettings(companyId);
      const company = { ...(businessSettings || {}), ...(companyProfile || {}) };

      // Generate portal link
      const portalLink = await this.generatePortalLink(companyId, quoteId);

      // Generate PDF for attachment (if requested)
      let pdfAttachment = null;
      if (options.includePDF !== false) {  // Default to true
        console.log('🔄 Generating PDF attachment...');
        try {
          // Generate actual PDF using jsPDF
          const pdfBase64 = await this.generatePDFBase64(company, quote, customer);
          console.log('✅ PDF generated successfully, size:', pdfBase64.length, 'bytes');
          pdfAttachment = {
            filename: `Quote-${quote.quote_number || quoteId}.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf'
          };
        } catch (pdfError) {
          console.error('❌ Failed to generate PDF:', pdfError);
          console.error('PDF Error Stack:', pdfError.stack);
          // DO NOT FALLBACK - Let user know PDF generation failed
          throw new Error(`PDF generation failed: ${pdfError.message}`);
        }
      }

      // Build email HTML with custom message
      const emailHtml = this.buildEmailTemplate({
        customerName: customerName,
        companyName: company.name || company.company_name || 'TradeMate Pro',
        companyLogo: company.logo_url || company.company_logo_url || '',
        quoteTitle: quote.title || 'Quote',
        totalAmount: (quote.total_amount || 0).toFixed(2),
        portalLink,
        companyPhone: company.phone || company.phone_number || '',
        companyAddress: company.address || company.street_address || '',
        customMessage: options.customMessage || ''
      });

      // Build payload for Edge Function
      const companyName = company.name || company.company_name || 'TradeMate Pro';
      const emailPayload = {
        from: options.fromEmail || `${companyName} <quotes@updates.tradesmatepro.com>`,
        to: customer.email,
        reply_to: company.email || 'support@tradesmatepro.com',  // Customer replies go to business email
        subject: options.subject || `Quote from ${companyName} - ${quote.title}`,
        html: emailHtml,
        attachments: pdfAttachment ? [pdfAttachment] : [],
        tags: [
          { name: 'type', value: 'quote' },
          { name: 'quote_id', value: quoteId.toString() },
          { name: 'company_id', value: companyId.toString() }
        ],
        companyId,
        quoteId
      };

      console.log('📤 Calling edge function send-quote-email:', { to: customer.email, subject: emailPayload.subject });

      // Use Supabase access token to call Edge Function
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const fnUrl = `${SUPABASE_URL}/functions/v1/send-quote-email`;
      const fnRes = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const fnData = await fnRes.json().catch(() => ({}));
      if (!fnRes.ok || fnData?.success === false) {
        console.error('Edge function error:', fnData);
        throw new Error(fnData?.error?.message || fnData?.error || `Email send failed (${fnRes.status})`);
      }

      console.log('✅ Email sent via Edge Function/Resend:', fnData);

      return {
        success: true,
        emailId: fnData.id,
        portalLink,
        sentTo: customer.email
      };
    } catch (error) {
      console.error('Failed to send quote email:', error);
      throw error;
    }
  }

  /**
   * Build professional email template
   */
  buildEmailTemplate(data) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote from ${data.companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%); color: white; padding: 40px 20px; text-align: center;">
      ${data.companyLogo ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="max-height: 60px; margin-bottom: 20px;">` : ''}
      <h1 style="margin: 0; font-size: 28px; font-weight: 600;">New Quote from ${data.companyName}</h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; background: #ffffff;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${data.customerName},</p>

      <p style="font-size: 16px; color: #333; margin: 0 0 30px 0;">
        ${data.companyName} has prepared a quote for you. We're excited to work with you!
      </p>

      ${data.customMessage ? `
      <!-- Custom Message -->
      <div style="background: #e3f2fd; border-left: 4px solid #1e88e5; padding: 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px; color: #333; white-space: pre-wrap;">${data.customMessage}</p>
      </div>
      ` : ''}

      <!-- Quote Card -->
      <div style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 2px solid #1e88e5;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #333;">${data.quoteTitle}</h3>
        <p style="font-size: 36px; color: #1e88e5; font-weight: bold; margin: 0;">
          $${data.totalAmount}
        </p>
      </div>

      <p style="font-size: 16px; color: #333; margin: 30px 0 15px 0;"><strong>What's Next?</strong></p>
      <ul style="font-size: 15px; color: #555; line-height: 1.8; padding-left: 20px;">
        <li>Review the quote details</li>
        <li>Approve with one click and e-signature</li>
        <li>Request changes if needed</li>
        <li>Download PDF for your records</li>
      </ul>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.portalLink}" style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          View & Approve Quote →
        </a>
      </div>

      <p style="font-size: 13px; color: #999; text-align: center; margin: 20px 0;">
        Or copy this link: <a href="${data.portalLink}" style="color: #1e88e5;">${data.portalLink}</a>
      </p>

      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>💡 Pro Tip:</strong> This link is valid for 24 hours. After that, you can still access your quote by contacting us.
        </p>
      </div>

      <p style="font-size: 15px; color: #333; margin: 30px 0 10px 0;">
        Questions? We're here to help!
      </p>
      <p style="font-size: 15px; color: #555; margin: 0;">
        📞 Call us: <a href="tel:${data.companyPhone}" style="color: #1e88e5; text-decoration: none;">${data.companyPhone}</a><br>
        📧 Reply to this email
      </p>

      <p style="font-size: 16px; color: #333; margin: 40px 0 0 0;">
        Thank you,<br>
        <strong>${data.companyName} Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #2c3e50; color: #95a5a6; padding: 30px 20px; text-align: center; font-size: 13px;">
      <p style="margin: 0 0 10px 0;"><strong style="color: #ecf0f1;">${data.companyName}</strong></p>
      <p style="margin: 0;">${data.companyAddress}</p>
      <p style="margin: 10px 0 0 0;">${data.companyPhone}</p>
      <p style="margin: 20px 0 0 0; font-size: 11px; color: #7f8c8d;">
        Powered by TradeMate Pro
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Resend quote (if customer lost link)
   */
  async resendQuote(companyId, quoteId) {
    return this.sendQuoteEmail(companyId, quoteId);
  }

  /**
   * Track quote view (called from public portal)
   */
  async trackQuoteView(token, ipAddress) {
    try {
      // Find quote by token
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?portal_token=eq.${token}&select=id,view_count,company_id`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error('Quote not found or link expired');
      }

      const quote = data[0];
      const now = new Date().toISOString();

      // Update view tracking
      await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_orders?id=eq.${quote.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viewed_at: quote.view_count === 0 ? now : undefined,
          view_count: (quote.view_count || 0) + 1,
          last_viewed_at: now,
          status: quote.status === 'sent' ? 'viewed' : quote.status
        })
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to track quote view:', error);
      throw error;
    }
  }

  /**
   * Generate PDF as base64 string for email attachment
   * Uses html2canvas with optimized settings for smaller file size
   * Reduced from 12MB to ~200-500KB by using lower scale and JPEG compression
   */
  async generatePDFBase64(company, quote, customer) {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary container for rendering
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '800px';
        container.style.background = 'white';
        container.style.padding = '40px';

        // Get HTML content from QuotePDFService
        const htmlContent = QuotePDFService.exportHtml(company, quote, [], customer);
        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        // Use html2canvas with optimized settings
        // scale: 0.75 = good quality but 3x smaller than scale: 2
        // JPEG 0.92 quality = much smaller than PNG
        html2canvas(container, {
          scale: 0.75,  // Reduced from 2 to reduce file size (was 12MB, now ~300KB)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 0,
          removeContainer: true
        }).then(canvas => {
          // Remove temporary container
          document.body.removeChild(container);

          // Create PDF from canvas using JPEG compression (92% quality)
          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });

          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          // Add first page
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // Add additional pages if content is longer than one page
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Get PDF as base64 string (remove data:application/pdf;base64, prefix)
          const pdfBase64 = pdf.output('datauristring').split(',')[1];
          resolve(pdfBase64);
        }).catch(error => {
          // Clean up on error
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const quoteSendingService = new QuoteSendingService();
export default quoteSendingService;

