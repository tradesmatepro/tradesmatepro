import { supaFetch } from '../utils/supaFetch';
import { getSupabaseClient } from '../utils/supabaseClient';
import settingsService from './SettingsService';
import InvoicePDFService from './InvoicePDFService';
import { computeInvoiceTotals } from './InvoicesService';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || window.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || window.REACT_APP_SUPABASE_ANON_KEY;

// Use production URL if available, otherwise fall back to localhost for development
const PORTAL_BASE_URL = process.env.REACT_APP_PUBLIC_URL
  ? `${process.env.REACT_APP_PUBLIC_URL}/customer-portal-new.html`
  : process.env.REACT_APP_PORTAL_URL || 'http://localhost:3000/customer-portal-new.html';

/**
 * InvoiceSendingService - Handles invoice email sending with Resend
 * Mirrors QuoteSendingService but for invoices
 */
const InvoiceSendingService = {
  /**
   * Send invoice via email using Resend
   * Accepts work_order_id (unified pipeline) - mirrors QuoteSendingService
   */
  async sendInvoiceEmail(companyId, workOrderId, options = {}) {
    try {
      console.log('📧 Sending invoice email:', { companyId, workOrderId, options });

      // Get work order data (unified pipeline - invoices are work_orders with status='invoiced')
      const workOrderResponse = await supaFetch(
        `work_orders?id=eq.${workOrderId}`,
        { method: 'GET' },
        companyId
      );
      console.log('📧 Work order response:', { ok: workOrderResponse.ok, status: workOrderResponse.status });
      if (!workOrderResponse.ok) {
        throw new Error(`Failed to fetch work order: ${workOrderResponse.status} ${workOrderResponse.statusText}`);
      }
      let workOrderRows = await workOrderResponse.json();
      // Fallback: if no work order found, treat input as an invoice_id and resolve its work_order_id
      if (!Array.isArray(workOrderRows) || workOrderRows.length === 0) {
        try {
          const invRes = await supaFetch(`invoices?id=eq.${workOrderId}`, { method: 'GET' }, companyId);
          if (invRes.ok) {
            const invRows = await invRes.json();
            const inv = Array.isArray(invRows) ? invRows[0] : invRows;
            if (inv?.work_order_id) {
              console.warn('ℹ️ sendInvoiceEmail fallback: treating provided id as invoice_id and resolving work_order_id =', inv.work_order_id);
              // Refetch using the resolved work_order_id
              const wo2 = await supaFetch(`work_orders?id=eq.${inv.work_order_id}`, { method: 'GET' }, companyId);
              if (wo2.ok) {
                workOrderRows = await wo2.json();
                // Also update workOrderId for downstream logs/tags
                workOrderId = inv.work_order_id;
              }
            }
          }
        } catch (_) {}
      }
      if (!Array.isArray(workOrderRows) || workOrderRows.length === 0) {
        throw new Error('Work order not found');
      }
      const invoice = workOrderRows[0]; // Use same variable name for compatibility

      // Fetch customer separately using customer_id
      const customerResp = await supaFetch(
        `customers?id=eq.${invoice.customer_id}`,
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
      console.log('🔄 Fetching company settings...');
      const companyProfile = await settingsService.getCompanyProfile(companyId);
      console.log('✅ Company profile:', companyProfile);
      const businessSettings = await settingsService.getBusinessSettings(companyId);
      console.log('✅ Business settings:', businessSettings);
      const company = { ...(businessSettings || {}), ...(companyProfile || {}) };
      console.log('✅ Combined company data:', company);

      // Generate portal link
      const portalLink = await this.generatePortalLink(companyId, workOrderId);

      // ✅ Fetch work order details (for signature, etc.)
      let workOrder = null;
      if (workOrderId) {
        try {
          const woRes = await supaFetch(
            `work_orders?id=eq.${workOrderId}&select=*,assigned_user:users!assigned_to(id,first_name,last_name,name)`,
            { method: 'GET' },
            companyId
          );
          if (woRes.ok) {
            const woRows = await woRes.json();
            if (woRows.length > 0) {
              workOrder = woRows[0];
              console.log('✅ Loaded work order with signature:', {
                id: workOrder.id,
                hasCustomerSignature: !!workOrder.customer_signature_url,
                hasTechnicianSignature: !!workOrder.technician_signature_url
              });
            }
          }
        } catch (woError) {
          console.warn('⚠️ Failed to load work order for signature:', woError);
        }
      }


      // Prepare inline signature images (CID attachments)
      const inlineAttachments = [];
      let customerSignatureCid = null;
      let technicianSignatureCid = null;
      let technicianName = null;
      if (workOrder?.assigned_user) {
        const au = workOrder.assigned_user;
        technicianName = au.name || `${au.first_name || ''} ${au.last_name || ''}`.trim();
      }

      const convertDataUrlToAttachment = (dataUrl, defaultFilename, cid) => {
        try {
          const m = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (!m) return null;
          const contentType = m[1];
          const base64 = m[2];
          const ext = (contentType.split('/')[1] || 'png').split(';')[0];
          return {
            filename: `${defaultFilename}.${ext}`,
            content: base64,
            contentType,
            contentId: cid
          };
        } catch (e) {
          console.warn('⚠️ Failed to convert data URL to attachment', e);
          return null;
        }
      };

      const fetchUrlToAttachment = async (url, defaultFilename, cid) => {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) return null;
          const contentType = res.headers.get('content-type') || 'image/png';
          const buf = await res.arrayBuffer();
          // Convert ArrayBuffer to base64 in chunks to avoid call stack limits
          const bytes = new Uint8Array(buf);
          const chunkSize = 0x8000;
          let binary = '';
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
          }
          const base64 = btoa(binary);
          const ext = (contentType.split('/')[1] || 'png').split(';')[0];
          return {
            filename: `${defaultFilename}.${ext}`,
            content: base64,
            contentType,
            contentId: cid
          };
        } catch (e) {
          console.warn('⚠️ Failed to fetch signature URL for inline embed', e);
          return null;
        }
      };

      // Customer signature
      if (workOrder?.customer_signature_url) {
        if (String(workOrder.customer_signature_url).startsWith('data:')) {
          customerSignatureCid = 'customer-signature';
          const att = convertDataUrlToAttachment(workOrder.customer_signature_url, 'customer-signature', customerSignatureCid);
          if (att) inlineAttachments.push(att);
        } else {
          const cid = 'customer-signature';
          const att = await fetchUrlToAttachment(workOrder.customer_signature_url, 'customer-signature', cid);
          if (att) {
            customerSignatureCid = cid;
            inlineAttachments.push(att);
          }
        }
      }

      // Technician signature
      if (workOrder?.technician_signature_url) {
        if (String(workOrder.technician_signature_url).startsWith('data:')) {
          technicianSignatureCid = 'technician-signature';
          const att = convertDataUrlToAttachment(workOrder.technician_signature_url, 'technician-signature', technicianSignatureCid);
          if (att) inlineAttachments.push(att);
        } else {
          const cid = 'technician-signature';
          const att = await fetchUrlToAttachment(workOrder.technician_signature_url, 'technician-signature', cid);
          if (att) {
            technicianSignatureCid = cid;
            inlineAttachments.push(att);
          }
        }
      }

      // Generate PDF for attachment (if requested)
      let pdfAttachment = null;
      if (options.includePDF !== false) {  // Default to true
        console.log('🔄 Generating PDF attachment...');
        try {
          // Generate actual PDF using jsPDF
          const pdfBase64 = await this.generatePDFBase64(company, invoice, customer, workOrder);
          console.log('✅ PDF generated successfully, size:', pdfBase64.length, 'bytes');
          pdfAttachment = {
            filename: `Invoice-${invoice.invoice_number || workOrderId}.pdf`,
            content: pdfBase64
          };
        } catch (pdfError) {
          console.error('❌ Failed to generate PDF:', pdfError);
          console.error('PDF Error Stack:', pdfError.stack);
          // DO NOT FALLBACK - Let user know PDF generation failed
          throw new Error(`PDF generation failed: ${pdfError.message}`);
        }
      }

      // Compute display totals from work order line items
      let displaySubtotal = Number(invoice.subtotal) || 0;
      let displayTax = Number(invoice.tax_amount) || 0;
      let displayTotal = Number(invoice.total_amount) || 0;
      try {
        // For unified pipeline, line items are stored in work_order_items table
        const itemsRes = await supaFetch(
          `work_order_items?work_order_id=eq.${workOrderId}&order=sort_order.asc.nullsfirst,created_at.asc`,
          { method: 'GET' },
          companyId
        );
        const items = itemsRes.ok ? await itemsRes.json() : [];
        console.log('🧾 Loaded work_order_items for email:', { count: items.length });
        if (items.length > 0) {
          const calc = computeInvoiceTotals(items, 0, 0);
          displaySubtotal = Number(calc.subtotal) || displaySubtotal;
          displayTax = Number(calc.tax_amount) || displayTax;
          displayTotal = Number(calc.total_amount) || displayTotal;
        } else {
          const fallbackWoId = workOrderId;
          if (fallbackWoId) {
            // Fallback: compute from work order line items if invoice has none
            try {
              const woItemsRes = await supaFetch(`work_order_line_items?work_order_id=eq.${fallbackWoId}`, { method: 'GET' }, companyId);
              const woItems = woItemsRes.ok ? await woItemsRes.json() : [];
              console.log('🧾 Loaded work_order_line_items for email fallback:', { count: woItems.length });
              if (woItems.length > 0) {
                const calc = computeInvoiceTotals(woItems, 0, 0);
                displaySubtotal = Number(calc.subtotal) || displaySubtotal;
                displayTax = Number(calc.tax_amount) || displayTax;
                displayTotal = Number(calc.total_amount) || displayTotal;
              }
            } catch (e) {
              console.warn('⚠️ Failed to load work_order_line_items for email:', e);
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not compute display totals from items:', e);
      }

      // Calculate due date based on payment terms
      const paymentTerms = invoice.payment_terms || 'Due on Receipt';
      const daysMap = {
        'Due on Receipt': 0,
        'Net 15': 15,
        'Net 30': 30,
        'Net 60': 60,
        'Net 90': 90,
        '50% Deposit, Balance on Completion': 0
      };
      const dueDays = daysMap[paymentTerms] || 0;
      const invoiceDate = new Date(invoice.created_at || new Date());
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + dueDays);
      const dueDateStr = dueDays === 0 ? paymentTerms : dueDate.toLocaleDateString();

      // Fetch attachments for this work order
      const attachments = workOrder ? await InvoicePDFService.getAttachments(companyId, workOrder.id) : [];

      // Build email HTML with custom message, signatures, and attachments
      const emailHtml = this.buildEmailTemplate({
        customerName: customerName,
        companyName: company.name || company.company_name || 'TradeMate Pro',
        companyLogo: company.logo_url || company.company_logo_url || '',
        invoiceNumber: invoice.quote_number || invoice.work_order_number || 'INV-' + new Date().getTime(),
        subtotal: displaySubtotal.toFixed(2),
        taxAmount: displayTax.toFixed(2),
        totalAmount: (displayTotal || (displaySubtotal + displayTax)).toFixed(2),
        dueDate: dueDateStr,
        paymentTerms: paymentTerms,
        portalLink,
        companyPhone: company.phone || company.phone_number || '',
        companyAddress: company.address || company.street_address || '',
        customMessage: options.customMessage || '',
        workOrder: workOrder || null,
        customerSignatureCid,
        technicianSignatureCid,
        technicianName,
        attachments: attachments || []
      });

      // Download and attach actual files from Supabase Storage
      const fileAttachments = [];
      if (attachments && attachments.length > 0) {
        console.log('📎 Downloading attachments for email:', attachments.length);
        const supabase = getSupabaseClient();

        for (const attachment of attachments) {
          try {
            // Download file from storage
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('files')
              .download(attachment.file_url);

            if (downloadError) {
              console.error('❌ Failed to download attachment:', attachment.file_name, downloadError);
              continue;
            }

            // Convert blob to base64 (browser-safe, no Buffer)
            const arrayBuffer = await fileData.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const chunkSize = 0x8000; // 32KB
            let binary = '';
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
            }
            const base64 = btoa(binary);

            fileAttachments.push({
              filename: attachment.file_name,
              content: base64,
              contentType: fileData.type || 'application/octet-stream'
            });

            console.log('✅ Attached file:', attachment.file_name);
          } catch (err) {
            console.error('❌ Error processing attachment:', attachment.file_name, err);
          }
        }
      }

      // Build payload for Edge Function
      const companyName = company.name || company.company_name || 'TradeMate Pro';
      const allAttachments = [
        ...(pdfAttachment ? [pdfAttachment] : []),
        ...inlineAttachments,
        ...fileAttachments
      ];

      const emailPayload = {
        from: options.fromEmail || `${companyName} <invoices@updates.tradesmatepro.com>`,
        to: customer.email,
        reply_to: company.email || 'support@tradesmatepro.com',  // Customer replies go to business email
        subject: options.subject || `Invoice ${invoice.invoice_number || invoice.work_order_number || workOrderId} from ${companyName}`,
        html: emailHtml,
        attachments: allAttachments,
        tags: [
          { name: 'type', value: 'invoice' },
          { name: 'work_order_id', value: workOrderId.toString() },
          { name: 'company_id', value: companyId.toString() }
        ],
        companyId,
        workOrderId
      };

      console.log('📤 Calling edge function send-quote-email:', { to: customer.email, subject: emailPayload.subject });

      // Use Supabase access token to call Edge Function
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const fnUrl = `${SUPABASE_URL}/functions/v1/send-quote-email`;
      console.log('📤 Edge function URL:', fnUrl);
      console.log('📤 Has access token:', !!accessToken);

      let fnRes;
      try {
        fnRes = await fetch(fnUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });
      } catch (fetchError) {
        console.error('❌ Fetch error calling edge function:', fetchError);
        throw new Error(`Failed to call edge function: ${fetchError.message}`);
      }

      console.log('📥 Edge function response status:', fnRes.status, fnRes.statusText);

      let fnData;
      try {
        const responseText = await fnRes.text();
        console.log('📥 Edge function raw response:', responseText);
        fnData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse Edge function response:', parseError);
        fnData = {};
      }

      if (!fnRes.ok || fnData?.success === false) {
        console.error('❌ Edge function error:', fnData);
        throw new Error(fnData?.error?.message || fnData?.error || fnData?.message || `Email send failed (${fnRes.status})`);
      }

      console.log('✅ Email sent via Edge Function/Resend:', fnData);

      return {
        success: true,
        emailId: fnData.id,
        portalLink,
        sentTo: customer.email
      };

    } catch (error) {
      console.error('❌ sendInvoiceEmail failed:', error);
      throw error;
    }
  },

  /**
   * Generate portal link for invoice (same as quotes - uses customer portal)
   * Customers view invoices in the unified customer portal with portal_token
   */
  async generatePortalLink(companyId, workOrderId) {
    try {
      console.log('🔗 Generating portal link for invoice:', workOrderId);

      // Get the work order with its portal_token
      const woResponse = await supaFetch(
        `work_orders?id=eq.${workOrderId}&select=portal_token`,
        { method: 'GET' },
        companyId
      );

      if (!woResponse.ok) {
        throw new Error('Failed to fetch work order');
      }

      const workOrders = await woResponse.json();
      if (!workOrders || workOrders.length === 0) {
        throw new Error('Work order not found');
      }

      const portalToken = workOrders[0].portal_token;

      if (!portalToken) {
        throw new Error('Work order portal token not found - this should have been auto-generated');
      }

      // Return customer portal URL with token (same portal as quotes)
      // Customer will see invoice, quote history, messages, files
      const portalUrl = `${PORTAL_BASE_URL}?token=${portalToken}`;
      console.log('✅ Invoice portal link generated:', portalUrl);

      return portalUrl;
    } catch (error) {
      console.error('Failed to generate invoice portal link:', error);
      throw new Error('Failed to generate invoice portal link');
    }
  },

  /**
   * Build email HTML template
   */
  buildEmailTemplate(data) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${data.companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center;">
      ${data.companyLogo ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="max-height: 60px; margin-bottom: 20px;">` : ''}
      <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Invoice from ${data.companyName}</h1>
      <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Invoice #${data.invoiceNumber}</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; background: #ffffff;">
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${data.customerName},</p>

      <p style="font-size: 16px; color: #333; margin: 0 0 30px 0;">
        Thank you for your business! Please find your invoice details below.
      </p>

      ${data.customMessage ? `
      <!-- Custom Message -->
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px; color: #333; white-space: pre-wrap;">${data.customMessage}</p>
      </div>
      ` : ''}

      <!-- Invoice Details Card -->
      <div style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 2px solid #10b981;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Subtotal:</td>
            <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 14px;">$${data.subtotal}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Tax:</td>
            <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 14px;">$${data.taxAmount}</td>
          </tr>
          <tr>
            <td style="padding: 15px 0 0 0; color: #111827; font-size: 16px; font-weight: bold; border-top: 2px solid #10b981;">Total Amount:</td>
            <td style="padding: 15px 0 0 0; text-align: right; color: #10b981; font-size: 28px; font-weight: bold; border-top: 2px solid #10b981;">$${data.totalAmount}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Payment Terms:</td>
            <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 14px; border-top: 1px solid #e5e7eb;">${data.paymentTerms}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Due Date:</td>
            <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 14px; border-top: 1px solid #e5e7eb;">${data.dueDate}</td>
          </tr>
        </table>

	      ${data.workOrder && (data.workOrder.customer_signature_url || data.workOrder.technician_signature_url || data.workOrder.work_performed || data.workOrder.materials_used) ? `
	      <!-- Signatures & Work Info -->
	      <div style="margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
	        <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 8px;">Completion & Signatures</div>
	        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
	          <tr>
	            <td align="center" valign="top" width="50%" style="padding: 8px;">
	              ${data.customerSignatureCid ? `<img src="cid:${data.customerSignatureCid}" alt="Customer Signature" style="max-width:200px; max-height:100px; display:block; border-bottom:1px solid #9ca3af; padding-bottom:8px;"> <div style="font-size:12px; color:#6b7280; margin-top:6px;">Customer Signature</div>` : (data.workOrder.customer_signature_url ? `<img src="${data.workOrder.customer_signature_url}" alt="Customer Signature" style="max-width:200px; max-height:100px; display:block; border-bottom:1px solid #9ca3af; padding-bottom:8px;"> <div style="font-size:12px; color:#6b7280; margin-top:6px;">Customer Signature</div>` : '')}
	            </td>
	            <td align="center" valign="top" width="50%" style="padding: 8px;">
	              ${data.technicianSignatureCid ? `<img src="cid:${data.technicianSignatureCid}" alt="Technician Signature" style="max-width:200px; max-height:100px; display:block; border-bottom:1px solid #9ca3af; padding-bottom:8px;"> <div style="font-size:12px; color:#6b7280; margin-top:6px;">Technician Signature${data.technicianName ? ` — ${data.technicianName}` : ''}</div>` : (data.workOrder.technician_signature_url ? `<img src="${data.workOrder.technician_signature_url}" alt="Technician Signature" style="max-width:200px; max-height:100px; display:block; border-bottom:1px solid #9ca3af; padding-bottom:8px;"> <div style="font-size:12px; color:#6b7280; margin-top:6px;">Technician Signature${data.technicianName ? ` — ${data.technicianName}` : ''}</div>` : '')}
	            </td>
	          </tr>
	        </table>
	        ${(data.workOrder.work_performed || data.workOrder.materials_used) ? `
	        <div style="margin-top: 10px;">
	          ${data.workOrder.work_performed ? `<div style="font-size:12px; color:#374151; margin-bottom:6px;"><strong>Work Performed:</strong><br><span style="white-space:pre-wrap;">${data.workOrder.work_performed}</span></div>` : ''}
	          ${data.workOrder.materials_used ? `<div style="font-size:12px; color:#374151;"><strong>Materials Used:</strong><br><span style="white-space:pre-wrap;">${data.workOrder.materials_used}</span></div>` : ''}
	        </div>
	        ` : ''}
	      </div>
	      ` : ''}

      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${data.portalLink}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Pay Invoice Online →
        </a>
      </div>

      <p style="font-size: 13px; color: #999; text-align: center; margin: 20px 0;">
        Or copy this link: <a href="${data.portalLink}" style="color: #10b981;">${data.portalLink}</a>
      </p>

      ${data.attachments && data.attachments.length > 0 ? `
      <!-- Attachments Section -->
      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">📎 Attached Files (${data.attachments.length})</h4>
        <div style="display: grid; gap: 10px;">
          ${data.attachments.map(file => {
            const fileName = file.file_name || 'Attachment';
            const fileSize = file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '';
            const isImage = file.file_type && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.file_type.toLowerCase());
            const icon = isImage ? '📷' : '📄';
            return `
              <div style="background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">${icon}</div>
                <div style="flex: 1;">
                  <div style="font-size: 14px; color: #333; font-weight: 500;">${fileName}</div>
                  ${fileSize ? `<div style="font-size: 12px; color: #666; margin-top: 2px;">${fileSize}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <p style="margin: 15px 0 0 0; font-size: 13px; color: #666;">
          <strong>Note:</strong> View all attachments in the customer portal by clicking the button above.
        </p>
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 30px 0 0 0;">
        Please remit payment at your earliest convenience. If you have any questions, feel free to contact us.
      </p>

      <p style="font-size: 14px; color: #333; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong>${data.companyName}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 13px;">
      <p style="margin: 0 0 10px 0;"><strong style="color: #f3f4f6;">${data.companyName}</strong></p>
      <p style="margin: 0;">${data.companyAddress}</p>
      <p style="margin: 10px 0 0 0;">${data.companyPhone}</p>
      <p style="margin: 20px 0 0 0; font-size: 11px; color: #6b7280;">
        Powered by TradeMate Pro
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  },

  /**
   * Generate PDF for email attachment
   * Uses Puppeteer backend for professional-quality native PDFs
   * Returns base64-encoded PDF for email attachment
   */
  async generatePDFBase64(company, invoice, customer, workOrder = null) {
    try {
      // Fetch attachments if workOrder is provided
      const attachments = workOrder ? await InvoicePDFService.getAttachments(company.id, workOrder.id) : [];

      // Get HTML content from InvoicePDFService - pass workOrder for signature and attachments
      const htmlContent = InvoicePDFService.exportHtml(company, invoice, [], customer, workOrder, attachments);

      // Call backend PDF generator (Puppeteer)
      const pdfGeneratorUrl = process.env.REACT_APP_PDF_GENERATOR_URL || 'http://localhost:3005';

      console.log('📄 Calling Puppeteer PDF generator at:', pdfGeneratorUrl);

      const response = await fetch(`${pdfGeneratorUrl}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html: htmlContent })
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`);
      }

      // Response is binary PDF, not JSON
      const pdfArrayBuffer = await response.arrayBuffer();
      const byteLength = pdfArrayBuffer.byteLength;
      if (!byteLength) {
        throw new Error('PDF is empty');
      }

      console.log(`✅ PDF received: ${(byteLength / 1024).toFixed(2)} KB`);

      // Debug: check first 5 bytes
      try {
        const headArr = Array.from(new Uint8Array(pdfArrayBuffer.slice(0, 5)));
        console.log('🔏 ArrayBuffer magic header (bytes):', headArr.join(','));
      } catch (e) {
        console.warn('⚠️ Could not read ArrayBuffer header:', e.message);
      }

      // Convert ArrayBuffer to base64 for email attachment (no DataURL)
      const bytes = new Uint8Array(pdfArrayBuffer);
      const chunkSize = 0x8000; // 32KB chunks
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const sub = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(sub));
      }
      const base64 = btoa(binary);

      // Quick validation on client
      try {
        const head = atob(base64.substring(0, 8));
        const codes = Array.from(head).map((c) => c.charCodeAt(0)).slice(0, 5);
        console.log('🔏 Base64-decoded header (bytes):', codes.join(','));
      } catch (e) {
        console.warn('⚠️ Base64 header validation failed:', e.message);
      }
      console.log(`✅ PDF converted to base64: ${(base64.length / 1024).toFixed(2)} KB`);
      return base64;
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
};

export default InvoiceSendingService;

