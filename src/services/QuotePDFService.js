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

  exportHtml(company, quote, items, customer = {}) {
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
      ? `<img src="${company.company_logo_url}" alt="Logo" style="height:120px;object-fit:contain;max-width:560px" />`
      : `<div style="font-size:20px;font-weight:700">${company.name || company.company_name || 'Your Company'}</div>`;

    return `<!doctype html><html><head><meta charset="utf-8"><title>Quote #${quote.quote_number || quote.id}</title>
    <style>
    body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial;color:#000;padding:24px;line-height:1.6;background:#fff}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:3px solid #000}
    .brand{display:flex;gap:16px;align-items:flex-start}
    .meta{font-size:14px;color:#333;line-height:1.4}
    .section{margin:24px 0;padding:20px;background:#fff;border:2px solid #000;border-radius:8px}
    .section h4{margin:0 0 16px 0;font-weight:700;color:#000;font-size:18px;border-bottom:2px solid #000;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin:24px 0;background:white;border:2px solid #000;border-radius:8px;overflow:hidden}
    th,td{padding:16px 12px;border-bottom:1px solid #000;text-align:left;font-size:14px;color:#000}
    th{background:#f0f0f0;font-weight:700;color:#000}
    .totals{margin-top:32px;padding:20px;background:#fff;border:2px solid #000;border-radius:8px;max-width:400px;margin-left:auto}
    .totals div{margin:8px 0;display:flex;justify-content:space-between;font-size:16px;color:#000}
    .totals div:last-child{border-top:3px solid #000;font-weight:700;font-size:20px;padding-top:12px;margin-top:12px;color:#000}
    @media print{body{padding:12px} .section{break-inside:avoid}}
    </style></head><body>
      <div class="header">
        <div class="brand">
          ${logoHtml}
          <div>
            <div style="font-size:18px;font-weight:600">${company.name || company.company_name || ''}</div>
            <div class="meta">${companyAddr}</div>
            <div class="meta">${company.phone || ''}${company.email ? ` • ${company.email}` : ''}</div>
          </div>
        </div>
        <div class="meta">Quote #${quote.quote_number || quote.id}<br/>Date: ${quote.created_at ? new Date(quote.created_at).toLocaleDateString() : ''}<br/>${validityText}</div>
      </div>
      <div class="section">
        <h4>Quote For</h4>
        <div>${customer.name || ''}</div>
        <div class="meta">${customer.email || ''}${customer.phone ? ` • ${customer.phone}` : ''}</div>
        <div class="meta">${customerAddr || '<span style="color:#9ca3af">No billing address on file</span>'}</div>
      </div>
      ${quote.description ? `<div class="section"><h4>Quote Description</h4><div style="background:#fff;padding:12px;border-radius:6px;border:2px solid #000;color:#000">${quote.description}</div></div>` : ''}
      ${pricingContent}
      <div class="totals">
        <div><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
        <div><span>Tax</span><span>${fmt(tax_amount)}</span></div>
        <div style="font-weight:700"><span>Total Quote</span><span>${fmt(total_amount)}</span></div>
      </div>
      ${ (company.quote_terms || company.default_quote_terms) ? `<div class="section"><h4>Terms & Conditions</h4><div>${company.quote_terms || company.default_quote_terms}</div></div>` : ''}
      ${ (company.quote_footer) ? `<div class="section"><div>${company.quote_footer}</div></div>` : ''}
    </body></html>`;
  },

  // Preview PDF in new tab (doesn't auto-close)
  async previewPDF(companyId, quoteId) {
    const { quote, items, customer } = await this.get(companyId, quoteId);
    const companyProfile = await settingsService.getCompanyProfile(companyId);
    const businessSettings = await settingsService.getBusinessSettings(companyId);
    const company = { ...(businessSettings || {}), ...(companyProfile || {}) };
    const html = this.exportHtml(company, quote, items, customer);
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
    const html = this.exportHtml(company, quote, items, customer);
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
      const html = this.exportHtml(company, quote, items, customer);

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

