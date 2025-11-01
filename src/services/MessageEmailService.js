import { supaFetch } from '../utils/supaFetch';
import settingsService from './SettingsService';
import { getSupabaseClient } from '../utils/supabaseClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import { quoteSendingService } from './QuoteSendingService';

/**
 * MessageEmailService
 * Sends professional email notifications to customers when a new message is posted
 * Reuses the existing Resend edge function (send-quote-email)
 */
class MessageEmailService {
  async getMessage(companyId, messageId) {
    const res = await supaFetch(`messages?id=eq.${messageId}`, { method: 'GET' }, companyId);
    if (!res.ok) throw new Error('Failed to load message');
    const rows = await res.json();
    if (!rows || !rows.length) throw new Error('Message not found');
    return rows[0];
  }

  async getCustomer(companyId, customerId) {
    const res = await supaFetch(`customers?id=eq.${customerId}`, { method: 'GET' }, companyId);
    if (!res.ok) throw new Error('Failed to load customer');
    const rows = await res.json();
    return rows?.[0] || null;
  }

  async getCompany(companyId) {
    const profile = await settingsService.getCompanyProfile(companyId);
    const business = await settingsService.getBusinessSettings(companyId);
    return { ...(business || {}), ...(profile || {}) };
  }

  buildEmailHtml({ customerName, companyName, companyLogo, messagePreview, portalLink }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message from ${companyName}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#6C63FF,#3F37C9);padding:28px 24px;color:#fff;text-align:center;">
      ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-height:48px;display:block;margin:0 auto 12px;">` : ''}
      <h1 style="margin:0;font-size:22px;line-height:1.3;">You've got a new message</h1>
      <p style="margin:8px 0 0 0;opacity:0.9;">from ${companyName}${customerName ? '' : ''}</p>
    </div>

    <div style="padding:28px;">
      ${customerName ? `<p style="margin:0 0 10px 0;font-size:16px;">Hi ${customerName},</p>` : ''}
      <p style="margin:0 0 16px 0;font-size:15px;">We just sent you a new message regarding your project. Here's a quick preview:</p>

      <div style="background:#f4f6ff;border-left:4px solid #6C63FF;padding:16px;border-radius:8px;margin:12px 0 18px 0;">
        <p style="margin:0;white-space:pre-wrap;font-size:15px;color:#222;">${messagePreview}</p>
      </div>

      <div style="text-align:center;margin:26px 0;">
        <a href="${portalLink}" style="background:linear-gradient(135deg,#6C63FF,#3F37C9);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;display:inline-block;font-weight:600;box-shadow:0 6px 16px rgba(108,99,255,0.35);">Open Customer Portal</a>
      </div>

      <p style="margin:0 0 12px 0;font-size:13px;color:#666;text-align:center;">This link takes you directly to your portal for this job.</p>

      <p style="margin:24px 0 0 0;font-size:13px;color:#999;text-align:center;">If the button above doesn't work, copy and paste this link into your browser:<br>
        <a href="${portalLink}" style="color:#6C63FF;word-break:break-all;">${portalLink}</a>
      </p>
    </div>

    <div style="background:#0f172a;color:#a5b4fc;padding:18px;text-align:center;font-size:12px;">
      <p style="margin:0;opacity:0.9;">Powered by TradeMate Pro</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async sendCustomerMessageEmailById(companyId, messageId) {
    const message = await this.getMessage(companyId, messageId);
    return this.sendCustomerMessageEmail(companyId, message);
  }

  async sendCustomerMessageEmail(companyId, message) {
    try {
      // Only send when message is from an employee/contractor to a customer
      const senderType = (message.sender_type || '').toLowerCase();
      if (senderType !== 'employee' && senderType !== 'contractor') {
        return { success: false, skipped: true, reason: 'not_customer_notification' };
      }

      const [company, customer] = await Promise.all([
        this.getCompany(companyId),
        this.getCustomer(companyId, message.customer_id)
      ]);

      if (!customer?.email) {
        console.warn('No customer email on record; skipping email notification');
        return { success: false, skipped: true, reason: 'missing_customer_email' };
      }

      // Build portal link using the existing generator (customer-portal-new.html?token=...)
      let portalLink = '';
      try {
        portalLink = await quoteSendingService.generatePortalLink(companyId, message.work_order_id);
      } catch (e) {
        console.error('Failed to generate portal link:', e);
        // Soft-fail: continue without link
      }

      const companyName = company?.name || company?.company_name || 'TradeMate Pro';
      const companyLogo = company?.logo_url || company?.company_logo_url || '';

      const emailHtml = this.buildEmailHtml({
        customerName: customer?.name || customer?.full_name || '',
        companyName,
        companyLogo,
        messagePreview: (message.content || '').slice(0, 600),
        portalLink
      });

      // Prepare payload for Edge Function (reuses existing send-quote-email)
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const fnUrl = `${SUPABASE_URL}/functions/v1/send-quote-email`;
      const emailPayload = {
        from: `${companyName} <messages@updates.tradesmatepro.com>`,
        to: customer.email,
        reply_to: company?.email || 'support@tradesmatepro.com',
        subject: `New message about your project from ${companyName}`,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'message' },
          { name: 'message_id', value: String(message.id) },
          { name: 'company_id', value: String(companyId) },
          ...(message.work_order_id ? [{ name: 'work_order_id', value: String(message.work_order_id) }] : [])
        ]
      };

      const fnRes = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      const text = await fnRes.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!fnRes.ok || data?.success === false) {
        throw new Error(data?.error?.message || data?.message || `Edge function error (${fnRes.status})`);
      }

      return { success: true, emailId: data.id, sentTo: customer.email, portalLink };
    } catch (error) {
      console.error('Failed to send message email:', error);
      return { success: false, error: error.message };
    }
  }
}

export const messageEmailService = new MessageEmailService();
export default messageEmailService;

