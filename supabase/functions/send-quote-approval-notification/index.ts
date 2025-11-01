import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { quoteId, companyId } = body;

    if (!quoteId || !companyId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing quoteId or companyId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from("work_orders")
      .select("*, customers(first_name, last_name, email), companies(name, email)")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error("Failed to fetch quote:", quoteError);
      return new Response(
        JSON.stringify({ success: false, error: "Quote not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get company owners/managers for email
    const { data: owners, error: ownersError } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("company_id", companyId)
      .in("role", ["owner", "admin", "manager"]);

    if (ownersError) {
      console.error("Failed to fetch owners:", ownersError);
    }

    const ownerEmails = owners?.map((o) => o.email).filter(Boolean) || [];
    if (ownerEmails.length === 0) {
      console.warn("No owner emails found for company");
      return new Response(
        JSON.stringify({ success: false, error: "No owner emails found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    const customerName = `${quote.customers?.first_name || ""} ${quote.customers?.last_name || ""}`.trim() || "Customer";
    const companyName = quote.companies?.name || "TradeMate Pro";
    const quoteAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(quote.total_amount || 0);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .quote-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #6b7280; }
    .value { color: #1f2937; }
    .amount { font-size: 24px; font-weight: 700; color: #10b981; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Quote Approved!</h1>
      <p>Great news! A customer has approved a quote.</p>
    </div>
    
    <div class="content">
      <p>Hi there,</p>
      
      <p><strong>${customerName}</strong> has approved the quote for <strong>${quote.title}</strong>!</p>
      
      <div class="quote-details">
        <div class="detail-row">
          <span class="label">Quote #:</span>
          <span class="value">${quote.work_order_number || "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="label">Customer:</span>
          <span class="value">${customerName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service:</span>
          <span class="value">${quote.title}</span>
        </div>
        <div class="detail-row">
          <span class="label">Amount:</span>
          <span class="value amount">${quoteAmount}</span>
        </div>
      </div>
      
      <p>The quote has been moved to your Active Jobs. You can now schedule the work and get started!</p>
      
      <p style="text-align: center;">
        <a href="${Deno.env.get("APP_URL") || "https://app.tradesmatepro.com"}/jobs" class="button">View Active Jobs</a>
      </p>
      
      <p>Best regards,<br><strong>TradeMate Pro</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${companyName} <quotes@updates.tradesmatepro.com>`,
        to: ownerEmails,
        subject: `✅ Quote Approved: ${quote.title} - ${quoteAmount}`,
        html: emailHtml,
        tags: [
          { name: "type", value: "quote_approval" },
          { name: "quote_id", value: quoteId },
          { name: "company_id", value: companyId },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await emailResponse.json();
    console.log("✅ Quote approval email sent:", result);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

