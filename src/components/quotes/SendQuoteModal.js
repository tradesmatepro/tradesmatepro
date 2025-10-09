import { useEffect, useMemo, useState } from 'react';
import { supaFetch } from '../../utils/supaFetch';


export default function SendQuoteModal({ isOpen, onClose, quote, customer, companyId, userEmail, userName, onSent, initialSubject, initialMessage, handleExportPDF }){
  const [toEmail, setToEmail] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includePdf, setIncludePdf] = useState(true);
  const [sending, setSending] = useState(false);
  const [template, setTemplate] = useState('default');
  const templates = useMemo(() => ({
    default: {
      subject: `Quote ${quote?.quote_number || quote?.id} from ${fromName || 'Our Team'}`,
      message: `Hi ${customer?.name || ''},\n\nPlease review your quote below. You can view it online or in the attached PDF.\n\nThanks!`
    },
    followup_3d: {
      subject: `Following up on your quote ${quote?.quote_number || quote?.id}`,
      message: `Hi ${customer?.name || ''},\n\nJust checking in to see if you had any questions about the quote we sent. We’re happy to help.\n\nThanks!`
    },
    followup_7d: {
      subject: `Quick reminder about your quote ${quote?.quote_number || quote?.id}`,
      message: `Hi ${customer?.name || ''},\n\nWe’d love to get you scheduled. Let us know if you’re ready to proceed or have questions.\n\nThanks!`
    }
  }), [quote, customer, fromName]);


  useEffect(() => {
    if (!isOpen) return;
    const t = initialSubject || templates[template].subject;
    const m = initialMessage || templates[template].message;
    setSubject(t);
    setMessage(m);
    // Derive default to from customer contact if available
    const email = customer?.email || customer?.primary_email || '';
    setToEmail(email);
    setFromEmail(userEmail || '');
    // Set from name from prop
    setFromName(userName || 'Your Name');
  }, [isOpen, template, templates, customer, userEmail, userName, initialSubject, initialMessage]);

  // Use production URL if available, otherwise use current origin for development
  const portalUrl = useMemo(() => {
    if (!quote) return '';
    const baseUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
    return `${baseUrl}/portal/quote/${quote.id}`;
  }, [quote]);

  const handleSend = async () => {
    if (!quote || !companyId) return;
    try {
      setSending(true);

      // 1) Update work order status and timestamp
      console.log('📤 Updating quote status to "sent" for quote:', quote.id);
      const updateResponse = await supaFetch(`work_orders?id=eq.${quote.id}`, {
        method: 'PATCH',
        body: {
          status: 'sent',  // ✅ Lowercase to match enum
          quote_sent_at: new Date().toISOString()
        }
      }, companyId);

      if (!updateResponse.ok) {
        console.error('❌ Failed to update quote status:', await updateResponse.text());
        throw new Error('Failed to update quote status');
      }
      console.log('✅ Quote status updated to "sent"');

      // 2) Create delivery tracking record
      const deliveryData = {
        company_id: companyId,
        work_order_id: quote.id,
        delivery_method: 'email',
        recipient_email: toEmail,
        email_subject: subject,
        email_body: message,
        delivery_status: 'sent',
        sent_at: new Date().toISOString()
      };

      try {
        await supaFetch('quote_deliveries', {
          method: 'POST',
          body: deliveryData
        }, companyId);
      } catch (deliveryError) {
        console.warn('Failed to create delivery record:', deliveryError);
        // Continue even if delivery tracking fails
      }

      // 3) Open PDF in a new tab if requested (user can download)
      if (includePdf && handleExportPDF) {
        try {
          await handleExportPDF(quote);
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
        }
      }

      // 4) TODO: Actually send email via SendGrid/Mailgun
      // await IntegrationService.sendEmail(deliveryData);

      await new Promise(r => setTimeout(r, 500));
      window?.toast?.success?.('Quote sent successfully!');
      onSent && onSent();
      onClose();
    } catch (e) {
      console.error('send quote error', e);
      window?.toast?.error?.('Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Send Quote</h3>
          <button className="text-gray-500 hover:text-gray-700 text-2xl leading-none" onClick={onClose}>×</button>
        </div>

        {/* Email Configuration Notice */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">ℹ️</span>
            <div className="text-sm text-blue-800">
              <strong>Email Setup Required:</strong> To send emails, configure SMTP settings in Settings → Integrations.
              For now, clicking "Send" will mark the quote as sent and open the PDF for you to manually email.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input value={toEmail} onChange={(e)=>setToEmail(e.target.value)} placeholder="customer@email.com" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
              <input value={fromEmail} onChange={(e)=>setFromEmail(e.target.value)} placeholder="me@company.com" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
              <input value={fromName} onChange={(e)=>setFromName(e.target.value)} placeholder="Your Name" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="text-xs text-gray-500 mt-1">Variables you can use in Subject/Message: {'{{customer.name}} {{quote.number}} {{portal_url}} {{from.name}}'}</div>

          </div>

          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select value={template} onChange={(e)=>setTemplate(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="default">Default</option>
                <option value="followup_3d">Follow-up (3 days)</option>
                <option value="followup_7d">Follow-up (7 days)</option>
              </select>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded whitespace-pre-wrap" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input id="includePdf" type="checkbox" checked={includePdf} onChange={(e)=>setIncludePdf(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="includePdf" className="text-sm text-gray-700">Attach PDF to email</label>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  if (handleExportPDF) {
                    handleExportPDF(quote);
                    window?.toast?.success?.('Opening PDF preview...');
                  } else {
                    window?.toast?.error?.('PDF export function not available');
                  }
                } catch (error) {
                  console.error('PDF preview error:', error);
                  window?.toast?.error?.('Failed to open PDF preview');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              📄 Preview PDF
            </button>
          </div>

          <div className="bg-gray-50 border rounded p-3 text-sm">
            <div className="font-medium mb-1">Public share link</div>
            <div className="flex gap-2 items-center">
              <input value={portalUrl} readOnly className="flex-1 px-2 py-1 border rounded bg-white" />
              <button type="button" className="btn-secondary" onClick={()=>{ navigator.clipboard.writeText(portalUrl); window?.toast?.success?.('Link copied'); }}>Copy</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={sending}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleSend} disabled={sending || !toEmail}>
            {sending ? 'Sending...' : 'Send Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}

