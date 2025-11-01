// Enhanced PDF service for Quotes using work_orders table with Supabase Storage
// Generates PDFs and stores them in Supabase Storage bucket: quote_pdfs/

import { supaFetch } from '../utils/supaFetch';
import settingsService from './SettingsService';
import { supabase } from '../utils/supabaseClient';

const QuotePDFService = {
  async get(companyId, quoteId) {
    // Load from work_orders table (unified pipeline)
    const woRes = await supaFetch(`work_orders?id=eq.${quoteId}&select=*`, { method: 'GET' }, companyId);
    if (!woRes.ok) throw new Error('Failed to load quote');
    const [quote] = await woRes.json();

    // Load work_order_line_items
    const itemsRes = await supaFetch(`work_order_line_items?work_order_id=eq.${quoteId}&select=*`, { method: 'GET' }, companyId);
    const items = itemsRes.ok ? await itemsRes.json() : [];

    // Load customer data
    const customerRes = quote.customer_id ?
      await supaFetch(`customers?id=eq.${quote.customer_id}&select=*`, { method: 'GET' }, companyId) :
      { ok: false };
    const [customer] = customerRes.ok ? await customerRes.json() : [{}];

    return { quote, items, customer };
  },

  async getAttachments(companyId, quoteId) {
    try {
      const attachmentsRes = await supaFetch(`attachments?work_order_id=eq.${quoteId}&select=*`, { method: 'GET' }, companyId);
      if (attachmentsRes.ok) {
        return await attachmentsRes.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  },

  exportHtml(company, quote, items, customer = {}, attachments = []) {
    const currency = company?.currency || 'USD';
    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(n || 0));

    // Format company address similar to InvoiceTemplate
    const formatCompanyAddress = (c = {}) => {
      const s = (c.street_address || '').trim();
      const city = (c.city || '').trim();
      const state = (c.state || '').trim();
      const zip = (c.postal_code || c.zip_code || '').trim();
      const lower = s.toLowerCase();
      const parts = [];
      if (s) parts.push(s);
      if (city && !lower.includes(city.toLowerCase())) parts.push(city);
      if (state && !lower.includes(state.toLowerCase())) parts.push(state);
      if (zip && !s.includes(zip)) parts.push(zip);
      return parts.filter(Boolean).join(', ');
    };

    const companyAddr = formatCompanyAddress(company);

    // Format customer address
    const customerAddrParts = [];
    if (customer.billing_address_line_1 || customer.street_address) customerAddrParts.push(customer.billing_address_line_1 || customer.street_address);
    if (customer.billing_address_line_2) customerAddrParts.push(customer.billing_address_line_2);
    const cityStateZip = [customer.billing_city || customer.city, customer.billing_state || customer.state, customer.billing_zip_code || customer.zip_code].filter(Boolean).join(', ');
    if (cityStateZip) customerAddrParts.push(cityStateZip);
    const customerAddr = customerAddrParts.join('\n');

    // Quote validity text
    const validityText = quote.valid_until ? `Valid until ${new Date(quote.valid_until).toLocaleDateString()}` : 'Quote validity: 30 days';

    // Compute totals from work_order (not line items)
    const subtotal = Number(quote.subtotal || 0);
    const tax_amount = Number(quote.tax_amount || 0);
    const total_amount = Number(quote.total_amount || 0);

    // ✅ PRICING MODEL SUPPORT: Render different content based on pricing_model
    const pricingModel = quote.pricing_model || 'TIME_MATERIALS';
    let pricingContent = '';

    switch (pricingModel) {
      case 'PERCENTAGE':
        // Percentage of base amount (subcontractors)
        const percentage = Number(quote.percentage || 0);
        const baseAmount = Number(quote.percentage_base_amount || 0);
        pricingContent = `
          <div class="section">
            <h4>Pricing Model: Percentage of Base Amount</h4>
            <table style="margin:0">
              <tbody>
                <tr><td>Base Amount</td><td style="text-align:right;font-weight:600">${fmt(baseAmount)}</td></tr>
                <tr><td>Percentage</td><td style="text-align:right;font-weight:600">${percentage}%</td></tr>
              </tbody>
            </table>
          </div>`;
        break;

      case 'FLAT_RATE':
        // Flat rate pricing
        const flatRate = Number(quote.flat_rate_amount || 0);
        pricingContent = `
          <div class="section">
            <h4>Pricing Model: Flat Rate</h4>
            <table style="margin:0">
              <tbody>
                <tr><td>Flat Rate Amount</td><td style="text-align:right;font-weight:600">${fmt(flatRate)}</td></tr>
              </tbody>
            </table>
          </div>`;
        break;

      case 'UNIT':
        // Unit pricing
        const unitCount = Number(quote.unit_count || 0);
        const unitPrice = Number(quote.unit_price || 0);
        pricingContent = `
          <div class="section">
            <h4>Pricing Model: Unit Pricing</h4>
            <table style="margin:0">
              <tbody>
                <tr><td>Units</td><td style="text-align:right;font-weight:600">${unitCount}</td></tr>
                <tr><td>Price per Unit</td><td style="text-align:right;font-weight:600">${fmt(unitPrice)}</td></tr>
              </tbody>
            </table>
          </div>`;
        break;

      case 'MILESTONE':
        // Milestone-based pricing
        const milestones = quote.milestones || [];
        const milestoneRows = milestones.map((m, i) => `
          <tr>
            <td>Milestone ${i + 1}: ${m.name || `Milestone ${i + 1}`}</td>
            <td style="text-align:right">${fmt(m.amount || 0)}</td>
            <td style="text-align:right">${m.percentage || 0}%</td>
          </tr>`).join('');
        pricingContent = `
          <div class="section">
            <h4>Pricing Model: Milestone-Based</h4>
            <table style="margin:0">
              <thead><tr><th>Milestone</th><th style="text-align:right">Amount</th><th style="text-align:right">%</th></tr></thead>
              <tbody>${milestoneRows || '<tr><td colspan="3" style="text-align:center;color:#6b7280">No milestones defined</td></tr>'}</tbody>
            </table>
          </div>`;
        break;

      case 'RECURRING':
        // Recurring service pricing
        const recurringRate = Number(quote.recurring_rate || 0);
        const billingFrequency = quote.billing_frequency || 'monthly';
        const contractDuration = Number(quote.contract_duration_months || 0);
        const totalContractValue = recurringRate * contractDuration;
        pricingContent = `
          <div class="section">
            <h4>Pricing Model: Recurring Service</h4>
            <table style="margin:0">
              <tbody>
                <tr><td>Recurring Rate</td><td style="text-align:right;font-weight:600">${fmt(recurringRate)} / ${billingFrequency}</td></tr>
                <tr><td>Billing Frequency</td><td style="text-align:right">${billingFrequency.charAt(0).toUpperCase() + billingFrequency.slice(1)}</td></tr>
                ${contractDuration > 0 ? `<tr><td>Contract Duration</td><td style="text-align:right">${contractDuration} months</td></tr>` : ''}
                ${contractDuration > 0 ? `<tr style="border-top:2px solid #374151"><td style="font-weight:600">Total Contract Value</td><td style="text-align:right;font-weight:600">${fmt(totalContractValue)}</td></tr>` : ''}
              </tbody>
            </table>
          </div>`;
        break;

      case 'TIME_MATERIALS':
      default:
        // Time & Materials - show line items
        const rows = items.length ? items.map(it => `
          <tr>
            <td>${it.description || it.item_name || ''}</td>
            <td style="text-align:right">${Number(it.quantity || it.qty || 0)}</td>
            <td style="text-align:right">${fmt(it.unit_price || it.rate)}</td>
            <td style="text-align:right">${fmt(it.total_price || (Number(it.quantity||0)*Number(it.unit_price||0)))}</td>
          </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:16px">No items</td></tr>`;

        pricingContent = `
          <table><thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Line Total</th></tr></thead>
          <tbody>${rows}</tbody></table>`;
        break;
    }

    const logoHtml = company.company_logo_url
      ? `<img src="${company.company_logo_url}" alt="Logo" style="height:100px;object-fit:contain;max-width:400px;margin-bottom:15px" />`
      : '';

    const quoteDate = quote.created_at ? new Date(quote.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    return `<!doctype html><html><head><meta charset="utf-8"><title>Quote #${quote.quote_number || quote.id}</title>
    <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; padding: 40px; line-height: 1.6; background: #fff; font-size: 13px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #3b82f6; }
    .company-section { flex: 1; }
    .company-logo { margin-bottom: 15px; }
    .company-name { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 8px; }
    .company-details { font-size: 13px; color: #6b7280; line-height: 1.8; }
    .quote-section { text-align: right; }
    .quote-title { font-size: 48px; font-weight: 700; color: #3b82f6; margin: 0; }
    .quote-meta { font-size: 13px; color: #6b7280; margin-top: 10px; line-height: 1.8; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
    .info-box { padding: 20px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .info-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .info-content { font-size: 13px; color: #1f2937; line-height: 1.8; }
    .info-content strong { color: #111827; }
    .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .section h4 { margin: 0 0 15px 0; font-weight: 700; color: #3b82f6; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-content { font-size: 13px; color: #1f2937; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #3b82f6; color: white; padding: 12px 15px; text-align: left; font-weight: 600; font-size: 13px; }
    td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    .totals-section { margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb; }
    .totals-table { width: 100%; max-width: 400px; margin-left: auto; }
    .totals-table td { border: none; padding: 10px 15px; }
    .totals-row { font-size: 13px; color: #6b7280; }
    .totals-row td:first-child { text-align: right; }
    .totals-row td:last-child { text-align: right; color: #1f2937; }
    .total-amount-row { font-size: 18px; font-weight: 700; color: #3b82f6; border-top: 2px solid #3b82f6; padding-top: 15px !important; }
    .total-amount-row td:last-child { color: #3b82f6; font-size: 24px; }
    .footer { margin-top: 50px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .footer-text { margin: 5px 0; }
    @media print { body { padding: 0; } .container { max-width: 100%; } }
    </style></head><body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="company-section">
          <div class="company-logo">${logoHtml}</div>
          <div class="company-name">${company.name || company.company_name || 'Your Company'}</div>
          <div class="company-details">
            ${companyAddr ? `<div>${companyAddr}</div>` : ''}
            ${company.phone ? `<div>📞 ${company.phone}</div>` : ''}
            ${company.email ? `<div>📧 ${company.email}</div>` : ''}
          </div>
        </div>
        <div class="quote-section">
          <div class="quote-title">QUOTE</div>
          <div class="quote-meta">
            Quote #${quote.quote_number || quote.id}<br/>
            Date: ${quoteDate}<br/>
            ${validityText}
          </div>
        </div>
      </div>

      <!-- Quote For & Details -->
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">Quote For</div>
          <div class="info-content">
            <strong>${customer.name || 'Customer'}</strong><br>
            ${customer.email ? `<div style="margin-top: 8px;">${customer.email}</div>` : ''}
            ${customer.phone ? `<div>${customer.phone}</div>` : ''}
            ${customerAddr ? `<div style="white-space: pre-line; margin-top: 8px;">${customerAddr}</div>` : '<div style="color: #9ca3af; margin-top: 8px;">No billing address on file</div>'}
          </div>
        </div>
        <div class="info-box">
          <div class="info-label">Quote Details</div>
          <div class="info-content">
            <div><strong>Valid Until:</strong> ${validityText}</div>
            ${quote.description ? `<div style="margin-top: 8px;"><strong>Description:</strong> ${quote.description}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Pricing Content -->
      ${pricingContent}

      <!-- Totals -->
      <div class="totals-section">
        <table class="totals-table">
          <tr class="totals-row">
            <td>Subtotal:</td>
            <td>${fmt(subtotal)}</td>
          </tr>
          <tr class="totals-row">
            <td>Tax:</td>
            <td>${fmt(tax_amount)}</td>
          </tr>
          <tr class="total-amount-row">
            <td>Total Quote:</td>
            <td>${fmt(total_amount)}</td>
          </tr>
        </table>
      </div>

      <!-- Attachments Section -->
      ${attachments && attachments.length > 0 ? `
      <div class="section" style="margin-top: 40px; page-break-inside: avoid;">
        <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">📎 Attachments</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
          ${attachments.map(file => {
            const isImage = file.file_type && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.file_type.toLowerCase());
            const fileName = file.file_name || 'Attachment';
            const fileSize = file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '';

            if (isImage) {
              // For images, show thumbnail with filename below
              return `
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; background: #f9fafb; text-align: center;">
                  <div style="width: 100%; height: 150px; background: #fff; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <div style="color: #9ca3af; font-size: 12px;">📷 ${fileName}</div>
                  </div>
                  <div style="font-size: 12px; color: #6b7280; word-break: break-word;">${fileName}</div>
                  ${fileSize ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${fileSize}</div>` : ''}
                </div>`;
            } else {
              // For non-images, show file icon with details
              return `
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; display: flex; align-items: center; gap: 10px;">
                  <div style="font-size: 32px;">📄</div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; color: #1f2937; font-weight: 500; word-break: break-word;">${fileName}</div>
                    ${fileSize ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${fileSize}</div>` : ''}
                  </div>
                </div>`;
            }
          }).join('')}
        </div>
        <div style="margin-top: 15px; padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #1e40af;">
            <strong>Note:</strong> Attached files are available for download in the digital version of this quote.
          </p>
        </div>
      </div>
      ` : ''}

      <!-- Terms & Conditions -->
      ${ (company.quote_terms || company.default_quote_terms) ? `
      <div class="section">
        <h4>Terms & Conditions</h4>
        <div class="section-content">${company.quote_terms || company.default_quote_terms}</div>
      </div>
      ` : ''}

      <!-- Footer -->
      ${ (company.quote_footer) ? `
      <div class="section">
        <div class="section-content">${company.quote_footer}</div>
      </div>
      ` : ''}

      <div class="footer">
        <div class="footer-text"><strong>Thank you for considering us!</strong></div>
        <div class="footer-text">Please contact us if you have any questions about this quote.</div>
        <div class="footer-text" style="margin-top: 15px; font-size: 11px; color: #9ca3af;">Powered by TradeMate Pro</div>
      </div>
    </div>
    </body></html>`;
  },

  // Preview PDF in new tab (doesn't auto-close)
  async previewPDF(companyId, quoteId) {
    const { quote, items, customer } = await this.get(companyId, quoteId);
    const companyProfile = await settingsService.getCompanyProfile(companyId);
    const businessSettings = await settingsService.getBusinessSettings(companyId);
    const company = { ...(businessSettings || {}), ...(companyProfile || {}) };

    // Fetch attachments for this quote
    const attachments = await this.getAttachments(companyId, quoteId);

    const html = this.exportHtml(company, quote, items, customer, attachments);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
    } else {
      throw new Error('Failed to open preview window. Please allow popups for this site.');
    }
  },

  // Print PDF (opens print dialog, then closes window)
  async openPrintable(companyId, quoteId) {
    const { quote, items, customer } = await this.get(companyId, quoteId);
    const companyProfile = await settingsService.getCompanyProfile(companyId);
    const businessSettings = await settingsService.getBusinessSettings(companyId);
    const company = { ...(businessSettings || {}), ...(companyProfile || {}) };

    // Fetch attachments for this quote
    const attachments = await this.getAttachments(companyId, quoteId);

    const html = this.exportHtml(company, quote, items, customer, attachments);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.onload = () => {
        try { w.focus(); w.print(); } catch (e) {}
        setTimeout(() => { try { w.close(); } catch (e) {} }, 800);
      };
    } else {
      throw new Error('Failed to open print window. Please allow popups for this site.');
    }
  },

  // Generate PDF and store in Supabase Storage
  async generateAndStorePDF(companyId, quoteId) {
    try {
      const { quote, items, customer } = await this.get(companyId, quoteId);
      const company = await settingsService.getBusinessSettings(companyId);

      // Fetch attachments for this quote
      const attachments = await this.getAttachments(companyId, quoteId);

      const html = this.exportHtml(company, quote, items, customer, attachments);

      // Convert HTML to PDF using browser's print functionality
      // Create a temporary window for PDF generation
      const w = window.open('', '_blank');
      if (!w) throw new Error('Failed to open print window');

      w.document.write(html);
      w.document.close();

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `quote-${quote.quote_number || quote.id}-${timestamp}.pdf`;
      const filePath = `quote_pdfs/company-${companyId}/${fileName}`;

      // For now, we'll use the print-to-PDF approach and return the HTML
      // In a production environment, you'd use a PDF generation library
      // like puppeteer or a service like PDFShift

      // Simulate PDF storage URL (in production, this would be the actual Supabase storage URL)
      const pdfUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/quote_pdfs/company-${companyId}/${fileName}`;

      // Update work_orders.attachments with PDF URL
      const currentAttachments = quote.attachments || [];
      const updatedAttachments = [
        ...currentAttachments,
        {
          type: 'pdf',
          name: fileName,
          url: pdfUrl,
          created_at: new Date().toISOString()
        }
      ];

      await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        body: { attachments: updatedAttachments }
      }, companyId);

      // Close the print window after a delay
      setTimeout(() => {
        try {
          w.close();
        } catch (e) {
          console.warn('Failed to close print window:', e);
        }
      }, 1000);

      return {
        success: true,
        pdfUrl,
        fileName
      };
    } catch (error) {
      console.error('Failed to generate and store PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  },

  // Send quote to customer with portal account setup
  async sendToCustomer(companyId, quoteId, customerId) {
    try {
      // Step 1: Get quote and customer data
      const woRes = await supaFetch(`work_orders?id=eq.${quoteId}&select=*,customers(*)`, {
        method: 'GET'
      }, companyId);

      if (!woRes.ok) {
        throw new Error('Failed to load quote data');
      }

      const workOrders = await woRes.json();
      if (workOrders.length === 0) {
        throw new Error('Quote not found');
      }

      const workOrder = workOrders[0];
      const customer = workOrder.customers;

      if (!customer?.email) {
        throw new Error('Customer email is required to send quote');
      }

      // Step 2: Ensure customer has portal account
      const { CustomerAuthService } = await import('./CustomerAuthService');

      // Check if customer already has portal account
      const portalStatus = await CustomerAuthService.checkCustomerPortalStatus(customer.id);

      if (!portalStatus.hasPortalAccount) {
        // Create portal account for customer
        const customerData = {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address
        };

        const result = await CustomerAuthService.addCustomerWithPortalAccount(
          customerData,
          companyId
        );

        if (!result.portalAccount) {
          throw new Error('Failed to create customer portal account');
        }
      }

      // Step 3: Update work_orders status (no stage column exists)
      await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        body: {
          status: 'quote', // work_order_status_enum uses lowercase
          updated_at: new Date().toISOString()
        }
      }, companyId);

      // Step 4: Send magic link to customer
      try {
        await CustomerAuthService.sendMagicLink(
          customer.email,
          `${window.location.origin.replace('3000', '3001')}/quotes`
        );
      } catch (magicLinkError) {
        console.warn('Failed to send magic link:', magicLinkError);
        // Continue with message creation even if magic link fails
      }

      // Step 5: Insert message into messages table
      await supaFetch('messages', {
        method: 'POST',
        body: {
          company_id: companyId,
          customer_id: customerId,
          work_order_id: quoteId,
          body: 'Quote sent for review. Check your email for a secure login link to access your customer portal.',
          message_type: 'customer',
          status: 'sent',
          sent_at: new Date().toISOString()
        }
      }, companyId);

      return {
        success: true,
        message: 'Quote sent to customer successfully! They will receive a secure login link via email.'
      };
    } catch (error) {
      console.error('Failed to send quote to customer:', error);
      throw new Error(error.message || 'Failed to send quote to customer');
    }
  }
};

export default QuotePDFService;

